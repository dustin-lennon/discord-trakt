/*
  Warnings:

  - You are about to drop the `message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `starboard_message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_message` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `starboard_message` DROP FOREIGN KEY `starboard_message_message_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_message` DROP FOREIGN KEY `user_message_message_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_message` DROP FOREIGN KEY `user_message_user_id_fkey`;

-- DropTable
DROP TABLE `message`;

-- DropTable
DROP TABLE `starboard_message`;

-- DropTable
DROP TABLE `user_message`;

-- CreateTable
CREATE TABLE `trakt_tv_information` (
    `snowflake` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `trakt_auth_code` VARCHAR(12) NULL,
    `trakt_access_token` VARCHAR(255) NULL,

    PRIMARY KEY (`snowflake`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `trakt_tv_information` ADD CONSTRAINT `trakt_tv_information_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`snowflake`) ON DELETE CASCADE ON UPDATE CASCADE;
