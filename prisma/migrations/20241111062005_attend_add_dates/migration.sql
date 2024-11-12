/*
  Warnings:

  - Added the required column `dates` to the `Attends` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `attends` ADD COLUMN `dates` DATE NOT NULL;
