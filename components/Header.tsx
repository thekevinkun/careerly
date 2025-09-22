"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

const Header = () => {
  const { data: session } = useSession();

  return (
    <header className="h-14 border-b bg-card px-6 flex-between">
      <h1 className="logo text-2xl font-bold text-primary">Careerly</h1>

      <div className="flex items-center gap-3">
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
