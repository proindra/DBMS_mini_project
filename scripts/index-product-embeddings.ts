import "dotenv/config";
import { prisma } from "../src/lib/db";
import { indexProductEmbeddings } from "../src/lib/vector-search/service";

async function main() {
  const count = await indexProductEmbeddings();
  console.log(`Indexed embeddings for ${count} products.`);
}

main()
  .catch((error) => {
    console.error("Product embedding indexing failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
