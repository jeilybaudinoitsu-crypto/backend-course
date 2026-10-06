// API tests for FEATURE-801
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { createUser, createRequestAs } from './helpers/test-data.js';
import { loginAs } from './helpers/test-auth.js';
import { cleanupCreatedData, closePool } from './helpers/cleanup.js';

after(async () => {
  await cleanupCreatedData();
  await closePool();
});

test('claim requires authentication', async () => {
  const agent = await createUser({ name: 'agent', role: 'agent' });
  const token = await loginAs(agent);
  const created = await createRequestAs(token);
  const response = await request(app).post(`/requests/${created.id}/claim`);
  assert.equal(response.status, 401);
});

test('a requester cannot claim a request', async () => {
  const agent = await createUser({ name: 'agent', role: 'agent' });
  const requester = await createUser({ name: 'req' });
  const requesterToken = await loginAs(requester);
  const agentToken = await loginAs(agent);
  const created = await createRequestAs(agentToken);
  const response = await request(app)
    .post(`/requests/${created.id}/claim`)
    .set('Authorization', `Bearer ${requesterToken}`);
  assert.equal(response.status, 403);
});

test('an agent claims an open request: 200, assignedTo from the token, in_progress', async () => {
  const agent = await createUser({ name: 'agent', role: 'agent' });
  const token = await loginAs(agent);
  const created = await createRequestAs(token);
  const response = await request(app)
    .post(`/requests/${created.id}/claim`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.assignedTo, agent.id);
  assert.equal(response.body.status, 'in_progress');
});

test('claiming a nonexistent request answers 404', async () => {
  const agent = await createUser({ name: 'agent', role: 'agent' });
  const token = await loginAs(agent);
  const response = await request(app)
    .post('/requests/999999999/claim')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(response.status, 404);
});

test('a second claim answers 409 REQUEST_ALREADY_ASSIGNED', async () => {
  const agent = await createUser({ name: 'agent', role: 'agent' });
  const token = await loginAs(agent);
  const created = await createRequestAs(token);
  await request(app)
    .post(`/requests/${created.id}/claim`)
    .set('Authorization', `Bearer ${token}`)
    .send();
  const response = await request(app)
    .post(`/requests/${created.id}/claim`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(response.status, 409);
  assert.equal(response.body.error.code, 'REQUEST_ALREADY_ASSIGNED');
});

test('a terminal request cannot be claimed', async () => {
  const agent = await createUser({ name: 'agent', role: 'agent' });
  const token = await loginAs(agent);
  const created = await createRequestAs(token);
  await request(app)
    .patch(`/requests/${created.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status: 'cancelled' });
  const response = await request(app)
    .post(`/requests/${created.id}/claim`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(response.status, 409);
});

test('assignedTo in the body is rejected as a server-controlled field', async () => {
  const agent = await createUser({ name: 'agent', role: 'agent' });
  const token = await loginAs(agent);
  const created = await createRequestAs(token);
  const response = await request(app)
    .post(`/requests/${created.id}/claim`)
    .set('Authorization', `Bearer ${token}`)
    .send({ assignedTo: '11111111-1111-1111-1111-111111111111' });
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'SERVER_CONTROLLED_FIELD');
});

test('the claim leaves a request_claimed event in the history', async () => {
  const agent = await createUser({ name: 'agent', role: 'agent' });
  const token = await loginAs(agent);
  const created = await createRequestAs(token);
  await request(app)
    .post(`/requests/${created.id}/claim`)
    .set('Authorization', `Bearer ${token}`);
  const response = await request(app)
    .get(`/requests/${created.id}/history`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(response.status, 200);
  const hasClaimed = response.body.some((e) => e.type === 'request_claimed' && e.fromStatus === 'open' && e.toStatus === 'in_progress');
  assert.ok(hasClaimed);
});
