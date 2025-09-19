import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/jobs/[jobId]/notes
export async function GET(
  _req: Request,
  { params }: { params: { jobId: string } }
) {
  const notes = await prisma.applicationNote.findMany({
    where: { jobId: params.jobId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notes);
}

// POST /api/jobs/[jobId]/notes
export async function POST(
  req: Request,
  { params }: { params: { jobId: string } }
) {
  const body = await req.json();

  if (!body.content || body.content.trim() === "") {
    return NextResponse.json({ error: "Content required" }, { status: 400 });
  }

  const note = await prisma.applicationNote.create({
    data: {
      note: body.content,
      jobId: params.jobId,
    },
  });

  return NextResponse.json(note);
}