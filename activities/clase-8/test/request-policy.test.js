// Policy tests — INCOMPLETE, on purpose. This is the payoff of the whole
// class: once canClaimRequest depends on nothing, its entire behavior
// matrix runs here with plain objects. No HTTP. No PostgreSQL. No server.
//
// Convert each stub as you implement the policy. Look at the matrix in
// the FEATURE-801 brief: every row becomes one assertion.
import test from 'node:test';

test('an agent can claim an open, unassigned request', async () => {
  const { canClaimRequest } = await import('../src/modules/requests/request.policy.js');
  const result = canClaimRequest({
    actor: { role: 'agent', userId: '11111111-1111-1111-1111-111111111111' },
    request: { status: 'open', assignedTo: null }
  });
  if (result.allowed !== true) throw new Error('expected allowed true');
});

test('a requester cannot claim, even an open request', async () => {
  const { canClaimRequest } = await import('../src/modules/requests/request.policy.js');
  const result = canClaimRequest({
    actor: { role: 'requester', userId: '11111111-1111-1111-1111-111111111111' },
    request: { status: 'open', assignedTo: null }
  });
  if (!(result.allowed === false && result.reason === 'NOT_AGENT')) {
    throw new Error(`unexpected ${JSON.stringify(result)}`);
  }
});

test('an already assigned request cannot be claimed again', async () => {
  const { canClaimRequest } = await import('../src/modules/requests/request.policy.js');
  const result = canClaimRequest({
    actor: { role: 'agent', userId: '11111111-1111-1111-1111-111111111111' },
    request: { status: 'open', assignedTo: '22222222-2222-2222-2222-222222222222' }
  });
  if (!(result.allowed === false && result.reason === 'ALREADY_ASSIGNED')) {
    throw new Error(`unexpected ${JSON.stringify(result)}`);
  }
});

test('a request that is not open cannot be claimed', async () => {
  const { canClaimRequest } = await import('../src/modules/requests/request.policy.js');
  const states = ['in_progress', 'resolved', 'closed', 'cancelled'];
  for (const status of states) {
    const result = canClaimRequest({
      actor: { role: 'agent', userId: '11111111-1111-1111-1111-111111111111' },
      request: { status, assignedTo: null }
    });
    if (!(result.allowed === false && result.reason === 'NOT_OPEN')) {
      throw new Error(`unexpected ${JSON.stringify(result)} for ${status}`);
    }
  }
});

test('the role rule wins over the state rules', async () => {
  const { canClaimRequest } = await import('../src/modules/requests/request.policy.js');
  const result = canClaimRequest({
    actor: { role: 'requester', userId: '11111111-1111-1111-1111-111111111111' },
    request: { status: 'cancelled', assignedTo: '22222222-2222-2222-2222-222222222222' }
  });
  if (!(result.allowed === false && result.reason === 'NOT_AGENT')) {
    throw new Error(`unexpected ${JSON.stringify(result)}`);
  }
});
