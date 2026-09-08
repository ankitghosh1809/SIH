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
    if (!item.roles) return true; // omitted => visible to everyone, including logged-out
    if (!user) return false; // role-restricted, nobody logged in
    return item.roles.includes(user.role);
  });
}

function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Primary">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-accent text-accent-foreground"
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
      {/* Desktop: persistent column. */}
      <aside className="hidden w-60 shrink-0 border-r border-border md:flex md:flex-col">
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
            className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col border-r border-border bg-background shadow-lg outline-none md:hidden"
          >
            <div className="flex items-center justify-between border-b border-border p-3">
              <DialogPrimitive.Title className="text-sm font-semibold text-foreground">
                Menu
              </DialogPrimitive.Title>
              <DialogPrimitive.Close className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
