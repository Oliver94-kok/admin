-- CreateTable
CREATE TABLE `LocatioUsers` (
    `id` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `branch` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LocatioUsers` ADD CONSTRAINT `LocatioUsers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
