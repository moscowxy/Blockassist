# GitHub Upload Checklist

Follow these steps to publish the Base Blackjack project to your GitHub repository:

1. **Install dependencies**
   ```bash
   npm install
   ```
   The project ships with a lock file–free configuration, so the command resolves package versions using the latest compatible releases defined in `package.json`.

2. **Build and test**
   ```bash
   npm run build
   ```
   The Hardhat build step compiles the Solidity contracts and TypeScript helper scripts. Run additional checks such as `npm run lint` when you add them to the tooling stack.

3. **Create a production bundle (optional)**
   If you add a front-end miniapp, ensure its build output lives under a dedicated directory (for example `app/dist/`) and add the folder to `.gitignore` unless you intend to commit static artifacts.

4. **Commit the results**
   ```bash
   git add .
   git commit -m "chore: prepare release"
   ```
   Verify `git status` is clean before moving to the next step.

5. **Push to GitHub**
   ```bash
   git push origin main
   ```
   Replace `main` with the branch you want to publish. After the push completes, open a pull request from your feature branch if you follow a trunk-based workflow.

6. **Tag a release (optional)**
   ```bash
   git tag -a v1.0.0 -m "Base Blackjack launch"
   git push origin v1.0.0
   ```
   Tags make it easier to distribute immutable snapshots when coordinating audits or rolling out new Farcaster miniapp builds.

With these steps complete, the codebase and assets will be available on GitHub for collaborators and players alike.
