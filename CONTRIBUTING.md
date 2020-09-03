# Contributing to holocron

✨ Thank you for taking the time to contribute to this project ✨

## 📖 Table of Contents

* [Code of Conduct](#code-of-conduct)
* [Developing](#developing)
* [Submitting a new feature](#submitting-a-new-feature)
* [Reporting bugs](#reporting-bugs)
* [Contributing](#getting-in-contact)
* [Coding conventions](#coding-conventions)

## Code of Conduct

This project adheres to the American Express [Code of Conduct](./CODE_OF_CONDUCT.md). By contributing, you are expected to honor these guidelines.

## Developing

### Installation

1. Fork the repository `holocron` to your GitHub account.
2. Afterwards run the following commands in your terminal
   Please review this tutorial to learn how to clone a repository https://help.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository

    ```bash
    $ git clone https://github.com/<your-github-username>/holocron
    $ cd holocron
    ```

   > replace `your-github-username` with your github username

3. Install the dependencies by running

    ```bash
    $ yarn
    ```

4. You can now run the scripts within the different [packages](./packages).

### Creating a `holocron` new release

1. Run `yarn lerna:version` locally from your release branch. This would push your release changes(changelog and tags) to the branch on github.
2. Create a pull request from your branch to the `main` branch with your changes.
3. Once the changes are approved ensure you merge the changes and provide the commit message for the merge as
   `chore(release): <semantic-release-version>`
   ensure you follow this convention otherwise the deployment will not be executed.
4. Once this is merged to main a deployment would be initiated on the main branch and all packages that changed would be released to npm.

## Submitting a new feature

When submitting a new feature request or enhancement of an existing features please review the following:

### Is your feature request related to a problem

Please provide a clear and concise description of what you want and what your use case is.

### Provide an example

Please include a snippets of the code of the new feature.

### Describe the suggested enhancement

A clear and concise description of the enhancement to be added include a step-by-step guide if applicable.
Add any other context or screenshots or animated GIFs about the feature request.

### Describe alternatives you've considered

A clear and concise description of any alternative solutions or features you've considered.

## Reporting bugs

All issues are submitted within GitHub issues. Please check this before submitting a new issue.

### Describe the bug

A clear and concise description of what the bug is.

### Provide step-by-step guide on how to reproduce the bug

Please provide code snippets or a link to a repository, with steps to reproduce the behavior, failure or topic of discussion.

### Expected behavior

Please provide a description of the expected behavior

### Screenshots

If applicable, add screenshots or animated GIFs to help explain your problem.

### System information

Provide the system information which is not limited to the below:

- OS: [e.g. macOS, Windows]
- Browser (if applies) [e.g. chrome, safari]
- Version of faux-cdn: [e.g. 5.0.0]
- Node version:[e.g 10.15.1]

### Security Bugs

Please review our [Security Policy](./SECURITY.md). Please follow the instructions outlined in the policy.

## Getting in contact

- Join our [Slack channel](http://one-amex.slack.com) request an invite [here](https://join.slack.com/t/one-amex/shared_invite/enQtOTA0MzEzODExODEwLTlmYzI1Y2U2ZDEwNWJjOTAxYTlmZTYzMjUyNzQyZTdmMWIwZGJmZDM2MDZmYzVjMDk5OWU4OGIwNjJjZWRhMjY)

## Coding conventions

### Git Commit Guidelines

We follow [conventional commits](https://www.conventionalcommits.org/) for git commit message formatting. These rules make it easier to review commit logs and improve contextual understanding of code changes. This also allows us to auto-generate the CHANGELOG from commit messages.