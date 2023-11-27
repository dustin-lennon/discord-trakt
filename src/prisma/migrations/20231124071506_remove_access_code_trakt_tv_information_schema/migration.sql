/*
  Warnings:

  - You are about to drop the column `trakt_auth_code` on the `trakt_tv_information` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `trakt_tv_information` DROP COLUMN `trakt_auth_code`;
