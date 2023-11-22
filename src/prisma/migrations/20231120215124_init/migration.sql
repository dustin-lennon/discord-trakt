-- CreateTable
CREATE TABLE `Guilds` (
    `id` BIGINT UNSIGNED NOT NULL,
    `guild_id` BIGINT UNSIGNED NOT NULL,
    `guild_name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `guild_id`(`guild_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuildsToUsers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `guild_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,

    INDEX `Guild`(`guild_id`),
    INDEX `User`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TraktTVInformation` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `trakt_auth_code` VARCHAR(12) NULL,
    `trakt_access_token` VARCHAR(255) NULL,

    INDEX `UserTrakt`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Users` (
    `id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `user_name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
