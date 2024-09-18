-- AlterTable
ALTER TABLE `attends` ADD COLUMN `locationIn` VARCHAR(191) NULL,
    ADD COLUMN `locationOut` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Salary` (
    `id` VARCHAR(191) NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `late` DOUBLE NULL,
    `bonus` DOUBLE NULL,
    `overTime` DOUBLE NULL,
    `salary` JSON NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Salary` ADD CONSTRAINT `Salary_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
