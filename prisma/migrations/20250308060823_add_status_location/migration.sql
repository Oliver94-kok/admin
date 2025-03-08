-- AlterTable
ALTER TABLE `LocatioUsers` ADD COLUMN `status` ENUM('Active', 'COMPLETE') NOT NULL DEFAULT 'Active';
