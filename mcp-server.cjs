require("dotenv").config({ path: "./env.txt" });
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

const server = new McpServer({
  name: "api-tester-mcp",
  version: "1.0.0",
});

async function httpRequest(method, path, body, headers) {
  const reqHeaders = { "Content-Type": "application/json", ...headers };
  const options = { method, headers: reqHeaders };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, options);
  const status = res.status;
  let data;
  try { data = await res.json(); } catch { data = await res.text(); }
  return { status, data };
}

// Generic HTTP request — works for any backend (Node, Java, Python, Go, .NET, etc.)
server.tool(
  "api_request",
  "Make any HTTP request to the configured API backend. Change API_BASE_URL env var to point to any backend.",
  {
    method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).describe("HTTP method"),
    path: z.string().describe("API path e.g. /api/v1/users or /api/Account/login"),
    body: z.string().optional().describe("JSON body as a string (for POST/PUT/PATCH)"),
    token: z.string().optional().describe("Bearer token for Authorization header"),
    extraHeaders: z.string().optional().describe("Additional headers as a JSON string e.g. {\"x-api-key\": \"abc\"}"),
  },
  async ({ method, path, body, token, extraHeaders }) => {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (extraHeaders) Object.assign(headers, JSON.parse(extraHeaders));
    const parsedBody = body ? JSON.parse(body) : undefined;
    const result = await httpRequest(method, path, parsedBody, headers);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// Convenience: login and capture JWT in one step
server.tool(
  "api_login",
  "POST credentials to any login endpoint and return the response (including JWT token if issued)",
  {
    path: z.string().describe("Login endpoint path e.g. /api/v1/user/validateLogin or /api/auth/login"),
    body: z.string().describe("Credentials as a JSON string e.g. {\"email\":\"a@b.com\",\"password\":\"123\"}"),
  },
  async ({ path, body }) => {
    const result = await httpRequest("POST", path, JSON.parse(body), {});
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
