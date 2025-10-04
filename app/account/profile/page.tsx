import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

import AccountProfile from "@/components/account/Profile";

const ProfilePage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return <AccountProfile />;
};

export default ProfilePage;
