-- AlterTable
ALTER TABLE `attends` ADD COLUMN `leaveId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Attends` ADD CONSTRAINT `Attends_leaveId_fkey` FOREIGN KEY (`leaveId`) REFERENCES `Leave`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
