import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Button } from "@/components/ui/button.js";
import { Link } from "wouter";
import type { Project } from "@shared/schema.js";
import VersionBadge from "./VersionBadge.js";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/40">
      <div className="relative bg-background/5 [aspect-ratio:1.6] overflow-hidden">
        <img
          src={project.imageUrl}
          alt={project.name}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto object-cover transform-gpu transition-transform duration-500 will-change-transform group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-background/5" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 z-10">
          <VersionBadge githubRepo={project.githubRepo} />
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{project.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
        <div className="space-y-2 flex-1">
          <h4 className="text-sm font-medium">Key Features:</h4>
          <ul className="list-disc pl-4 space-y-0.5">
            {project.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <Link href={`/projects/${project.name.toLowerCase()}`}>
            <Button variant="outline" size="sm" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 text-white">Learn More</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}