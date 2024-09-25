/*
  Warnings:

  - You are about to drop the column `location` on the `attendbranch` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `attendbranch` DROP COLUMN `location`,
    MODIFY `clockIn` TIME NULL,
    MODIFY `clockOut` TIME NULL,
    MODIFY `startOn` DATE NULL,
    MODIFY `offDay` DATE NULL;
