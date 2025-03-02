-- AddForeignKey
ALTER TABLE `ManagerLocation` ADD CONSTRAINT `ManagerLocation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
