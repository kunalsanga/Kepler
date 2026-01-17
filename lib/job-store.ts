/**
 * Job Store - Shared storage for generation jobs
 * Uses a simple in-memory Map with fallback to handle Next.js serverless contexts
 * 
 * Note: In Next.js development mode, this should work. In production/serverless,
 * we might need to use a database or external storage.
 */

interface JobData {
  jobId: string
  promptId?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  imageUrl?: string
  videoUrl?: string
  error?: string
}

// Use globalThis to ensure the Map persists across module reloads in Next.js
// This works in development mode (single process) but may not work in serverless
const globalForJobStore = globalThis as unknown as {
  jobStore: Map<string, JobData> | undefined
}

if (!globalForJobStore.jobStore) {
  globalForJobStore.jobStore = new Map<string, JobData>()
}

const jobStore = globalForJobStore.jobStore

export function setJob(jobId: string, data: JobData) {
  jobStore.set(jobId, data)
  console.log('[JobStore] Set job:', jobId, 'Total:', jobStore.size, 'Keys:', Array.from(jobStore.keys()))
}

export function getJob(jobId: string): JobData | null {
  const job = jobStore.get(jobId)
  console.log('[JobStore] Get job:', jobId, 'Found:', !!job, 'Total:', jobStore.size, 'Keys:', Array.from(jobStore.keys()))
  return job || null
}

export function updateJob(jobId: string, updates: Partial<JobData>) {
  const job = jobStore.get(jobId)
  if (job) {
    Object.assign(job, updates)
    jobStore.set(jobId, job)
    console.log('[JobStore] Updated job:', jobId, 'Status:', job.status, 'Total:', jobStore.size)
  } else {
    console.error('[JobStore] Job not found for update:', jobId, 'Available keys:', Array.from(jobStore.keys()))
  }
}

export function getAllJobs(): JobData[] {
  return Array.from(jobStore.values())
}

