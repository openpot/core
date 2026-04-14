# Contributing to Openpot

We welcome contributions from the community! Openpot is built on the principles of software freedom and privacy.

## How to Get Involved

1. **Fork the Repository**: Create your own copy of the repository.
2. **Create a Branch**: Work on a descriptive feature branch (e.g., `feat/secure-session-validation`).
3. **Draft Your Code**: Implement your changes with clear, documented code.
4. **Write Tests**: Ensure your changes are covered by unit or E2E tests.
5. **Submit a Pull Request**: Provide a detailed description of your contribution.

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
