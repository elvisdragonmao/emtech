# Contributing to emtech

Thank you for your interest in contributing to emtech! 🎉  
We welcome contributions of all kinds, including bug reports, suggestions, and code improvements. Please follow the guidelines below to ensure a smooth contribution process.

---

## Getting Started

### Prerequisites
- Ensure you have [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/) installed on your system.

### Local Development
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Edit-Mr/emtech.git
   cd emtech
   ```
2. **Install dependencies**:
   ```bash
   yarn install
   ```
3. **Run the development server**:
   ```bash
   yarn start
   ```
   - This will start a local live server and rebuild the site automatically whenever you save changes.

4. **Build the static site** (if needed):
   ```bash
   yarn build
   ```
   - The output static files will be generated in the `dist` directory.

---

## Reporting Issues

If you encounter a bug or have a suggestion:
1. **Check existing issues** to avoid duplicates.
2. **Open a new issue** with a clear and descriptive title.
   - Include steps to reproduce the problem if reporting a bug.
   - Share any relevant details or screenshots to help us understand your suggestion or issue better.

---

## Making Changes

### Workflow
1. Fork this repository and clone your fork.
2. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b <branch-name>
   ```
3. Make your changes and test them locally.
4. Commit your changes with a clear and concise message:
   ```bash
   git commit -m "Description of the change"
   ```
5. Push your changes to your forked repository:
   ```bash
   git push origin <branch-name>
   ```
6. Open a Pull Request (PR) to the main repository.

---

## Code Review Process

1. **CI/CD pipeline checks**: 
   - All PRs will go through automated checks to ensure code quality.
   - A preview of your changes will be auto-generated via [Vercel](https://vercel.com/).

2. **Feedback and Discussion**:
   - Reviewers may request changes or ask for clarification.
   - Be open to suggestions and collaborate to improve your contribution.

---

Thank you for contributing! ❤️
If you have any questions, feel free to reach out by creating an issue.

Happy coding! 🚀
