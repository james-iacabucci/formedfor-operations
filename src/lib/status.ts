
export const SCULPTURE_STATUS = {
  IDEA: {
    code: "idea",
    displayName: "Idea"
  },
  PENDING: {
    code: "pending",
    displayName: "Pending"
  },
  APPROVED: {
    code: "approved",
    displayName: "Approved"
  },
  ARCHIVED: {
    code: "archived",
    displayName: "Archived"
  }
} as const;

export type SculptureStatusCode = typeof SCULPTURE_STATUS[keyof typeof SCULPTURE_STATUS]["code"];

export const getStatusDisplayName = (code: SculptureStatusCode): string => {
  const status = Object.values(SCULPTURE_STATUS).find(s => s.code === code);
  return status?.displayName || "Unknown";
};
