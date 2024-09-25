export interface BranchsUser {
  id: string;
  clockIn: string | null;
  clockOut: string | null;
  userId: string;
  team: string;
  startOn: string | null;
  offDay: string | null;
  users: { name: string; username: string; userImg: string | null } | null;
}
