import { createFileRoute } from "@tanstack/react-router";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/docs")({
  head: () => ({ meta: [{ title: "API Docs — API Practice Lab" }] }),
  component: Docs,
});

type Endpoint = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  auth: boolean;
  summary: string;
  request?: string;
  success: { status: number; body: string };
  errors: Array<{ status: number; when: string }>;
  curl: string;
};

const BASE = "<base-url>";

const endpoints: Endpoint[] = [
  {
    method: "POST", path: "/api/public/users", auth: false,
    summary: "Create a new user.",
    request: `{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "secret123"
}`,
    success: { status: 201, body: `{ "id": "uuid", "firstName": "Jane", "lastName": "Doe", "email": "jane@example.com" }` },
    errors: [
      { status: 400, when: "Invalid JSON body" },
      { status: 409, when: "Email already registered" },
      { status: 422, when: "Missing required fields or invalid email/password" },
    ],
    curl: `curl -X POST ${BASE}/api/public/users \\
  -H "Content-Type: application/json" \\
  -d '{"firstName":"Jane","lastName":"Doe","email":"jane@example.com","password":"secret123"}'`,
  },
  {
    method: "POST", path: "/api/public/users/login", auth: false,
    summary: "Authenticate a user. Returns a JWT bearer token.",
    request: `{ "email": "jane@example.com", "password": "secret123" }`,
    success: { status: 200, body: `{ "token": "<JWT>", "tokenType": "Bearer", "expiresIn": 3600, "user": { "id": "uuid", "email": "jane@example.com" } }` },
    errors: [
      { status: 400, when: "Missing email or password" },
      { status: 401, when: "Invalid credentials" },
    ],
    curl: `curl -X POST ${BASE}/api/public/users/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"jane@example.com","password":"secret123"}'`,
  },
  {
    method: "POST", path: "/api/public/users/logout", auth: true,
    summary: "Log out the current user (invalidates the token server-side).",
    success: { status: 200, body: `{ "message": "Logged out" }` },
    errors: [{ status: 401, when: "Missing or invalid token" }],
    curl: `curl -X POST ${BASE}/api/public/users/logout -H "Authorization: Bearer <token>"`,
  },
  {
    method: "GET", path: "/api/public/users/me", auth: true,
    summary: "Return the authenticated user.",
    success: { status: 200, body: `{ "id": "uuid", "firstName": "Jane", "lastName": "Doe", "email": "jane@example.com", "createdAt": "..." }` },
    errors: [{ status: 401, when: "Missing or invalid token" }, { status: 404, when: "Profile not found" }],
    curl: `curl ${BASE}/api/public/users/me -H "Authorization: Bearer <token>"`,
  },
  {
    method: "PATCH", path: "/api/public/users/me", auth: true,
    summary: "Update the authenticated user's profile.",
    request: `{ "firstName": "Janet", "email": "janet@example.com" }`,
    success: { status: 200, body: `{ "id": "uuid", "firstName": "Janet", "lastName": "Doe", "email": "janet@example.com" }` },
    errors: [{ status: 400, when: "No fields provided" }, { status: 401, when: "Invalid token" }, { status: 422, when: "Invalid email" }],
    curl: `curl -X PATCH ${BASE}/api/public/users/me \\
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \\
  -d '{"firstName":"Janet"}'`,
  },
  {
    method: "DELETE", path: "/api/public/users/me", auth: true,
    summary: "Delete the authenticated user and ALL their contacts. Designed for automated cleanup.",
    success: { status: 204, body: "(empty)" },
    errors: [{ status: 401, when: "Missing or invalid token" }, { status: 500, when: "Deletion failed" }],
    curl: `curl -X DELETE ${BASE}/api/public/users/me -H "Authorization: Bearer <token>"`,
  },
  {
    method: "GET", path: "/api/public/contacts", auth: true,
    summary: "List contacts for the authenticated user. Optional ?sort=name|created and ?order=asc|desc.",
    success: { status: 200, body: `[{ "id": "uuid", "firstName": "Ada", "lastName": "Lovelace", ... }]` },
    errors: [{ status: 401, when: "Missing or invalid token" }],
    curl: `curl "${BASE}/api/public/contacts?sort=name&order=asc" -H "Authorization: Bearer <token>"`,
  },
  {
    method: "POST", path: "/api/public/contacts", auth: true,
    summary: "Create a new contact.",
    request: `{
  "firstName": "Ada",
  "lastName": "Lovelace",
  "email": "ada@example.com",
  "phone": "555-0100",
  "city": "London"
}`,
    success: { status: 201, body: `{ "id": "uuid", "firstName": "Ada", ... }` },
    errors: [
      { status: 401, when: "Missing or invalid token" },
      { status: 422, when: "firstName/lastName missing or invalid email" },
    ],
    curl: `curl -X POST ${BASE}/api/public/contacts \\
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \\
  -d '{"firstName":"Ada","lastName":"Lovelace","email":"ada@example.com"}'`,
  },
  {
    method: "GET", path: "/api/public/contacts/:id", auth: true,
    summary: "Return one contact owned by the user.",
    success: { status: 200, body: `{ "id": "uuid", "firstName": "Ada", ... }` },
    errors: [
      { status: 400, when: "Invalid id format" },
      { status: 401, when: "Missing or invalid token" },
      { status: 404, when: "Contact not found" },
    ],
    curl: `curl ${BASE}/api/public/contacts/<id> -H "Authorization: Bearer <token>"`,
  },
  {
    method: "PUT", path: "/api/public/contacts/:id", auth: true,
    summary: "Replace a contact. Requires firstName and lastName; missing optional fields are nulled.",
    request: `{ "firstName": "Ada", "lastName": "L.", "email": "ada@new.com" }`,
    success: { status: 200, body: `{ "id": "uuid", "firstName": "Ada", "lastName": "L.", ... }` },
    errors: [
      { status: 400, when: "Invalid id format" },
      { status: 401, when: "Missing or invalid token" },
      { status: 404, when: "Contact not found" },
      { status: 422, when: "Missing firstName/lastName or invalid email" },
    ],
    curl: `curl -X PUT ${BASE}/api/public/contacts/<id> \\
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \\
  -d '{"firstName":"Ada","lastName":"L."}'`,
  },
  {
    method: "PATCH", path: "/api/public/contacts/:id", auth: true,
    summary: "Partially update a contact.",
    request: `{ "phone": "555-9999" }`,
    success: { status: 200, body: `{ "id": "uuid", "phone": "555-9999", ... }` },
    errors: [
      { status: 400, when: "No fields to update / invalid id" },
      { status: 401, when: "Missing or invalid token" },
      { status: 404, when: "Contact not found" },
      { status: 422, when: "Invalid email" },
    ],
    curl: `curl -X PATCH ${BASE}/api/public/contacts/<id> \\
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \\
  -d '{"phone":"555-9999"}'`,
  },
  {
    method: "DELETE", path: "/api/public/contacts/:id", auth: true,
    summary: "Delete a contact.",
    success: { status: 204, body: "(empty)" },
    errors: [
      { status: 400, when: "Invalid id format" },
      { status: 401, when: "Missing or invalid token" },
      { status: 404, when: "Contact not found" },
    ],
    curl: `curl -X DELETE ${BASE}/api/public/contacts/<id> -H "Authorization: Bearer <token>"`,
  },
];

