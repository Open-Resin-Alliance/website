import { useQuery } from "@tanstack/react-query";

interface GitHubRelease {
  tag_name: string;
  prerelease: boolean;
  name: string;
  published_at: string;
}

export function useGitHubRelease(repo: string | undefined | null) {
  return useQuery<GitHubRelease | null>({
    queryKey: ["github-release", repo],
    queryFn: async () => {
      if (!repo) return null;
      
      try {
        const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`);
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error('Failed to fetch GitHub release');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching GitHub release:', error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}