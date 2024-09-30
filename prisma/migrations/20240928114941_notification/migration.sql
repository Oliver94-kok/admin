-- AlterTable
ALTER TABLE `salary` ADD COLUMN `total` DOUBLE NULL;

-- CreateTable
CREATE TABLE `NotificationUser` (
    `id` VARCHAR(191) NOT NULL,
    `leave` JSON NULL,
    `clock` JSON NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `NotificationUser_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NotificationUser` ADD CONSTRAINT `NotificationUser_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
