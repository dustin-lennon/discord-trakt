import { ApplyOptions } from '@sapphire/decorators';
import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';
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

		if (isMessageInstance(msg)) {
			let code;
			trakt
				.get_codes()
				.then(async (poll) => {
					console.log(`Poll: ${JSON.stringify(await poll)}`);
					code = await poll.user_code;

					console.log(`User code: ${code}`);

					return code;
				})
				.catch((error) => console.error(`Critical failure: ${JSON.stringify(error.message)}`));

			return interaction.editReply(
				`Click the following code to authorize ${this.container.client.user?.username} to access your account \`${code}\``
			);
		}

		return interaction.editReply('Failed to obtain an authorization code...');
	}
}
