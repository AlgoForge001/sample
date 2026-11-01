Build a very simple, beginner-friendly full-stack web application called **My Notes**.

### Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: SQLite
- Frontend and backend must be in the same project repository.

### Features
1. A clean, modern and responsive UI.
2. A text input to write a note.
3. An "Add Note" button.
4. Display all saved notes on the page.
5. Delete notes with a delete button.
6. Notes must persist in the database even after restarting the server.
7. Frontend should fetch data from the backend REST API.

### API Endpoints
- GET `/api/notes` — Get all notes
- POST `/api/notes` — Create a note
- DELETE `/api/notes/:id` — Delete a note
- GET `/api/health` — Health check

### Deployment Requirements (IMPORTANT)
- Create a production-ready Dockerfile.
- Configure the application to run on port 3000.
- The frontend must be served by the Express backend in production.
- Bind the server to `0.0.0.0`.
- Store SQLite database in `/app/data/notes.db`.
- Make database storage persistent using a Docker volume.
- Include a `.dockerignore` file.
- Include a README.md with simple instructions to run locally and deploy using Coolify.
- Make sure the app works correctly when deployed through Coolify using a Dockerfile.

Keep the project simple. Avoid unnecessary libraries and complexity. Generate all required files and make sure the application works.