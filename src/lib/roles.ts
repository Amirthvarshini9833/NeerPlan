export const roles = ["HOMEOWNER", "INSTALLER", "ADMIN"] as const;
export type AppRole = (typeof roles)[number];
export const canManageUsers = (role: AppRole) => role === "ADMIN";
export const canViewLeads = (role: AppRole) => role === "INSTALLER" || role === "ADMIN";
