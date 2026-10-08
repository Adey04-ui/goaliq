// scripts/test-rate-limit.mjs

const url = process.argv[2];
const total = Number(process.argv[3] || 60);

if (!url) {
  console.error(
    'Usage: node scripts/test-rate-limit.mjs "<url>" [count]'
  );
  process.exit(1);
}

if (!Number.isInteger(total) || total <= 0) {
  console.error('Error: count must be a positive integer.');
  process.exit(1);
}

console.log('');
console.log('========================================');
console.log('       GoalIQ Rate Limit Burst Test');
console.log('========================================');
console.log('');
console.log(`URL:      ${url}`);
console.log(`Requests: ${total}`);
console.log('');
console.log('Sending requests concurrently...');
console.log('');

const start = Date.now();

const results = await Promise.all(
  Array.from({ length: total }, async (_, index) => {
    const requestNumber = index + 1;

    try {
      const response = await fetch(url);

      return {
        requestNumber,
        status: response.status,
        limit: response.headers.get('x-ratelimit-limit'),
        remaining: response.headers.get('x-ratelimit-remaining'),
        retryAfter: response.headers.get('retry-after'),
      };
    } catch (error) {
      return {
        requestNumber,
        status: 'ERROR',
        error: error.message,
      };
    }
  })
);

const elapsed = Date.now() - start;

const statusCounts = {};

for (const result of results) {
  statusCounts[result.status] =
    (statusCounts[result.status] || 0) + 1;
}

console.log('========================================');
console.log('                 RESULTS');
console.log('========================================');
console.log('');

console.log('Status counts:');
console.log(statusCounts);
console.log('');

console.log('First 20 responses:');

for (const result of results.slice(0, 20)) {
  console.log(
    `#${result.requestNumber}:`,
    `status=${result.status}`,
    `remaining=${result.remaining}`,
    `limit=${result.limit}`,
    result.retryAfter
      ? `retry-after=${result.retryAfter}`
      : ''
  );
}

console.log('');

const blocked = results.filter(
  (result) => result.status === 429
);

if (blocked.length > 0) {
  console.log(`429 responses: ${blocked.length}`);

  console.log(
    `First 429: request #${blocked[0].requestNumber}`
  );

  console.log(
    `Retry-After: ${blocked[0].retryAfter ?? 'not provided'}s`
  );
} else {
  console.log('No 429 responses were received.');
}

console.log('');

console.log(`Completed in ${elapsed}ms`);
console.log('');

console.log('========================================');