import { handleRequest } from "../src/server.js";

const routes = {
  health: "/health",
  status: "/api/v1/status",
  validate: "/api/v1/validate",
};

export default async function handler(req, res) {
  const url = new URL(req.url || "/", "http://localhost");
  const route = url.searchParams.get("route");
  const target = routes[route];

  if (!target) {
    res.writeHead(404, {
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    });
    res.end(JSON.stringify({ error: { code: "NOT_FOUND", message: "The requested route was not found." } }));
    return;
  }

  req.url = target;
  try {
    await handleRequest(req, res);
  } catch (error) {
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 400;
    res.writeHead(statusCode, {
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    });
    res.end(JSON.stringify({
      error: {
        code: statusCode === 413 ? "PAYLOAD_TOO_LARGE" : "INVALID_REQUEST",
        message: statusCode === 413 ? "Request body exceeds the 16 KB limit." : "The request could not be processed.",
      },
    }));
  }
}
