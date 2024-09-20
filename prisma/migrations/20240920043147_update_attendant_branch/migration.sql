-- AlterTable
ALTER TABLE `attendbranch` MODIFY `clockIn` DATETIME(3) NULL,
    MODIFY `clockOut` DATETIME(3) NULL,
    MODIFY `location` VARCHAR(191) NULL;
