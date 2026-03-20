import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const packageJson = require('./package.json')

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
}

export default nextConfig
