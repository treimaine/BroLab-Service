/**
 * BroLab Entertainment Job Worker
 * 
 * External Node.js worker that processes background jobs from Convex.
 * Handles preview generation using ffmpeg CLI.
 * 
 * Requirements:
 * - Requirement 11.2: Poll Convex jobs table for pending jobs
 * - Requirement 11.3: Extract first 30s to mp3 (or full if shorter)
 * - Requirement 11.4: Upload preview to Convex Storage
 * - Requirement 11.7: Handle failures and record errors
 * 
 * Usage:
 * 1. Build: npm run build:worker
 * 2. Run: npm run worker
 * 
 * Environment Variables:
 * - NEXT_PUBLIC_CONVEX_URL: Convex deployment URL (required)
 * - WORKER_ID: Optional worker identifier (defaults to hostname)
 * - POLL_INTERVAL_MS: Optional polling interval in milliseconds (defaults to 5000)
 */

// Load environment variables from .env.local
import { config } from "dotenv";
import { join, resolve } from "node:path";

// Load .env.local from project root
config({ path: resolve(process.cwd(), ".env.local") });

import { ConvexHttpClient } from "convex/browser";
import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import { hostname, tmpdir } from "node:os";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
const WORKER_ID = process.env.WORKER_ID || `worker-${hostname()}`;
const POLL_INTERVAL_MS = Number.parseInt(process.env.POLL_INTERVAL_MS || "5000", 10);
const PREVIEW_DURATION_SEC = 30;

if (!CONVEX_URL) {
  console.error("ERROR: NEXT_PUBLIC_CONVEX_URL environment variable is required");
  process.exit(1);
}

// ============================================================================
// CONVEX CLIENT
// ============================================================================

const convex = new ConvexHttpClient(CONVEX_URL);

// ============================================================================
// TYPES
// ============================================================================

// Branded types for Convex IDs - provides type safety and semantic meaning
type ConvexId<T extends string = string> = string & { readonly __brand: T };

// Helper function to create branded IDs (use when receiving IDs from Convex)
function asConvexId<T extends string = string>(id: string): ConvexId<T> {
  return id as ConvexId<T>;
}

// Specific branded types for different entities
type TrackId = ConvexId<'Track'>;
type StorageId = ConvexId<'Storage'>;
type JobId = ConvexId<'Job'>;
type WorkspaceId = ConvexId<'Workspace'>;
type LicenseId = ConvexId<'License'>;
type DocumentId = ConvexId<'LicenseDocument'>;

interface PreviewGenerationPayload {
  trackId: TrackId;
  fullStorageId: StorageId;
}

interface LicensePdfGenerationPayload {
  licenseId: LicenseId;
  documentId: DocumentId;
  workspaceId: WorkspaceId;
}

type JobPayload = PreviewGenerationPayload | LicensePdfGenerationPayload;

interface Job {
  _id: JobId;
  workspaceId: WorkspaceId;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  payload: JobPayload;
  attempts: number;
  error?: string;
  lockedAt?: number;
  lockedBy?: string;
  createdAt: number;
  updatedAt: number;
}

// License data structure returned from Convex
interface LicenseDataForPdf {
  license: {
    _id: string;
    tierKey: string;
    termsVersion: string;
    includesStems: boolean;
    rightsSnapshot: {
      commercialUse: boolean;
      audioStreamingCap: number;
      musicVideosCap: number;
      livePerformanceCap: number;
      radioBroadcastCap: number;
      syncAllowed: boolean;
    };
    prohibitedUsesSnapshot: string[];
    creditLineSnapshot: string;
    licensorWriterSharePercent?: number;
    licenseeWriterSharePercent?: number;
    licensorPublisherSharePercent?: number;
    licenseePublisherSharePercent?: number;
    publishingEnabled: boolean;
    buyerEmail?: string;
    createdAt: number;
  };
  track: {
    title: string;
    bpm?: number;
    key?: string;
  };
  workspace: {
    name: string;
    slug: string;
  };
  order: {
    amountCents: number;
    currency: string;
    createdAt: number;
  };
}

