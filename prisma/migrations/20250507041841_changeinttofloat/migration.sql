/*
  Warnings:

  - You are about to alter the column `workingDay` on the `salary` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `salary` MODIFY `workingDay` DOUBLE NULL;
