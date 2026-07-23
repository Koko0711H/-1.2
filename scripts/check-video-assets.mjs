import { open, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const videoFiles = [
  'hero-power-range-sharp4k.mp4',
  'silent-generator.mp4',
  'open-frame.mp4',
  'open-frame-small.mp4',
  'mobile-trailer.mp4',
  'high-voltage.mp4',
]

const remoteBaseUrl = process.argv[2] ? new URL(process.argv[2]) : null
const failures = []

async function checkLocalFile(file) {
  const filePath = resolve('public', file)
  const fileStat = await stat(filePath)
  if (!fileStat.isFile() || fileStat.size === 0) {
    throw new Error('missing or empty file')
  }

  const handle = await open(filePath, 'r')
  try {
    const header = Buffer.alloc(12)
    const { bytesRead } = await handle.read(header, 0, header.length, 0)
    if (bytesRead < 12 || header.toString('ascii', 4, 8) !== 'ftyp') {
      throw new Error('invalid MP4 header')
    }
  } finally {
    await handle.close()
  }
}

async function checkRemoteFile(file) {
  const response = await fetch(new URL(file, remoteBaseUrl))
  const contentType = response.headers.get('content-type') ?? ''
  const reader = response.body?.getReader()
  const firstChunk = reader ? await reader.read() : { value: null }
  await reader?.cancel()

  if (!response.ok || !contentType.startsWith('video/') || !firstChunk.value?.byteLength) {
    throw new Error(`HTTP ${response.status}; type=${contentType || 'missing'}`)
  }
}

for (const file of videoFiles) {
  try {
    if (remoteBaseUrl) {
      await checkRemoteFile(file)
    } else {
      await checkLocalFile(file)
    }
  } catch (error) {
    failures.push({ file, error: error.message })
  }
}

if (failures.length) {
  console.error('Video asset check failed:')
  console.table(failures)
  process.exitCode = 1
} else {
  const target = remoteBaseUrl ? remoteBaseUrl.href : 'public/'
  console.log(`Video asset check passed: ${videoFiles.length}/${videoFiles.length} (${target})`)
}
