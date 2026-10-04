export type Actor = { id: string; role: "USER" | "PROFESSIONAL" | "ADMIN"; active: boolean; professionalProfile?: { enabled: boolean } | null };
export type CaseAccess = { requesterId: string; assignedProfessionalId: string | null };
export function allowedActor(user: Actor) {
  return user.active && (user.role !== "PROFESSIONAL" || !!user.professionalProfile?.enabled);
}
export function canAccess(user: Actor, ticket: CaseAccess) {
  return allowedActor(user) && (user.role === "ADMIN" || (user.role === "USER" && ticket.requesterId === user.id) || (user.role === "PROFESSIONAL" && ticket.assignedProfessionalId === user.id));
}
export const transitions: Record<string, readonly string[]> = {
  NEW: ["UNDER_REVIEW"], UNDER_REVIEW: ["IN_PROGRESS"],
  IN_PROGRESS: ["WAITING_REQUESTER", "RESOLVED"],
  WAITING_REQUESTER: ["IN_PROGRESS", "RESOLVED"], RESOLVED: ["CLOSED", "IN_PROGRESS"], CLOSED: ["UNDER_REVIEW"],
};
export function canTransition(role: Actor["role"], from: string, to: string) {
  if (!transitions[from]?.includes(to)) return false;
  return role === "ADMIN" || (role === "PROFESSIONAL" && ["IN_PROGRESS", "WAITING_REQUESTER"].includes(from) && ["IN_PROGRESS", "WAITING_REQUESTER", "RESOLVED"].includes(to));
}
export function canAssign(role: Actor["role"], status: string) {
  return role === "ADMIN" && ["IN_PROGRESS", "WAITING_REQUESTER"].includes(status);
}
