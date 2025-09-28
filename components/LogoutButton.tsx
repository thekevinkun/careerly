"use client";

import { signOut } from "next-auth/react";
import { Button } from "./ui/button";

const LogoutButton = () => {
  return (
    <Button className="w-full" onClick={() => signOut({ callbackUrl: "/login" })}>
      Logout
    </Button>
  );
};

export default LogoutButton;
