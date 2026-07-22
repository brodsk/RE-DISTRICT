#!/usr/bin/env tsx
/**
 * RE:DISTRICT — Alza Import CLI
 *
 * Usage:
 *   npm run import:alza
 *   npm run import:alza -- --url https://www.alza.sk/beauty/casio/v1508.htm
 *   npx tsx scripts/import-alza.ts --url <url>
 *
 * Environment variables required:
 *   SUPABASE_URL
 *   SUPABASE_SECRET_KEY
 */

import { importAlzaCategory } from "../lib/alza/importer";
import { writeFileSync } from "fs";
import { join } from "path";

// ── Argument parsing ───────────────────────────────────────────────────────

function parseArgs(): { url: string } {
  const args = process.argv.slice(2);
  let url = process.env.ALZA_CATEGORY_URL ?? "https://www.alza.sk/beauty/casio/v1508.htm";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--url" && args[i + 1]) {
      url = args[i + 1];
      i++;
    }
  }

  if (!url.startsWith("https://www.alza.")) {
    console.error(`❌ Invalid Alza URL: ${url}`);
    console.error(`   Must start with https://www.alza.sk/ or https://www.alza.cz/`);
    process.exit(1);
  }

  return { url };
}

// ── Environment check ──────────────────────────────────────────────────────

function checkEnvironment(): void {
  const required = ["SUPABASE_URL", "SUPABASE_SECRET_KEY"];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    for (const key of missing) {
      console.error(`   - ${key}`);
    }
    console.error("\n   Create a .env.local file or set them in your environment.");
    process.exit(1);
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  checkEnvironment();
  const { url } = parseArgs();

  console.log(`\n🚀 RE:DISTRICT Alza Importer`);
  console.log(`   Category: ${url}\n`);

  const startMs = Date.now();

  try {
    const report = await importAlzaCategory(url);

    const durationSec = (report.durationMs / 1000).toFixed(1);

    console.log("\n" + "═".repeat(50));
    console.log("  IMPORT REPORT");
    console.log("═".repeat(50));
    console.log(`  Category:    ${report.categoryUrl}`);
    console.log(`  Duration:    ${durationSec}s`);
    console.log(`  Pages:       ${report.pagesCrawled}/${report.pagesFound}`);
    console.log(`  Products:    ${report.productsFound} found`);
    console.log(`    ✓ Created: ${report.productsCreated}`);
    console.log(`    ↺ Updated: ${report.productsUpdated}`);
    console.log(`    ⚠ Unavail: ${report.productsUnavailable}`);
    console.log(`    ✗ Failed:  ${report.productsFailed}`);
    console.log(`  Images:`);
    console.log(`    ↓ Downloaded: ${report.imagesDownloaded}`);
    console.log(`    ⏭ Skipped:   ${report.imagesSkipped}`);

    if (report.errors.length > 0) {
      console.log(`\n  Errors (${report.errors.length}):`);
      for (const err of report.errors.slice(0, 10)) {
        console.log(`    [${err.phase}] ${err.url}: ${err.message}`);
      }
      if (report.errors.length > 10) {
        console.log(`    ... and ${report.errors.length - 10} more`);
      }
    }

    console.log("═".repeat(50));

    // Save report to file
    const reportPath = join(process.cwd(), `import-report-${Date.now()}.json`);
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Full report saved: ${reportPath}`);

    if (report.productsFailed > 0 && report.productsCreated === 0 && report.productsUpdated === 0) {
      process.exit(1);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ Fatal import error: ${msg}`);
    if (err instanceof Error && err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

main();
