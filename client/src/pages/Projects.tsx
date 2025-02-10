import ProjectCard from "@/components/projects/ProjectCard.js";
import { type Project } from "@shared/schema.js";
import { useProjects } from "@/hooks/use-projects.js";

function BalancedGrid({ projects }: { projects: Project[] }) {
  // For 1-2 projects, center them in the layout
  if (projects.length <= 2) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  }

  // For 3 projects, use three columns
  if (projects.length === 3) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  }

  // For 4 projects, use 2x2 grid
  if (projects.length === 4) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  }

  // For 5 projects, use 3-2 split
  if (projects.length === 5) {
    return (
      <div className="space-y-8 lg:space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {projects.slice(0, 3).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">
          {projects.slice(3).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    );
  }

  // For 6 or more projects, use 3-column grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

export default function Projects() {
  const { data: projects = [], isLoading } = useProjects();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Projects Section */}
      <section className="py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
            Projects
          </h1>
          <p className="mt-6 text-lg text-muted-foreground/90 leading-relaxed">
            Our mission is to improve the accessibility and reliability of resin printer control software with a focus on the open-source community.
          </p>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-muted rounded-lg" />
            <div className="h-96 bg-muted rounded-lg" />
          </div>
        ) : (
          <BalancedGrid projects={projects} />
        )}
      </section>
    </div>
  );
}
