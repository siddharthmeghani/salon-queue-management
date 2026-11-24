# Prompt Log — Aura Salon Queue Management System

## 1. Development Method

I used ChatGPT to generate the initial Aura Salon Queue Management System as a complete downloadable ZIP project. I then extracted the files, opened the project in Visual Studio Code, configured Supabase, tested the features, and deployed it using GitHub and Vercel. I used ChatGPT for step-by-step help during setup and troubleshooting.

## 2. Prompt History

**Accuracy note:** The prompts below are **reconstructed examples** based on the work I completed, not verbatim transcripts. The original project-generation message and any exact follow-up messages should be copied from ChatGPT history if a verbatim log is required. The activities and results describe my project workflow.

### Prompt 1 — Original Project Generation

**Actual prompt:**

Develop a Vibe Coding Project for a Salon Queue Management
as per the attached guide. The application should be deployed.
Refer to the attached guide for requirements and implementation
details. Before due date I want you guys to submit personal
GitHub and public repository link, with working live link on
top of README.md file. these my assignments complete these
assignment and give me each step how to i deploy it what are
the necessary file i need to submit.. please generate layout
of our application aesthetic and pleasant

**Outcome:**

ChatGPT generated the complete Salon Queue Management
application as a downloadable ZIP file.

### Prompt 2 — Run the Downloaded Project (Reconstructed)

> I downloaded and extracted the Aura Salon project ZIP. Help me open the correct folder in VS Code, install the dependencies, and run it locally. Give me the terminal commands one step at a time.

**Outcome:** Opened the project, ran `npm install` and `npm run dev`, and tested the local website.

### Prompt 3 — Test Customer Features (Reconstructed)

> Help me test the customer flow: join a queue, choose services and a barber, generate a token, and check queue position and estimated waiting time. Tell me what to verify.

**Outcome:** Tested queue joining and customer status with demo entries.

### Prompt 4 — Test Staff and Owner Features (Reconstructed)

> Guide me through testing the reception, barber, TV display, and owner pages. I want to check calling customers, starting and completing services, toggling services, and opening or closing online joining.

**Outcome:** Tested the major staff workflows and owner controls with the demo PIN `2468`.

### Prompt 5 — Configure Supabase (Reconstructed)

> I want queue updates to be shared across browser sessions instead of staying only in one browser. Help me configure Supabase, use the SQL schema, set the project URL and publishable key, and verify live synchronization.

**Outcome:** Configured Supabase and checked queue synchronization across sessions.

### Prompt 6 — Set Up Git (Reconstructed)

> Help me install Git on Windows, open the correct project folder, initialize the repository, stage the project files, and create my first commit. Explain errors one step at a time.

**Outcome:** Installed and configured Git, corrected a repository-folder mistake, set author details, and committed the project.

### Prompt 7 — Upload to GitHub (Reconstructed)

> I have created a GitHub repository for the salon queue project. Guide me through connecting my local project to the repository and pushing the `main` branch.

**Outcome:** Uploaded the project to GitHub and completed browser authentication.

### Prompt 8 — Deploy on Vercel (Reconstructed)

> Help me deploy my GitHub React/Vite project on Vercel. Show me how to import the repository, set the Supabase environment variables, deploy, and open the live website.

**Outcome:** Deployed the application successfully.

### Prompt 9 — Verify the Live Website (Reconstructed)

> Help me test the deployed Aura Salon website. I want to verify customer registration, token status, reception, barber actions, TV display, owner settings, English/Gujarati labels, and shared queue updates.

**Outcome:** Tested the main live workflows, including cross-session queue updates.

### Prompt 10 — Prepare Submission Documentation (Reconstructed)

> Help me update the README and submission checklist with my real GitHub and Vercel links, write a reflection based on what I actually did, and prepare a prompt log for the project.

**Outcome:** Updated `README.md`, `SUBMISSION_CHECKLIST.md`, `REFLECTION.md`, and `prompts.md`.

### Prompt 11 — Check GitHub Security (Reconstructed)

> Help me check which files are tracked by Git and whether I accidentally committed `.env.local`, secret keys, or real customer data. Give me commands I can run in VS Code.

**Outcome:** Verified `.env.local` was not tracked; a keyword search found documentation warnings rather than exposed service-role keys; checked that the seed data used fictional examples. These checks do not constitute a complete security audit.

### Prompt 12 — Push Final Documentation Changes (Reconstructed)

> I changed my reflection, prompt log, and submission checklist in VS Code. Help me check Git status, stage only these files, commit them, and push the updates to GitHub.

**Outcome:** Committed and pushed the documentation updates.

## 3. Errors and Troubleshooting

| Issue | How I addressed it |
|---|---|
| `git` not recognized | Installed Git for Windows and checked `git --version`. |
| Git repository initialized in the wrong folder | Navigated to `salon-queue-project` and corrected the repository setup. |
| Incorrect `git --short` command | Used `git status --short` instead. |
| `Author identity unknown` | Configured Git username and email before committing. |
| `fatal: not a git repository` from parent folder | Ran `cd salon-queue-project` before Git commands. |
| Need for shared queue updates | Configured Supabase and tested across browser sessions. |
| Documentation changed only locally | Staged, committed, and pushed the updated Markdown files. |

## 4. Technologies and Tools

- **ChatGPT:** Generated the initial application and provided setup, testing, and troubleshooting guidance.
- **Visual Studio Code:** Edited and ran the project.
- **React, Vite, JavaScript, CSS:** Application frontend.
- **Supabase:** Shared queue data.
- **Git and GitHub:** Version control and source hosting.
- **Vercel:** Public deployment.
- **Browser:** Local and live testing.

## 5. Project Links

- **GitHub profile:** https://github.com/siddharthmeghani
- **GitHub repository:** https://github.com/siddharthmeghani/salon-queue-management
- **Live website:** https://salon-queue-management-mu.vercel.app
- **Staff demo PIN:** `2468`

## 6. Reflection on AI Use

ChatGPT helped me produce the starting project quickly, but I still needed to run it, configure services, solve setup problems, test different roles, and publish it. The most useful part of the process was following one troubleshooting step at a time and verifying the result before moving on. I learned how a locally running application becomes a deployed project with a GitHub repository, environment configuration, and a shared database.

## 7. Submission Integrity Note

This file records the workflow and **reconstructed prompt examples**. It does not claim these examples are exact historical messages. If the assignment requires every prompt actually entered, the reconstructed examples must be replaced or supplemented with the original conversation text in chronological order, including failed attempts and follow-up questions.
