import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../src/server.js";

let server;
let baseUrl;

before(async () => {
  server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test("health endpoint returns ok and hardening headers", async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("status endpoint identifies the service", async () => {
  const response = await fetch(`${baseUrl}/api/v1/status`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.service, "flagship-api");
});

test("validation endpoint accepts valid data", async () => {
  const response = await fetch(`${baseUrl}/api/v1/validate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "  Alex  ", role: " learner " }),
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    valid: true,
    data: { name: "Alex", role: "learner" },
  });
});

test("validation endpoint rejects invalid name", async () => {
  const response = await fetch(`${baseUrl}/api/v1/validate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: " " }),
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "INVALID_NAME");
});

test("validation endpoint rejects unsupported media types", async () => {
  const response = await fetch(`${baseUrl}/api/v1/validate`, {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: "name=Alex",
  });
  assert.equal(response.status, 415);
});

test("unknown routes return a JSON 404", async () => {
  const response = await fetch(`${baseUrl}/not-a-route`);
  assert.equal(response.status, 404);
  assert.equal((await response.json()).error.code, "NOT_FOUND");
});

test("known routes reject unsupported methods", async () => {
  const response = await fetch(`${baseUrl}/health`, { method: "POST" });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET");
});
