# 📝 My Notes

A simple, beginner-friendly full-stack note-taking web application built with **React**, **Vite**, **Express**, and **SQLite**, containerized and ready for production self-hosting on **Coolify** or any Docker-compatible platform.

---

## 🚀 Features

- **Modern & Responsive UI**: Clean card-based design with smooth transitions and mobile-first responsiveness.
- **Unified Single-Container Architecture**: Express backend serves both the REST API and the compiled React + Vite frontend SPA on port 3000.
- **Persistent Notes Storage**: Notes are stored in SQLite (`better-sqlite3` with WAL mode) and persist across server restarts, container updates, and redeployments.
- **RESTful API**: Clean backend API for managing notes and health checks.
- **Keyboard Shortcuts**: Press `Ctrl + Enter` (or `Cmd + Enter`) to quickly save notes.
- **Real-Time Search**: Instant client-side search to quickly locate notes by title or content.
- **Coolify & Production Ready**: Multi-stage Docker build, health check (`/api/health`), non-root-compatible storage path (`/app/data`), and graceful shutdown.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite
- **Backend**: Node.js 22, Express
- **Database**: SQLite (`better-sqlite3` with Write-Ahead Logging)
- **Monorepo**: Frontend and backend co-located in a single repository

---

## 📡 API Endpoints

All frontend API calls use relative routes (`/api/...`) so no manual URL or environment configuration is needed between environments.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check (checks database connectivity, uptime, and timestamp) |
| `GET` | `/api/notes` | Fetch all saved notes (newest first) |
| `POST` | `/api/notes` | Create a new note (`{ title?, content }`) |
| `DELETE` | `/api/notes/:id` | Delete a note by ID |

---

## 💻 Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18, v20, or v22 recommended)
- `npm` (v10+ or v11+)

### 1. Install All Dependencies
Install dependencies for both root (backend) and client (frontend):
```bash
npm run install:all
```

### 2. Start in Development Mode
Runs the Express backend and the Vite dev server concurrently:
```bash
npm run dev
```
- Frontend dev server: [http://localhost:5173](http://localhost:5173) (automatically proxies `/api` requests to backend on port 3000)
- Backend server: [http://localhost:3000](http://localhost:3000)

### 3. Run Automated Tests
```bash
npm test
```

### 4. Build & Run Production Locally
```bash
# 1. Build the React frontend into client/dist
npm run build

# 2. Start the Express production server
npm start
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

### 1. Build the Docker Image
```bash
docker build -t my-notes:latest .
```

### 2. Run Container with Persistent Volume
The SQLite database is stored at `/app/data/notes.db`. Mount a Docker volume at `/app/data` to ensure notes persist across container restarts and updates:

```bash
docker run -d \
  --name my-notes \
  -p 3000:3000 \
  -v my-notes-data:/app/data \
  my-notes:latest
```

### 3. Test Container Health & Endpoints
```bash
# Verify health check
curl http://localhost:3000/api/health

# Verify web app
curl http://localhost:3000/
```

---

## ☁️ Deploying on Coolify (Self-Hosting Guide)

Coolify deploys and manages containerized applications effortlessly using the project's root `Dockerfile`.

### Step 1: Add New Application in Coolify
1. In your Coolify dashboard, select your **Project** and **Environment**.
2. Click **+ Add New Resource**.
3. Choose **Public Repository** or **Private Repository**.
4. Enter your Git repository URL:
   ```text
   https://github.com/AlgoForge001/sample.git
   ```
   and specify the branch (e.g., `main`).

### Step 2: Configure General Settings & Build Pack
1. Navigate to the **General** / **Configuration** tab:
   - **Build Pack**: Select **Dockerfile**.
   - **Dockerfile Location**: `/Dockerfile` (or leave blank to use the default root Dockerfile).
   - **Ports Exposes**: Enter `3000`.
   - **Base Directory**: `/` (root).
2. Under **Domains**:
   - Add your custom domain or Coolify-generated domain (e.g., `https://notes.yourdomain.com`). Coolify will automatically configure Traefik reverse proxy and Let's Encrypt SSL.

### Step 3: Configure Health Check
1. In the **Health Checks** section:
   - Enable **Health Check**.
   - **Path**: Set to `/api/health`.
   - **Port**: `3000` (or leave default).
   - **Interval**: 30 seconds.
   - **Timeout**: 5 seconds.

### Step 4: Configure Persistent Storage Volume (CRITICAL)
Because SQLite saves data to disk, you **must** configure persistent volume storage so notes survive redeployments:
1. Go to the **Storages** tab of your application in Coolify.
2. Click **+ Add Storage**.
3. Fill in the volume configuration:
   - **Volume Name**: `my-notes-data` (or any identifier)
   - **Destination Path**: `/app/data`
4. Click **Save**.

### Step 5: Deploy
1. Click the **Deploy** button in the top right.
2. Coolify will:
   - Clone the repository.
   - Run the multi-stage Docker build (compiling React with Vite and setting up Express + SQLite).
   - Attach the persistent volume `/app/data`.
   - Start the container and verify the `/api/health` endpoint.
3. Open your configured URL to access your live **My Notes** application!

---

## 📂 Project Structure

```text
├── client/                 # Frontend React + Vite application
│   ├── src/
│   │   ├── App.jsx         # Main UI component (relative /api routes, note form, list, search)
│   │   ├── App.css         # Clean, responsive styles and layout
│   │   ├── index.css       # Global typography & CSS resets
│   │   └── main.jsx        # React root entrypoint
│   ├── index.html          # HTML document
│   ├── package.json        # Client dependencies (React, Vite)
│   └── vite.config.js      # Vite dev server configuration & /api proxy
├── server/                 # Backend Node.js + Express application
│   ├── db.js               # SQLite database setup (/app/data/notes.db) & WAL mode
│   └── index.js            # Express server (REST API, static SPA serving, graceful shutdown)
├── tests/                  # Automated integration tests
│   └── api.test.js         # Integration test suite for API, SQLite, and static SPA serving
├── Dockerfile              # Multi-stage production container build for Coolify
├── .dockerignore           # Prevents unneeded files from bloating the Docker context
├── .gitignore              # Ignores dependencies, builds, and local database files
├── package.json            # Root configuration, dependencies, and unified scripts
├── README.md               # Detailed documentation & Coolify deployment instructions
└── agent.md                # Project requirements specification
```
