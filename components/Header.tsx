"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

import LogoutButton from "@/components/LogoutButton";
import AddJobFormDialog from "@/components/dialogs/AddJobFormDialog";

const Header = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const isJobDetailPage = pathname.startsWith("/dashboard/jobs/");
  const isAccountPage = pathname.startsWith("/account/");

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // update every second

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-14 bg-white/80 backdrop-blur-md shadow-sm !pl-1.5 lg:!pl-6 !px-6 flex-between z-30">
      <div className="flex items-center gap-2">
        {/* Hamburger only visible on mobile */}
        {!isAccountPage &&
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded hover:bg-muted"
          >
            <Menu className="h-6 w-6" />
          </button>
        }

        <Link href="/" className={`${isAccountPage ? "ml-2 lg:ml-0" : "hidden lg:block"}`}>
          <h1 className="logo text-2xl">
            Careerly
          </h1>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {!isAccountPage &&
          <div className="w-fit block lg:hidden">
            {isJobDetailPage ? (
              <Link
                href="/dashboard"
                className="!text-xs btn btn-primary cursor-default"
              >
                ← Back to Dashboard
              </Link>
            ) : (
              <AddJobFormDialog />
            )}
          </div>
        }

        <span className="text-sm text-muted-foreground hidden md:block">
          {format(currentTime, "EEEE, d MMM yyyy · hh:mm a")}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9 cursor-pointer" key={session?.user?.image || "no-header-avatar"}>
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
