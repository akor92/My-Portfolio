import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

/**
 * Seed the database with an initial admin account and starter content drawn
 * from the existing portfolio. Idempotent: safe to run repeatedly.
 */
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';
  const name = process.env.ADMIN_NAME ?? 'Site Admin';

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, passwordHash, role: 'ADMIN' },
  });
  console.log(`✔ Admin ready: ${admin.email}`);

  const projects = [
    {
      title: 'CI/CD Portfolio Pipeline',
      summary: 'Jenkins → Docker Hub → Kubernetes pipeline that ships this very site.',
      description:
        'A full continuous-delivery pipeline: Jenkins builds a Docker image on every push, pushes it to Docker Hub, then rolls out a fresh deployment to a Kubernetes cluster with zero manual steps.',
      techStack: ['Jenkins', 'Docker', 'Kubernetes', 'Nginx'],
      repoUrl: 'https://github.com/akor92/my-portfolio',
      featured: true,
      published: true,
      sortOrder: 1,
    },
    {
      title: 'DevFolio Platform API',
      summary: 'Type-safe REST API powering projects, blog, and contact messages.',
      description:
        'A layered Node.js + TypeScript API (Express, Prisma, PostgreSQL, Zod, JWT) with a clean routes → controllers → services → repositories architecture designed to scale horizontally.',
      techStack: ['TypeScript', 'Express', 'Prisma', 'PostgreSQL', 'Zod'],
      featured: true,
      published: true,
      sortOrder: 2,
    },
    {
      title: 'Containerized Infrastructure Lab',
      summary: 'Reproducible local infra with Docker Compose and health checks.',
      description:
        'A docker-compose environment that spins up the API, database, and web front-end with one command — the same topology used in production, just smaller.',
      techStack: ['Docker Compose', 'PostgreSQL', 'Alpine'],
      published: true,
      sortOrder: 3,
    },
  ];

  for (const p of projects) {
    const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    await prisma.project.upsert({
      where: { slug },
      update: {},
      create: { ...p, slug, authorId: admin.id },
    });
  }
  console.log(`✔ Seeded ${projects.length} projects`);

  const post = {
    title: 'Shipping a Portfolio with a Real CI/CD Pipeline',
    excerpt: 'How I turned a static HTML page into a container that deploys itself.',
    content:
      '# From static file to self-deploying container\\n\\nEvery push triggers Jenkins, which builds a Docker image, pushes it to Docker Hub, and rolls out a new Kubernetes deployment...',
    tags: ['DevOps', 'CI/CD', 'Kubernetes'],
    published: true,
  };
  const postSlug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  await prisma.post.upsert({
    where: { slug: postSlug },
    update: {},
    create: { ...post, slug: postSlug, publishedAt: new Date(), authorId: admin.id },
  });
  console.log('✔ Seeded 1 blog post');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
