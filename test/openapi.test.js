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

test("OpenAPI document describes all public routes and validation contract", async () => {
  const response = await fetch(`${baseUrl}/openapi.json`);
  assert.equal(response.status, 200);
  const spec = await response.json();
  assert.equal(spec.openapi, "3.1.0");
  assert.ok(spec.paths["/health"].get);
  assert.ok(spec.paths["/api/v1/status"].get);
  assert.equal(spec.paths["/api/v1/validate"].post.requestBody.required, true);
  assert.equal(spec.paths["/api/v1/validate"].post.requestBody.content["application/json"].schema.properties.name.maxLength, 80);
});
