import { Card, CardContent } from "@/components/ui/card.js";
import { Button } from "@/components/ui/button.js";
import { Printer, AlertTriangle, Wrench } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-border/40 shadow-xl bg-card/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 mb-6">
              <Printer className="w-full h-full text-muted-foreground/80 transform-gpu transition-all duration-500 hover:scale-110 hover:rotate-6" />
            </div>

            <div className="space-y-2 mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                404: Print Failed
              </h1>
              <p className="text-base text-muted-foreground/80">
                Looks like this layer failed to adhere!
              </p>
            </div>

            <div className="w-full max-w-md space-y-4">
              <div className="p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/40 shadow-sm hover:shadow-md transition-all hover:bg-card/60">
                <div className="flex items-center gap-2 text-yellow-500/90 mb-2">
                  <AlertTriangle className="w-4 h-4 animate-bounce" style={{ animationDuration: '3s' }} />
                  <p className="font-medium text-sm">Print Diagnostics</p>
                </div>
                <p className="text-sm text-muted-foreground/80">
                  The page you're looking for seems to have delaminated from our server.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/40 shadow-sm hover:shadow-md transition-all hover:bg-card/60">
                <div className="flex items-center gap-2 text-blue-500/90 mb-3">
                  <Wrench className="w-4 h-4 animate-wiggle" />
                  <p className="font-medium text-sm">Suggested Fixes</p>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground/80">
                  <li className="flex items-start gap-2 group">
                    <span className="block w-1 h-1 mt-2 rounded-full bg-muted-foreground/30 group-hover:bg-muted-foreground/50 transition-colors" />
                    <span className="group-hover:translate-x-0.5 transition-transform">Check your build plate leveling (URL spelling)</span>
                  </li>
                  <li className="flex items-start gap-2 group">
                    <span className="block w-1 h-1 mt-2 rounded-full bg-muted-foreground/30 group-hover:bg-muted-foreground/50 transition-colors" />
                    <span className="group-hover:translate-x-0.5 transition-transform">Increase exposure time (double-check the path)</span>
                  </li>
                  <li className="flex items-start gap-2 group">
                    <span className="block w-1 h-1 mt-2 rounded-full bg-muted-foreground/30 group-hover:bg-muted-foreground/50 transition-colors" />
                    <span className="group-hover:translate-x-0.5 transition-transform">Add more support structures (check your router config)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <Link href="/">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-600/90 via-pink-500/90 to-orange-400/90 hover:from-purple-600 hover:via-pink-500 hover:to-orange-400 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  Return to Build Plate (Home)
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
