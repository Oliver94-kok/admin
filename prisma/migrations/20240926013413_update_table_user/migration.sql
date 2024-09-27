/*
  Warnings:

  - Added the required column `fine` to the `Attends` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isLogin` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `attends` ADD COLUMN `fine` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `isLogin` BOOLEAN NOT NULL;
