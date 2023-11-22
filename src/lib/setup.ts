// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

import { ApplicationCommandRegistries, BucketScope, LogLevel, RegisterBehavior, container } from '@sapphire/framework';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-editable-commands/register';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-subcommands/register';
import { setup, type ArrayString, envParseArray, envParseString, envParseBoolean } from '@skyra/env-utilities';
import * as colorette from 'colorette';
import { join } from 'path';
import { inspect } from 'util';
import { rootFolder } from '#lib/constants';
import { GatewayIntentBits, type ClientOptions, Partials } from 'discord.js';
import { Integrations, NodeOptions } from '@sentry/node';
import { RewriteFrames } from '@sentry/integrations';
import '@kaname-png/plugin-sentry';
import { PrismaClient } from '@prisma/client';

// Set default behavior to bulk overwrite
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

// Read env var
setup(join(rootFolder, 'src', '.env'));

// Set default inspection depth
inspect.defaultOptions.depth = 1;

// Enable colorette
colorette.createColors({ useColor: true });

const prisma = new PrismaClient({
	log: [
		{ level: 'query', emit: 'event' },
		{ level: 'warn', emit: 'event' },
		{ level: 'info', emit: 'event' },
		{ level: 'error', emit: 'event' }
	]
});
container.prisma = prisma;

export const SENTRY_OPTIONS: NodeOptions = {
	debug: envParseBoolean('DOTENV_DEBUG', true),
	integrations: [
		new Integrations.Modules(),
		new Integrations.FunctionToString(),
		new Integrations.LinkedErrors(),
		new Integrations.Console(),
		new Integrations.Http({ breadcrumbs: true, tracing: true }),
		new RewriteFrames({ root: rootFolder })
	],
	dsn: envParseString('SENTRY_URL'),
	tracesSampleRate: 1.0,
	environment: envParseString('NODE_ENV')
};

function parseSentryOptions() {
	return {
		loadSentryErrorListeners: true,
		root: rootFolder,
		options: SENTRY_OPTIONS
	};
}

export const CLIENT_OPTIONS: ClientOptions = {
	intents: [
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent
	],
	disableMentionPrefix: true,
	defaultCooldown: {
		filteredUsers: envParseArray('OWNERS'),
		scope: BucketScope.User,
		delay: 10_000,
		limit: 2
	},
	shards: 'auto',
	logger: {
		level: envParseString('NODE_ENV') === 'production' ? LogLevel.Info : LogLevel.Debug
	},
	partials: [Partials.Channel],
	loadMessageCommandListeners: true,
	loadDefaultErrorListeners: true,
	sentry: parseSentryOptions()
};

export const TRAKT_API_OPTIONS = {
	client_id: envParseString('TRAKT_CLIENT'),
	client_secret: envParseString('TRAKT_CLIENT_SECRET'),
	api_url: envParseString('TRAKT_API_URL'),
	debug: envParseString('TRAKT_DEBUG')
};

declare module '@sapphire/pieces' {
	interface Container {
		prisma: typeof prisma;
	}
}

declare module '@skyra/env-utilities' {
	interface Env {
		OWNERS: ArrayString;
		SENTRY_URL: string;
		TRAKT_CLIENT: string;
		TRAKT_CLIENT_SECRET: string;
		TRAKT_API_URL: string;
		TRAKT_DEBUG: boolean;
		DB_HOST: string;
		DB_USERNAME: string;
		DB_DATABASE: string;
		DB_PASSWORD: string;
		DB_URL: string;
	}
}
