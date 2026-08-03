import { mkdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

mkdirSync('backups', { recursive: true })

const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const result = spawnSync(pnpm, [
  '--dir', 'cms', 'strapi', 'export',
  '--file', '../backups/flydeer-news',
  '--no-encrypt',
], { stdio: 'inherit', shell: process.platform === 'win32' })

if (result.error) console.error(result.error)

process.exit(result.status ?? 1)
