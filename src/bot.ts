import '#lib/setup';

import { container } from '@sapphire/framework';
import { TraktClient } from './TraktClient.js';

const client = new TraktClient();

const main = async () => {
	try {
		client.logger.info(`Logging in...`);
		await client.login();
		client.logger.info(`Logged in as ${client.user?.username}...`);
	} catch (error) {
		container.logger.error(error);
		client.destroy();
		process.exit(1);
	}
};

main().catch(container.logger.error.bind(container.logger));
