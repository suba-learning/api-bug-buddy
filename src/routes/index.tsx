import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Bug, Code2, FlaskConical, ListChecks, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "API Practice Lab — Contact Manager for QA & API Testing" },
      { name: "description", content: "Practice REST API testing: auth, JWT, CRUD, validation, negative cases, and intentional bugs." },
    ],
  }),
  component: Landing,
});

function Feature({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="surface-card p-5">
      <Icon className="h-5 w-5 text-primary mb-3" />
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function Landing() {
  return (
    <div>
      <section className="container mx-auto px-4 py-20 text-center">
        <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-accent text-accent-foreground mb-6">
          <FlaskConical className="h-3.5 w-3.5" /> A QA training playground
        </span>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto">
          Practice <span className="text-primary">REST API testing</span> on a real Contact Manager.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
          Sign up, get a JWT, and exercise the full CRUD surface — including auth, validation,
          negative cases, and intentional bugs you can hunt in “Buggy Mode.”
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/signup"><Button size="lg">Create your test account</Button></Link>
          <Link to="/docs"><Button size="lg" variant="outline">Read the API Docs</Button></Link>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto text-left">
          <Feature icon={ShieldCheck} title="Real JWT auth" body="Signup, login, logout, /users/me — all with bearer tokens you can copy." />
          <Feature icon={ListChecks} title="Full Contact CRUD" body="GET, POST, PUT, PATCH, DELETE — validate happy paths and negative cases." />
          <Feature icon={Bug} title="Buggy Mode" body="Toggle on intentional bugs to practice discovering and reporting defects." />
          <Feature icon={Code2} title="In-app API docs" body="Every endpoint documented with request, response, and curl examples." />
          <Feature icon={Sparkles} title="Cleanup endpoint" body="DELETE /users/me wipes the test user — perfect for automation teardown." />
          <Feature icon={FlaskConical} title="Testing guide" body="Suggested CRUD flow, regression ideas, and Buggy Mode exercises." />
        </div>
      </section>
    </div>
  );
}
