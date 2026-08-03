import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const archive = 'backups/flydeer-news.tar.gz'
if (!existsSync(archive)) {
  console.error(`找不到 ${archive}，请先执行 pnpm cms:export。`)
  process.exit(1)
}

const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const result = spawnSync(pnpm, [
  '--dir', 'cms', 'strapi', 'import',
  '--file', '../backups/flydeer-news.tar.gz',
  '--force',
], { stdio: 'inherit', shell: process.platform === 'win32' })

if (result.error) console.error(result.error)

process.exit(result.status ?? 1)
