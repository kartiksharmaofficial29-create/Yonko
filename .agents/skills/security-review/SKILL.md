---
name: security-review
description: Use this skill when the user asks to "run a security review", "apply security review", scan for vulnerabilities before deploying to production, or audit backend routes, authentication, and database queries.
---

# Security Review Skill

Performs comprehensive security scans and audits on codebases to detect vulnerabilities, misconfigurations, and credential leaks.

## Key Vulnerability Checkpoints
1. **Injection Vulnerabilities**:
   - SQL / NoSQL Injection: Raw query string concatenations, improper ORM usage, unsanitized `$where` or regex queries.
   - Command / Shell Injection: Untrusted inputs passed to shell executors (`exec`, `spawn`, `eval`).
2. **Cross-Site Scripting (XSS)**:
   - Rendering unescaped user inputs in DOM (`dangerouslySetInnerHTML`, `innerHTML`, `v-html`).
   - Missing Content-Security-Policy (CSP) headers.
3. **Cross-Site Request Forgery (CSRF) & CORS**:
   - Permissive CORS policies (`Origin: *` with credentials).
   - Missing CSRF tokens on sensitive mutating endpoints (POST, PUT, DELETE).
4. **Authentication & Access Control (Broken Object-Level Authorization / IDOR)**:
   - Missing authorization checks on endpoint handlers (e.g., querying `/api/user/:id` without verifying the authenticated session belongs to that ID).
   - Weak password hashing (ensure bcrypt/argon2 with proper salt rounds).
   - Insecure JWT handling (weak secret keys, no expiration check).
5. **Secrets & Information Exposure**:
   - Hardcoded API tokens, database connection strings, private keys in source code.
   - Leaking stack traces or sensitive internal database errors to client responses.

## When to Activate
- The user prompts: `run a security review`, `apply security review`, or asks to audit routes, queries, or prepare for production deployment.

## Review Output Format
For every vulnerability found:
- **Severity**: [Critical | High | Medium | Low]
- **Location**: File path and line number(s)
- **Vulnerability Type**: (e.g. SQL Injection, IDOR, Unsanitized Input)
- **Description & Risk**: How an attacker could exploit it
- **Recommended Remediation**: Exact code diff or replacement to fix the issue
