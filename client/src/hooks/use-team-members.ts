import { useQuery } from "@tanstack/react-query";
import type { TeamMember } from "@shared/schema.js";

export function useTeamMembers() {
  return useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
    queryFn: async () => {
      const response = await fetch("/api/team-members");
      if (!response.ok) {
        throw new Error("Failed to fetch team members");
      }
      return response.json();
    },
  });
}