import { db } from './src/db/database';

async function testEndpoints() {
  const BASE = 'http://localhost:5050/api';
  console.log('🧪 Starting API integration tests...');

  // 1. Health
  const healthRes = await fetch(`${BASE}/health`);
  const health = await healthRes.json();
  if (health.status !== 'ok') throw new Error('Health check failed');
  console.log('✓ Health check passed');

  // 2. Sections
  const secRes = await fetch(`${BASE}/sections`);
  const sections = await secRes.json();
  if (!Array.isArray(sections) || sections.length < 3) throw new Error('Sections fetch failed');
  console.log(`✓ Sections retrieved (${sections.length} sections)`);

  // 3. Liaison messages for child 1
  const liaisRes = await fetch(`${BASE}/liaison/child/1`);
  const liaisMessages = await liaisRes.json();
  if (!Array.isArray(liaisMessages) || liaisMessages.length === 0) throw new Error('Liaison messages fetch failed');
  console.log(`✓ Liaison messages retrieved (${liaisMessages.length} messages)`);

  // 4. Send new liaison message
  const newMsgRes = await fetch(`${BASE}/liaison`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      child_id: 1,
      sender_type: 'staff',
      sender_name: 'Sarah Benali',
      message: 'Test message de liaison bien reçu.',
      category: 'sommeil'
    })
  });
  const newMsg = await newMsgRes.json();
  if (!newMsg || !newMsg.id) throw new Error('Liaison post failed');
  console.log('✓ Liaison message posted');

  // 5. Reminders list
  const remRes = await fetch(`${BASE}/reminders`);
  const reminders = await remRes.json();
  if (!Array.isArray(reminders) || reminders.length === 0) throw new Error('Reminders fetch failed');
  console.log(`✓ Reminders retrieved (${reminders.length} reminders)`);

  // 6. Toggle reminder status
  const toggleRes = await fetch(`${BASE}/reminders/${reminders[0].id}/status`, { method: 'PUT' });
  const toggled = await toggleRes.json();
  if (!toggled || !toggled.status) throw new Error('Reminder toggle failed');
  console.log(`✓ Reminder status toggled to: ${toggled.status}`);

  console.log('🎉 ALL LIAISON & REMINDER ENDPOINTS VERIFIED SUCCESSFULLY!');
}

testEndpoints().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
