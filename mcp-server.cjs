const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");

const DEFAULT_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

const server = new McpServer({
  name: "api-tester-mcp",
  version: "1.0.0",
});

async function httpRequest(baseUrl, method, path, body, headers) {
  const reqHeaders = { "Content-Type": "application/json", ...headers };
  const options = { method, headers: reqHeaders };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${baseUrl}${path}`, options);
  const status = res.status;
  let data;
  try { data = await res.json(); } catch { data = await res.text(); }
  return { status, data, baseUrl };
}

server.tool(
  "api_request",
  "Make any HTTP request to an API backend. Defaults to API_BASE_URL env var, or pass baseUrl to target a different server.",
  {
    method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).describe("HTTP method"),
    path: z.string().describe("API path e.g. /api/v1/users"),
    body: z.string().optional().describe("JSON body as a string (for POST/PUT/PATCH)"),
    token: z.string().optional().describe("Bearer token for Authorization header"),
    extraHeaders: z.string().optional().describe("Additional headers as a JSON string"),
    baseUrl: z.string().optional().describe("Override base URL e.g. http://localhost:5000 (defaults to API_BASE_URL env var)"),
  },
  async ({ method, path, body, token, extraHeaders, baseUrl }) => {
    const url = baseUrl || DEFAULT_BASE_URL;
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (extraHeaders) Object.assign(headers, JSON.parse(extraHeaders));
    const parsedBody = body ? JSON.parse(body) : undefined;
    const result = await httpRequest(url, method, path, parsedBody, headers);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  "api_login",
  "POST credentials to any login endpoint. Defaults to API_BASE_URL env var, or pass baseUrl to target a different server.",
  {
    path: z.string().describe("Login endpoint path e.g. /api/v1/user/validateLogin"),
    body: z.string().describe("Credentials as JSON string e.g. {\"email\":\"a@b.com\",\"password\":\"123\"}"),
    baseUrl: z.string().optional().describe("Override base URL e.g. http://localhost:5000 (defaults to API_BASE_URL env var)"),
  },
  async ({ path, body, baseUrl }) => {
    const url = baseUrl || DEFAULT_BASE_URL;
    const result = await httpRequest(url, "POST", path, JSON.parse(body), {});
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
