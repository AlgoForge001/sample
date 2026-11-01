# 📝 My Notes

A simple, beginner-friendly full-stack note-taking web application built with **React**, **Vite**, **Express**, and **SQLite**.

---

## 🚀 Features

- **Modern & Responsive UI**: Clean card-based design with smooth transitions and mobile-first responsiveness.
- **Persistent Notes**: Notes are stored in SQLite and persist across server restarts and deployments.
- **RESTful API**: Clean backend API for managing notes and health monitoring.
- **Convenience Shortcuts**: Press `Ctrl + Enter` (or `Cmd + Enter`) to quickly save notes.
- **Search & Filter**: Real-time client-side search to quickly locate notes.
- **Production-Ready Docker**: Multi-stage Docker build serving the optimized React frontend directly through Express on port 3000.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite
- **Backend**: Node.js, Express
- **Database**: SQLite (`better-sqlite3` with WAL mode)
- **Monorepo**: Frontend and backend co-located in a single repository

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check (checks database connection and uptime) |
| `GET` | `/api/notes` | Fetch all saved notes (newest first) |
| `POST` | `/api/notes` | Create a new note (`{ title?, content }`) |
| `DELETE` | `/api/notes/:id` | Delete a note by ID |

---

## 💻 Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18, v20, or v22 recommended)
- `npm` (included with Node.js)

### 1. Install Dependencies
Install dependencies for both backend and frontend with a single command:
```bash
npm run install:all
```

### 2. Start in Development Mode
Runs the Express backend and the Vite dev server concurrently with auto-reload:
```bash
npm run dev
```
- Frontend dev server: [http://localhost:5173](http://localhost:5173) (automatically proxies API requests to backend)
- Backend server: [http://localhost:3000](http://localhost:3000)

### 3. Run Automated Tests
```bash
npm test
```

### 4. Build & Run in Production Mode Locally
```bash
# Build the React frontend into client/dist
npm run build

# Start the Express server (serves both API and static frontend)
npm start
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

### Build Docker Image
```bash
docker build -t my-notes .
```

### Run with Persistent Storage Volume
The SQLite database is stored at `/app/data/notes.db`. Mount a Docker volume at `/app/data` to ensure notes persist across container restarts and updates:

```bash
docker run -d \
  --name my-notes \
  -p 3000:3000 \
  -v my-notes-data:/app/data \
  my-notes
```

Check the health status:
```bash
curl http://localhost:3000/api/health
```

---

## ☁️ Deploying on Coolify

Deploying **My Notes** on [Coolify](https://coolify.io/) is quick and straightforward:

### Step 1: Add New Application
1. In the Coolify dashboard, select your **Project** and **Environment**.
2. Click **+ Add New Resource** and select **Public Repository** or **Private Repository** (connect your Git repository containing this project).

### Step 2: Configure Build Pack & Port
1. Under **General Configuration**:
   - **Build Pack**: Select **Dockerfile**.
   - **Ports Exposes**: Enter `3000`.
   - **Base Directory**: Leave as `/` (root).
2. Under **Health Checks**:
   - Enable Health Check.
   - **Path**: Set to `/api/health`.

### Step 3: Configure Persistent Storage (IMPORTANT)
To ensure notes are never lost during redeployments or container restarts:
1. Navigate to the **Storages** tab in your application settings.
2. Click **+ Add Storage**.
3. Configure the volume:
   - **Volume Name**: `my-notes-data` (or any descriptive name)
   - **Destination Path**: `/app/data`
4. Click **Save**.

### Step 4: Deploy
1. Click the **Deploy** button at the top right.
2. Coolify will build the multi-stage Docker image, mount the persistent volume at `/app/data`, and route traffic to port `3000`.
3. Open your assigned application domain/URL to use your notes app!

---

## 📂 Project Structure

```text
├── client/                 # Frontend React + Vite application
│   ├── src/
│   │   ├── App.jsx         # Main UI component (form, note list, delete)
│   │   ├── App.css         # UI styles and responsive design
│   │   ├── index.css       # Global styles & resets
│   │   └── main.jsx        # React root entrypoint
│   ├── index.html          # HTML document
│   ├── package.json        # Client dependencies & scripts
│   └── vite.config.js      # Vite configuration & dev proxy
├── server/                 # Backend Node.js + Express application
│   ├── db.js               # SQLite connection & table initialization
│   └── index.js            # Express REST API & static file serving
├── tests/                  # Integration tests
│   └── api.test.js         # Automated API & DB integration test suite
├── Dockerfile              # Multi-stage production container build
├── .dockerignore           # Files ignored in Docker build context
├── .gitignore              # Files ignored by git
├── package.json            # Root dependencies & scripts
├── README.md               # Documentation & setup instructions
└── agent.md                # Project requirements specification
```

