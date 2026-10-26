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

  // 3. Children list
  const childRes = await fetch(`${BASE}/children`);
  const children = await childRes.json();
  if (!Array.isArray(children) || children.length === 0) throw new Error('Children fetch failed');
  console.log(`✓ Children retrieved (${children.length} children)`);

  // 4. Create child
  const newChildRes = await fetch(`${BASE}/children`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      first_name: 'TestEnfant',
      last_name: 'Integration',
      birth_date: '2025-05-01',
      gender: 'M',
      section_id: 2,
      allergies: 'Kiwi',
      diet: 'Standard',
      guardians: [
        { first_name: 'Parent', last_name: 'Test', relation: 'Mère', phone: '0600000000', email: 'parent@test.com' }
      ]
    })
  });
  const createdChild = await newChildRes.json();
  if (!createdChild || !createdChild.id) throw new Error('Child creation failed');
  console.log(`✓ Child created with ID: ${createdChild.id}`);

  // 5. Check-in test
  const checkinRes = await fetch(`${BASE}/attendance/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      child_id: createdChild.id,
      actual_arrival: '08:45',
      notes: 'Arrivée en forme'
    })
  });
  const checkinData = await checkinRes.json();
  if (!checkinData.success || checkinData.attendance.status !== 'present') throw new Error('Check-in failed');
  console.log('✓ Check-in succeeded');

  // 6. Daily log upsert
  const logRes = await fetch(`${BASE}/daily-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      child_id: createdChild.id,
      mood: 'Très joyeux',
      meals_summary: 'Repas complet',
      naps_summary: 'Sieste 1h30',
      hygiene_summary: '2 changes',
      activities: 'Peinture',
      observations: 'Super journée',
      logged_by: 'Testeur'
    })
  });
  const logData = await logRes.json();
  if (!logData || logData.mood !== 'Très joyeux') throw new Error('Daily log upsert failed');
  console.log('✓ Daily log upsert succeeded');

  // 7. Check-out test
  const checkoutRes = await fetch(`${BASE}/attendance/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      child_id: createdChild.id,
      actual_departure: '17:00',
      pickup_by: 'Parent Test'
    })
  });
  const checkoutData = await checkoutRes.json();
  if (!checkoutData.success || checkoutData.attendance.status !== 'departed') throw new Error('Check-out failed');
  console.log('✓ Check-out succeeded');

  // 8. Ratios
  const ratiosRes = await fetch(`${BASE}/staff/ratios`);
  const ratiosData = await ratiosRes.json();
  if (!Array.isArray(ratiosData.sections)) throw new Error('Ratios calculation failed');
  console.log('✓ Staff legal ratios calculated');

  // 9. Invoice generation
  const invRes = await fetch(`${BASE}/invoices/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      child_id: createdChild.id,
      month: '2026-10',
      actual_hours: 140,
      meal_count: 20
    })
  });
  const invData = await invRes.json();
  if (!invData || !invData.invoice_number) throw new Error('Invoice generation failed');
  console.log(`✓ Invoice generated: ${invData.invoice_number} (Total: ${invData.total_due} €)`);

  // Clean test child
  await fetch(`${BASE}/children/${createdChild.id}`, { method: 'DELETE' });
  console.log('✓ Cleaned up test child');

  console.log('🎉 ALL API ENDPOINTS VERIFIED SUCCESSFULLY!');
}

testEndpoints().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
