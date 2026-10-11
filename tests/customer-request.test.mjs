import test from 'node:test';
import assert from 'node:assert/strict';
import { customerRequests } from '../src/lib/customer-request.js';

const status = {
  id: 'synthetic-id', reference: 'AUDIT-SYNTHETIC', stage: 'received',
  created_at: '2026-10-11T00:00:00.000Z',
};

for (const [type, displayField] of [
  ['consultations', 'email'], ['referrals', 'referring_firm_name'], ['partnerships', 'email'],
]) {
  test(`${type}: preserves the status display while dropping internal data`, () => {
    const row = {
      ...status, [displayField]: 'synthetic display value',
      internal_notes: 'PRIVATE_SENTINEL', source_ip_hash: 'PRIVATE_SENTINEL',
      user_agent: 'PRIVATE_SENTINEL', assigned_to: 'PRIVATE_SENTINEL',
      reviewed_by: 'PRIVATE_SENTINEL', future_private_column: 'PRIVATE_SENTINEL',
    };
    assert.deepEqual(customerRequests(type, [row]), [{ ...status, [displayField]: 'synthetic display value' }]);
    assert.equal(JSON.stringify(customerRequests(type, [row])).includes('PRIVATE_SENTINEL'), false);
    assert.equal(row.internal_notes, 'PRIVATE_SENTINEL');
  });
}

test('malformed results and unknown request types fail closed', () => {
  for (const rows of [null, undefined, {}, 'invalid']) {
    assert.deepEqual(customerRequests('consultations', rows), []);
  }
  assert.deepEqual(customerRequests('toString', [status]), []);
  assert.deepEqual(customerRequests('consultations', [null, [], 7]), []);
});

test('prototype properties are not accepted as customer fields', () => {
  const row = Object.create({ email: 'inherited@example.invalid', internal_notes: 'PRIVATE_SENTINEL' });
  Object.assign(row, status);
  assert.deepEqual(customerRequests('consultations', [row]), [status]);
});
