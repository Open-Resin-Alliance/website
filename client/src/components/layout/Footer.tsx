import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="relative mt-auto">
      <div className="relative max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-border/40 pt-8">
          <div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Open Resin Alliance
            </h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Advancing open source resin 3D printing technology through collaboration and innovation.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/projects">
                  <a className="text-muted-foreground hover:text-foreground transition-colors">
                    Projects
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-muted-foreground hover:text-foreground transition-colors">
                    About Us
                  </a>
                </Link>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Documentation
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Community</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a 
                  href="https://github.com/Open-Resin-Alliance" 
                  target="Open-Resin-Alliance" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a 
                  href="https://discord.gg/beFeTaPH6v" 
                  target="beFeTaPH6v" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Discord
                </a>
              </li>
              <li>
                <a 
                  href="https://bsky.app/profile/openresin.org" 
                  target="openresin.org" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Bluesky
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border/40">
          <p className="text-sm text-center text-muted-foreground">
            © {new Date().getFullYear()} Open Resin Alliance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}