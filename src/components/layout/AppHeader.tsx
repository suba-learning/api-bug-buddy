import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";
import { FlaskConical, LogOut } from "lucide-react";

export function AppHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-20">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <FlaskConical className="h-5 w-5 text-primary" />
          <span>API Practice Lab</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {user && (
            <Link to="/dashboard" className="px-3 py-1.5 rounded-md hover:bg-accent">Contacts</Link>
          )}
          <Link to="/docs" className="px-3 py-1.5 rounded-md hover:bg-accent">API Docs</Link>
          <Link to="/guide" className="px-3 py-1.5 rounded-md hover:bg-accent">Testing Guide</Link>
          {user && (
            <Link to="/settings" className="px-3 py-1.5 rounded-md hover:bg-accent">Settings</Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden sm:inline text-xs text-muted-foreground">{user.email}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => { await signOut(); router.navigate({ to: "/" }); }}
              >
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button size="sm" variant="ghost">Login</Button></Link>
              <Link to="/signup"><Button size="sm">Sign up</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
