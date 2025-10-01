"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

import AddJobForm from "@/components/modals/AddJobForm";
import LogoutButton from "./LogoutButton";

const Header = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isJobDetailPage = pathname.startsWith("/dashboard/jobs/");

  return (
    <header className="h-14 bg-white/80 backdrop-blur-md shadow-sm pl-2 pr-4 lg:!px-6 flex-between z-30">
      <div className="flex items-center gap-3">
        {/* Hamburger only visible on mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded hover:bg-muted"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="logo text-xl sm:text-2xl font-bold text-primary">
          Careerly
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-fit block lg:hidden">
          {isJobDetailPage ? (
            <Link
              href="/dashboard"
              className="!text-xs btn btn-primary cursor-default"
            >
              ← Back to Dashboard
            </Link>
          ) : (
            <AddJobForm />
          )}
        </div>

        <span className="text-sm text-muted-foreground hidden sm:block">
          Hi, <b>{session?.user?.name ? session.user.name : "Welcome back"}</b>
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer">
              {session?.user?.avatarUrl ? (
                <AvatarImage
                  src={session.user.avatarUrl}
                  alt={session.user.name ?? ""}
                />
              ) : (
                <AvatarFallback>
                  {session?.user?.name?.[0] ?? "U"}
                </AvatarFallback>
              )}
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => console.log("Go to profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Go to settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="hover:!bg-transparent">
              <LogoutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
