import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { EmbedBuilder } from 'discord.js';

export class ExtendedPaginatedMessage extends PaginatedMessage {
	// Override the max pages constant
	public static maxPages = 50; // Set this to your desired max pages

	constructor() {
		super();
		// Ensure the instance's max pages is updated
		this.maxPages = ExtendedPaginatedMessage.maxPages;
	}

	// Override the addPageEmbed method to handle embeds
	public addPageEmbed(cb: (embed: EmbedBuilder) => EmbedBuilder): this {
		// Check if we have exceeded the max pages
		if (this.pages.length >= this.maxPages) {
			throw new Error(`Cannot add more pages, reached the maximum: ${this.maxPages}`);
		}

		return super.addPageEmbed(cb);
	}
}
