import { CLIENT_OPTIONS } from '#lib/setup';
import { SapphireClient } from '@sapphire/framework';

export class TraktClient extends SapphireClient {
	public constructor() {
		super(CLIENT_OPTIONS);
	}
}
