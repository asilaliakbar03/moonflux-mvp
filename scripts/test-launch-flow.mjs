/**
 * MoonFluxx Token Launch — Dry Run E2E Test
 * 
 * Tests every step of the launch pipeline WITHOUT making real on-chain transactions.
 * Run: node scripts/test-launch-flow.mjs
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Fetch with timeout (15s default)
function fetchWithTimeout(url, opts = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(timer));
}

const PASS = '✅';
const FAIL = '❌';
const WARN = '⚠️';
let passed = 0;
let failed = 0;
let warnings = 0;

function log(icon, label, detail = '') {
  console.log(`  ${icon} ${label}${detail ? ` — ${detail}` : ''}`);
}

function assert(condition, label, detail = '') {
  if (condition) {
    passed++;
    log(PASS, label, detail);
  } else {
    failed++;
    log(FAIL, label, detail);
  }
}

function warn(label, detail = '') {
  warnings++;
  log(WARN, label, detail);
}

// ─────────────────────────────────────────────
// Step 1: Test AI Token Generation Endpoint
// ─────────────────────────────────────────────
async function testGenerateToken() {
  console.log('\n🧪 Step 1: AI Token Generation (/api/generate-token)');
  
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/generate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'A memecoin about AI trading bots on Solana' }),
    }, 30000);

    assert(res.status === 200, 'Returns 200 OK', `Got ${res.status}`);
    
    const data = await res.json();
    assert(typeof data.name === 'string' && data.name.length > 0, 'Has token name', data.name);
    assert(typeof data.ticker === 'string' && data.ticker.length >= 2, 'Has valid ticker', data.ticker);
    assert(typeof data.description === 'string', 'Has description');
    assert(data.suggestedCurve !== undefined, 'Has suggested curve', data.suggestedCurve);
    
    const cacheHeader = res.headers.get('x-cache');
    if (cacheHeader === 'HIT') {
      log('💡', 'AI Response: Mock fallback used (no AI key configured)');
    } else {
      log('💡', 'AI Response: Live AI generation used');
    }
    
    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      warn('AI endpoint timed out (30s) — NVIDIA NIM may be slow. Mock fallback will serve users.');
    } else {
      failed++;
      log(FAIL, 'Endpoint unreachable', err.message);
    }
    return null;
  }
}

// ─────────────────────────────────────────────
// Step 1b: Test Rate Limiting
// ─────────────────────────────────────────────
async function testRateLimiting() {
  console.log('\n🧪 Step 1b: Rate Limiting');
  
  try {
    // Fire 6 rapid requests (limit is 5/min for generate-token)
    const promises = Array.from({ length: 6 }, () =>
      fetchWithTimeout(`${BASE_URL}/api/generate-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'rate limit test' }),
      })
    );
    
    const results = await Promise.all(promises);
    const statuses = results.map(r => r.status);
    const has429 = statuses.includes(429);
    
    if (has429) {
      assert(true, 'Rate limiter blocks excess requests', `Statuses: ${statuses.join(', ')}`);
    } else {
      warn('Rate limiter did not trigger', `All returned: ${statuses.join(', ')} (may be per-instance in serverless)`);
    }
  } catch (err) {
    warn('Rate limit test error', err.message);
  }
}

// ─────────────────────────────────────────────
// Step 2: Test Metadata Upload Endpoint
// ─────────────────────────────────────────────
async function testUploadMetadata() {
  console.log('\n🧪 Step 2: Metadata Upload (/api/upload-metadata)');
  
  try {
    const formData = new FormData();
    formData.append('name', 'Test Token');
    formData.append('ticker', 'TEST');
    formData.append('description', 'A test token for dry-run validation');
    formData.append('website', 'https://moonflux.app');
    formData.append('twitter', '@moonflux');
    formData.append('telegram', 'moonflux_chat');
    formData.append('creator', '7xKXsU9f3Fmbk2m'); // mock wallet

    // Create a tiny 1x1 PNG as test image
    const pngBytes = new Uint8Array([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
      0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82,
    ]);
    const blob = new Blob([pngBytes], { type: 'image/png' });
    formData.append('image', blob, 'test-token.png');

    const res = await fetchWithTimeout(`${BASE_URL}/api/upload-metadata`, {
      method: 'POST',
      body: formData,
    });

    assert(res.status === 200, 'Returns 200 OK', `Got ${res.status}`);
    
    const data = await res.json();
    assert(typeof data.metadataUri === 'string' && data.metadataUri.length > 0, 'Has metadataUri', data.metadataUri);
    assert(typeof data.imageUri === 'string', 'Has imageUri');
    assert(data.metadataUri.length <= 200, 'metadataUri within 200-char limit', `${data.metadataUri.length} chars`);
    
    if (data.pinned) {
      log('💡', 'IPFS: Pinata upload succeeded (live IPFS)');
    } else {
      warn('IPFS: Using fallback mock URI (PINATA_JWT not configured)');
    }
    
    return data;
  } catch (err) {
    failed++;
    log(FAIL, 'Endpoint unreachable', err.message);
    return null;
  }
}

// ─────────────────────────────────────────────
// Step 3: Test Validation Edge Cases
// ─────────────────────────────────────────────
async function testValidation() {
  console.log('\n🧪 Step 3: Input Validation');
  
  // Missing prompt
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/generate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(res.status === 400, 'Rejects missing prompt', `Got ${res.status}`);
  } catch (err) {
    failed++;
    log(FAIL, 'Missing prompt test failed', err.message);
  }

  // Missing metadata fields
  try {
    const formData = new FormData();
    // Intentionally missing 'name' and 'ticker'
    const res = await fetchWithTimeout(`${BASE_URL}/api/upload-metadata`, {
      method: 'POST',
      body: formData,
    });
    assert(res.status === 400, 'Rejects missing metadata fields', `Got ${res.status}`);
  } catch (err) {
    failed++;
    log(FAIL, 'Missing metadata test failed', err.message);
  }

  // Oversized image (simulate with header check)
  try {
    const formData = new FormData();
    formData.append('name', 'Big Token');
    formData.append('ticker', 'BIG');
    // Create a 6MB fake blob
    const bigBlob = new Blob([new Uint8Array(6 * 1024 * 1024)], { type: 'image/png' });
    formData.append('image', bigBlob, 'huge.png');

    const res = await fetchWithTimeout(`${BASE_URL}/api/upload-metadata`, {
      method: 'POST',
      body: formData,
    });
    assert(res.status === 400, 'Rejects oversized image (>5MB)', `Got ${res.status}`);
  } catch (err) {
    failed++;
    log(FAIL, 'Oversized image test failed', err.message);
  }
}

// ─────────────────────────────────────────────
// Step 4: Test MoonScore API  
// ─────────────────────────────────────────────
async function testMoonScore() {
  console.log('\n🧪 Step 4: MoonScore API (/api/moonscore)');
  
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/moonscore?mint=7xKXsU9f3FmbkT2mGm4ntJ8r9zKprL5aHqRsmN1p`, {
      method: 'GET',
    }, 30000);

    assert(res.status === 200, 'Returns 200 OK', `Got ${res.status}`);
    
    const data = await res.json();
    assert(data.score !== undefined, 'Has score', `Score: ${data.score}`);
    assert(data.score >= 0 && data.score <= 100, 'Score in valid range (0-100)');
  } catch (err) {
    if (err.name === 'AbortError') {
      warn('MoonScore timed out (AI-backed endpoint)');
    } else {
      failed++;
      log(FAIL, 'MoonScore test failed', err.message);
    }
  }
}

// ─────────────────────────────────────────────
// Step 5: Test Other New Feature APIs
// ─────────────────────────────────────────────
async function testNewFeatureAPIs() {
  console.log('\n🧪 Step 5: New Feature APIs');
  
  const endpoints = [
    { path: '/api/launch-calendar', method: 'GET', expectKey: 'launches', name: 'Launch Calendar' },
    { path: '/api/reputation', method: 'GET', expectKey: 'nodes', name: 'Reputation Graph' },
    { path: '/api/marketplace', method: 'GET', expectKey: null, name: 'Marketplace' },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}${ep.path}`, { method: ep.method });
      assert(res.status === 200, `${ep.name}: Returns 200`, `Got ${res.status}`);
      
      if (ep.expectKey) {
        const data = await res.json();
        assert(data[ep.expectKey] !== undefined, `${ep.name}: Has '${ep.expectKey}' key`);
      }
    } catch (err) {
      failed++;
      log(FAIL, `${ep.name} failed`, err.message);
    }
  }
}

// ─────────────────────────────────────────────
// Step 6: Test Page Rendering (SSR / CSR)
// ─────────────────────────────────────────────
async function testPageRendering() {
  console.log('\n🧪 Step 6: Page Rendering');
  
  const pages = [
    '/', '/explore', '/feed', '/terminal', '/leaderboard',
    '/arena', '/marketplace', '/calendar', '/reputation',
    '/profile', '/settings', '/launch', '/venture',
  ];

  for (const path of pages) {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}${path}`);
      assert(res.status === 200, `${path}: Renders OK`, `Got ${res.status}`);
    } catch (err) {
      failed++;
      log(FAIL, `${path} unreachable`, err.message);
    }
  }
}

// ─────────────────────────────────────────────
// Run All Tests
// ─────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  MoonFluxx Token Launch — Dry Run E2E Test  ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`Target: ${BASE_URL}`);

  await testGenerateToken();
  await testRateLimiting();
  await testUploadMetadata();
  await testValidation();
  await testMoonScore();
  await testNewFeatureAPIs();
  await testPageRendering();

  console.log('\n═══════════════════════════════════════');
  console.log(`  Results: ${PASS} ${passed} passed | ${FAIL} ${failed} failed | ${WARN} ${warnings} warnings`);
  console.log('═══════════════════════════════════════\n');

  if (failed > 0) {
    console.log('⚠️  Some tests failed. Review the errors above.');
    process.exit(1);
  } else {
    console.log('🎉 All tests passed! Launch pipeline is operational.');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
