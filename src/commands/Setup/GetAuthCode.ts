import { ApplyOptions } from '@sapphire/decorators';
import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';
import { Snowflake } from '@sapphire/snowflake';
import { envParseString } from '@skyra/env-utilities';
import { Trakt } from 'nodeless-trakt-ts';

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
		const trakt = new Trakt({
			client_id: envParseString('TRAKT_CLIENT'),
			client_secret: envParseString('TRAKT_CLIENT_SECRET'),
			endpoint: envParseString('TRAKT_API_URL'),
			debug: envParseString('TRAKT_DEBUG')
		});

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
			const token = await trakt
				.get_codes()
				.then(async (poll) => {
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
						`Use the following code to authorize ${this.container.client.user?.username} to access your account \`${code}\` at ${verificationUrl}`
					);

					// verify if app was authorized
					const authToken = await trakt.poll_access(poll);
					console.log(`Auth Token: `, authToken);
				})
				.catch(async (error) => {
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

			interaction.followUp(`Trakt Access Token: ${JSON.stringify(token)}`);

			console.log(`Trakt Access Token: ${JSON.stringify(token)}`);
		} else {
			return interaction.editReply('Failed to obtain an authorization code...');
		}
	}
}
