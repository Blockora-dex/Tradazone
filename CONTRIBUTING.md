# Contributing to Tradazone

First off, thank you for considering contributing to Tradazone! It's people like you who make Tradazone such a great tool for businesses and freelancers.

## 🚀 Getting Started

To get started with development:

1.  **Fork** the repository and clone it to your local machine.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## 🛠️ CI/CD Pipeline

We use **GitHub Actions** to ensure code quality and automate our deployment process.

### Automated Checks

Every pull request and push to the `main` branch triggers our CI pipeline, which performs the following steps:

1.  **Environment Setup**: Sets up the Node.js environment (v20).
2.  **Dependency Installation**: Runs `npm ci` for a clean, reproducible installation.
3.  **Linting**: Runs `npm run lint` to enforce code style and catch potential errors. **This step must pass for the build to proceed.**
4.  **Building**: Runs `npm run build` to verify the project builds correctly.
5.  **Deployment**: If the push is to the `main` branch, the project is automatically deployed to GitHub Pages.

### Manual Verification

Before submitting a pull request, please ensure your changes pass the same checks locally:

```bash
# Run linting
npm run lint

# Verify build
npm run build
```

## 🤝 How to Contribute

1.  **Fork** this repository.
2.  **Create a feature branch**:
    ```bash
    git checkout -b feature/your-feature-name
    ```
3.  **Commit your changes** with a clear message:
    ```bash
    git commit -m "feat: add your feature description"
    ```
4.  **Push** to your branch:
    ```bash
    git push origin feature/your-feature-name
    ```
5.  **Open a Pull Request** — describe what you changed and why.

## 📝 Commit Message Convention

We follow a simple convention for commit messages to keep our history clean and readable:

| Prefix | When to use |
|---|---|
| `feat:` | A new feature |
| `fix:` | A bug fix |
| `style:` | UI/CSS changes with no logic change |
| `refactor:` | Code restructuring without behavior change |
| `docs:` | Documentation updates |
| `chore:` | Dependency updates, build configs |

## 🐞 Reporting Issues

Found a bug or have a suggestion? [Open an issue](https://github.com/FolushoJoseph/Tradazone/issues) and include:
- A clear description of the problem.
- Steps to reproduce.
- Expected vs actual behavior.
- Screenshots if applicable.

## 🎨 Code Style

- Keep components focused and single-purpose.
- Co-locate styles with components where possible.
- Follow existing naming conventions (`PascalCase` for components, `camelCase` for hooks/utils).
- Avoid hardcoded values — use the data/context layer.
