/*
  Warnings:

  - You are about to drop the `managerlocation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Managerlocation` DROP FOREIGN KEY `ManagerLocation_userId_fkey`;

-- DropTable
DROP TABLE `Managerlocation`;
