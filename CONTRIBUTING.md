# Contributing to Openpot Secure Session Tracker

We welcome contributions from the community! **Openpot Secure Session Tracker** is built on the principles of software freedom, digital sovereignty, and absolute privacy.

## How to Get Involved

We welcome all types of contributions, from bug fixes and feature enhancements to documentation improvements and accessibility audits.

### 1. The Pull Request Process
1. **Fork & Clone**: Create a personal fork and clone it to your local machine.
2. **Branching**: Use a descriptive branch name (e.g., `feat/secure-session-validation` or `fix/pwa-ios-splash`).
3. **Drafting**: Implement your changes. Ensure your code is clean, documented, and follows our [Security Principles](./DEVELOPMENT.md#security-principles).
4. **Validation**: Run the [Quality Gates](#quality-gates) locally. All tests must pass.
5. **PR Submission**: Open a Pull Request against our `main` branch. 
    - Provide a clear, concise title.
    - Use our PR template (if available) or describe **what** changed and **why**.
    - Link any related issues.

### 2. Community Engagement
- **Issues**: Open an issue for bugs or feature requests before starting work to avoid redundant efforts.
- **Discussions**: Join our community discussions to help shape the future of Openpot.

## Code Standards

- **TypeScript Preferred**: Use strong typing to prevent runtime errors.
- **Accessibility (A11y)**: All UI components must meet WCAG 2.1 AA standards.
- **Privacy-First**: Never introduce third-party libraries that track user behavior or send data to external servers.
- **Clean UI**: Maintain the minimalist, premium aesthetic of the project.

## Quality Gates

Before submitting your PR, please run the following:

```bash
pnpm lint       # Code style and best practices
pnpm typecheck  # TypeScript types
pnpm test       # Unit tests
pnpm e2e        # End-to-end tests (Playwright)
```

## Security Reporting

If you find a security vulnerability, please do NOT open a public issue. Instead, contact the maintainers directly at security@openpot.org (or the contact listed in the main repository).

## License

By contributing to Openpot, you agree that your contributions will be licensed under the **AGPL-3.0**.
