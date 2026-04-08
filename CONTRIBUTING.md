# Open Source Contribution Guidelines

## How to Contribute
1. Fork the repo
2. Create a feature branch from `main`
3. Start the containerized workspace with `docker compose up --build app` or reopen the repo in the included dev container
4. Make your changes with tests and documentation
5. Submit a pull request with a clear description

## Code Standards
- Follow `code-conventions.md` for style and structure
- Include unit tests and ensure accessibility (WCAG 2.1 AA)
- Run linting and type checking before submitting
- Ensure security best practices (zero-knowledge compliance)
- Keep all dependency installs inside the repo container workflow rather than relying on host-global tooling

## Community
- Use GitHub Issues for bug reports and feature requests
- Follow conventional commit messages for PRs
- Respect the code of conduct

## Licensing
- AGPL-3.0: Any modifications must be open source
