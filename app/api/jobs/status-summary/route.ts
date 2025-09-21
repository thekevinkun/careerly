import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await prisma.jobApplication.groupBy({
    by: ["status"],
    _count: { status: true },
    where: { userId: session.user.id },
  });

  return NextResponse.json(summary);
}