// Raw job data structure from Convex (before type branding)
interface RawJobData {
  _id: string;
  workspaceId: string;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  payload: {
    trackId?: string;
    fullStorageId?: string;
    licenseId?: string;
    documentId?: string;
    workspaceId?: string;
  };
  attempts: number;
  error?: string;
  lockedAt?: number;
  lockedBy?: string;
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// FFMPEG UTILITIES
// ============================================================================

/**
 * Extract preview from audio file using ffmpeg
 * 
 * Extracts first 30 seconds (or full length if shorter) as MP3.
 * 
 * @param inputPath - Path to input audio file
 * @param outputPath - Path to output MP3 file
 * @param durationSec - Duration to extract (default: 30)
 * @returns Promise that resolves when extraction is complete
 * @throws Error if ffmpeg fails
 */
async function extractPreview(
  inputPath: string,
  outputPath: string,
  durationSec: number = PREVIEW_DURATION_SEC
): Promise<void> {
  return new Promise((resolve, reject) => {
    // ffmpeg command: extract first N seconds, convert to MP3
    // -i: input file
    // -t: duration (will use full length if file is shorter)
    // -acodec libmp3lame: MP3 codec
    // -b:a 192k: bitrate 192 kbps
    // -y: overwrite output file
    const args = [
      "-i",
      inputPath,
      "-t",
      durationSec.toString(),
      "-acodec",
      "libmp3lame",
      "-b:a",
      "192k",
      "-y",
      outputPath,
    ];

    console.log(`[ffmpeg] Executing: ffmpeg ${args.join(" ")}`);

    const ffmpeg = spawn("ffmpeg", args);

    let stderr = "";

    ffmpeg.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        console.log(`[ffmpeg] Preview extracted successfully`);
        resolve();
      } else {
        console.error(`[ffmpeg] Failed with code ${code}`);
        console.error(`[ffmpeg] stderr: ${stderr}`);
        reject(new Error(`ffmpeg failed with code ${code}: ${stderr}`));
      }
    });

    ffmpeg.on("error", (err) => {
      console.error(`[ffmpeg] Spawn error:`, err);
      reject(new Error(`Failed to spawn ffmpeg: ${err.message}`));
    });
  });
}

/**
 * Check if ffmpeg is installed
 * 
 * @returns Promise that resolves to true if ffmpeg is available
 */
async function checkFfmpegInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    const ffmpeg = spawn("ffmpeg", ["-version"]);

    ffmpeg.on("close", (code) => {
      resolve(code === 0);
    });

    ffmpeg.on("error", () => {
      resolve(false);
    });
  });
}

// ============================================================================
// JOB PROCESSING
// ============================================================================

/**
 * Generate license PDF using pdf-lib
 * 
 * Creates a professional license document with all terms and conditions.
 * 
 * @param licenseData - License data fetched from Convex
 * @param outputPath - Path to save the generated PDF
 */
