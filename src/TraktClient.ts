import { BucketScope, LogLevel, SapphireClient } from '@sapphire/framework';
import { envParseArray, envParseString } from '@skyra/env-utilities';
import { GatewayIntentBits, Partials } from 'discord.js';
import { Connection, createConnection } from 'mysql2/promise';
import { Umzug } from 'umzug';

export class TraktClient extends SapphireClient {
	// Define MySQL connection properties
	private dbConnection: Connection

	public constructor() {
		super({
			disableMentionPrefix: true,
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
			defaultCooldown: {
				filteredUsers: envParseArray('OWNERS'),
				scope: BucketScope.User,
				delay: 10_000,
				limit: 2
			},
			shards: 'auto',
			logger: {
				level: LogLevel.Debug
			},
			partials: [Partials.Channel],
			loadMessageCommandListeners: true
		});

		// Connect to MySQL on bot initialization
		this.initializeDatabase();
	}

	// Method to initialize MySQL database connection
	private async initializeDatabase() {
		try {
			// Create a MySQL connection
			this.dbConnection = await createConnection({
				host: envParseString('DB_HOST'),
				user: envParseString('DB_USERNAME'),
				password: envParseString('DB_PASSWORD'),
				database: envParseString('DB_DATABASE')
			})

			// Call method to create the necessary tables
			await this.createTables()

			console.log('MySQL connection established successfully')
		} catch (error) {
			console.error(`Error connecting to MySQL: ${error}`)
		}
	}

	private async createTables() {
		const umzug = new Umzug({
			migrations: {
				path: path.join
			}
		})
	}
}
