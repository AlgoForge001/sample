const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const TEST_PORT = 3123;
const TEST_DB = path.join(__dirname, 'test-notes.db');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, text: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('--- Starting Automated Integration Tests ---');

  // Clean test DB if exists
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);

  // Spawn server on test port
  const server = spawn('node', ['server/index.js'], {
    env: { ...process.env, PORT: TEST_PORT, DB_PATH: TEST_DB },
    stdio: 'pipe',
  });

  server.stdout.on('data', (d) => process.stdout.write(`[SERVER] ${d}`));
  server.stderr.on('data', (d) => process.stderr.write(`[SERVER ERR] ${d}`));

  let serverStarted = false;
  for (let i = 0; i < 20; i++) {
    await wait(250);
    try {
      const res = await request({ hostname: '127.0.0.1', port: TEST_PORT, path: '/api/health', method: 'GET' });
      if (res.status === 200) {
        serverStarted = true;
        break;
      }
    } catch {
      // Retry
    }
  }

  if (!serverStarted) {
    server.kill();
    throw new Error('Server failed to start on test port');
  }

  try {
    // 1. Health check
    console.log('Test 1: Health check');
    const health = await request({ hostname: '127.0.0.1', port: TEST_PORT, path: '/api/health', method: 'GET' });
    if (health.status !== 200 || health.data.status !== 'ok') {
      throw new Error(`Health check failed: ${JSON.stringify(health)}`);
    }

    // 2. Validate empty note creation fails
    console.log('Test 2: Validation on empty note creation');
    const emptyNote = await request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/api/notes',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { content: '   ' }
    );
    if (emptyNote.status !== 400) {
      throw new Error(`Expected 400 for empty note, got ${emptyNote.status}`);
    }

    // 3. Create valid note
    console.log('Test 3: Create valid note');
    const newNote = await request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/api/notes',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { title: 'Shopping List', content: 'Apples, Bananas, Milk' }
    );
    if (newNote.status !== 201 || !newNote.data.id || newNote.data.title !== 'Shopping List') {
      throw new Error(`Create note failed: ${JSON.stringify(newNote)}`);
    }
    const noteId = newNote.data.id;

    // 4. Get all notes
    console.log('Test 4: Get all notes');
    const notes = await request({ hostname: '127.0.0.1', port: TEST_PORT, path: '/api/notes', method: 'GET' });
    if (notes.status !== 200 || !Array.isArray(notes.data) || notes.data.length !== 1) {
      throw new Error(`Expected array with 1 note, got ${JSON.stringify(notes)}`);
    }

    // 5. Delete note
    console.log('Test 5: Delete note');
    const del = await request({ hostname: '127.0.0.1', port: TEST_PORT, path: `/api/notes/${noteId}`, method: 'DELETE' });
    if (del.status !== 200 || del.data.id !== noteId) {
      throw new Error(`Delete failed: ${JSON.stringify(del)}`);
    }

    // 6. Delete non-existent note (should return 404)
    console.log('Test 6: Delete non-existent note returns 404');
    const delMissing = await request({ hostname: '127.0.0.1', port: TEST_PORT, path: `/api/notes/999999`, method: 'DELETE' });
    if (delMissing.status !== 404) {
      throw new Error(`Expected 404 for missing note, got ${delMissing.status}`);
    }

    // 7. Test UI index.html served
    console.log('Test 7: Static UI served');
    const indexRes = await request({ hostname: '127.0.0.1', port: TEST_PORT, path: '/', method: 'GET' });
    if (indexRes.status !== 200 || !indexRes.text.includes('My Notes')) {
      throw new Error('Root path did not return UI HTML');
    }

    console.log('🎉 ALL INTEGRATION TESTS PASSED!');
  } finally {
    server.kill();
    // Clean up test DB
    try {
      if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
    } catch {
      // Ignore
    }
  }
}

run().catch((err) => {
  console.error('❌ Tests failed:', err);
  process.exit(1);
});
