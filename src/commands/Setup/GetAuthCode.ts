/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApplyOptions } from '@sapphire/decorators';
import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';
import { Snowflake } from '@sapphire/snowflake';

@ApplyOptions<Command.Options>({
	description: 'Get Trakt.tv Auth Token'
})
export class SlashCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) => {
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.setDMPermission(false);
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const msg = await interaction.reply({ content: `Obtaining authorization code...`, fetchReply: true, ephemeral: true });
		const requestingUser = BigInt(interaction.user.id);

		let uniqueId;

		await this.container.prisma.user.upsert({
			where: { snowflake: requestingUser },
			create: { snowflake: requestingUser },
			update: { snowflake: requestingUser }
		});

		if (isMessageInstance(msg)) {
			await this.container.trakt
				.get_codes()
				.then(async (poll: { user_code: any; verification_url: any }) => {
					const code = poll?.user_code;

					// Address to input auth code
					const verificationUrl = poll?.verification_url;

					// create a snowflake
					const epoch = new Date();
					const snowflake = new Snowflake(epoch);
					uniqueId = snowflake.generate();

					await interaction.editReply(
						`Open the URL ${verificationUrl} and type the code \`${code}\` to authorize ${this.container.client.user?.username}`
					);

					// verify if app was authorized
					return this.container.trakt.poll_access(poll);
					// return {
					// 	pollData: this.container.trakt.poll_access(poll),
					// 	uniquId: uniqueId
					// };
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

			const exportedToken = await this.container.trakt.export_token();

			let userAuthCode!: {
				snowflake: bigint;
				userId: bigint;
				access_token: string | null;
				refresh_token: string | null;
				expires: bigint | null;
			};

			// Add access_token, refresh_token, and expire time
			await this.container.prisma.traktTVInformation.upsert({
				where: {
					snowflake_userId: {
						snowflake: BigInt(userAuthCode?.snowflake ?? uniqueId),
						userId: BigInt(userAuthCode?.userId ?? requestingUser)
					}
				},
				create: {
					snowflake: BigInt(userAuthCode?.snowflake ?? uniqueId),
					userId: BigInt(userAuthCode?.userId ?? requestingUser),
					refresh_token: exportedToken.refresh_token,
					expires: exportedToken.expires,
					access_token: exportedToken.access_token
				},
				update: {
					refresh_token: exportedToken.refresh_token,
					expires: exportedToken.expires,
					access_token: exportedToken.access_token
				}
			});

			return await interaction.followUp({ content: `Logged in!`, ephemeral: true });
		} else {
			return await interaction.editReply('Failed to obtain an authorization code...');
		}
	}
}
