import { createFileRoute } from "@tanstack/react-router";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/guide")({
  head: () => ({ meta: [{ title: "Testing Guide — API Practice Lab" }] }),
  component: Guide,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface-card p-6 space-y-3">
      <h2 className="text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Guide() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold mb-2">API Testing Guide</h1>
        <p className="text-muted-foreground">Suggested flows for practicing manual and automated REST API testing.</p>
      </header>

      <Section title="Suggested CRUD test flow">
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Create user — <code className="font-mono">POST /users</code></li>
          <li>Login — <code className="font-mono">POST /users/login</code> → save token</li>
          <li>Create contact — <code className="font-mono">POST /contacts</code></li>
          <li>List all — <code className="font-mono">GET /contacts</code></li>
          <li>Get one — <code className="font-mono">GET /contacts/:id</code></li>
          <li>Partial update — <code className="font-mono">PATCH /contacts/:id</code></li>
          <li>Replace — <code className="font-mono">PUT /contacts/:id</code></li>
          <li>Delete — <code className="font-mono">DELETE /contacts/:id</code></li>
          <li>Verify deletion — <code className="font-mono">GET /contacts/:id</code> → expect 404</li>
          <li>Cleanup — <code className="font-mono">DELETE /users/me</code></li>
          <li>Verify token is invalidated — any request → expect 401</li>
        </ol>
      </Section>

      <Section title="Authentication flow">
        <p className="text-sm">Every protected endpoint expects a <code className="font-mono">Authorization: Bearer &lt;token&gt;</code> header. Tokens come from the login endpoint.</p>
        <CodeBlock code={`# 1. Login\nTOKEN=$(curl -s -X POST $BASE/api/public/users/login \\\n  -H "Content-Type: application/json" \\\n  -d '{"email":"u@e.com","password":"secret123"}' | jq -r .token)\n\n# 2. Use it\ncurl $BASE/api/public/contacts -H "Authorization: Bearer $TOKEN"`} />
      </Section>

      <Section title="Cleanup flow (automation)">
        <p className="text-sm">For CI runs, always tear down at the end:</p>
        <CodeBlock code={`curl -X DELETE $BASE/api/public/users/me -H "Authorization: Bearer $TOKEN"\n# Expect: 204 No Content\n\n# Reuse same token — should now fail\ncurl -i $BASE/api/public/users/me -H "Authorization: Bearer $TOKEN"\n# Expect: 401 Unauthorized`} />
      </Section>

      <Section title="Positive test cases">
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Signup with valid fields → 201</li>
          <li>Login with valid credentials → 200 + token</li>
          <li>Create contact with required fields only → 201</li>
          <li>Create contact with all fields populated → 201</li>
          <li>List contacts after creating → contains the new contact</li>
          <li>PATCH single field → only that field changes</li>
          <li>PUT all fields → entire record replaced</li>
          <li>Delete contact → 204; subsequent GET → 404</li>
        </ul>
      </Section>

      <Section title="Negative test cases">
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Signup missing required field → 422</li>
          <li>Signup with duplicate email → 409</li>
          <li>Login with wrong password → 401</li>
          <li>Request with no token → 401</li>
          <li>Request with malformed token → 401</li>
          <li>GET <code className="font-mono">/contacts/not-a-uuid</code> → 400</li>
          <li>GET non-existent contact id → 404</li>
          <li>POST with invalid JSON body → 400</li>
          <li>POST contact with invalid email format → 422</li>
          <li>Access another user's contact → 404 (RLS-scoped)</li>
          <li>Reuse token after <code className="font-mono">DELETE /users/me</code> → 401</li>
        </ul>
      </Section>

      <Section title="Regression test ideas">
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Create 50 contacts, list, sort, search — verify all returned and ordered</li>
          <li>PATCH does not affect non-updated fields</li>
          <li>PUT nulls out optional fields when omitted</li>
          <li>updatedAt advances on PATCH/PUT but not on GET</li>
          <li>Email change on user updates both profile and auth account</li>
        </ul>
      </Section>

      <Section title="Buggy Mode exercises">
        <p className="text-sm">Enable Buggy Mode in Settings, then design tests that detect each defect:</p>
        <ul className="list-disc list-inside text-sm space-y-2">
          <li><strong>Phone update bug</strong> — PATCH a contact's phone. Re-fetch and assert the new phone. Sometimes it won't update.</li>
          <li><strong>Wrong delete status code</strong> — DELETE returns 200 with a JSON body instead of 204 No Content.</li>
          <li><strong>Sort ignored</strong> — request <code className="font-mono">?sort=name</code> and assert ordering. Should fail.</li>
          <li><strong>Invalid email accepted</strong> — POST a contact with <code className="font-mono">"email":"not-an-email"</code> and expect 422. Sometimes returns 201.</li>
          <li><strong>PUT optional fields</strong> — Verify PUT correctly nulls missing optional fields but still rejects missing firstName/lastName.</li>
        </ul>
      </Section>
    </div>
  );
}
