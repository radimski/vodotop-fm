/* Security-parity checks for the Cloudflare preview adapter. */
import assert from 'node:assert/strict';
import {
  FormError,
  checkOrigin,
  evaluateSpam,
  issueToken,
  verifyToken,
  verifyTurnstile,
} from '../site/functions/_core.mjs';

const secret = 'worker-test-secret-that-is-long-enough';
const now = 1_800_000_000;
const first = await issueToken('rezervacia', secret, now);
const second = await issueToken('rezervacia', secret, now);

assert.notEqual(first, second, 'tokens issued in the same second must be unique');
assert.equal(await verifyToken(first, 'rezervacia', secret, 7200, now), now);

await assert.rejects(
  verifyToken(first.slice(0, -1) + (first.endsWith('0') ? '1' : '0'), 'rezervacia', secret, 7200, now),
  (error) => error instanceof FormError && error.code === 'bad_nonce',
);

checkOrigin('https://www.raftingoravec-pieniny.sk', '', ['raftingoravec-pieniny.sk']);
assert.throws(
  () => checkOrigin('https://attacker.example', '', ['raftingoravec-pieniny.sk']),
  (error) => error instanceof FormError && error.code === 'bad_request',
);

const trapped = evaluateSpam(
  { _website: 'https://spam.example' },
  {},
  { fields: {}, minSeconds: 0 },
  10,
);
assert.equal(trapped.quarantined, true);
assert.ok(trapped.reasons.includes('honeypot:_website'));

const passFetch = async () => new Response(JSON.stringify({
  success: true,
  hostname: 'www.raftingoravec-pieniny.sk',
  action: 'booking',
  'error-codes': [],
}), { status: 200, headers: { 'Content-Type': 'application/json' } });

await verifyTurnstile({
  token: 'test-token',
  secret: 'test-secret',
  expectedHostnames: ['raftingoravec-pieniny.sk'],
  expectedAction: 'booking',
  fetcher: passFetch,
});

await assert.rejects(
  verifyTurnstile({
    token: 'bad-token',
    secret: 'test-secret',
    fetcher: async () => new Response(JSON.stringify({ success: false, 'error-codes': ['invalid-input-response'] })),
  }),
  (error) => error instanceof FormError && error.code === 'turnstile',
);

console.log('Cloudflare preview nonce, origin, honeypot and Turnstile parity passed.');
