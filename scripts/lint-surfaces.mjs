#!/usr/bin/env node

/**
 * Lint Surfaces - Prevent GlassSurface usage outside UI kit
 * 
 * This script enforces the surface taxonomy:
 * - ChromeSurface for chrome elements (header/footer/nav)
 * - CardSurface for card elements (cards/modules/overlays)
 * - GlassSurface is LEGACY and should only exist in src/platform/ui/**
 * 
 * Usage:
 *   node scripts/lint-surfaces.mjs
 * 
 * Exit codes:
 *   0 - All checks passed
 *   1 - Violations found
 */

import { glob } from 'glob'
import fs from 'node:fs'

// Patterns to check (application code, not UI kit)
const APP_PATTERNS = [
  'app/**/*.{ts,tsx}',
  'src/components/**/*.{ts,tsx}',
  'src/features/**/*.{ts,tsx}',
]

// UI kit path (GlassSurface allowed here)
const UI_KIT_PATH = 'src/platform/ui/'

// Forbidden patterns
const FORBIDDEN_PATTERNS = [
  {
    pattern: /import\s+{[^}]*GlassSurface[^}]*}\s+from\s+['"]@\/platform\/ui['"]/g,
    name: 'GlassSurface import',
    message: 'GlassSurface is legacy. Use ChromeSurface (chrome) or CardSurface (cards) instead.',
  },
  {
    pattern: /<GlassSurface/g,
    name: 'GlassSurface usage',
    message: 'GlassSurface is legacy. Use ChromeSurface (chrome) or CardSurface (cards) instead.',
  },
]

async function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const violations = []

  for (const { pattern, name, message } of FORBIDDEN_PATTERNS) {
    const matches = content.match(pattern)
    if (matches) {
      violations.push({
        file: filePath,
        pattern: name,
        count: matches.length,
        message,
      })
    }
  }

  return violations
}

async function main() {
  console.log('🔍 Checking for GlassSurface usage outside UI kit...\n')

  let allViolations = []

  // Expand glob patterns
  const files = []
  for (const pattern of APP_PATTERNS) {
    const matches = await glob(pattern, { ignore: 'node_modules/**' })
    files.push(...matches)
  }

  // Remove duplicates and UI kit files
  const uniqueFiles = [...new Set(files)].filter(
    file => !file.replaceAll('\\', '/').includes(UI_KIT_PATH)
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
    console.log('✅ All checks passed! No GlassSurface usage found outside UI kit.\n')
    process.exit(0)
  }

  console.error('❌ VIOLATIONS FOUND:\n')
  
  for (const violation of allViolations) {
    console.error(`  ${violation.file}`)
    console.error(`    - Found ${violation.count}x "${violation.pattern}"`)
    console.error(`    - ${violation.message}`)
    console.error(`    - ChromeSurface: header/footer/nav (uses bg tokens)`)
    console.error(`    - CardSurface: cards/modules/overlays (uses card tokens)\n`)
  }

  console.error('💡 Migrate to ChromeSurface or CardSurface to fix these violations.\n')
  process.exit(1)
}

try {
  await main()
} catch (err) {
  console.error('Error running lint:', err)
  process.exit(1)
}
