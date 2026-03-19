#!/usr/bin/env node
/**
 * JIRA + Cursor integration script.
 * - Reads credentials from .env (single source of configuration).
 * - connect: Generates .cursor/mcp.json for Cursor MCP server.
 * - Terminal commands: list, description, comment, get, transitions, transition, search.
 *
 * Usage:
 *   npm run jira:connect     # Generate MCP config from .env
 *   npm run jira:list        # List my JIRA tickets
 *   npm run jira -- description MPX-1675
 *   npm run jira -- comment MPX-1675 "Work started"
 */

import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();
const ENV_PATH = join(PROJECT_ROOT, '.env');
const CURSOR_DIR = join(PROJECT_ROOT, '.cursor');
const MCP_JSON_PATH = join(CURSOR_DIR, 'mcp.json');

function loadEnv() {
  let raw = '';
  try {
    raw = readFileSync(ENV_PATH, 'utf8');
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
    console.error('No .env file found. Copy .env.example to .env and set JIRA_HOST, JIRA_EMAIL, JIRA_API_TOKEN.');
    process.exit(1);
  }
  const env = {};
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let value = t.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1).replace(/\\"/g, '"');
    else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[key] = value.trim();
  }
  return env;
}

function normalizeJiraUrl(host) {
  if (!host) return '';
  const s = host.trim().replace(/\/$/, '');
  return s.startsWith('http://') || s.startsWith('https://') ? s : `https://${s}`;
}

function cmdConnect() {
  const env = loadEnv();
  const host = env.JIRA_HOST || '';
  const email = env.JIRA_EMAIL || '';
  const token = env.JIRA_API_TOKEN || '';
  if (!host || !email || !token) {
    console.error('Set JIRA_HOST, JIRA_EMAIL, and JIRA_API_TOKEN in .env');
    process.exit(1);
  }
  const baseUrl = host.trim().replace(/\/$/, '');
  const jiraUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
  const confluenceUrl = jiraUrl.replace(/\/$/, '') + '/wiki';

  // Use Docker-based mcp-atlassian (sooperset) - the npm server-jira package does not exist;
  // this server provides jira_get_issue, jira_search, etc. for Cursor Chat prompts.
  const mcpConfig = {
    mcpServers: {
      jira: {
        command: 'docker',
        args: [
          'run',
          '-i',
          '--rm',
          '-e', 'CONFLUENCE_URL',
          '-e', 'CONFLUENCE_USERNAME',
          '-e', 'CONFLUENCE_API_TOKEN',
          '-e', 'JIRA_URL',
          '-e', 'JIRA_USERNAME',
          '-e', 'JIRA_API_TOKEN',
          'ghcr.io/sooperset/mcp-atlassian:latest',
        ],
        env: {
          CONFLUENCE_URL: confluenceUrl,
          CONFLUENCE_USERNAME: email,
          CONFLUENCE_API_TOKEN: token,
          JIRA_URL: jiraUrl,
          JIRA_USERNAME: email,
          JIRA_API_TOKEN: token,
        },
      },
    },
  };
  try {
    mkdirSync(CURSOR_DIR, { recursive: true });
  } catch (e) {
    if (e.code !== 'EEXIST') throw e;
  }
  writeFileSync(MCP_JSON_PATH, JSON.stringify(mcpConfig, null, 2), 'utf8');
  console.log('Generated .cursor/mcp.json (Docker mcp-atlassian). Restart Cursor to load the JIRA MCP server.');
  console.log('Ensure Docker is running.');
}

