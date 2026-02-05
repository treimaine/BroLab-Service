# BroLab Entertainment Job Worker

External Node.js worker that processes background jobs from Convex.

## Features

- **Preview Generation**: Extracts 30-second MP3 previews from full audio files using ffmpeg
- **Job Queue Processing**: Polls Convex jobs table for pending jobs
- **Concurrency Control**: Locks jobs before processing to prevent duplicate work
- **Error Handling**: Records failures and allows retry
- **Graceful Shutdown**: Handles SIGINT/SIGTERM signals

## Prerequisites

### 1. ffmpeg

The worker requires ffmpeg to be installed and available in PATH.

**Installation:**

- **Windows**: 
  ```bash
  choco install ffmpeg
  ```
  Or download from https://ffmpeg.org/download.html

- **macOS**:
  ```bash
  brew install ffmpeg
  ```

- **Linux**:
  ```bash
  sudo apt-get install ffmpeg
  ```

**Verify installation:**
```bash
ffmpeg -version
```

### 2. Environment Variables

The worker reads from `.env.local` in the project root:

```env
# Required
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Optional
WORKER_ID=worker-1                    # Defaults to hostname
POLL_INTERVAL_MS=5000                 # Defaults to 5000 (5 seconds)
```

## Usage

### 1. Build the Worker

```bash
npm run build:worker
```

This compiles `worker/index.ts` to `dist/worker/index.js`.

### 2. Run the Worker

```bash
npm run worker
```

The worker will:
1. Check if ffmpeg is installed
2. Connect to Convex
3. Start polling for pending jobs
4. Process jobs as they arrive

### 3. Stop the Worker

Press `Ctrl+C` to gracefully shutdown the worker.

## How It Works

### Job Processing Flow

1. **Poll**: Worker queries Convex for the next pending `preview_generation` job
2. **Lock**: Worker locks the job to prevent other workers from processing it
3. **Download**: Worker downloads the full audio file from Convex Storage
4. **Extract**: Worker uses ffmpeg to extract a 30-second MP3 preview
5. **Upload**: Worker uploads the preview to Convex Storage
6. **Complete**: Worker updates the track with the preview storage ID
7. **Event**: Worker records a `preview_generated` event

### Error Handling

If a job fails:
1. Worker marks the job as `failed` in Convex
2. Worker records the error message
3. Worker updates the track `processingStatus` to `failed`
4. Job can be retried manually from the UI

### Concurrency

Multiple workers can run simultaneously:
- Each worker has a unique `WORKER_ID`
- Jobs are locked before processing
- Lock timeout: 5 minutes (stale locks are automatically released)

## Development

### Project Structure

```
worker/
├── index.ts           # Main worker implementation
├── tsconfig.json      # TypeScript configuration
└── README.md          # This file

dist/worker/
├── index.js           # Compiled JavaScript
├── index.js.map       # Source map
└── index.d.ts         # Type definitions
```

### TypeScript Configuration

The worker uses a separate `tsconfig.json` with:
- Target: ES2022
- Module: NodeNext (ESM)
- Strict mode: disabled (for simplicity)
- Output: `dist/worker/`

### Debugging

Enable verbose logging by modifying the worker code or use Node.js debugging:

```bash
node --inspect dist/worker/index.js
```

## Deployment

### Production Considerations

1. **Process Manager**: Use PM2, systemd, or Docker to keep the worker running
2. **Multiple Workers**: Run multiple instances for redundancy
3. **Monitoring**: Monitor worker logs and job queue depth
4. **Alerts**: Set up alerts for failed jobs or worker crashes

### Example PM2 Configuration

```json
{
  "apps": [{
    "name": "brolab-worker",
    "script": "dist/worker/index.js",
    "instances": 2,
    "exec_mode": "cluster",
    "env": {
      "NODE_ENV": "production",
      "NEXT_PUBLIC_CONVEX_URL": "https://your-deployment.convex.cloud"
    }
  }]
}
```

### Example Docker Configuration

```dockerfile
FROM node:22-alpine

# Install ffmpeg
RUN apk add --no-cache ffmpeg

# Copy worker files
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/worker ./dist/worker

# Run worker
CMD ["node", "dist/worker/index.js"]
```

## Troubleshooting

### Worker won't start

**Error**: `ffmpeg is not installed or not in PATH`
- **Solution**: Install ffmpeg (see Prerequisites)

**Error**: `NEXT_PUBLIC_CONVEX_URL environment variable is required`
- **Solution**: Add `NEXT_PUBLIC_CONVEX_URL` to `.env.local`

### Jobs are failing

**Check ffmpeg output**: Look for ffmpeg errors in worker logs
**Check file format**: Ensure uploaded files are valid audio (WAV, MP3)
**Check storage**: Ensure Convex Storage has enough space

### Jobs are stuck in "processing"

**Stale locks**: Jobs locked for >5 minutes are automatically released
**Worker crash**: Restart the worker to process pending jobs

## Requirements Implemented

- ✅ Requirement 11.2: Poll Convex jobs table for pending jobs
- ✅ Requirement 11.3: Extract first 30s to mp3 (or full if shorter)
- ✅ Requirement 11.4: Upload preview to Convex Storage
- ✅ Requirement 11.7: Handle failures and record errors

## Future Enhancements

- [ ] Support for other job types (license PDF generation, waveform generation)
- [ ] Configurable preview duration per track
- [ ] Progress reporting for long-running jobs
- [ ] Job priority queue
- [ ] Worker health checks and metrics
