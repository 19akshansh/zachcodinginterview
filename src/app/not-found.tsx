import Link from "next/link";
import { HomeIcon } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="flex max-w-md flex-col items-center text-center">
        <h1 className="text-8xl font-bold tracking-tight text-primary">404</h1>

        <h2 className="mt-4 text-2xl font-semibold">Page not found</h2>

        <p className="mt-2 text-muted-foreground">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 hover:bg-primary/90 text-primary-foreground transition-colors hover:bg-blue-500"
        >
          <HomeIcon className="size-4" />
          Back to Home
        </Link>
      </div>
    </main>
  );
}
