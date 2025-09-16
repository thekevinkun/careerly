import { prisma } from "@/lib/prisma";

export default async function Home() {
  const users = await prisma.user.findMany();
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Careerly</h1>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </main>
  );
}
