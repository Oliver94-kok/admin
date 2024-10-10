-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `token` LONGTEXT NULL,
    `userImg` VARCHAR(191) NULL,
    `isLogin` BOOLEAN NOT NULL,
    `role` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attends` (
    `id` VARCHAR(191) NOT NULL,
    `clockIn` DATETIME(3) NULL,
    `clockOut` DATETIME(3) NULL,
    `workingHour` DOUBLE NULL,
    `img` VARCHAR(191) NULL,
    `locationIn` VARCHAR(191) NULL,
    `locationOut` VARCHAR(191) NULL,
    `overtime` INTEGER NULL,
    `fine` DOUBLE NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Salary` (
    `id` VARCHAR(191) NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `workingDay` INTEGER NOT NULL,
    `workingHoour` INTEGER NULL,
    `fine` INTEGER NULL,
    `late` DOUBLE NULL,
    `overTimeHour` DOUBLE NULL,
    `overTime` DOUBLE NULL,
    `total` DOUBLE NULL,
    `perDay` DOUBLE NULL,
    `bonus` DOUBLE NULL,
    `allowance` DOUBLE NULL,
    `cover` DOUBLE NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Branch` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `team` VARCHAR(191) NOT NULL,
    `longtitude` DOUBLE NOT NULL,
    `latitude` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AttendBranch` (
    `id` VARCHAR(191) NOT NULL,
    `clockIn` VARCHAR(191) NULL,
    `clockOut` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `team` VARCHAR(191) NOT NULL,
    `startOn` VARCHAR(191) NULL,
    `offDay` VARCHAR(191) NULL,

    UNIQUE INDEX `AttendBranch_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Leave` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `startDate` VARCHAR(191) NOT NULL,
    `endDate` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `img` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
ALTER TABLE `Attends` ADD CONSTRAINT `Attends_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Salary` ADD CONSTRAINT `Salary_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendBranch` ADD CONSTRAINT `AttendBranch_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Leave` ADD CONSTRAINT `Leave_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationUser` ADD CONSTRAINT `NotificationUser_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
