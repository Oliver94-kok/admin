/*
  Warnings:

  - You are about to drop the column `address` on the `locatiousers` table. All the data in the column will be lost.
  - Added the required column `addressIn` to the `LocatioUsers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressOut` to the `LocatioUsers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeIn` to the `LocatioUsers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeOut` to the `LocatioUsers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `LocatioUsers` DROP COLUMN `address`,
    ADD COLUMN `addressIn` VARCHAR(191) NOT NULL,
    ADD COLUMN `addressOut` VARCHAR(191) NOT NULL,
    ADD COLUMN `timeIn` DATETIME(3) NOT NULL,
    ADD COLUMN `timeOut` DATETIME(3) NOT NULL;
