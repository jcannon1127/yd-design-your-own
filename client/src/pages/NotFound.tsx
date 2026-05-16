import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-8 text-center">
      <p className="text-xs text-muted-foreground font-body uppercase tracking-[0.25em] mb-4">404</p>
      <h1 className="font-display text-5xl mb-4">Page not found</h1>
      <p className="text-muted-foreground font-body mb-8 max-w-md">
        That page doesn't exist — but you can still design your own.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-md bg-primary text-primary-foreground font-body hover:bg-primary/90 transition-colors"
      >
        Back to the customizer
      </Link>
    </div>
  );
}
