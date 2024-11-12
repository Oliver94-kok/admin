/*
  Warnings:

  - You are about to drop the column `fine2` on the `attends` table. All the data in the column will be lost.
  - You are about to alter the column `overtime` on the `attends` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `attends` DROP COLUMN `fine2`,
    MODIFY `overtime` DOUBLE NULL,
    MODIFY `status` ENUM('Active', 'Full_Attend', 'No_ClockOut', 'No_ClockIn', 'Absent', 'Leave', 'Late') NOT NULL DEFAULT 'Active';
