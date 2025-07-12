export interface BranchsUser {
  id: string;
  clockIn: string | null;
  clockOut: string | null;
  userId: string;
  team: string;
  branch: string | null;
  startOn: string | null;
  offDay: string | null;
  users: { name: string; username: string; userImg: string | null } | null;
}

export const branchAssistant = [
  "助手A", "助手B", "助手C", "助手D", "助手E" 
]