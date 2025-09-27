"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Menu } from "lucide-react";

import AddJobForm from "@/components/modals/AddJobForm";

const Header = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isJobDetailPage = pathname.startsWith("/dashboard/jobs/");

  return (
    <header className="h-14 bg-white/80 backdrop-blur-md shadow-sm px-4 sm:px-6 flex-between">
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
              className="btn btn-primary cursor-default"
            >
              ← Back to Dashboard
            </Link>
          ) : (
            <AddJobForm />
          )}
        </div>

        <span className="text-sm text-muted-foreground hidden sm:block">
          {session?.user?.name}
        </span>
        <Avatar className="h-8 w-8">
          {session?.user?.avatarUrl ? (
            <AvatarImage
              src={session.user.avatarUrl}
              alt={session.user.name ?? ""}
            />
          ) : (
            <AvatarFallback>{session?.user?.name?.[0] ?? "U"}</AvatarFallback>
          )}
        </Avatar>
      </div>
    </header>
  );
};

export default Header;
