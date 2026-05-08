#!/usr/bin/env python3
"""
Clean Code Audit Script
Analyzes the entire codebase for clean code violations
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Tuple

# Directories to exclude
EXCLUDE_DIRS = {
    'node_modules', '.next', 'dist', 'build', '.git', 
    'convex/_generated', '.agent', '.kiro', 'coverage'
}

# File extensions to analyze
INCLUDE_EXTENSIONS = {'.ts', '.tsx', '.js', '.jsx'}

class CleanCodeViolation:
    def __init__(self, file_path: str, line_num: int, violation_type: str, message: str, severity: str = 'warning'):
        self.file_path = file_path
        self.line_num = line_num
        self.violation_type = violation_type
        self.message = message
        self.severity = severity
    
    def __repr__(self):
        return f"{self.severity.upper()}: {self.file_path}:{self.line_num} - {self.violation_type}: {self.message}"

def should_skip_path(path: Path) -> bool:
    """Check if path should be skipped"""
    parts = path.parts
    return any(excluded in parts for excluded in EXCLUDE_DIRS)

def count_lines_in_function(lines: List[str], start_idx: int) -> int:
    """Count lines in a function starting from start_idx"""
    brace_count = 0
    line_count = 0
    started = False
    
    for i in range(start_idx, len(lines)):
        line = lines[i].strip()
        
        if '{' in line:
            brace_count += line.count('{')
            started = True
        if '}' in line:
            brace_count -= line.count('}')
        
        if started:
            line_count += 1
            
        if started and brace_count == 0:
            break
    
    return line_count

def analyze_file(file_path: Path) -> List[CleanCodeViolation]:
    """Analyze a single file for clean code violations"""
    violations = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
    except Exception as e:
        return violations
    
    rel_path = str(file_path).replace(str(Path.cwd()), '').lstrip(os.sep)
    
    # Check for excessive JSDoc comments
    jsdoc_pattern = re.compile(r'^\s*/\*\*')
    jsdoc_count = 0
    in_jsdoc = False
    jsdoc_start_line = 0
    
    for i, line in enumerate(lines, 1):
        # Track JSDoc blocks
        if jsdoc_pattern.match(line):
            in_jsdoc = True
            jsdoc_start_line = i
            jsdoc_count = 1
        elif in_jsdoc:
            jsdoc_count += 1
            if '*/' in line:
                in_jsdoc = False
                # Flag JSDoc blocks > 10 lines
                if jsdoc_count > 10:
                    violations.append(CleanCodeViolation(
                        rel_path, jsdoc_start_line, 'EXCESSIVE_JSDOC',
                        f'JSDoc comment is {jsdoc_count} lines long (max 10 recommended)',
                        'warning'
                    ))
        
        # Check for section dividers
        if re.match(r'^\s*//\s*={10,}', line):
            violations.append(CleanCodeViolation(
                rel_path, i, 'SECTION_DIVIDER',
                'Unnecessary section divider comment',
                'info'
            ))
        
        # Check for obvious comments
        obvious_patterns = [
            (r'//\s*(Close Button|Header|Footer|Icon|Label|Title|Content|Actions)', 'OBVIOUS_COMMENT'),
            (r'{/\*\s*(Close Button|Header|Footer|Icon|Label|Title|Content|Actions)', 'OBVIOUS_JSX_COMMENT'),
        ]
        
        for pattern, violation_type in obvious_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                violations.append(CleanCodeViolation(
                    rel_path, i, violation_type,
                    'Obvious comment that should be removed',
                    'info'
                ))
        
        # Check for magic numbers (excluding common ones like 0, 1, 2, -1, 100)
        magic_number_pattern = r'\b(2500|3000|5000|7500|10000|15000|20000|30000|50000)\b'
        if re.search(magic_number_pattern, line):
            # Exclude if it's in a comment or string
            if not (line.strip().startswith('//') or line.strip().startswith('*')):
                violations.append(CleanCodeViolation(
                    rel_path, i, 'MAGIC_NUMBER',
                    'Magic number should be extracted to named constant',
                    'warning'
                ))
    
    # Check for long functions
    function_pattern = re.compile(r'^\s*(export\s+)?(async\s+)?function\s+\w+|^\s*(export\s+)?const\s+\w+\s*=\s*(async\s+)?\(')
    
    for i, line in enumerate(lines):
        if function_pattern.match(line):
            func_lines = count_lines_in_function(lines, i)
            if func_lines > 30:
                violations.append(CleanCodeViolation(
                    rel_path, i + 1, 'LONG_FUNCTION',
                    f'Function is {func_lines} lines long (max 30 recommended)',
                    'warning'
                ))
    
    return violations

def analyze_codebase(root_dir: Path) -> Dict[str, List[CleanCodeViolation]]:
    """Analyze entire codebase"""
    all_violations = {}
    
    for file_path in root_dir.rglob('*'):
        if file_path.is_file() and file_path.suffix in INCLUDE_EXTENSIONS:
            if should_skip_path(file_path):
                continue
            
            violations = analyze_file(file_path)
            if violations:
                all_violations[str(file_path)] = violations
    
    return all_violations

def generate_report(violations: Dict[str, List[CleanCodeViolation]]) -> str:
    """Generate human-readable report"""
    report = []
    report.append("=" * 80)
    report.append("CLEAN CODE AUDIT REPORT")
    report.append("=" * 80)
    report.append("")
    
    # Count by type
    type_counts = {}
    severity_counts = {'error': 0, 'warning': 0, 'info': 0}
    
    for file_violations in violations.values():
        for v in file_violations:
            type_counts[v.violation_type] = type_counts.get(v.violation_type, 0) + 1
            severity_counts[v.severity] = severity_counts.get(v.severity, 0) + 1
    
    # Summary
    report.append("SUMMARY")
    report.append("-" * 80)
    report.append(f"Total files with violations: {len(violations)}")
    report.append(f"Total violations: {sum(len(v) for v in violations.values())}")
    report.append("")
    report.append("By Severity:")
    for severity, count in sorted(severity_counts.items()):
        report.append(f"  {severity.upper()}: {count}")
    report.append("")
    report.append("By Type:")
    for vtype, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
        report.append(f"  {vtype}: {count}")
    report.append("")
    report.append("=" * 80)
    report.append("")
    
    # Detailed violations
    report.append("DETAILED VIOLATIONS")
    report.append("-" * 80)
    report.append("")
    
    for file_path in sorted(violations.keys()):
        file_violations = violations[file_path]
        report.append(f"\n{file_path} ({len(file_violations)} violations)")
        report.append("-" * 80)
        
        for v in sorted(file_violations, key=lambda x: x.line_num):
            report.append(f"  Line {v.line_num}: [{v.severity.upper()}] {v.violation_type}")
            report.append(f"    {v.message}")
        report.append("")
    
    return "\n".join(report)

def main():
    root_dir = Path.cwd()
    print(f"Analyzing codebase at: {root_dir}")
    print("This may take a few moments...")
    print("")
    
    violations = analyze_codebase(root_dir)
    report = generate_report(violations)
    
    # Print to console
    print(report)
    
    # Save to file
    output_file = root_dir / 'clean-code-audit-report.txt'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\nReport saved to: {output_file}")
    
    # Return exit code based on severity
    has_errors = any(
        v.severity == 'error' 
        for file_violations in violations.values() 
        for v in file_violations
    )
    
    return 1 if has_errors else 0

if __name__ == '__main__':
    exit(main())
