import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { EmbedBuilder } from 'discord.js';

export function movieResponseRebuilder(movieResponse: object) {
	console.log('movie Response: ', JSON.stringify(movieResponse));

	const display = new PaginatedMessage({
		template: new EmbedBuilder().setColor('#8E44AD')
	});

	movieResponse.forEach((movie) => {
		display.addPageEmbed((embed) => {
			embed //
				.addFields({
					name: 'Test Name',
					value: 'Test value'
				});
			return embed;
		});
		console.log('looped movie data', JSON.stringify(movie));
	});

	return display;
}
