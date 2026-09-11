import { LogOut, Menu, User } from "lucide-react";
import { Link } from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/routes";

interface HeaderProps {
  onToggleMobileNav: () => void;
}

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

/** Small geometric scan/eye mark, echoing RetinaScanIllustration's visual
 * language, in place of a generic shield icon. currentColor so it picks
 * up whatever text color it's placed in. */
function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.35" />
      <path
        d="M12 3a9 9 0 0 1 9 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="3.25" fill="currentColor" />
    </svg>
  );
}

export function Header({ onToggleMobileNav }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="text-foreground hover:bg-secondary hover:text-foreground md:hidden"
        onClick={onToggleMobileNav}
        aria-label="Open menu"
      >
        <Menu className="size-5" aria-hidden="true" />
      </Button>

      <Link
        to={ROUTES.home}
        className="flex items-center gap-2 rounded-md text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <LogoMark className="size-5 text-primary" />
        <span>SIH26139 Screening</span>
      </Link>

      <div className="ml-auto flex items-center gap-3">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-2 px-2 text-foreground hover:bg-secondary hover:text-foreground"
              >
                <Avatar className="size-7">
                  <AvatarFallback className="bg-primary/15 text-xs text-primary">
                    {initials(user.full_name ?? user.username)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">{user.username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="flex flex-col">
                <span className="font-medium">{user.full_name ?? user.username}</span>
                <span className="text-xs font-normal capitalize text-muted-foreground">
                  {user.role.replace("_", " ")}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="size-4" aria-hidden="true" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild size="sm">
            <Link to={ROUTES.login}>
              <User className="size-4" aria-hidden="true" />
              Log in
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
