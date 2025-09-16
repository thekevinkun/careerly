import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/jobs → user logged in jobs
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await prisma.jobApplication.findMany({
    where: { userId: session.user.id },
    include: {
      notes: true,
      resumes: true,
      coverLetters: true,
    },
  });

  return NextResponse.json(jobs);
}

// POST /api/jobs → create new job
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const newJob = await prisma.jobApplication.create({
    data: {
      userId: session.user.id,
      title: body.title,
      company: body.company,
      jobLink: body.jobLink,
      description: body.description,
      status: body.status ?? "applied",
      appliedAt: body.appliedAt ? new Date(body.appliedAt) : new Date(),

      notes: body.notes
        ? { create: body.notes.map((note: string) => ({ note })) }
        : undefined,

      resumes: body.resumes
        ? {
            create: body.resumes.map((resume: any) => ({
              content: resume.content,
              isAiGenerated: resume.isAiGenerated ?? false,
              userId: session.user.id,
            })),
          }
        : undefined,

      coverLetters: body.coverLetters
        ? {
            create: body.coverLetters.map((cl: any) => ({
              content: cl.content,
              isAiGenerated: cl.isAiGenerated ?? false,
              userId: session.user.id,
            })),
          }
        : undefined,
    },
    include: {
      notes: true,
      resumes: true,
      coverLetters: true,
    },
  });

  return NextResponse.json(newJob, { status: 201 });
}
