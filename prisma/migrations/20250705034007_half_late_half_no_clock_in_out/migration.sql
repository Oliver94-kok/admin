-- AlterTable
ALTER TABLE `Attends` MODIFY `status` ENUM('Active', 'Full_Attend', 'No_ClockIn_ClockOut', 'No_clockIn_ClockOut_Late', 'Absent', 'Leave', 'Late', 'OffDay', 'Half_Day', 'Half_Day_Late', 'Half_Day_NoClockIn_Out') NOT NULL DEFAULT 'Active';
