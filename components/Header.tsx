"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import moment from "moment";
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
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const isJobDetailPage = pathname.startsWith("/dashboard/jobs/");

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // update every second

    return () => clearInterval(timer);
  }, []);

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

        <span className="text-sm text-muted-foreground hidden md:block">
          {moment(currentTime).format("dddd, D MMM YYYY · hh:mm")}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer">
              {session?.user?.image ? (
                <AvatarImage
                  src={session.user.image}
                  alt={session.user.name ?? ""}
                />
              ) : (
                <AvatarFallback>
                  {session?.user?.name?.[0] ?? "U"}
                </AvatarFallback>
              )}
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48 sm:w-56">
            <div className="px-2 py-3 text-sm">
              <p>Hi, <span className="font-semibold">{session?.user?.name}</span></p>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => router.push("/account/profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/account/settings")}>
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
