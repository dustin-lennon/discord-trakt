import { ApplyOptions } from '@sapphire/decorators';
import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	description: 'Reload all slash commands',
	preconditions: ['OwnerOnly']
})
export class SlashCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) => {
			builder //
				.setName(this.name)
				.setDescription(this.description);
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const msg = await interaction.reply({ content: 'Reloading commands...', fetchReply: true });

		if (isMessageInstance(msg)) {
			// Reload all commands
			this.applicationCommandRegistry.command?.reload();

			return interaction.editReply('Commands have been reloaded!');
		}

		return interaction.editReply('Failed to retrieve ping...');
	}
}
