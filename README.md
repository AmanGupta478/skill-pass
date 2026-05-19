# Skill Pass

Skill Pass is a premium, comprehensive web application designed to allow students to showcase their verified achievements, projects, internships, and certifications. Built with a robust role-based system, it connects Students, Verifiers, and Admins in a secure and transparent verification ecosystem.

---

## 🚀 Features

*   **Role-Based Access Control**: Tailored dashboards and views for three distinct user roles: **Student**, **Verifier**, and **Admin**.
*   **Student Dashboard**: 
    *   Create and manage portfolio entries (Projects, Internships, Certifications).
    *   Upload files/evidence supporting achievements.
    *   Request formal verifications from authorized verifiers.
*   **Verifier Dashboard**:
    *   Review pending verification requests.
    *   Inspect entry evidence and details.
    *   Approve or reject verification requests with feedback.
*   **Admin Dashboard**:
    *   Track platform-wide user activity and flags.
    *   Resolve disputes, review flagged entries, and manage user verification flows.
*   **Responsive Profile Views**: Clean, responsive, public-facing portfolios that showcase verified achievements to prospective recruiters.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: Next.js 15 (App Router, Standalone Build)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS & Shadcn/UI (Radix UI primitives)
*   **Icons & Notifications**: Lucide React, Sonner

### Backend
*   **Runtime & Server**: Node.js & Express.js (ES6 ES Modules)
*   **ORM**: Prisma ORM
*   **Database**: PostgreSQL
*   **Authentication**: JWT (JSON Web Tokens) with HttpOnly Cookie storage

---

## 📂 Project Structure

```text
skill-pass/
│
├── frontend/             # Next.js Client-side application
│   ├── src/              # Application source code (App Router, components, hooks)
│   ├── public/           # Static public assets
│   ├── Dockerfile        # Standalone Next.js multi-stage build Dockerfile
│   └── tsconfig.json     # TypeScript configuration
│
├── backend/              # Express.js REST API
│   ├── controllers/      # Route controllers (auth, entries, flags, verifier)
│   ├── routes/           # Express endpoint routes
│   ├── prisma/           # Prisma DB schema and database migration history
│   ├── Dockerfile        # Optimized Node.js production Dockerfile
│   └── index.js          # API Server entry point
│
├── Docker-compose.yml    # Main Docker Compose orchestration file
└── README.md             # Project documentation
```

---

## 🐳 Quick Start: Running with Docker Compose (Recommended)

The entire application is containerized and orchestrated using Docker Compose. A PostgreSQL database healthcheck ensures the backend is only started when the database is fully ready, and CORS/port mappings are pre-configured.

### Prerequisites
Make sure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine.

### 1. Build and Start the Stack
From the project root directory, run:
```bash
docker compose up --build -d
```
*   `--build`: Automatically builds local Dockerfiles for frontend and backend.
*   `-d`: Runs the containers in detached (background) mode.

### 2. Verify Container Status
Check that all three containers (`db`, `backend`, and `frontend`) are up and healthy:
```bash
docker compose ps
```

### 3. Deploy Database Migrations
Deploy the database schema changes to the newly created PostgreSQL container:
```bash
docker compose exec backend npx prisma migrate deploy
```

### 4. Seed the Database (Optional)
If you wish to pre-populate the database with initial seed data:
```bash
docker compose exec backend node prisma/seed.js
```

### 5. Access the Web App
Open your browser and navigate to:
*   **Frontend Client**: [http://localhost:3000](http://localhost:3000)
*   **Backend Server**: [http://localhost:8000](http://localhost:8000)

### 6. Stop/Manage Containers
*   **Stop without deleting data/containers**:
    ```bash
    docker compose stop
    ```
*   **Start again instantly**:
    ```bash
    docker compose start
    ```
*   **Stop and fully remove containers**:
    ```bash
    docker compose down
    ```

---

## 💻 Local Development (Without Docker)

If you prefer to run the services locally on your host machine:

### Prerequisites
*   Node.js (v20 or higher)
*   PostgreSQL running locally

### Setup Steps

1.  **Clone and install dependencies**:
    ```bash
    git clone https://github.com/AmanGupta478/skill-pass.git
    cd skill-pass

    # Install Frontend Dependencies
    cd frontend && npm install

    # Install Backend Dependencies
    cd ../backend && npm install
    ```

2.  **Environment Variables**:
    *   Create a `.env` file in the `backend/` directory following the database connection details.
    *   Create a `.env` file in the `frontend/` directory declaring `NEXT_PUBLIC_API_URL=http://localhost:8000`.

3.  **Deploy database migrations locally**:
    ```bash
    cd backend
    npx prisma migrate dev
    ```

4.  **Run development servers**:
    *   **Frontend**: In `/frontend`, run `npm run dev`
    *   **Backend**: In `/backend`, run `npm run dev`