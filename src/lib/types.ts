import { container } from '@sapphire/pieces';
import { ChatInputCommandInteraction, ContextMenuCommandInteraction } from 'discord.js';
import type * as Sentry from '@sentry/node';

export interface ErrorHandlerOptions {
	interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction;
	error: Error;
	loggerSeverityLevel: keyof Omit<typeof container.logger, 'LogLevel' | 'write' | 'has'>;
	sentrySeverityLevel: Sentry.SeverityLevel;
}

export interface ErrorDefaultSentryScope {
	error: Error;
	sentrySeverityLevel: Sentry.SeverityLevel;
	scope: Sentry.Scope;
}
