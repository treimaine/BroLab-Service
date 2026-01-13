#!/usr/bin/env node

/**
 * Lint Chrome Surfaces - Prevent color drift in header/footer
 * 
 * This script checks that chrome surfaces (header/footer/nav) never use
 * card tokens (bg-card/*) which cause light grey overlays in dark mode.
 * 
 * Chrome surfaces MUST use bg tokens (--bg, --bg-2) for theme coherence.
 * 
 * Usage:
 *   node scripts/lint-chrome-surfaces.mjs
 * 
 * Exit codes:
 *   0 - All checks passed
 *   1 - Violations found
 */

import { glob } from 'glob'
import fs from 'node:fs'

// Files to check (chrome surface components)
const CHROME_SURFACE_PATTERNS = [
  'src/components/hub/Footer.tsx',
  'src/platform/ui/dribbble/TopMinimalBar.tsx',
  'src/platform/ui/dribbble/GlassHeader.tsx',
  'src/platform/ui/dribbble/GlassFooter.tsx',
  'src/platform/ui/dribbble/ChromeSurface.tsx',
  'app/**/layout.tsx', // Check layouts for header/footer usage
]

// Forbidden patterns in chrome surfaces
const FORBIDDEN_PATTERNS = [
  { pattern: /bg-card(?!-alpha)/g, name: 'bg-card' },
  { pattern: /bg-white/g, name: 'bg-white' },
  { pattern: /bg-slate-50/g, name: 'bg-slate-50' },
  { pattern: /bg-gray-50/g, name: 'bg-gray-50' },
]

// Exceptions (allowed usage)
const EXCEPTIONS = [
  // CardSurface.tsx is allowed to use bg-card
  'src/platform/ui/dribbble/CardSurface.tsx',
  // GlassSurface.tsx is the old component (deprecated but not removed yet)
  'src/platform/ui/dribbble/GlassSurface.tsx',
  // ChromeSurface.tsx contains forbidden patterns in dev warning examples
  'src/platform/ui/dribbble/ChromeSurface.tsx',
  // GlassHeader.tsx and GlassFooter.tsx are legacy (deprecated)
  'src/platform/ui/dribbble/GlassHeader.tsx',
  'src/platform/ui/dribbble/GlassFooter.tsx',
]

async function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const violations = []

  for (const { pattern, name } of FORBIDDEN_PATTERNS) {
    const matches = content.match(pattern)
    if (matches) {
      violations.push({
        file: filePath,
        pattern: name,
        count: matches.length,
      })
    }
  }

  return violations
}

async function main() {
  console.log('🔍 Checking chrome surfaces for forbidden patterns...\n')

  let allViolations = []

  // Expand glob patterns
  const files = []
  for (const pattern of CHROME_SURFACE_PATTERNS) {
    const matches = await glob(pattern, { ignore: 'node_modules/**' })
    files.push(...matches)
  }

  // Remove duplicates and exceptions
  const uniqueFiles = [...new Set(files)].filter(
    file => !EXCEPTIONS.some(exception => file.replaceAll('\\', '/').includes(exception))
  )

  console.log(`Checking ${uniqueFiles.length} files...\n`)

  for (const file of uniqueFiles) {
    if (!fs.existsSync(file)) continue

    const violations = await checkFile(file)
    if (violations.length > 0) {
      allViolations.push(...violations)
    }
  }

  if (allViolations.length === 0) {
    console.log('✅ All checks passed! No forbidden patterns found.\n')
    process.exit(0)
  }

  console.error('❌ VIOLATIONS FOUND:\n')
  
  for (const violation of allViolations) {
    console.error(`  ${violation.file}`)
    console.error(`    - Found ${violation.count}x "${violation.pattern}"`)
    console.error(`    - Chrome surfaces must use bg tokens (--bg, --bg-2) only`)
    console.error(`    - Use ChromeSurface component for headers/footers`)
    console.error(`    - Use CardSurface component for cards/modules\n`)
  }

  console.error('💡 Fix these violations to prevent color drift in dark mode.\n')
  process.exit(1)
}

try {
  await main()
} catch (err) {
  console.error('Error running lint:', err)
  process.exit(1)
}
