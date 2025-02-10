import { Card, CardContent } from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge.js";
import { Button } from "@/components/ui/button.js";
import { SiFlutter, SiLinux } from "react-icons/si";
import { Github } from "lucide-react";
import VersionBadge from "@/components/projects/VersionBadge.js";

export default function OrionProject() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
          Orion
        </h1>
        <p className="mt-6 text-lg text-muted-foreground/90 leading-relaxed">
          A user interface designed to control Odyssey, built for Linux SBCs and tailored for mSLA printer control
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <VersionBadge 
            githubRepo="Open-Resin-Alliance/orion" 
            className="h-9 px-4 text-sm" 
          />
          <a 
            href="https://github.com/Open-Resin-Alliance/orion"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white hover:from-purple-700 hover:via-pink-600 hover:to-orange-500">
              <Github className="w-4 h-4" />
              View on GitHub
            </Button>
          </a>
        </div>
      </div>

      {/* Hero Image Section */}
      <div className="relative mx-auto mb-24 max-w-4xl perspective-1000">
        <div className="group">
          <div className="transform-gpu transition-transform duration-500 group-hover:rotate-y-3 group-hover:rotate-x-3 group-hover:translate-z-8">
            <Card className="overflow-hidden border-border/40 bg-background/20 backdrop-blur-sm shadow-2xl">
              <CardContent className="p-0">
                <img
                  src="/projects/orion_no_border.png"
                  alt="Orion Interface"
                  className="w-full rounded-lg"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="grid gap-8 md:grid-cols-2 mb-24">
        <Card className="group bg-background/20 backdrop-blur-sm border-border/40 shadow-2xl hover:bg-background/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-md bg-yellow-500/10">
                <SiLinux className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                  Technical Overview
                </h2>
                <p className="text-sm text-muted-foreground/80">Linux SBC Compatible</p>
              </div>
            </div>
            <p className="text-muted-foreground/90 leading-relaxed">
              Designed to run on a wide variety of Linux Single Board Computers, Orion provides
              a robust and reliable control interface for mSLA printers. Built with performance
              and reliability in mind, it ensures smooth operation of your printer.
            </p>
          </CardContent>
        </Card>

        <Card className="group bg-background/20 backdrop-blur-sm border-border/40 shadow-2xl hover:bg-background/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-md bg-blue-500/10">
                <SiFlutter className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                  User Experience
                </h2>
                <p className="text-sm text-muted-foreground/80">Intuitive Interface</p>
              </div>
            </div>
            <p className="text-muted-foreground/90 leading-relaxed">
              Built with Flutter, Orion offers an intuitive and responsive interface suitable for
              both beginners and experienced users. The clean, modern design makes controlling
              your printer a seamless experience.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <div className="mb-24">
        <h2 className="text-2xl font-semibold text-center mb-12 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
          Key Features
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "User-friendly Interface",
              description: "An intuitive interface for controlling mSLA printers, suitable for both beginners and experienced users"
            },
            {
              title: "Real-time Monitoring",
              description: "Keep track of your print progress and status in real-time"
            },
            {
              title: "File Management",
              description: "Simplified process of uploading and selecting print files"
            },
            {
              title: "Customizable Settings",
              description: "Fine-tune your prints according to your specific needs"
            }
          ].map((feature, index) => (
            <Card key={index} className="group bg-background/20 backdrop-blur-sm border-border/40 shadow-2xl hover:bg-background/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <Badge 
                    variant="secondary" 
                    className="h-6 w-6 flex items-center justify-center bg-background/50 backdrop-blur-sm group-hover:bg-background/70"
                  >
                    {index + 1}
                  </Badge>
                  <h3 className="font-semibold text-foreground/90">{feature.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Get Started Section */}
      <Card className="group bg-background/20 backdrop-blur-sm border-border/40 shadow-2xl hover:bg-background/30 transition-colors">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground/90 max-w-2xl mx-auto mb-6">
            Join us in developing the future of open source resin 3D printing. Contribute to Orion
            and help make high-quality 3D printing accessible to everyone.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a 
              href="https://github.com/Open-Resin-Alliance/orion"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white hover:from-purple-700 hover:via-pink-600 hover:to-orange-500">
                <Github className="w-4 h-4" />
                View Repository
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
