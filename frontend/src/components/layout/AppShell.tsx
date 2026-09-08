import { useState, type ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import type { NavItem } from "@/lib/routes";

interface AppShellProps {
  navItems: NavItem[];
  children: ReactNode;
}

export function AppShell({ navItems, children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      <Header onToggleMobileNav={() => setMobileNavOpen(true)} />

      <div className="flex flex-1">
        <Sidebar
          navItems={navItems}
          mobileOpen={mobileNavOpen}
          onMobileOpenChange={setMobileNavOpen}
        />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-x-hidden px-4 py-6 outline-none sm:px-6 lg:px-8"
        >
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