function EndpointCard({ ep }: { ep: Endpoint }) {
  return (
    <div className="surface-card p-5 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`method-badge method-${ep.method}`}>{ep.method}</span>
        <code className="font-mono text-sm">{ep.path}</code>
        {ep.auth && <span className="text-xs px-2 py-0.5 rounded bg-accent text-accent-foreground">Auth required</span>}
      </div>
      <p className="text-sm text-muted-foreground">{ep.summary}</p>

      {ep.auth && (
        <div className="text-sm">
          <span className="font-semibold">Headers:</span> <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Authorization: Bearer &lt;token&gt;</code>
        </div>
      )}

      {ep.request && (
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Request body</p>
          <CodeBlock code={ep.request} />
        </div>
      )}
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Success ({ep.success.status})</p>
        <CodeBlock code={ep.success.body} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Error responses</p>
        <ul className="text-sm space-y-1">
          {ep.errors.map((e, i) => (
            <li key={i}><code className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted">{e.status}</code> <span className="text-muted-foreground">— {e.when}</span></li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">curl</p>
        <CodeBlock code={ep.curl} />
      </div>
    </div>
  );
}

function Docs() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
      <p className="text-muted-foreground mb-6">Base URL: <code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">{typeof window !== "undefined" ? window.location.origin : BASE}</code></p>

      <div className="surface-card p-4 mb-6 text-sm">
        <p><strong>Status codes used:</strong> 200 OK · 201 Created · 204 No Content · 400 Bad Request · 401 Unauthorized · 404 Not Found · 409 Conflict · 422 Validation Error · 500 Internal Server Error</p>
        <p className="mt-2 text-muted-foreground">Auth uses standard JWT Bearer tokens. Get one from <code className="font-mono">POST /users/login</code>.</p>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-3">Auth & User</h2>
      <div className="grid gap-4">
        {endpoints.slice(0, 6).map((ep, i) => <EndpointCard key={i} ep={ep} />)}
      </div>

      <h2 className="text-xl font-bold mt-10 mb-3">Contacts</h2>
      <div className="grid gap-4">
        {endpoints.slice(6).map((ep, i) => <EndpointCard key={i} ep={ep} />)}
      </div>
    </div>
  );
}
