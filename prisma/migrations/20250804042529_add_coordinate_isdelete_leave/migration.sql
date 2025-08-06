-- AlterTable
ALTER TABLE `Attends` ADD COLUMN `clockInLatitude` DOUBLE NULL,
    ADD COLUMN `clockInLongitude` DOUBLE NULL,
    ADD COLUMN `clockOutLatitude` DOUBLE NULL,
    ADD COLUMN `clockOutLongitude` DOUBLE NULL;

-- AlterTable
ALTER TABLE `Leave` ADD COLUMN `isDelete` BOOLEAN NOT NULL DEFAULT false;