async function generateLicensePdf(
  licenseData: LicenseDataForPdf,
  outputPath: string
): Promise<void> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a page (A4 format: 595 x 842 points)
  const page = pdfDoc.addPage([595, 842]);
  const { height } = page.getSize();
  
  // Embed fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Define colors
  const black = rgb(0, 0, 0);
  const gray = rgb(0.4, 0.4, 0.4);
  
  // Define margins and positions
  const margin = 50;
  let yPosition = height - margin;
  const lineHeight = 20;
  const sectionSpacing = 30;
  
  // Helper function to add text
  const addText = (text: string, fontSize: number, font: typeof regularFont, color = black) => {
    page.drawText(text, {
      x: margin,
      y: yPosition,
      size: fontSize,
      font,
      color,
    });
    yPosition -= lineHeight;
  };
  
  // Helper function to add section header
  const addSectionHeader = (title: string) => {
    yPosition -= sectionSpacing;
    page.drawText(title, {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: black,
    });
    yPosition -= lineHeight;
  };
  
  // Helper function to format cap value
  const formatCap = (cap: number): string => {
    if (cap === -1) return "Unlimited";
    if (cap === 0) return "Not included";
    return cap.toLocaleString();
  };
  
  // Helper function to format currency
  const formatCurrency = (amountCents: number, currency: string): string => {
    const amount = amountCents / 100;
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  };
  
  // Helper function to format date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  // ============ TITLE ============
  page.drawText("BEAT LICENSE AGREEMENT", {
    x: margin,
    y: yPosition,
    size: 18,
    font: boldFont,
    color: black,
  });
  yPosition -= lineHeight * 1.5;
  
  addText(`License ID: ${licenseData.license._id}`, 10, regularFont, gray);
  addText(`Issue Date: ${formatDate(licenseData.license.createdAt)}`, 10, regularFont, gray);
  addText(`Terms Version: ${licenseData.license.termsVersion}`, 10, regularFont, gray);
  
  // ============ PARTIES ============
  addSectionHeader("PARTIES");
  addText(`Licensor: ${licenseData.workspace.name}`, 11, regularFont);
  addText(`Licensee: ${licenseData.license.buyerEmail || "Buyer"}`, 11, regularFont);
  
  // ============ TRACK INFO ============
  addSectionHeader("TRACK INFORMATION");
  addText(`Title: ${licenseData.track.title}`, 11, regularFont);
  if (licenseData.track.bpm) {
    addText(`BPM: ${licenseData.track.bpm}`, 11, regularFont);
  }
  if (licenseData.track.key) {
    addText(`Key: ${licenseData.track.key}`, 11, regularFont);
  }
  addText(`Purchase Amount: ${formatCurrency(licenseData.order.amountCents, licenseData.order.currency)}`, 11, regularFont);
  addText(`Purchase Date: ${formatDate(licenseData.order.createdAt)}`, 11, regularFont);
  
  // ============ LICENSE TIER ============
  addSectionHeader("LICENSE TIER");
  const tierName = licenseData.license.tierKey.charAt(0).toUpperCase() + licenseData.license.tierKey.slice(1);
  addText(`Tier: ${tierName} License`, 11, boldFont);
  addText(`Stems Included: ${licenseData.license.includesStems ? "Yes" : "No"}`, 11, regularFont);
  
  // ============ RIGHTS & CAPS ============
  addSectionHeader("USAGE RIGHTS AND LIMITATIONS");
  const rights = licenseData.license.rightsSnapshot;
  addText(`Commercial Use: ${rights.commercialUse ? "Allowed" : "Not Allowed"}`, 11, regularFont);
  addText(`Audio Streaming: ${formatCap(rights.audioStreamingCap)} streams`, 11, regularFont);
  addText(`Music Videos: ${formatCap(rights.musicVideosCap)} videos`, 11, regularFont);
  addText(`Live Performances: ${formatCap(rights.livePerformanceCap)} performances`, 11, regularFont);
  addText(`Radio Broadcasts: ${formatCap(rights.radioBroadcastCap)} broadcasts`, 11, regularFont);
  addText(`Sync Licensing (TV/Film/Ads/Games): ${rights.syncAllowed ? "Allowed" : "Not Allowed"}`, 11, regularFont);
  
  // ============ PUBLISHING SPLIT ============
  if (licenseData.license.publishingEnabled) {
    addSectionHeader("PUBLISHING SPLIT");
    addText(`Licensor Writer Share: ${licenseData.license.licensorWriterSharePercent || 50}%`, 11, regularFont);
    addText(`Licensee Writer Share: ${licenseData.license.licenseeWriterSharePercent || 50}%`, 11, regularFont);
    addText(`Licensor Publisher Share: ${licenseData.license.licensorPublisherSharePercent || 50}%`, 11, regularFont);
    addText(`Licensee Publisher Share: ${licenseData.license.licenseePublisherSharePercent || 50}%`, 11, regularFont);
  }
  
  // ============ CREDIT LINE ============
  addSectionHeader("CREDIT REQUIREMENT");
  addText(licenseData.license.creditLineSnapshot, 11, regularFont);
  
  // ============ PROHIBITED USES ============
  addSectionHeader("PROHIBITED USES");
  for (const prohibition of licenseData.license.prohibitedUsesSnapshot) {
    addText(`• ${prohibition}`, 11, regularFont);
  }
  
  // ============ FOOTER ============
  yPosition = margin + 40;
  page.drawText("This is a legally binding agreement. By using this beat, you agree to all terms above.", {
    x: margin,
    y: yPosition,
    size: 9,
    font: regularFont,
    color: gray,
  });
  yPosition -= 15;
  page.drawText(`Generated by BroLab Entertainment (${licenseData.workspace.slug}.brolabentertainment.com)`, {
    x: margin,
    y: yPosition,
    size: 9,
    font: regularFont,
    color: gray,
  });
  
  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(outputPath, pdfBytes);
}

