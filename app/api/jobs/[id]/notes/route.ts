import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/jobs/[jobId]/notes
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const notes = await prisma.applicationNote.findMany({
    where: { jobId: params.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notes);
}

// POST /api/jobs/[jobId]/notes
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  if (!body.content || body.content.trim() === "") {
    return NextResponse.json({ error: "Content required" }, { status: 400 });
  }

  const note = await prisma.applicationNote.create({
    data: {
      note: body.content,
      jobId: params.id,
    },
  });

  return NextResponse.json(note);
}
