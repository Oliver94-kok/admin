-- DropForeignKey
ALTER TABLE `attendbranch` DROP FOREIGN KEY `AttendBranch_userId_fkey`;

-- DropForeignKey
ALTER TABLE `attends` DROP FOREIGN KEY `Attends_userId_fkey`;

-- DropForeignKey
ALTER TABLE `leave` DROP FOREIGN KEY `Leave_userId_fkey`;

-- DropForeignKey
ALTER TABLE `salary` DROP FOREIGN KEY `Salary_userId_fkey`;

-- AddForeignKey
ALTER TABLE `Attends` ADD CONSTRAINT `Attends_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Salary` ADD CONSTRAINT `Salary_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendBranch` ADD CONSTRAINT `AttendBranch_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Leave` ADD CONSTRAINT `Leave_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
