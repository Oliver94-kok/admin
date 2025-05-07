function calculateShiftLeaveDuration(
    leaveStart: Date,
    leaveEnd: Date,
    shiftStartTime: string,
    shiftEndTime: string
): number {
    // 1. Parse shift times
    const [shiftStartH, shiftStartM] = shiftStartTime.split(':').map(Number);
    const [shiftEndH, shiftEndM] = shiftEndTime.split(':').map(Number);

    // 2. Calculate shift duration in hours
    let shiftDuration = (shiftEndH - shiftStartH) + (shiftEndM - shiftStartM) / 60;
    if (shiftDuration <= 0) shiftDuration += 24; // Handle overnight shifts
    const halfShift = shiftDuration / 2;

    // 3. Create the current shift period
    const shiftStart = new Date(leaveStart);
    shiftStart.setHours(shiftStartH, shiftStartM, 0, 0);

    const shiftEnd = new Date(shiftStart);
    shiftEnd.setHours(shiftEndH, shiftEndM, 0, 0);
    if (shiftEnd <= shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1);

    // 4. Check if leave is completely within this shift period
    if (leaveStart >= shiftStart && leaveEnd <= shiftEnd) {
        const leaveHours = (leaveEnd.getTime() - leaveStart.getTime()) / (1000 * 60 * 60);

        if (leaveHours >= shiftDuration * 0.9) return 1;
        if (leaveHours >= halfShift) return 0.5;
        return 0;
    }

    // 5. Special handling for overnight shifts
    if (shiftEndH < shiftStartH) {
        // Check if leave falls in the "night portion" (00:00-07:00)
        const nightStart = new Date(leaveStart);
        nightStart.setHours(0, 0, 0, 0);

        const nightEnd = new Date(leaveStart);
        nightEnd.setHours(shiftEndH, shiftEndM, 0, 0);

        if (leaveStart >= nightStart && leaveEnd <= nightEnd) {
            const leaveHours = (leaveEnd.getTime() - leaveStart.getTime()) / (1000 * 60 * 60);
            const portion = leaveHours / shiftDuration;

            if (portion >= 0.9) return 1;
            if (portion >= 0.5) return 0.5;
            return 0;
        }
    }

    return 0;
}
// Test function with corrected variable names
function testLeaveCalculation() {
    // Test 1: Exact overnight shift (12 hours)
    const leaveStart1 = new Date('2025-05-06T09:00:00+08:00');
    const leaveEnd1 = new Date('2025-05-06T13:30:00+08:00');
    console.log('Test 1 :',
        calculateShiftLeaveDuration(leaveStart1, leaveEnd1, "09:00", "18:00")); // Should be 1

    // Test 2: 10 hours of 12h shift (10/12 = 0.833 → rounds to 1)
    const leaveStart2 = new Date('2025-05-06T19:00:00+08:00');
    const leaveEnd2 = new Date('2025-05-07T05:00:00+08:00');
    console.log('Test 2 (19:00-05:00, 10h):',
        calculateShiftLeaveDuration(leaveStart2, leaveEnd2, "19:00", "07:00")); // Should be 1

    // Test 3: 1.5 shifts (18 hours)
    const leaveStart3 = new Date('2025-05-07T01:00:00+08:00');
    const leaveEnd3 = new Date('2025-05-07T07:00:00+08:00');
    console.log('Test 3', calculateShiftLeaveDuration(leaveStart3, leaveEnd3, "19:00", "07:00"));

    console.log('Test 4', calculateShiftLeaveDuration(
        new Date('2025-05-06T19:00:00'), // Start at shift start
        new Date('2025-05-07T01:00:00'), // 6 hours (half)
        "19:00", "07:00"
    )); // Returns 0.5

    console.log('Test 5', calculateShiftLeaveDuration(
        new Date('2025-05-06T22:00:00'), // 3 hours in
        new Date('2025-05-07T04:00:00'), // 6 hours covered
        "19:00", "07:00"
    ));
}

export const GET = async () => {
    try {
        testLeaveCalculation();
        return Response.json({ "okay": "okay" }, { status: 200 })
    } catch (error) {
        return Response.json(error, { status: 500 })
    }
}