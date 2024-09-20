/*
  Warnings:

  - You are about to drop the column `branchid` on the `attendbranch` table. All the data in the column will be lost.
  - Added the required column `team` to the `AttendBranch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longtitude` to the `Branch` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `attendbranch` DROP FOREIGN KEY `AttendBranch_branchid_fkey`;

-- AlterTable
ALTER TABLE `attendbranch` DROP COLUMN `branchid`,
    ADD COLUMN `team` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `branch` ADD COLUMN `latitude` DOUBLE NOT NULL,
    ADD COLUMN `longtitude` DOUBLE NOT NULL;

-- CreateTable
CREATE TABLE `Leave` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `img` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Leave` ADD CONSTRAINT `Leave_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
