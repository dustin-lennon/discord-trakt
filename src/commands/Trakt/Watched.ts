import { movieResponseRebuilder } from '#lib/util/responseBuilders/moviesResponseBuilder';
import { checkAndUpdateTokens, getAccessTokenData } from '#lib/util/traktauthtokencheck';
import { ApplyOptions } from '@sapphire/decorators';
import { ChatInputCommand, Command } from '@sapphire/framework';
import { APIApplicationCommandOptionChoice } from 'discord.js';
import isEmpty from 'lodash.isempty';

@ApplyOptions<Command.Options>({
	description: 'Get watch TV/Movie Information'
})
export class SlashCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) => {
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.setDMPermission(false)
				.addStringOption((option) =>
					option //
						.setName('shows-movies')
						.setDescription('Display watch data for shows or movies?')
						.setChoices(...this.#watchChoices)
						.setRequired(true)
				);
		});
	}

	readonly #watchChoices: APIApplicationCommandOptionChoice<string>[] = [
		{ name: 'Shows', value: 'shows' },
		{ name: 'Movies', value: 'movies' }
	];

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply();

		// Check to make sure token is valid
		const accessTokenData = await getAccessTokenData(BigInt(interaction.user.id));

		// Token is valid - pull watched data
		if (!isEmpty(accessTokenData)) {
			// Check and make sure access_token, expires, and refresh_token are not null
			if (
				(accessTokenData as accessTokenInfo).access_token !== null &&
				(accessTokenData as accessTokenInfo).expires !== null &&
				(accessTokenData as accessTokenInfo).refresh_token !== null
			) {
				// Handle token to keep it up to date
				const updatedTokenData = await this.container.trakt.import_token(accessTokenData);

				await checkAndUpdateTokens(
					BigInt(interaction.user.id),
					(accessTokenData as accessTokenInfo).snowflake,
					updatedTokenData.access_token,
					updatedTokenData.refresh_token,
					BigInt(updatedTokenData.expires)
				);

				return this.sendReply(updatedTokenData, interaction);
			} else {
				return await interaction.followUp('Run `/getauthcode` to start the process of obtaining an access code and authentication token.');
			}
		} else {
			return await interaction.followUp('Run `/getauthcode` to start the process of obtaining an access code and authentication token.');
		}
	}

	private async sendReply(accessTokenData: { access_token: unknown }, interaction: ChatInputCommand.Interaction) {
		const watchedMovieData = await this.container.trakt.users
			.watched({
				auth: accessTokenData.access_token,
				type: interaction.options.getString('shows-movies', true),
				username: 'me'
			})
			.then(async (results: unknown) => {
				// console.log(`Movie Results: `, JSON.stringify(results));
				return results;
			});

		const paginatedMessage = movieResponseRebuilder(watchedMovieData.data);

		// return paginatedMessage.run(interaction);

		// console.log('watched movie data: ', watchedMovieData);
	}
}

type accessTokenInfo = {
	snowflake: bigint;
	access_token: string;
	refresh_token: string;
	expires: bigint;
};
