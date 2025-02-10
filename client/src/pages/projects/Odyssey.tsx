import { Card, CardContent } from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge.js";
import { Button } from "@/components/ui/button.js";
import { SiRust } from "react-icons/si";
import { Github, Cpu } from "lucide-react";
import VersionBadge from "@/components/projects/VersionBadge.js";

export default function OdysseyProject() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
          Odyssey
        </h1>
        <p className="mt-6 text-lg text-muted-foreground/90 leading-relaxed">
          A high-performance backend engine for mSLA printer control, built with Rust and designed to work seamlessly with Klipper
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <VersionBadge 
            githubRepo="Open-Resin-Alliance/odyssey" 
            className="h-9 px-4 text-sm" 
          />
          <a 
            href="https://github.com/Open-Resin-Alliance/odyssey"
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
                  src="/projects/odyssey.png"
                  alt="Odyssey Architecture"
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
              <div className="p-2.5 rounded-md bg-orange-500/10">
                <SiRust className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                  Technical Overview
                </h2>
                <p className="text-sm text-muted-foreground/80">High-Performance Backend</p>
              </div>
            </div>
            <p className="text-muted-foreground/90 leading-relaxed">
              Built with Rust for maximum performance and reliability, Odyssey provides a robust
              backend for controlling mSLA printers. Zero-cost abstractions and memory safety
              ensure stable operation even under heavy workloads.
            </p>
          </CardContent>
        </Card>

        <Card className="group bg-background/20 backdrop-blur-sm border-border/40 shadow-2xl hover:bg-background/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-md bg-blue-500/10">
                <Cpu className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                  Klipper Integration
                </h2>
                <p className="text-sm text-muted-foreground/80">Seamless Operation</p>
              </div>
            </div>
            <p className="text-muted-foreground/90 leading-relaxed">
              Designed to work harmoniously with Klipper, Odyssey handles the complexities of
              mSLA printing while leveraging Klipper's proven motion control capabilities.
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
              title: "High Performance",
              description: "Built with Rust for maximum speed and efficiency, ensuring smooth printer operation"
            },
            {
              title: "Klipper Integration",
              description: "Seamless integration with Klipper for precise motion control and reliable operation"
            },
            {
              title: "Advanced Processing",
              description: "Sophisticated processing of Prusa SL1 slicer files for optimal print quality"
            },
            {
              title: "Extensive Configuration",
              description: "Comprehensive configuration options for fine-tuned printer control"
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
            Join us in developing the future of open source resin 3D printing. Contribute to Odyssey
            and help build a robust, high-performance printer control system.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a 
              href="https://github.com/Open-Resin-Alliance/odyssey"
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