import { Badge } from "@/components/ui/badge.js";
import { cn } from "@/lib/utils.js";
import { useGitHubRelease } from "@/hooks/use-github-release.js";
import { GitBranch, Loader2 } from "lucide-react";

interface VersionBadgeProps {
  githubRepo: string | undefined | null;
  className?: string;
}

export default function VersionBadge({ githubRepo, className }: VersionBadgeProps) {
  const { data: release, isLoading } = useGitHubRelease(githubRepo);

  if (!githubRepo) {
    return (
      <Badge variant="secondary" className={cn("bg-background/80 backdrop-blur-sm", className)}>
        In Development
      </Badge>
    );
  }

  if (isLoading) {
    return (
      <Badge variant="secondary" className={cn("bg-background/80 backdrop-blur-sm gap-1", className)}>
        <Loader2 className="h-3 w-3 animate-spin" />
        Loading version
      </Badge>
    );
  }

  if (!release) {
    return (
      <Badge variant="secondary" className={cn("bg-background/80 backdrop-blur-sm gap-1", className)}>
        <GitBranch className="h-3 w-3" />
        No releases yet
      </Badge>
    );
  }

  return (
    <Badge 
      variant="default"
      className={cn(
        "gap-1",
        release.prerelease 
          ? "bg-gradient-to-r from-orange-500 to-orange-300 hover:from-orange-600 hover:to-orange-400" 
          : "bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500",
        "text-white",
        className
      )}
    >
      <GitBranch className="h-3 w-3" />
      {release.tag_name}
    </Badge>
  );
}