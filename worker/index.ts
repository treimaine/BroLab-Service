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
 * - WORKER_SECRET: Shared secret configured in both the worker and Convex (required)
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

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
const WORKER_SECRET = process.env.WORKER_SECRET;
const WORKER_ID = process.env.WORKER_ID || `worker-${hostname()}`;
const POLL_INTERVAL_MS = Number.parseInt(process.env.POLL_INTERVAL_MS || "5000", 10);
const PREVIEW_DURATION_SEC = 30;

if (!CONVEX_URL) {
  console.error("ERROR: NEXT_PUBLIC_CONVEX_URL environment variable is required");
  process.exit(1);
}

if (!WORKER_SECRET) {
  console.error("ERROR: WORKER_SECRET environment variable is required");
  process.exit(1);
}

const convex = new ConvexHttpClient(CONVEX_URL);

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
  entitlement: {
    licenseTermsSnapshot: {
      commonTerms?: {
        grant_type: string;
        ownership: {
          beat_and_composition_owner: string;
          master_owner: string;
          transfer: string;
        };
        content_id_policy: {
          allow_master_claims: boolean;
          disallow_beat_claims: boolean;
          note: string;
        };
        refund_policy: {
          default: string;
          exception: string;
          note: string;
        };
        termination: {
          breach_cure_days: number;
          termination_effect: string;
        };
        governing_law: {
          jurisdiction: string;
          venue: string;
          note: string;
        };
      };
    };
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

async function generateLicensePdf(
  licenseData: LicenseDataForPdf,
  outputPath: string
): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { height } = page.getSize();
  
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const black = rgb(0, 0, 0);
  const gray = rgb(0.4, 0.4, 0.4);
  
  const margin = 50;
  const lineHeight = 20;
  const sectionSpacing = 30;
  
  const context: PdfContext = {
    pdfDoc,
    page,
    margin,
    yPosition: height - margin,
    lineHeight,
    sectionSpacing,
    boldFont,
    regularFont,
    black,
    gray,
  };

  addPdfHeader(context, licenseData);
  addPartiesSection(context, licenseData);
  addTrackInfoSection(context, licenseData);
  addLicenseTierSection(context, licenseData);
  addRightsSection(context, licenseData);
  addPublishingSplitSection(context, licenseData);
  addCreditSection(context, licenseData);
  addProhibitedUsesSection(context, licenseData);
  addLegalTermsSection(context, licenseData);
  addPdfFooter(context, licenseData);
  
  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(outputPath, pdfBytes);
}

function addPdfHeader(
  context: PdfContext,
  licenseData: LicenseDataForPdf
): void {
  const { page, margin, boldFont, regularFont, black, gray, lineHeight } = context;
  
  page.drawText("BEAT LICENSE AGREEMENT", {
    x: margin,
    y: context.yPosition,
    size: 18,
    font: boldFont,
    color: black,
  });
  context.yPosition -= lineHeight * 1.5;
  
  addText(context, `License ID: ${licenseData.license._id}`, 10, regularFont, gray);
  addText(context, `Issue Date: ${formatDate(licenseData.license.createdAt)}`, 10, regularFont, gray);
  addText(context, `Terms Version: ${licenseData.license.termsVersion}`, 10, regularFont, gray);
}

function addPartiesSection(
  context: PdfContext,
  licenseData: LicenseDataForPdf
): void {
  addSectionHeader(context, "PARTIES");
  addText(context, `Licensor: ${licenseData.workspace.name}`, 11, context.regularFont);
  addText(context, `Licensee: ${licenseData.license.buyerEmail || "Buyer"}`, 11, context.regularFont);
}

function addTrackInfoSection(
  context: PdfContext,
  licenseData: LicenseDataForPdf
): void {
  addSectionHeader(context, "TRACK INFORMATION");
  addText(context, `Title: ${licenseData.track.title}`, 11, context.regularFont);
  
  if (licenseData.track.bpm) {
    addText(context, `BPM: ${licenseData.track.bpm}`, 11, context.regularFont);
  }
  if (licenseData.track.key) {
    addText(context, `Key: ${licenseData.track.key}`, 11, context.regularFont);
  }
  
  addText(context, `Purchase Amount: ${formatCurrency(licenseData.order.amountCents, licenseData.order.currency)}`, 11, context.regularFont);
  addText(context, `Purchase Date: ${formatDate(licenseData.order.createdAt)}`, 11, context.regularFont);
}

