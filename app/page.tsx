import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany();
  
  return (
    <main className="p-8">
      <h1 className="text-2xl">Careerly</h1>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </main>
  );
}
