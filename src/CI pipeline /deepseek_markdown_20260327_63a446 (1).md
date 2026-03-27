# CI/CD Pipeline Configuration

## Linting Strategy

This repository implements comprehensive linting for all CI/CD pipeline files to ensure:
- **Consistency**: All workflow files follow the same structure and style
- **Security**: Shell scripts are checked for common security issues
- **Reliability**: GitHub Actions syntax is validated before execution
- **Maintainability**: YAML files are properly formatted and documented

### Linting Tools

| Tool | Purpose | Configuration |
|------|---------|---------------|
| `yamllint` | YAML syntax and style | `.yamllint.yml` |
| `shellcheck` | Shell script analysis | `.shellcheckrc` |
| `actionlint` | GitHub Actions validation | N/A (uses defaults) |

### Running Linters Locally

```bash
# Install dependencies
pip install yamllint shellcheck-py actionlint

# Run all linters
yamllint -c .yamllint.yml .github/workflows/
find scripts/ -name "*.sh" -exec shellcheck {} \;
actionlint

# Or use pre-commit hooks
pre-commit run --all-files