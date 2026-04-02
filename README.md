Skill Pass

A comprehensive web application for enhancing and showcasing skills through interactive challenges and learning modules.

🚀 Features




Interactive Challenges: Engage in skill-based challenges to test and improve abilities.

Progress Tracking: Monitor your learning journey and track improvements over time.

Community Interaction: Connect with other learners and share experiences.

Responsive Design: Optimized for desktop and mobile devices.

🛠️ Tech Stack

Frontend: Next.js, TypeScript, Tailwind CSS, Shadcn/UI

Backend: Node.js, Express.js, TypeScript

Database: PostgreSQL (via Prisma ORM)

Version Control & CI/CD: GitHub Actions (see .github/workflows)

📂 Project Structure
skill-pass/
│
├─ frontend/          # Client-side application built with Next.js
├─ backend/           # Server-side API and business logic
├─ .github/
│   └─ workflows/     # CI/CD pipelines (GitHub Actions)
├─ README.md          # Project documentation
└─ ...

🧪 Installation
Prerequisites

Node.js (v18 or higher)

PostgreSQL database

Steps

Clone the repository:

git clone https://github.com/AmanGupta478/skill-pass.git
cd skill-pass


Install dependencies:

# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install


Configure environment variables (e.g., database URL, JWT secrets).

Start the development servers:

# Frontend
cd frontend
npm run dev

# Backend
cd backend
npm run dev