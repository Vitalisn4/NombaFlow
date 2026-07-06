import 'dotenv/config';
import { createPrismaClient } from '../src/client';

async function main() {
  const prisma = createPrismaClient();
  console.log('Seed not implemented yet. See Issue #30.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
