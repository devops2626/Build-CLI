# Microsoft Build CLI

The Microsoft Build CLI is a [GitHub Copilot CLI](https://docs.github.com/en/copilot/github-copilot-in-the-cli) skill that connects your local project to the Microsoft Build session catalog. It reads your dependencies, finds relevant sessions, and helps you plan your Build experience — all from your terminal.

## Get Started

Open **GitHub Copilot CLI** in any project and run:

```
/plugin install microsoft/Build-CLI
```

Then try:

```
What Build sessions are relevant to my project?
```

The skill reads your `package.json`, `requirements.txt`, `.csproj`, or other dependency files, maps them to Microsoft products, and searches the live Build 2026 session catalog for matches.

## What You Can Do

| Ask the skill to... | Example |
|---------------------|---------|
| Find sessions for your project | *"What Build sessions should I attend?"* |
| See what's new for your tech stack | *"What's new at Build for Azure Cosmos DB?"* |
| Look up a session by code | *"Tell me about session BRK155"* |
| Get next steps after a session | *"What should I do after session BRK155?"* |
| Scaffold a project from a session | *"Scaffold a project from session BRK155"* |
| Log notes during the event | *"Log a note from session BRK155: great agent demo"* |

## How It Works

The skill pulls session data from the **live Build 2026 catalog** — no stale data, no manual updates. For SDK docs and code samples, it uses the **Microsoft Learn MCP Server**.

If you have **Node.js 22+** installed, the skill automatically uses the `@microsoft/events-cli` for faster local search and caching. Without Node.js, it falls back to direct HTTP — everything still works.

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit [Contributor License Agreements](https://cla.opensource.microsoft.com).

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft
trademarks or logos is subject to and must follow
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
