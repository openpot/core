
const { getGhostLibrary, saveGhostName, listAllSessions } = require('./src/lib/db/session-db');

async function test() {
  console.log('--- Initial Ghost Library ---');
  const initial = await getGhostLibrary();
  console.log(initial);

  console.log('--- Adding Strain ---');
  await saveGhostName('Test Strain');
  const after = await getGhostLibrary();
  console.log(after);

  console.log('--- All Sessions ---');
  const sessions = await listAllSessions();
  console.log(sessions.length);
}

// This won't work easily here because of IndexedDB mock, 
// but I'm checking the logic flow.
