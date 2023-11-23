/* eslint-disable @typescript-eslint/no-explicit-any */
import { TRAKT_API_OPTIONS } from '#lib/setup';
import { ApplyOptions } from '@sapphire/decorators';
import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';
import { Snowflake } from '@sapphire/snowflake';

import Trakt from 'trakt.tv';

@ApplyOptions<Command.Options>({
	description: 'Get Trakt.tv Auth Token'
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) => {
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.setDMPermission(false);
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const trakt = new Trakt(TRAKT_API_OPTIONS);

		const msg = await interaction.reply({ content: `Obtaining authorization code...`, fetchReply: true, ephemeral: true });
		const requestingUser = BigInt(interaction.user.id);

		await this.container.prisma.user.upsert({
			where: { snowflake: requestingUser },
			create: { snowflake: requestingUser },
			update: { snowflake: requestingUser }
		});

		// Does the user have an auth code already? - update it if they do
		const userAuthCode = await this.container.prisma.traktTVInformation.findFirst({
			where: {
				userId: requestingUser,
				trakt_auth_code: { not: null }
			}
		});

		if (isMessageInstance(msg)) {
			await trakt
				.get_codes()
				.then(async (poll: { user_code: any; verification_url: any }) => {
					// console.log(`Poll: ${JSON.stringify(poll)}`);
					const code = poll?.user_code;

					// Address to input auth code
					const verificationUrl = poll?.verification_url;

					// create a snowflake
					const epoch = new Date();
					const snowflake = new Snowflake(epoch);
					const uniqueId = snowflake.generate();

					// If the user already exists update the auth code
					if (userAuthCode?.trakt_auth_code) {
						await this.container.prisma.traktTVInformation.update({
							where: {
								snowflake_userId: {
									snowflake: BigInt(userAuthCode!.snowflake),
									userId: BigInt(userAuthCode!.userId)
								}
							},
							data: {
								trakt_auth_code: code
							}
						});
					} else {
						// Add the auth code to the current user
						await this.container.prisma.traktTVInformation.create({
							data: {
								snowflake: uniqueId,
								userId: requestingUser,
								trakt_auth_code: code
							}
						});
					}

					interaction.editReply(
						`Open the URL ${verificationUrl} and type the code \`${code}\` to authorize ${this.container.client.user?.username}`
					);

					// verify if app was authorized
					return trakt.poll_access(poll);
				})
				.catch(async (error: { statusCode: any }) => {
					let errorMsg;

					switch (error.statusCode) {
						case 410: // Expired
							errorMsg = await interaction.editReply(
								`Timeout reached in authorizing ${this.container.client.user?.username} to access your data.`
							);
							break;
						case 404: // Not Found - invalid device_code
							errorMsg = await interaction.editReply(`Invalid device_code used`);
							break;
						case 409: // Already Used - user already approved this code
							errorMsg = await interaction.editReply(`Code already used and approved.`);
							break;
						case 418: // Denied - user explicitly denied this code
							errorMsg = await interaction.editReply(`Code explicitly denied by user.`);
							break;
						case 429:
							errorMsg = await interaction.editReply(`Application is polling too quickly!`);
							break;
						default:
							errorMsg = await interaction.editReply(`An error occurred... \`\`\`${JSON.stringify(error)}\`\`\``);
							break;
					}

					return errorMsg;
				});

			const exportedToken = trakt.export_token();

			// Add access_token, refresh_token, and expire time
			await this.container.prisma.traktTVInformation.update({
				where: {
					snowflake_userId: {
						snowflake: BigInt(userAuthCode!.snowflake),
						userId: BigInt(userAuthCode!.userId)
					}
				},
				data: {
					trakt_access_token: exportedToken.access_token,
					trakt_refresh_token: exportedToken.refresh_token,
					trakt_access_token_expire: exportedToken.expires
				}
			});

			return interaction.followUp({ content: `Logged in!`, ephemeral: true });
		} else {
			return interaction.editReply('Failed to obtain an authorization code...');
		}
	}
}