function addLicenseTierSection(
  context: PdfContext,
  licenseData: LicenseDataForPdf
): void {
  addSectionHeader(context, "LICENSE TIER");
  const tierName = licenseData.license.tierKey.charAt(0).toUpperCase() + licenseData.license.tierKey.slice(1);
  addText(context, `Tier: ${tierName} License`, 11, context.boldFont);
  addText(context, `Stems Included: ${licenseData.license.includesStems ? "Yes" : "No"}`, 11, context.regularFont);
}

function addRightsSection(
  context: PdfContext,
  licenseData: LicenseDataForPdf
): void {
  addSectionHeader(context, "USAGE RIGHTS AND LIMITATIONS");
  const rights = licenseData.license.rightsSnapshot;
  
  addText(context, `Commercial Use: ${rights.commercialUse ? "Allowed" : "Not Allowed"}`, 11, context.regularFont);
  addText(context, `Audio Streaming: ${formatCap(rights.audioStreamingCap)} streams`, 11, context.regularFont);
  addText(context, `Music Videos: ${formatCap(rights.musicVideosCap)} videos`, 11, context.regularFont);
  addText(context, `Live Performances: ${formatCap(rights.livePerformanceCap)} performances`, 11, context.regularFont);
  addText(context, `Radio Broadcasts: ${formatCap(rights.radioBroadcastCap)} broadcasts`, 11, context.regularFont);
  addText(context, `Sync Licensing (TV/Film/Ads/Games): ${rights.syncAllowed ? "Allowed" : "Not Allowed"}`, 11, context.regularFont);
}

function addPublishingSplitSection(
  context: PdfContext,
  licenseData: LicenseDataForPdf
): void {
  if (!licenseData.license.publishingEnabled) {
    return;
  }
  
  addSectionHeader(context, "PUBLISHING SPLIT");
  addText(context, `Licensor Writer Share: ${licenseData.license.licensorWriterSharePercent ?? 50}%`, 11, context.regularFont);
  addText(context, `Licensee Writer Share: ${licenseData.license.licenseeWriterSharePercent ?? 50}%`, 11, context.regularFont);
  addText(context, `Licensor Publisher Share: ${licenseData.license.licensorPublisherSharePercent ?? 50}%`, 11, context.regularFont);
  addText(context, `Licensee Publisher Share: ${licenseData.license.licenseePublisherSharePercent ?? 50}%`, 11, context.regularFont);
}

function addCreditSection(
  context: PdfContext,
  licenseData: LicenseDataForPdf
): void {
  addSectionHeader(context, "CREDIT REQUIREMENT");
  addText(context, licenseData.license.creditLineSnapshot, 11, context.regularFont);
}

function addProhibitedUsesSection(
  context: PdfContext,
  licenseData: LicenseDataForPdf
): void {
  addSectionHeader(context, "PROHIBITED USES");
  for (const prohibition of licenseData.license.prohibitedUsesSnapshot) {
    addText(context, `- ${prohibition}`, 11, context.regularFont);
  }
}

function addLegalTermsSection(
  context: PdfContext,
  licenseData: LicenseDataForPdf
): void {
  const terms = licenseData.entitlement.licenseTermsSnapshot.commonTerms;
  if (!terms) return;

  addSectionHeader(context, "OWNERSHIP AND LICENSE GRANT");
  addText(
    context,
    `Grant: ${terms.grant_type.charAt(0).toUpperCase()}${terms.grant_type.slice(1)} license.`,
    11,
    context.regularFont
  );
  addText(context, terms.ownership.beat_and_composition_owner, 11, context.regularFont);
  addText(context, terms.ownership.master_owner, 11, context.regularFont);
  addText(context, terms.ownership.transfer, 11, context.regularFont);

  addSectionHeader(context, "CONTENT ID");
  addText(context, terms.content_id_policy.note, 11, context.regularFont);

  addSectionHeader(context, "REFUNDS AND TERMINATION");
  addText(context, terms.refund_policy.note, 11, context.regularFont);
  addText(
    context,
    `Breach cure period: ${terms.termination.breach_cure_days} days. ${terms.termination.termination_effect}`,
    11,
    context.regularFont
  );

  addSectionHeader(context, "GOVERNING LAW");
  addText(
    context,
    `${terms.governing_law.jurisdiction}; venue: ${terms.governing_law.venue}.`,
    11,
    context.regularFont
  );
}

