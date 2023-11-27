/*
  Warnings:

  - You are about to drop the column `trakt_access_token` on the `trakt_tv_information` table. All the data in the column will be lost.
  - You are about to drop the column `trakt_access_token_expire` on the `trakt_tv_information` table. All the data in the column will be lost.
  - You are about to drop the column `trakt_refresh_token` on the `trakt_tv_information` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `trakt_tv_information` DROP COLUMN `trakt_access_token`,
    DROP COLUMN `trakt_access_token_expire`,
    DROP COLUMN `trakt_refresh_token`,
    ADD COLUMN `access_token` VARCHAR(255) NULL,
    ADD COLUMN `expires` BIGINT NULL,
    ADD COLUMN `refresh_token` VARCHAR(255) NULL;
