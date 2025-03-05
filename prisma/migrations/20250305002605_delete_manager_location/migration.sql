/*
  Warnings:

  - You are about to drop the `managerlocation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ManagerLocation` DROP FOREIGN KEY `ManagerLocation_userId_fkey`;

-- DropTable
DROP TABLE `ManagerLocation`;
