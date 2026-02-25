# AI Agents & Assistants

This document lists the AI assistants and agents that can work with the TieLog codebase.

---

## Supported AI Assistants

### Claude (Anthropic)

- **CLI**: [Claude Code](https://claude.com/claude-code)
- **Usage**: Full codebase assistance, refactoring, debugging
- **Configuration**: `CLAUDE_API_KEY` environment variable

### AdaL (SylphAI)

- **CLI**: [AdaL](https://github.com/adal-cli/adal-cli)
- **Usage**: R&D and software engineering automation
- **Installation**: `npm install -g @adal-cli/adal`

### GitHub Copilot

- **IDE**: VS Code, JetBrains, Neovim
- **Usage**: Inline code completions, chat assistance
- **Extension**: `GitHub.copilot`

---

## Agent Configuration

### Environment Setup

```bash
# Configure AI agent access
cp .env.example .env.local
```

### API Keys

| Service | Environment Variable | Required |
|---------|---------------------|----------|
| OpenAI | `OPENAI_API_KEY` | For GPT models |
| Anthropic | `ANTHROPIC_API_KEY` | For Claude |
| Supabase | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | For backend |

---

## Development Guidelines for AI Agents

### Code Style

- TypeScript strict mode enabled
- Follow ESLint configuration (`.eslint.config.mjs`)
- Use functional components with TypeScript

### Testing

```bash
npm test           # Run unit tests
npm run test:watch # Watch mode
```

### Type Checking

```bash
npx tsc --noEmit   # Type check before commits
```

---

## Troubleshooting

### Claude Code

```bash
# Check configuration
claude config list

# Set API key
claude config set api-key YOUR_KEY
```

### AdaL

```bash
# Verify installation
adal --version

# Get help
adal --help
```

---

## Resources

- [TieLog GitHub](https://github.com/your-org/the-logbook)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