/**
 * Process a license PDF generation job
 * 
 * 1. Fetch license + track + workspace data from Convex
 * 2. Generate PDF using pdf-lib
 * 3. Upload PDF to Convex Storage
 * 4. Update licenseDocuments with storage ID
 * 5. Update purchaseEntitlements with PDF storage ID
 * 
 * @param job - Job to process
 * @throws Error if processing fails
 */
async function processLicensePdfGenerationJob(job: Job): Promise<void> {
  const payload = job.payload as LicensePdfGenerationPayload;
  const { licenseId, documentId } = payload;

  console.log(`[job ${job._id}] Processing license PDF generation for license ${licenseId}`);

  // Create temporary directory for this job
  const tempDir = join(tmpdir(), `brolab-license-${job._id}`);
  await fs.mkdir(tempDir, { recursive: true });

  try {
    // Step 1: Fetch license data from Convex
    console.log(`[job ${job._id}] Fetching license data...`);
    const licenseData = await convex.query(
      "modules/licenses:getLicenseForPdf" as never,
      { licenseId } as never
    ) as LicenseDataForPdf;

    if (!licenseData) {
      throw new Error("Failed to fetch license data from Convex");
    }

    console.log(`[job ${job._id}] License data fetched: ${licenseData.track.title}`);

    // Step 2: Generate PDF
    console.log(`[job ${job._id}] Generating PDF...`);
    const pdfPath = join(tempDir, "license.pdf");
    await generateLicensePdf(licenseData, pdfPath);

    // Step 3: Read PDF file
    const pdfBuffer = await fs.readFile(pdfPath);
    console.log(`[job ${job._id}] PDF size: ${pdfBuffer.byteLength} bytes`);

    // Step 4: Upload PDF to Convex Storage
    console.log(`[job ${job._id}] Uploading PDF to Convex Storage...`);
    const uploadUrl = await convex.mutation(
      "platform/storage:generateUploadUrl" as never,
      {} as never
    );
    
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/pdf",
      },
      body: pdfBuffer,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload PDF: ${uploadResponse.statusText}`);
    }

    const uploadResult = (await uploadResponse.json()) as { storageId: string };
    const pdfStorageId = asConvexId<'Storage'>(uploadResult.storageId);
    console.log(`[job ${job._id}] PDF uploaded with storage ID: ${pdfStorageId}`);

    // Step 5: Update license document and entitlement
    console.log(`[job ${job._id}] Updating license document and entitlement...`);
    await convex.mutation(
      "modules/licenses:completeLicensePdfGeneration" as never,
      { 
        documentId, 
        storageId: pdfStorageId,
        licenseId,
      } as never
    );

    console.log(`[job ${job._id}] ✅ License PDF generation completed successfully`);
  } finally {
    // Cleanup: Remove temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
      console.log(`[job ${job._id}] Cleaned up temporary directory`);
    } catch (err) {
      console.error(`[job ${job._id}] Failed to cleanup temp directory:`, err);
    }
  }
}

/**
 * Process a preview generation job
 * 
 * 1. Download full audio file from Convex Storage
 * 2. Extract 30-second preview using ffmpeg
 * 3. Upload preview to Convex Storage
 * 4. Update track with preview storage ID
 * 5. Record "preview_generated" event
 * 
 * @param job - Job to process
 * @throws Error if processing fails
 */
async function processPreviewGenerationJob(job: Job): Promise<void> {
  const payload = job.payload as PreviewGenerationPayload;
  const { trackId, fullStorageId } = payload;

  console.log(`[job ${job._id}] Processing preview generation for track ${trackId}`);

  // Create temporary directory for this job
  const tempDir = join(tmpdir(), `brolab-preview-${job._id}`);
  await fs.mkdir(tempDir, { recursive: true });

  try {
    // Step 1: Download full audio file from Convex Storage
    console.log(`[job ${job._id}] Downloading full audio file...`);
    const fullAudioUrl = await convex.query(
      "platform/storage:getFileUrl" as never,
      { storageId: fullStorageId } as never
    );

    if (!fullAudioUrl) {
      throw new Error("Failed to get full audio file URL from Convex Storage");
    }

    const fullAudioResponse = await fetch(fullAudioUrl);
    if (!fullAudioResponse.ok) {
      throw new Error(`Failed to download full audio file: ${fullAudioResponse.statusText}`);
    }

    const fullAudioBuffer = await fullAudioResponse.arrayBuffer();
    const inputPath = join(tempDir, "input.audio");
    await fs.writeFile(inputPath, Buffer.from(fullAudioBuffer));

    console.log(`[job ${job._id}] Downloaded ${fullAudioBuffer.byteLength} bytes`);

    // Step 2: Extract preview using ffmpeg
    console.log(`[job ${job._id}] Extracting ${PREVIEW_DURATION_SEC}s preview...`);
    const outputPath = join(tempDir, "preview.mp3");
    await extractPreview(inputPath, outputPath, PREVIEW_DURATION_SEC);

    // Step 3: Read preview file
    const previewBuffer = await fs.readFile(outputPath);
    console.log(`[job ${job._id}] Preview size: ${previewBuffer.byteLength} bytes`);

    // Step 4: Upload preview to Convex Storage
    console.log(`[job ${job._id}] Uploading preview to Convex Storage...`);
    const uploadUrl = await convex.mutation(
      "platform/storage:generateUploadUrl" as never,
      {} as never
    );
    
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "audio/mpeg",
      },
      body: previewBuffer,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload preview: ${uploadResponse.statusText}`);
    }

    const uploadResult = (await uploadResponse.json()) as { storageId: string };
    const previewStorageId = asConvexId<'Storage'>(uploadResult.storageId);
    console.log(`[job ${job._id}] Preview uploaded with storage ID: ${previewStorageId}`);

    // Step 5: Update track with preview storage ID
    console.log(`[job ${job._id}] Updating track with preview...`);
    await convex.mutation(
      "modules/beats:completePreviewGeneration" as never,
      { trackId, previewStorageId } as never
    );

    console.log(`[job ${job._id}] ✅ Preview generation completed successfully`);
  } finally {
    // Cleanup: Remove temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
      console.log(`[job ${job._id}] Cleaned up temporary directory`);
    } catch (err) {
      console.error(`[job ${job._id}] Failed to cleanup temp directory:`, err);
    }
  }
}

