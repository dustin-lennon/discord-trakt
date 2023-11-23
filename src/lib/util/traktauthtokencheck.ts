import { container } from '@sapphire/framework';

export async function isTokenValidCheck(userId: bigint): Promise<boolean> {
	// Current timestamp
	const currentTime = new Date().getTime();

	// Get token expire time from database
	const traktTVInformation = await container.prisma.traktTVInformation.findFirst({
		select: {
			trakt_access_token_expire: true
		},
		where: {
			userId: userId
		}
	});

	if (traktTVInformation?.trakt_access_token_expire !== null && traktTVInformation?.trakt_access_token_expire !== undefined) {
		return currentTime < traktTVInformation?.trakt_access_token_expire ? true : false;
	} else {
		return false;
	}
}
