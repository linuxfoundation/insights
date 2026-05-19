# Contributing to LFX Insights

Contributions are what make the open-source community such an amazing place to learn, inspire, and create.

## Ways to contribute

- Try [Insights](https://insights.linuxfoundation.org/) and give feedback by [creating new issues](https://github.com/linuxfoundation/insights/issues).
- Participate on open discussions or share your ideas with us by checking the [Discussions](https://github.com/linuxfoundation/insights/discussions).
- Noticed something missing in our documentation? Feel free to share your feedback — or contribute directly to help us improve it!

Any contributions you make are **greatly appreciated**. ❤️

### Issue priorities

<table>
  <tr>
    <td>
      Type of Issue
    </td>
    <td>
      Priority
    </td>
  </tr>
   <tr>
    <td>
      Bug in Critical Features (Community Data)
    </td>
    <td>
      <a href="https://github.com/calcom/cal.com/issues?q=is:issue+is:open+sort:updated-desc+label:Urgent">
        <img src="https://img.shields.io/badge/-Urgent-red">
      </a>
    </td>
  </tr>
  <tr>
    <td>
      Bug in Core Features (Collections, Projects, Projects metrics)
    </td>
    <td>
      <a href="https://github.com/calcom/cal.com/issues?q=is:issue+is:open+sort:updated-desc+label:%22High+priority%22">
        <img src="https://img.shields.io/badge/-High%20Priority-orange">
      </a>
    </td>
  </tr>
  <tr>
    <td>
      Confusing UX (but it's working)
    </td>
    <td>
      <a href="https://github.com/calcom/cal.com/issues?q=is:issue+is:open+sort:updated-desc+label:%22Medium+priority%22">
        <img src="https://img.shields.io/badge/-Medium%20Priority-yellow">
      </a>
    </td>
  </tr>
  <tr>
    <td>
      Minor improvements
    </td>
    <td>
      <a href="https://github.com/calcom/cal.com/issues?q=is:issue+is:open+sort:updated-desc+label:%22Low+priority%22">
        <img src="https://img.shields.io/badge/-Low%20Priority-green">
      </a>
    </td>
  </tr>
</table>

## 📚 Documentation Contribution Guide

We welcome contributions to our documentation! If you’ve found something missing, unclear, or outdated, here’s how you can help improve it.

#### 🔗 Accessing the Documentation

You can view the live documentation here:
➡️ [LFX Insights Docs](https://insights.linuxfoundation.org/docs/introduction/what-is-insights/)

Our documentation is built using [VitePress](https://vitepress.dev/), a modern static site generator powered by Vite and Vue.

#### 🗂️ Where the Documentation Lives

All documentation files are located within the [main repository](https://github.com/linuxfoundation/insights) under:
`frontend/docs`

Each Markdown file within this directory corresponds to a public documentation page. The folder structure defines the URL structure. For example:

```bash
/frontend/docs/introduction/data-quality/index.md
```
…is available at:
➡️ https://insights.linuxfoundation.org/docs/introduction/data-quality/

To create a new page or section, simply add Markdown files and folders that match your intended URL path.
Note: All markdown files should be `index.md`. The URL path is defined by the folders.

#### 🧱 Project Structure Overview

Here’s a quick overview of how our documentation is organized:

| Path                                   | Purpose                                                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `frontend/docs/.vitepress/`            | VitePress configuration and theme customization                                                                          |
| `frontend/docs/.vitepress/config.ts`   | Site-wide settings such as title and base path. See [VitePress Site Config](https://vitepress.dev/reference/site-config) |
| `frontend/docs/.vitepress/theme/`      | Customizations to the default theme                                                                                      |
| `theme/components/`                    | Custom Vue components like Navbar and Footer                                                                             |
| `theme/cssOverrides/` and `custom.css` | CSS files overriding VitePress defaults                                                                                  |
| `theme/index.ts`                       | Imports and exports for theme customization                                                                              |
| `frontend/docs/images/`                | Image assets used across the documentation                                                                               |


#### 🛠️ Running the Docs Locally

##### 1. Clone the repository
Make sure you have Git installed. If not, follow this [installation guide](https://git-scm.com/downloads).

```bash
git --version        # Verify Git installation
git clone --recursive https://github.com/linuxfoundation/insights.git
cd insights
```

If you already cloned the repo without the `--recursive` flag, you should manually update submodules.

```bash
git submodule update --init --recursive
```

##### 2. Install Node.js and pnpm

You'll need:
- Node.js v20+
- pnpm v9+

```bash
# Install Node.js via NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# Restart your terminal, then:
nvm install 20
nvm use 20

# Verify installation
node -v      # Should return v20.x.x
nvm current  # Should return v20.x.x

# Install pnpm globally
npm install -g pnpm@latest-9
pnpm -v       # Should return 9.x.x or higher
```

##### 3. Install project dependencies

```bash
# Within the insights git project directory: /insights
cd frontend
pnpm install
```

##### 4. Start the Documentation Server

```bash
pnpm run docs:dev
```

Your local documentation will be available at:
➡️ http://localhost:5173/docs/

Changes you make to Markdown files will update live in your browser.


#### ✍️ How to Contribute
Once you’ve made your edits in frontend/docs and confirmed everything looks good locally:

```bash
# Make sure you're at the root of the repository
# Go to main
git checkout main
# Get the latest changes from main
git fetch
git pull
# Create a new branch to make your changes
git checkout -b "docs/<meaningful-branch-name>"
# After doing the changes, push your changes to the remote branch
git status              # Review your changes
git add .               # Stage all modified files
git commit -S -s -m "docs: YOUR COMMIT MESSAGE"   # Sign and commit
git push                # Push changes to your remote branch
```

[Guide on how to sign commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits).

Then:

- Open a Pull Request via the link shown in your terminal.
- Add the documentation label.
- In the PR description, briefly explain the changes you’ve made.

## 🙏 Thank You!
We appreciate your contribution to making LFX Insights better. If you have any questions, don’t hesitate to reach out or open an issue.