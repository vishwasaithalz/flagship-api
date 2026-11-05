import http from "node:http";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const MAX_BODY_BYTES = 16 * 1024;

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

async function readJsonBody(req) {
  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of req) {
    totalBytes += chunk.length;
    if (totalBytes > MAX_BODY_BYTES) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) {
    throw new SyntaxError("A JSON request body is required.");
  }
  return JSON.parse(raw);
}

export async function handleRequest(req, res) {
  const pathname = new URL(req.url ?? "/", "http://localhost").pathname;

  if (req.method === "GET" && pathname === "/health") {
    return sendJson(res, 200, { status: "ok" });
  }

  if (req.method === "GET" && pathname === "/openapi.json") {
    return sendJson(res, 200, {
      openapi: "3.1.0",
      info: { title: "Flagship API", version: "0.1.0", description: "Learning API contract. Not a production security certification." },
      paths: {
        "/health": { get: { summary: "Liveness check", responses: { "200": { description: "Service is alive" } } } },
        "/api/v1/status": { get: { summary: "Service metadata", responses: { "200": { description: "Service status" } } } },
        "/api/v1/validate": { post: { summary: "Validate a small JSON object", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name"], properties: { name: { type: "string", minLength: 1, maxLength: 80 }, role: { type: "string", maxLength: 80 } } } } } }, responses: { "200": { description: "Valid payload" }, "400": { description: "Invalid payload" }, "413": { description: "Payload exceeds 16 KB" }, "415": { description: "Unsupported media type" } } } }
      }
    });
  }

  if (req.method === "GET" && pathname === "/api/v1/status") {
    return sendJson(res, 200, {
      service: "flagship-api",
      version: "0.1.0",
      runtime: "node",
    });
  }

  if (pathname === "/api/v1/validate" && req.method === "POST") {
    const contentType = req.headers["content-type"] ?? "";
    if (!contentType.toLowerCase().startsWith("application/json")) {
      return sendJson(res, 415, {
        error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "Content-Type must be application/json." },
      });
    }

    const input = await readJsonBody(req);
    if (input === null || typeof input !== "object" || Array.isArray(input)) {
      return sendJson(res, 400, {
        error: { code: "INVALID_BODY", message: "The JSON body must be an object." },
      });
    }

    if (typeof input.name !== "string" || input.name.trim().length < 1 || input.name.trim().length > 80) {
      return sendJson(res, 400, {
        error: { code: "INVALID_NAME", message: "name must be a non-empty string of at most 80 characters." },
      });
    }

    if (input.role !== undefined && (typeof input.role !== "string" || input.role.trim().length > 80)) {
      return sendJson(res, 400, {
        error: { code: "INVALID_ROLE", message: "role must be a string of at most 80 characters." },
      });
    }

    return sendJson(res, 200, {
      valid: true,
      data: {
        name: input.name.trim(),
        ...(input.role === undefined ? {} : { role: input.role.trim() }),
      },
    });
  }

  if (pathname === "/health" || pathname === "/api/v1/status" || pathname === "/api/v1/validate" || pathname === "/openapi.json") {
    res.setHeader("Allow", pathname === "/api/v1/validate" ? "POST" : "GET");
    return sendJson(res, 405, {
      error: { code: "METHOD_NOT_ALLOWED", message: "The HTTP method is not supported for this route." },
    });
  }

  return sendJson(res, 404, {
    error: { code: "NOT_FOUND", message: "The requested route was not found." },
  });
}

export function createServer() {
  return http.createServer((req, res) => {
    handleRequest(req, res).catch((error) => {
      const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 400;
      const code = statusCode === 413 ? "PAYLOAD_TOO_LARGE" : "INVALID_REQUEST";
      sendJson(res, statusCode, {
        error: {
          code,
          message: statusCode === 413 ? "Request body exceeds the 16 KB limit." : "The request could not be processed.",
        },
      });
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const port = Number.parseInt(process.env.PORT ?? "3000", 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error("PORT must be an integer between 1 and 65535.");
    process.exit(1);
  }
  createServer().listen(port, "127.0.0.1", () => {
    console.log(`Flagship API listening at http://127.0.0.1:${port}`);
  });
}
