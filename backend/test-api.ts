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

  // 3. Feed
  const feedRes = await fetch(`${BASE}/feed`);
  const feed = await feedRes.json();
  if (!Array.isArray(feed) || feed.length === 0) throw new Error('Feed fetch failed');
  console.log(`✓ Activities feed retrieved (${feed.length} moments)`);

  // 4. Like an activity
  const likeRes = await fetch(`${BASE}/feed/${feed[0].id}/like`, { method: 'POST' });
  const liked = await likeRes.json();
  if (liked.likes_count <= feed[0].likes_count) throw new Error('Like increment failed');
  console.log(`✓ Activity liked (${liked.likes_count} likes)`);

  // 5. Weekly Menu
  const menuRes = await fetch(`${BASE}/weekly-menu`);
  const menu = await menuRes.json();
  if (!Array.isArray(menu) || menu.length !== 5) throw new Error('Weekly menu fetch failed');
  console.log(`✓ Weekly menu retrieved (5 days)`);

  // 6. Announcements
  const annRes = await fetch(`${BASE}/announcements`);
  const ann = await annRes.json();
  if (!Array.isArray(ann) || ann.length === 0) throw new Error('Announcements fetch failed');
  console.log(`✓ Announcements retrieved (${ann.length} announcements)`);

  // 7. Vaccinations for child 1
  const vacRes = await fetch(`${BASE}/vaccinations/child/1`);
  const vaccines = await vacRes.json();
  if (!Array.isArray(vaccines) || vaccines.length < 7) throw new Error('Vaccinations fetch failed');
  console.log(`✓ Vaccinations retrieved (${vaccines.length} mandatory vaccines)`);

  // 8. Milestones for child 1
  const mileRes = await fetch(`${BASE}/milestones/child/1`);
  const milestones = await mileRes.json();
  if (!Array.isArray(milestones) || milestones.length === 0) throw new Error('Milestones fetch failed');
  console.log(`✓ Milestones retrieved (${milestones.length} milestones)`);

  console.log('🎉 ALL EXTENDED API ENDPOINTS VERIFIED SUCCESSFULLY!');
}

testEndpoints().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
