/*
  Warnings:

  - You are about to alter the column `trakt_auth_code_expire_time` on the `trakt_tv_information` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(6)` to `Timestamp`.

*/
-- AlterTable
ALTER TABLE `trakt_tv_information` MODIFY `trakt_auth_code_expire_time` TIMESTAMP NULL;
