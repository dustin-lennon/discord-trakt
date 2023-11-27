import { container } from '@sapphire/framework';

export async function getAccessTokenData(userId: bigint): Promise<object | null> {
	const traktTVInformation = await container.prisma.traktTVInformation.findFirst({
		select: {
			snowflake: true,
			access_token: true,
			expires: true,
			refresh_token: true
		},
		where: {
			userId: userId
		}
	});

	return traktTVInformation;
}

export async function checkAndUpdateTokens(
	userId: bigint,
	snowflake: bigint,
	accessToken: string,
	refreshToken: string,
	expires: bigint
): Promise<undefined> {
	const currentTokens = await container.prisma.traktTVInformation.findFirst({
		select: {
			access_token: true,
			refresh_token: true,
			expires: true
		},
		where: {
			userId: userId
		}
	});

	// Update data in the database if needed
	if (accessToken !== currentTokens?.access_token) {
		container.prisma.traktTVInformation.update({
			where: {
				snowflake_userId: {
					snowflake: snowflake,
					userId: userId
				}
			},
			data: {
				access_token: accessToken,
				refresh_token: refreshToken,
				expires: expires
			}
		});
	}
}
