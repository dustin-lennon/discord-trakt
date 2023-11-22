/*
  Warnings:

  - You are about to drop the `Guilds` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GuildsToUsers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TraktTVInformation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Guilds`;

-- DropTable
DROP TABLE `GuildsToUsers`;

-- DropTable
DROP TABLE `TraktTVInformation`;

-- DropTable
DROP TABLE `Users`;

-- CreateTable
CREATE TABLE `user` (
    `snowflake` BIGINT NOT NULL,

    PRIMARY KEY (`snowflake`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trakt_tv_information` (
    `snowflake` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `guild_id` BIGINT NOT NULL,
    `trakt_auth_code` VARCHAR(12) NULL,
    `trakt_access_token` VARCHAR(255) NULL,

    PRIMARY KEY (`snowflake`, `user_id`, `guild_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `trakt_tv_information` ADD CONSTRAINT `trakt_tv_information_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`snowflake`) ON DELETE CASCADE ON UPDATE CASCADE;
