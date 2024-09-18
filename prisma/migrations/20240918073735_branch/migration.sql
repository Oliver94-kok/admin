/*
  Warnings:

  - You are about to drop the column `bonus` on the `salary` table. All the data in the column will be lost.
  - You are about to drop the column `salary` on the `salary` table. All the data in the column will be lost.
  - Added the required column `workingDay` to the `Salary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `salary` DROP COLUMN `bonus`,
    DROP COLUMN `salary`,
    ADD COLUMN `overTimeHour` DOUBLE NULL,
    ADD COLUMN `workingDay` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Branch` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `team` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AttendBranch` (
    `id` VARCHAR(191) NOT NULL,
    `clockIn` DATETIME(3) NOT NULL,
    `clockOut` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `branchid` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `startOn` DATETIME(3) NULL,
    `offDay` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AttendBranch` ADD CONSTRAINT `AttendBranch_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendBranch` ADD CONSTRAINT `AttendBranch_branchid_fkey` FOREIGN KEY (`branchid`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
