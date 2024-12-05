/*
  Warnings:

  - You are about to drop the column `fine` on the `salary` table. All the data in the column will be lost.
  - You are about to drop the column `fine2` on the `salary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Salary` DROP COLUMN `fine`,
    DROP COLUMN `fine2`,
    ADD COLUMN `fineLate` INTEGER NULL,
    ADD COLUMN `fineNoClockIn` INTEGER NULL,
    ADD COLUMN `fineNoClockOut` INTEGER NULL;
