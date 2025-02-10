import { Button } from "@/components/ui/button.js";
import { Badge } from "@/components/ui/badge.js";
import { Link } from "wouter";
import { ScrollReveal } from "@/components/ui/scroll-reveal.js";
import LogoCloud from "@/components/LogoCloud.js";

export default function Home() {
  const sponsors = [
    {
      name: "Atlas3DSS",
      url: "https://atlas3dss.com",
      imageUrl: "/website/sponsors/atlas3dss.png",
      description: "Innovative support solutions for resin 3D printing, helping makers achieve better print success rates and quality.",
    },
    {
      name: "The Contrapposto Shop",
      url: "https://contrapposto.shop",
      imageUrl: "/website/sponsors/thecontrappostoshop.svg",
      isSvg: true,
      description: "Creators of the Prometheus mSLA printer, the open-source 3D printer that sparked the formation of the Open Resin Alliance.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative py-20 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center">
              <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
                <span className="block mb-2">Advancing Open Source</span>
                <span className="block bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent leading-tight">
                  Resin 3D Printing
                </span>
              </h1>
              <p className="mt-6 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-8 md:text-xl md:max-w-3xl">
                Join us in revolutionizing additive manufacturing through open collaboration and innovation.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <Link href="/projects">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 text-white"
                  >
                    Explore Our Projects
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <ScrollReveal direction="left">
              <div className="relative group perspective-1000">
                <div className="transform-gpu transition-transform duration-500 group-hover:rotate-y-12 group-hover:rotate-x-12 group-hover:translate-z-8">
                  <img
                    src="/website/media/3dprintopia_2024.PNG"
                    alt="3D Printing Process"
                    className="rounded-lg shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-background/10 rounded-lg pointer-events-none" />
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2}>
              <div className="flex flex-col justify-center space-y-6 md:pl-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                  Our Mission
                </h2>
                <div className="prose prose-lg dark:prose-invert">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    The Open Resin Alliance is dedicated to advancing the field of resin-based 3D printing
                    through open source collaboration. We believe that by sharing knowledge and resources,
                    we can accelerate innovation and make high-quality 3D printing accessible to everyone.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Badge variant="secondary" className="text-sm bg-background/50 backdrop-blur-sm">
                    Open Source
                  </Badge>
                  <Badge variant="secondary" className="text-sm bg-background/50 backdrop-blur-sm">
                    Innovation
                  </Badge>
                  <Badge variant="secondary" className="text-sm bg-background/50 backdrop-blur-sm">
                    Collaboration
                  </Badge>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                Our Partners & Supporters
              </h2>
            </div>
            <LogoCloud logos={sponsors} className="max-w-4xl mx-auto" />
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}