import { isTokenValidCheck } from '#lib/util/traktauthtokencheck';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	description: 'Get watch TV/Movie Information'
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
		// Check to make sure token is valid
		const isValidToken = await isTokenValidCheck(BigInt(interaction.user.id));
		console.log(`is token valid: `, isValidToken);
	}
}
