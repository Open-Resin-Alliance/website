import { cn } from "@/lib/utils.js";
import { Card, CardContent } from "@/components/ui/card.js";

interface LogoCloudProps {
  logos: {
    name: string;
    url: string;
    imageUrl: string;
    description?: string;
    isSvg?: boolean;
  }[];
  className?: string;
}

export default function LogoCloud({ logos, className }: LogoCloudProps) {
  return (
    <Card className={cn("border-border/40 bg-background/20 shadow-2xl", className)}>
      <CardContent className="p-6 sm:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {logos.map((logo) => (
            <div key={logo.name} className="group relative isolate">
              <div className="flex flex-col items-center">
                <a
                  href={logo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center transition-transform duration-200 hover:scale-105 cursor-pointer"
                >
                  {logo.isSvg ? (
                    <div className="pointer-events-none">
                      <object
                        data={logo.imageUrl}
                        type="image/svg+xml"
                        className="h-24 sm:h-32 w-auto drop-shadow-lg"
                        aria-label={`${logo.name} logo`}
                      >
                        <img
                          src={logo.imageUrl}
                          alt={`${logo.name} logo`}
                          className="h-24 sm:h-32 object-contain"
                        />
                      </object>
                    </div>
                  ) : (
                    <img
                      src={logo.imageUrl}
                      alt={`${logo.name} logo`}
                      className="h-24 sm:h-32 w-auto object-contain drop-shadow-lg"
                    />
                  )}
                </a>
                <div className="mt-4 text-center md:hidden">
                  <a
                    href={logo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm font-medium text-muted-foreground/90 hover:text-foreground/90 transition-colors"
                  >
                    {logo.name}
                  </a>
                  {logo.description && (
                    <p className="mt-2 text-sm text-muted-foreground/75 px-4">
                      {logo.description}
                    </p>
                  )}
                </div>
              </div>
              {logo.description && (
                <div className="absolute inset-0 hidden md:flex items-center justify-center">
                  <div className="w-full max-w-[280px] opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
                    <div className="rounded-lg border border-border/30 shadow-lg bg-background/95 p-4 transform-gpu hover:bg-background/90 transition-colors">
                      <h3 className="font-medium text-sm mb-1.5">{logo.name}</h3>
                      <p className="text-xs text-muted-foreground/90 leading-relaxed">
                        {logo.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}