async function jiraFetch(baseUrl, email, token, path, options = {}) {
  const url = `${baseUrl.replace(/\/$/, '')}/rest/api/3${path}`;
  const encoded = Buffer.from(`${email}:${token}`, 'utf8').toString('base64');
  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Basic ${encoded}`,
        ...options.headers,
      },
    });
  } catch (err) {
    console.error('Network error:', err.message || err);
    console.error('Check JIRA_HOST, internet connection, and firewall.');
    process.exit(1);
  }
  if (!res.ok) {
    const t = await res.text();
    console.error(`JIRA API error ${res.status}: ${t}`);
    process.exit(1);
  }
  return res.json();
}

function formatAttachmentSize(bytes) {
  if (bytes == null || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function printAttachments(attachments) {
  if (!attachments || attachments.length === 0) return;
  console.log('Attachments:');
  for (const a of attachments) {
    const name = a.filename || a.fileName || '(unnamed)';
    const size = formatAttachmentSize(a.size);
    const contentUrl = a.content || a.self;
    console.log(`  - ${name}${size ? ` (${size})` : ''}`);
    if (contentUrl) console.log(`    URL: ${contentUrl}`);
  }
}

function printIssue(issue) {
  const f = issue.fields || {};
  console.log('---');
  console.log('Key:    ', issue.key);
  console.log('Summary:', f.summary || '(none)');
  console.log('Status: ', f.status?.name ?? '(none)');
  console.log('Type:   ', f.issuetype?.name ?? '(none)');
  if (f.assignee) console.log('Assignee:', f.assignee.displayName ?? f.assignee.emailAddress);
  if (f.description) {
    console.log('Description:');
    const desc = f.description;
    const text = typeof desc === 'string' ? desc : (desc.content?.map(c => c.content?.map(t => t.text).join('')).join('\n') || '(see raw JSON)');
    console.log(text);
  }
  printAttachments(f.attachment);
  console.log('---');
}

async function cmdList(env) {
  const baseUrl = normalizeJiraUrl(env.JIRA_HOST);
  const data = await jiraFetch(baseUrl, env.JIRA_EMAIL, env.JIRA_API_TOKEN,
    `/search/jql?jql=${encodeURIComponent('assignee = currentUser() ORDER BY updated DESC')}&maxResults=50&fields=summary,status,assignee,issuetype`);
  const issues = data.issues || [];
  if (issues.length === 0) {
    console.log('No issues found.');
    return;
  }
  console.log(`Found ${issues.length} issue(s):\n`);
  for (const i of issues) {
    const f = i.fields || {};
    console.log(`${i.key}  ${(f.status?.name || '').padEnd(14)} ${f.summary || '(no summary)'}`);
  }
}

async function cmdDescription(env, key) {
  const baseUrl = normalizeJiraUrl(env.JIRA_HOST);
  const issue = await jiraFetch(baseUrl, env.JIRA_EMAIL, env.JIRA_API_TOKEN, `/issue/${key}`);
  printIssue(issue);
}

async function cmdComment(env, key, commentText) {
  const baseUrl = normalizeJiraUrl(env.JIRA_HOST);
  const body = {
    body: {
      type: 'doc',
      version: 1,
      content: [{ type: 'paragraph', content: [{ type: 'text', text: commentText }] }],
    },
  };
  await jiraFetch(baseUrl, env.JIRA_EMAIL, env.JIRA_API_TOKEN, `/issue/${key}/comment`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  console.log(`Comment added to ${key}.`);
}

async function cmdGet(env, key) {
  return cmdDescription(env, key);
}

async function cmdAttachments(env, key) {
  const baseUrl = normalizeJiraUrl(env.JIRA_HOST);
  const issue = await jiraFetch(baseUrl, env.JIRA_EMAIL, env.JIRA_API_TOKEN,
    `/issue/${key}?fields=summary,attachment`);
  const f = issue.fields || {};
  console.log(`Attachments for ${issue.key}: ${f.summary || '(no summary)'}\n`);
  if (!f.attachment || f.attachment.length === 0) {
    console.log('No attachments.');
    return;
  }
  printAttachments(f.attachment);
  console.log('\nOpen the URL in a browser to download (uses same auth as this script).');
}

async function cmdTransitions(env, key) {
  const baseUrl = normalizeJiraUrl(env.JIRA_HOST);
  const data = await jiraFetch(baseUrl, env.JIRA_EMAIL, env.JIRA_API_TOKEN, `/issue/${key}/transitions`);
  const transitions = data.transitions || [];
  if (transitions.length === 0) {
    console.log('No transitions available for this issue.');
    return;
  }
  console.log('Available transitions for', key + ':');
  console.log('');
  for (const t of transitions) {
    console.log(`  ${t.id.padEnd(6)} → ${t.name}`);
  }
  console.log('\nTo move status: npm run jira -- transition', key, '<transition_id>');
}

async function cmdTransition(env, key, transitionId) {
  const baseUrl = normalizeJiraUrl(env.JIRA_HOST);
  await jiraFetch(baseUrl, env.JIRA_EMAIL, env.JIRA_API_TOKEN, `/issue/${key}/transitions`, {
    method: 'POST',
    body: JSON.stringify({ transition: { id: transitionId } }),
  });
  console.log(`Done. ${key} transitioned with id ${transitionId}.`);
}

async function cmdSearch(env, jql) {
  const baseUrl = normalizeJiraUrl(env.JIRA_HOST);
  const q = jql || 'assignee = currentUser()';
  const data = await jiraFetch(baseUrl, env.JIRA_EMAIL, env.JIRA_API_TOKEN,
    `/search/jql?jql=${encodeURIComponent(q)}&maxResults=50&fields=summary,status,assignee,issuetype`);
  const issues = data.issues || [];
  if (issues.length === 0) {
    console.log('No issues found.');
    return;
  }
  console.log(`Found ${issues.length} issue(s):\n`);
  for (const i of issues) {
    const f = i.fields || {};
    console.log(`${i.key}  ${(f.status?.name || '').padEnd(14)} ${f.summary || '(no summary)'}`);
  }
}

function requireEnv(env) {
  const host = (env.JIRA_HOST || '').trim();
  const email = (env.JIRA_EMAIL || '').trim();
  const token = (env.JIRA_API_TOKEN || '').trim();
  if (!host || !email || !token) {
    console.error('Set JIRA_HOST, JIRA_EMAIL, and JIRA_API_TOKEN in .env');
    process.exit(1);
  }
  if (!host.startsWith('http://') && !host.startsWith('https://')) {
    console.error('JIRA_HOST should be a full URL (e.g. https://your-company.atlassian.net)');
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const command = args[0];
const a1 = args[1];
const a2 = args[2];

if (!command || command === 'help' || command === '--help' || command === '-h') {
  console.log(`
JIRA + Cursor integration

  npm run jira:connect                    Generate .cursor/mcp.json from .env (then restart Cursor)
  npm run jira:list                       List my JIRA tickets

  npm run jira -- description <key>       Show ticket summary and description (e.g. MPX-1675)
  npm run jira -- attachments <key>       List attachment names and download URLs for a ticket
  npm run jira -- comment <key> "text"    Add a comment to a ticket
  npm run jira -- get <key>               Full issue details (includes attachments)
  npm run jira -- transitions <key>       List available status transitions
  npm run jira -- transition <key> <id>  Move issue to a new status
  npm run jira -- search "<jql>"         Search by JQL
  npm run jira -- list                   List my issues

Credentials are read from .env (JIRA_HOST, JIRA_EMAIL, JIRA_API_TOKEN).
`);
  process.exit(0);
}

(async () => {
  if (command === 'connect') {
    cmdConnect();
    return;
  }

  const env = loadEnv();
  requireEnv(env);

  switch (command) {
    case 'list':
      await cmdList(env);
      break;
    case 'description':
      if (!a1) { console.error('Usage: description <issue-key>'); process.exit(1); }
      await cmdDescription(env, a1);
      break;
    case 'comment':
      if (!a1 || !a2) { console.error('Usage: comment <issue-key> "comment text"'); process.exit(1); }
      await cmdComment(env, a1, a2);
      break;
    case 'get':
      if (!a1) { console.error('Usage: get <issue-key>'); process.exit(1); }
      await cmdGet(env, a1);
      break;
    case 'attachments':
      if (!a1) { console.error('Usage: attachments <issue-key>'); process.exit(1); }
      await cmdAttachments(env, a1);
      break;
    case 'transitions':
      if (!a1) { console.error('Usage: transitions <issue-key>'); process.exit(1); }
      await cmdTransitions(env, a1);
      break;
    case 'transition':
      if (!a1 || !a2) { console.error('Usage: transition <issue-key> <transition-id>'); process.exit(1); }
      await cmdTransition(env, a1, a2);
      break;
    case 'search':
      await cmdSearch(env, a1);
      break;
    default:
      console.error('Unknown command:', command);
      console.error('Run: npm run jira -- --help');
      process.exit(1);
  }
})();