function addPdfFooter(
  context: PdfContext,
  licenseData: LicenseDataForPdf
): void {
  const { page, margin, regularFont, gray } = context;
  
  context.yPosition = margin + 40;
  page.drawText("This is a legally binding agreement. By using this beat, you agree to all terms above.", {
    x: margin,
    y: context.yPosition,
    size: 9,
    font: regularFont,
    color: gray,
  });
  context.yPosition -= 15;
  page.drawText(`Generated by BroLab Entertainment (${licenseData.workspace.slug}.brolabentertainment.com)`, {
    x: margin,
    y: context.yPosition,
    size: 9,
    font: regularFont,
    color: gray,
  });
}

interface PdfContext {
  pdfDoc: PDFDocument;
  page: ReturnType<PDFDocument['addPage']>;
  margin: number;
  yPosition: number;
  lineHeight: number;
  sectionSpacing: number;
  boldFont: ReturnType<PDFDocument['embedFont']> extends Promise<infer T> ? T : never;
  regularFont: ReturnType<PDFDocument['embedFont']> extends Promise<infer T> ? T : never;
  black: ReturnType<typeof rgb>;
  gray: ReturnType<typeof rgb>;
}

function addText(
  context: PdfContext,
  text: string,
  fontSize: number,
  font: PdfContext['regularFont'],
  color = context.black
): void {
  const maxWidth = context.page.getWidth() - context.margin * 2;
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && font.widthOfTextAtSize(candidate, fontSize) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);

  for (const wrappedLine of lines) {
    ensurePdfSpace(context, context.lineHeight);
    context.page.drawText(wrappedLine, {
      x: context.margin,
      y: context.yPosition,
      size: fontSize,
      font,
      color,
    });
    context.yPosition -= context.lineHeight;
  }
}

function addSectionHeader(context: PdfContext, title: string): void {
  ensurePdfSpace(context, context.sectionSpacing + context.lineHeight);
  context.yPosition -= context.sectionSpacing;
  context.page.drawText(title, {
    x: context.margin,
    y: context.yPosition,
    size: 14,
    font: context.boldFont,
    color: context.black,
  });
  context.yPosition -= context.lineHeight;
}

function ensurePdfSpace(context: PdfContext, requiredHeight: number): void {
  const footerReserve = 70;
  if (context.yPosition - requiredHeight >= context.margin + footerReserve) {
    return;
  }

  context.page = context.pdfDoc.addPage([595, 842]);
  context.yPosition = context.page.getHeight() - context.margin;
}

function formatCap(cap: number): string {
  if (cap === -1) return "Unlimited";
  if (cap === 0) return "Not included";
  return cap.toLocaleString();
}

function formatCurrency(amountCents: number, currency: string): string {
  const amount = amountCents / 100;
  return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

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
      { licenseId, workerSecret: WORKER_SECRET } as never
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
      { workerSecret: WORKER_SECRET } as never
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
        workerSecret: WORKER_SECRET,
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
      { storageId: fullStorageId, workerSecret: WORKER_SECRET } as never
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
      { workerSecret: WORKER_SECRET } as never
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

async function processJob(job: Job): Promise<void> {
  console.log(`\n[job ${job._id}] Starting job processing (type: ${job.type}, attempt: ${job.attempts + 1})`);

  try {
    // Step 1: Lock the job
    console.log(`[job ${job._id}] Attempting to lock job...`);
    const locked = await convex.mutation(
      "platform/jobs:lockJob" as never,
      { jobId: job._id, workerId: WORKER_ID, workerSecret: WORKER_SECRET } as never
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
      { jobId: job._id, workerSecret: WORKER_SECRET } as never
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
        { jobId: job._id, error: errorMessage, workerSecret: WORKER_SECRET } as never
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
          { documentId: payload.documentId, error: errorMessage, workerSecret: WORKER_SECRET } as never
        );
      }

      console.log(`[job ${job._id}] Job marked as failed in database`);
    } catch (failError) {
      console.error(`[job ${job._id}] Failed to mark job as failed:`, failError);
    }
  }
}

async function pollAndProcessJobs(): Promise<void> {
  try {
    // Query for next pending job (any type)
    const rawJob = await convex.query(
      "platform/jobs:getNextPendingJob" as never,
      { workerSecret: WORKER_SECRET } as never
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

process.on("SIGINT", () => {
  console.log("\n\n[worker] Received SIGINT, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n\n[worker] Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

try {
  await main();
} catch (error) {
  console.error("\n[worker] Fatal error:", error);
  process.exit(1);
}
