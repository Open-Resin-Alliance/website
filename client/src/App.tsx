import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient.js";
import { Toaster } from "@/components/ui/toaster.js";
import NotFound from "@/pages/not-found.js";
import Home from "@/pages/Home.js";
import Projects from "@/pages/Projects.js";
import About from "@/pages/About.js";
import OrionProject from "@/pages/projects/Orion.js";
import OdysseyProject from "@/pages/projects/Odyssey.js";
import Navbar from "@/components/layout/Navbar.js";
import Footer from "@/components/layout/Footer.js";
import { ThemeProvider } from "@/components/theme-provider.js";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/layout/PageTransition.js";
import { Router as WouterRouter } from "wouter";
import { useScrollTop } from "@/hooks/use-scroll-top.js";
import Contact from "@/pages/Contact.js";

// Get the base path from Vite's configuration at build time
const base = import.meta.env.BASE_URL;

// Create a base-aware router
const BaseRouter = () => (
  <WouterRouter base={base}>
    <RouterContent />
  </WouterRouter>
);

function RouterContent() {
  const [location] = useLocation();
  useScrollTop();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16 mt-safe">
        <AnimatePresence mode="wait">
          <Switch location={location} key={location}>
            <Route path="/">
              <PageTransition>
                <Home />
              </PageTransition>
            </Route>
            <Route path="/projects">
              <PageTransition>
                <Projects />
              </PageTransition>
            </Route>
            <Route path="/projects/orion">
              <PageTransition>
                <OrionProject />
              </PageTransition>
            </Route>
            <Route path="/projects/odyssey">
              <PageTransition>
                <OdysseyProject />
              </PageTransition>
            </Route>
            <Route path="/about">
              <PageTransition>
                <About />
              </PageTransition>
            </Route>
            <Route path="/contact">
              <PageTransition>
                <Contact />
              </PageTransition>
            </Route>
            <Route>
              <PageTransition>
                <NotFound />
              </PageTransition>
            </Route>
          </Switch>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BaseRouter />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;