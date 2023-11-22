/*
  Warnings:

  - You are about to drop the `trakt_tv_information` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `trakt_tv_information` DROP FOREIGN KEY `trakt_tv_information_user_id_fkey`;

-- DropTable
DROP TABLE `trakt_tv_information`;

-- CreateTable
CREATE TABLE `message` (
    `snowflake` BIGINT NOT NULL,

    PRIMARY KEY (`snowflake`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_message` (
    `user_id` BIGINT NOT NULL,
    `message_id` BIGINT NOT NULL,

    PRIMARY KEY (`user_id`, `message_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `starboard_message` (
    `snowflake` BIGINT NOT NULL,
    `author_id` BIGINT NOT NULL,
    `channel_id` BIGINT NOT NULL,
    `guild_id` BIGINT NOT NULL,
    `message_id` BIGINT NOT NULL,

    PRIMARY KEY (`snowflake`, `author_id`, `channel_id`, `guild_id`, `message_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_message` ADD CONSTRAINT `user_message_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`snowflake`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_message` ADD CONSTRAINT `user_message_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `message`(`snowflake`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `starboard_message` ADD CONSTRAINT `starboard_message_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `message`(`snowflake`) ON DELETE CASCADE ON UPDATE CASCADE;
