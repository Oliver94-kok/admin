-- AlterTable
ALTER TABLE `Attends` ADD COLUMN `fine2` DOUBLE NULL,
    MODIFY `status` ENUM('Active', 'Full_Attend', 'No_ClockIn_ClockOut', 'No_clockIn_ClockOut_Late', 'Absent', 'Leave', 'Late', 'OffDay', 'Half_Day') NOT NULL DEFAULT 'Active';
