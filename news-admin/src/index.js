import { loadEnvFile } from 'node:process'

import { buildApp } from './app.js'
import { loadConfig } from './config.js'

try {
  loadEnvFile()
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

const config = loadConfig()
const app = await buildApp(config)

try {
  await app.listen({ host: config.host, port: config.port })
  app.log.info(`新闻后台已启动：http://${config.host}:${config.port}/admin/`)
} catch (error) {
  app.log.error(error)
  process.exitCode = 1
}
