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
    AttendBranch: { team: string } | null;
  } | null;
}
