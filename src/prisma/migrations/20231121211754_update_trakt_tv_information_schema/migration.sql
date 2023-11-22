/*
  Warnings:

  - You are about to drop the column `trakt_access_token_expiration` on the `trakt_tv_information` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `trakt_tv_information` DROP COLUMN `trakt_access_token_expiration`,
    ADD COLUMN `trakt_refresh_token` VARCHAR(255) NULL;
