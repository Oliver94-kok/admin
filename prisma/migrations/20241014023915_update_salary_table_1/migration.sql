/*
  Warnings:

  - You are about to drop the column `workingHoour` on the `salary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `salary` DROP COLUMN `workingHoour`,
    ADD COLUMN `fine2` INTEGER NULL,
    ADD COLUMN `notClockIn` INTEGER NULL,
    ADD COLUMN `workingHour` INTEGER NULL,
    MODIFY `late` INTEGER NULL;
