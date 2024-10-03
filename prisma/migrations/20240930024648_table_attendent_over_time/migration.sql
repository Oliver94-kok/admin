/*
  Warnings:

  - You are about to drop the column `ovetime` on the `attends` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `attends` DROP COLUMN `ovetime`,
    ADD COLUMN `overtime` INTEGER NULL;
