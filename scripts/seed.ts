// Uploads local content/*.md files to Vercel Blob for the Gitto API to serve.
// Run: pnpm seed  (or: npx tsx scripts/seed.ts)
// Loads .env.local so BLOB_READ_WRITE_TOKEN is set (same as Next.js).
import { config } from "dotenv";
import { put, list, del } from "@vercel/blob";
import { readFileSync, readdirSync } from "fs";
import { join, resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local"), quiet: true });

const CONTENT_DIR = join(__dirname, "..", "content");

async function seed() {
  // Clean existing blobs
  const existing = await list();
  if (existing.blobs.length > 0) {
    console.log(`Deleting ${existing.blobs.length} existing blobs...`);
    await Promise.all(existing.blobs.map((b) => del(b.url)));
  }

  const tenants = readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const tenant of tenants) {
    const tenantDir = join(CONTENT_DIR, tenant);
    const files = readdirSync(tenantDir).filter((f) => f.endsWith(".md"));

    for (const file of files) {
      const slug = file.replace(".md", "");
      const content = readFileSync(join(tenantDir, file), "utf-8");
      const pathname = `${tenant}/${slug}.md`;

      const blob = await put(pathname, content, {
        access: "public",
        addRandomSuffix: false,
        contentType: "text/markdown",
      });
      console.log(`Uploaded ${pathname} → ${blob.url}`);
    }
  }

  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
