import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema.js";

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
}