/**
 * Process a single job
 * 
 * Handles job locking, processing, completion, and failure.
 * 
 * @param job - Job to process
 */
async function processJob(job: Job): Promise<void> {
  console.log(`\n[job ${job._id}] Starting job processing (type: ${job.type}, attempt: ${job.attempts + 1})`);

  try {
    // Step 1: Lock the job
    console.log(`[job ${job._id}] Attempting to lock job...`);
    const locked = await convex.mutation(
      "platform/jobs:lockJob" as never,
      { jobId: job._id, workerId: WORKER_ID } as never
    );

    if (!locked) {
      console.log(`[job ${job._id}] Job is already locked by another worker, skipping`);
      return;
    }

    console.log(`[job ${job._id}] Job locked successfully`);

    // Step 2: Process the job based on type
    if (job.type === "preview_generation") {
      await processPreviewGenerationJob(job);
    } else if (job.type === "license_pdf_generation") {
      await processLicensePdfGenerationJob(job);
    } else {
      throw new Error(`Unknown job type: ${job.type}`);
    }

    // Step 3: Mark job as completed
    console.log(`[job ${job._id}] Marking job as completed...`);
    await convex.mutation(
      "platform/jobs:completeJob" as never,
      { jobId: job._id } as never
    );

    console.log(`[job ${job._id}] ✅ Job completed successfully`);
  } catch (error) {
    // Step 4: Handle failure
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[job ${job._id}] ❌ Job failed:`, errorMessage);

    try {
      // Mark job as failed in Convex
      await convex.mutation(
        "platform/jobs:failJob" as never,
        { jobId: job._id, error: errorMessage } as never
      );

      // Update entity processing status to failed
      if (job.type === "preview_generation") {
        const payload = job.payload as PreviewGenerationPayload;
        await convex.mutation(
          "modules/beats:failPreviewGeneration" as never,
          { trackId: payload.trackId, error: errorMessage } as never
        );
      } else if (job.type === "license_pdf_generation") {
        const payload = job.payload as LicensePdfGenerationPayload;
        await convex.mutation(
          "modules/licenses:failLicensePdfGeneration" as never,
          { documentId: payload.documentId, error: errorMessage } as never
        );
      }

      console.log(`[job ${job._id}] Job marked as failed in database`);
    } catch (failError) {
      console.error(`[job ${job._id}] Failed to mark job as failed:`, failError);
    }
  }
}

// ============================================================================
// WORKER MAIN LOOP
// ============================================================================

/**
 * Poll for pending jobs and process them
 */
async function pollAndProcessJobs(): Promise<void> {
  try {
    // Query for next pending job (any type)
    const rawJob = await convex.query(
      "platform/jobs:getNextPendingJob" as never,
      {} as never
    ) as unknown;

    if (rawJob) {
      // Cast raw job data to typed Job with branded IDs
      const jobData = rawJob as RawJobData;

      let typedPayload: JobPayload;
      
      if (jobData.type === "preview_generation") {
        typedPayload = {
          trackId: asConvexId<'Track'>(jobData.payload.trackId),
          fullStorageId: asConvexId<'Storage'>(jobData.payload.fullStorageId),
        };
      } else if (jobData.type === "license_pdf_generation") {
        typedPayload = {
          licenseId: asConvexId<'License'>(jobData.payload.licenseId),
          documentId: asConvexId<'LicenseDocument'>(jobData.payload.documentId),
          workspaceId: asConvexId<'Workspace'>(jobData.payload.workspaceId),
        };
      } else {
        throw new Error(`Unknown job type: ${jobData.type}`);
      }

      const typedJob: Job = {
        ...jobData,
        _id: asConvexId<'Job'>(jobData._id),
        workspaceId: asConvexId<'Workspace'>(jobData.workspaceId),
        payload: typedPayload,
      };
      
      await processJob(typedJob);
    } else {
      // No jobs available, wait before next poll
      // (using a shorter log message to avoid spam)
      process.stdout.write(".");
    }
  } catch (error) {
    console.error("\n[worker] Error in poll loop:", error);
  }
}

/**
 * Main worker function
 */
async function main() {
  console.log("=".repeat(80));
  console.log("BroLab Entertainment Job Worker");
  console.log("=".repeat(80));
  console.log(`Worker ID: ${WORKER_ID}`);
  console.log(`Convex URL: ${CONVEX_URL}`);
  console.log(`Poll Interval: ${POLL_INTERVAL_MS}ms`);
  console.log(`Preview Duration: ${PREVIEW_DURATION_SEC}s`);
  console.log("=".repeat(80));

  // Check if ffmpeg is installed
  console.log("\n[startup] Checking ffmpeg installation...");
  const ffmpegInstalled = await checkFfmpegInstalled();

  if (!ffmpegInstalled) {
    console.error("\n❌ ERROR: ffmpeg is not installed or not in PATH");
    console.error("\nPlease install ffmpeg:");
    console.error("  - Windows: choco install ffmpeg OR download from https://ffmpeg.org/download.html");
    console.error("  - macOS: brew install ffmpeg");
    console.error("  - Linux: sudo apt-get install ffmpeg");
    process.exit(1);
  }

  console.log("✅ ffmpeg is installed and available");

  // Start polling loop
  console.log("\n[worker] Starting job polling loop...");
  console.log("[worker] Waiting for jobs (dots indicate polling)...\n");

  // Poll immediately, then at intervals
  await pollAndProcessJobs();

  setInterval(async () => {
    await pollAndProcessJobs();
  }, POLL_INTERVAL_MS);
}

// ============================================================================
// ENTRY POINT
// ============================================================================

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n[worker] Received SIGINT, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n\n[worker] Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

// Start the worker
try {
  await main();
} catch (error) {
  console.error("\n[worker] Fatal error:", error);
  process.exit(1);
}
