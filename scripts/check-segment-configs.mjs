#!/usr/bin/env node

/**
 * Diagnostic script to find invalid segment configuration exports
 * 
 * This script checks all files in the app/ directory for:
 * 1. Client components exporting segment config (metadata, dynamic, etc.)
 * 2. Invalid exports that might confuse Next.js
 * 3. Type exports with names that match segment config names
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { extname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..', '..')

const SEGMENT_CONFIG_NAMES = [
    'metadata',
    'dynamic',
    'revalidate',
    'runtime',
    'fetchCache',
    'preferredRegion',
    'maxDuration',
    'generateStaticParams',
    'generateMetadata',
]

function isClientComponent(content) {
    return /^['"]use client['"]/m.test(content)
}

function findExports(content, filePath) {
    const issues = []

    // Check for segment config exports
    for (const configName of SEGMENT_CONFIG_NAMES) {
        // Match: export const metadata = ...
        const constExport = new RegExp(`export\\s+const\\s+${configName}\\s*=`, 'g')
        // Match: export const { metadata } = ...
        const destructuredExport = new RegExp(`export\\s+const\\s+\\{[^}]*${configName}[^}]*\\}`, 'g')
        // Match: export type metadata = ...
        const typeExport = new RegExp(`export\\s+type\\s+${configName}\\s*=`, 'g')
        // Match: export interface metadata
        const interfaceExport = new RegExp(`export\\s+interface\\s+${configName}\\b`, 'g')

        if (constExport.test(content) || destructuredExport.test(content)) {
            const isClient = isClientComponent(content)
            if (isClient) {
                issues.push({
                    type: 'CLIENT_COMPONENT_SEGMENT_CONFIG',
                    configName,
                    filePath,
                    severity: 'ERROR',
                    message: `Client component exports segment config '${configName}' - this is invalid`,
                })
            }
        }

        // Type/interface exports with segment config names might confuse Next.js
        if (typeExport.test(content) || interfaceExport.test(content)) {
            issues.push({
                type: 'TYPE_EXPORT_CONFLICT',
                configName,
                filePath,
                severity: 'WARNING',
                message: `Type/interface export named '${configName}' might confuse Next.js`,
            })
        }
    }

    return issues
}

function scanDirectory(dir, baseDir = dir) {
    const issues = []
    const entries = readdirSync(dir)

    for (const entry of entries) {
        const fullPath = join(dir, entry)
        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
            issues.push(...scanDirectory(fullPath, baseDir))
        } else if (stat.isFile()) {
            const ext = extname(entry)
            if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
                try {
                    const content = readFileSync(fullPath, 'utf-8')
                    const fileIssues = findExports(content, fullPath.replace(baseDir + '/', ''))
                    issues.push(...fileIssues)
                } catch (error) {
                    console.error(`Error reading ${fullPath}:`, error.message)
                }
            }
        }
    }

    return issues
}

// Main execution
const appDir = join(__dirname, 'app')
console.log('🔍 Scanning app/ directory for segment configuration issues...\n')

const issues = scanDirectory(appDir)

if (issues.length === 0) {
    console.log('✅ No obvious segment configuration issues found')
    process.exit(0)
}

console.log(`⚠️  Found ${issues.length} potential issue(s):\n`)

const errors = issues.filter(i => i.severity === 'ERROR')
const warnings = issues.filter(i => i.severity === 'WARNING')

if (errors.length > 0) {
    console.log('❌ ERRORS (must fix):')
    errors.forEach(issue => {
        console.log(`\n  File: ${issue.filePath}`)
        console.log(`  Type: ${issue.type}`)
        console.log(`  Config: ${issue.configName}`)
        console.log(`  Message: ${issue.message}`)
    })
}

if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS (should review):')
    warnings.forEach(issue => {
        console.log(`\n  File: ${issue.filePath}`)
        console.log(`  Type: ${issue.type}`)
        console.log(`  Config: ${issue.configName}`)
        console.log(`  Message: ${issue.message}`)
    })
}

process.exit(errors.length > 0 ? 1 : 0)

