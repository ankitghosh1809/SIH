import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { NavLink } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import type { NavItem } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface SidebarProps {
  navItems: NavItem[];
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

function useVisibleNavItems(navItems: NavItem[]) {
  const { user } = useAuth();
  return navItems.filter((item) => {
    if (item.guestOnly) return !user; // e.g. "Login" — logged-out visitors only
    if (!user) return false; // everything else requires being logged in
    if (!item.roles) return true; // no role restriction beyond "logged in"
    return item.roles.includes(user.role);
  });
}

function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <nav
      className="flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain p-3"
      aria-label="Primary"
    >
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-white/8 hover:text-ink-foreground",
              isActive && "bg-ink-accent/12 text-ink-accent hover:bg-ink-accent/15 hover:text-ink-accent"
            )
          }
        >
          {item.icon ? <item.icon className="size-4" aria-hidden="true" /> : null}
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function Sidebar({ navItems, mobileOpen, onMobileOpenChange }: SidebarProps) {
  const visibleItems = useVisibleNavItems(navItems);

  return (
    <>
      {/* Desktop: persistent column. Deliberately dark, matching Header
          and the marketing pages, so the brand has one consistent dark
          identity wherever it's chrome rather than content — the actual
          working area (main) stays light for legibility. */}
      <aside className="hidden w-60 shrink-0 border-r border-ink-border bg-ink md:flex md:flex-col">
        <NavList items={visibleItems} />
      </aside>

      {/* Mobile: drawer built directly on the Radix Dialog primitives (not
          the pre-styled DialogContent) so it can dock to the left edge
          instead of appearing as a centered modal, while still getting
          Radix's focus trap, Escape-to-close, and aria-modal behavior for
          free. */}
      <DialogPrimitive.Root open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 md:hidden" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col border-r border-ink-border bg-ink shadow-lg outline-none md:hidden"
          >
            <div className="flex items-center justify-between border-b border-ink-border p-3">
              <DialogPrimitive.Title className="text-sm font-semibold text-ink-foreground">
                Menu
              </DialogPrimitive.Title>
              <DialogPrimitive.Close className="rounded-md p-1.5 text-ink-muted hover:bg-white/8 hover:text-ink-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-accent">
                <XIcon className="size-4" aria-hidden="true" />
                <span className="sr-only">Close menu</span>
              </DialogPrimitive.Close>
            </div>
            <NavList items={visibleItems} onNavigate={() => onMobileOpenChange(false)} />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
