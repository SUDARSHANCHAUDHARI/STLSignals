#!/usr/bin/env tsx
/**
 * Local pipeline runner — fetch Reddit posts then detect signals.
 * Run: pnpm pipeline
 * Output: detected signals printed to stdout for review.
 * Use the dashboard at http://localhost:3000 to review and manually draft posts.
 */

import { fetchRedditPostsJob } from "@/lib/jobs/fetch-reddit-posts";
import { detectSignalsJob } from "@/lib/jobs/detect-signals";

async function main() {
  console.log("=== STL Signals Pipeline ===\n");

  console.log("Step 1/2: Fetching Reddit posts...");
  const fetchResult = await fetchRedditPostsJob();
  console.log(JSON.stringify(fetchResult, null, 2));

  console.log("\nStep 2/2: Detecting signals...");
  const detectResult = await detectSignalsJob();
  console.log(JSON.stringify(detectResult, null, 2));

  if (detectResult.ok && detectResult.signals.length > 0) {
    console.log("\n=== Detected Signals ===");
    for (const signal of detectResult.signals) {
      console.log(`\n[${signal.topic}] ${signal.title}`);
      console.log(`  Score: ${signal.score}  Confidence: ${signal.confidence.toFixed(2)}  Sources: ${signal.sourceCount}`);
      console.log(`  Summary: ${signal.summary}`);
    }
    console.log(`\nOpen http://localhost:3000/signals to review and create drafts.`);
  } else {
    console.log("\nNo new signals detected.");
  }
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
