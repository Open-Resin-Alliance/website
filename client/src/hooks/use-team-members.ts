import { useQuery } from "@tanstack/react-query";
import type { TeamMember } from "@shared/schema.js";

export function useTeamMembers() {
  return useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });
}