import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils.js";
import { Menu, Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button.js";
import { useTheme } from "@/components/theme-provider.js";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet.js";
import { useState } from "react";

export default function Navbar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent supports-[backdrop-filter]:bg-background/0">
      <div className="absolute inset-0 bg-background/30 dark:bg-background/10 backdrop-blur-md border-b border-border/40" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 pt-safe">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <a className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                Open Resin Alliance
              </a>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex space-x-8">
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a
                    className={cn(
                      "inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors hover:text-foreground/80",
                      location === link.href
                        ? "text-foreground border-b-2 border-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </a>
                </Link>
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-background/30"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="hover:bg-background/30">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[320px] p-0 border rounded-l-lg border-border/40 bg-background/20 backdrop-blur-md shadow-lg"
              >
                <div className="p-6 border-b border-border/40 flex items-center justify-between">
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                    Menu
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-background/30"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </div>
                <div className="flex flex-col py-2">
                  {links.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <a
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "px-6 py-5 text-lg font-medium transition-all hover:bg-background/30 flex items-center justify-between group",
                          location === link.href
                            ? "text-foreground bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-orange-400/10"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {link.label}
                        <span 
                          className={cn(
                            "w-2 h-2 rounded-full transition-all duration-300",
                            location === link.href
                              ? "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 scale-100 opacity-100"
                              : "scale-50 opacity-0 bg-foreground group-hover:scale-75 group-hover:opacity-50"
                          )}
                        />
                      </a>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}