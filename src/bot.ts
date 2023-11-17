import '#lib/setup';

import { container } from '@sapphire/framework';
import { envParseString } from '@skyra/env-utilities';
import { TraktClient } from './TraktClient.js';

import * as Sentry from '@sentry/node';
import { RewriteFrames } from '@sentry/integrations';
import { rootFolder } from '#lib/constants';

const client = new TraktClient();

const main = async () => {
	// Load in Sentry for error logging
	if (envParseString('SENTRY_URL')) {
		Sentry.init({
			dsn: envParseString('SENTRY_URL'),
			tracesSampleRate: 1.0,
			environment: envParseString('NODE_ENV'),
			integrations: [
				new Sentry.Integrations.Modules(),
				new Sentry.Integrations.FunctionToString(),
				new Sentry.Integrations.LinkedErrors(),
				new Sentry.Integrations.Console(),
				new Sentry.Integrations.Http({ breadcrumbs: true, tracing: true }),
				new RewriteFrames({ root: rootFolder })
			]
		});
	}

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
