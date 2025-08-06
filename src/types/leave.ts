export interface LeavesInterface {
  id: string;
  userId: string;
  reason: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  img: string | null;
  branch: string | null;
  users: {
    name: string;
    username: string;
    userImg: string | null;
    AttendBranch: { team: string; branch: string | null } | null;
  } | null;
}

export const leaveType = [
  "Paid leave",
  'Cuti bergaji',
  '带薪假',
  // "Medical leave (MC)",
  // 'Cuti sakit (MC)',
  // '病假 (MC)',
  "Bereavement leave",
  '丧假',
  'Cuti berkabung',
  "Annual leave",
  'Cuti tahunan',
  '年假',
  "Delivery late",
  'Penghantaran lewat',
  '载送延迟',
];

export const fullLeaveTypes = [
  "Paid leave",
  'Cuti bergaji',
  '带薪假',
  "Unpaid leave",
  'Cuti tanpa gaji',
  '无薪假',
  "Emergency leave",
  '紧急假',
  'Cuti sakit (MC)',
  "Bereavement leave",
  'Cuti berkabung',
  '丧假',
  "Medical leave (MC)",
  '病假 (MC)',
  "Annual leave",
  'Cuti tahunan',
  '年假',
  "Forget clock",
  'Lupa clock',
  '忘记打卡',
  "Delivery late",
  'Penghantaran lewat',
  '载送延迟',
];

export const leaveTypeToShortCode: Record<string, string> = {
  // Paid Leave group
  "Paid leave": "PL",
  "Cuti bergaji": "PL",
  "带薪假": "PL",

  // Unpaid Leave group
  "Unpaid leave": "UP",
  "Cuti tanpa gaji": "UP",
  "无薪假": "UP",

  // Emergency Leave group
  "Emergency leave": "EL",
  "紧急假": "EL",
  "Cuti sakit (MC)": "MC", // assuming this maps to EL

  // Bereavement Leave group
  "Bereavement leave": "BL",
  "Cuti berkabung": "BL",
  "丧假": "BL",

  // Medical Leave group
  "Medical leave (MC)": "MC",
  "病假 (MC)": "MC",

  // Annual Leave group
  "Annual leave": "AL",
  "Cuti tahunan": "AL",
  "年假": "AL",

  // Forget Clock group
  "Forget clock": "FC",
  "Lupa clock": "FC",
  "忘记打卡": "FC",

  // Delivery Late group
  "Delivery late": "DL",
  "Penghantaran lewat": "DL",
  "载送延迟": "DL",
};




export const leaveTypeMap: Record<string, string> = {
  "Paid leave": "Paid leave",
  "Cuti bergaji": "Paid leave",
  "带薪假": "Paid leave",

  "Unpaid leave": "Unpaid leave",
  "Cuti tanpa gaji": "Unpaid leave",
  "无薪假": "Unpaid leave",

  "Emergency leave": "Emergency leave",
  "Cuti kecemasan": "Emergency leave",
  "紧急假": "Emergency leave",

  "Cuti sakit (MC)": "Medical leave (MC)",
  "Medical leave (MC)": "Medical leave (MC)",
  "病假 (MC)": "Medical leave (MC)",

  "Bereavement leave": "Bereavement leave",
  "Cuti berkabung": "Bereavement leave",
  "丧假": "Bereavement leave",

  "Annual leave": "Annual leave",
  "Cuti tahunan": "Annual leave",
  "年假": "Annual leave",

  "Forget clock": "Forget clock",
  "Lupa clock": "Forget clock",
  "忘记打卡": "Forget clock",

  "Delivery late": "Delivery late",
  "Penghantaran lewat": "Delivery late",
  "载送延迟": "Delivery late",
};