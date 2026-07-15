/*
  Warnings:

  - You are about to drop the column `language` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `pushNotifications` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `githubUrl` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `linkedinUrl` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "settings" DROP COLUMN "language",
DROP COLUMN "pushNotifications",
DROP COLUMN "theme";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "githubUrl",
DROP COLUMN "linkedinUrl",
DROP COLUMN "skills";

-- DropEnum
DROP TYPE "Theme";
