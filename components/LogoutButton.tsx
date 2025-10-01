"use client";

import { signOut } from "next-auth/react";
import { Button } from "./ui/button";

const LogoutButton = () => {
  return (
    <Button variant="destructive" className="w-full" onClick={() => signOut({ callbackUrl: "/login" })}>
      Logout
    </Button>
  );
};

export default LogoutButton;
