import { prisma } from "@/lib/prisma";

async function main() {
  // Create user
  const user = await prisma.user.upsert({
    where: { email: "kevinitsnovember@gmail.com" },
    update: {},
    create: {
      name: "Kevin Mahendra",
      email: "kevinitsnovember@gmail.com",
      passwordHash: "1234567890",
      avatarUrl: "https://i.pravatar.cc/150?u=kevin",
    },
  });

  // Create some job applications
  const googleJob = await prisma.jobApplication.create({
    data: {
      userId: user.id,
      title: "Frontend Engineer",
      company: "Google",
      jobLink: "https://careers.google.com/jobs/results/12345-frontend/",
      description: "Work on high-scale frontend projects with React/Next.js.",
      status: "applied",
      appliedAt: new Date("2025-09-01"),
      notes: {
        create: [
          { note: "Submitted resume through careers page." },
          { note: "Need to follow up with recruiter next week." },
        ],
      },
      resumes: {
        create: [
          {
            userId: user.id,
            content: "Google-tailored resume version...",
            isAiGenerated: true,
          },
        ],
      },
      coverLetters: {
        create: [
          {
            userId: user.id,
            content: "Custom Google cover letter...",
            isAiGenerated: true,
          },
        ],
      },
    },
  });

  const netflixJob = await prisma.jobApplication.create({
    data: {
      userId: user.id,
      title: "Fullstack Developer",
      company: "Netflix",
      jobLink: "https://jobs.netflix.com/roles/67890-fullstack",
      description: "Develop scalable APIs and microservices.",
      status: "interviewing",
      appliedAt: new Date("2025-08-20"),
      notes: {
        create: [{ note: "First interview scheduled next week." }],
      },
    },
  });

  // Subscription plan
  await prisma.subscription.upsert({
    where: { userId: user.id }, // ✅ works now
    update: {},
    create: {
      userId: user.id,
      plan: "pro",
      status: "active",
      currentPeriodStart: new Date("2025-09-01"),
      currentPeriodEnd: new Date("2025-10-01"),
    },
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
