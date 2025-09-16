import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/jobs → user logged in jobs
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const jobs = await prisma.jobApplication.findMany({
    where: { userId },
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
  const body = await req.json();

  const newJob = await prisma.jobApplication.create({
    data: {
      userId: body.userId,
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
              userId: body.userId,
            })),
          }
        : undefined,

      coverLetters: body.coverLetters
        ? {
            create: body.coverLetters.map((cl: any) => ({
              content: cl.content,
              isAiGenerated: cl.isAiGenerated ?? false,
              userId: body.userId,
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
