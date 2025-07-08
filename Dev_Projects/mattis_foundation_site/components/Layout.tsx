import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 border-b">
        <nav className="flex space-x-4">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/programs">Programs</Link>
          <Link href="/media">Media</Link>
          <Link href="/events">Events</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </header>

      <main className="flex-grow p-6">{children}</main>

      <footer className="p-4 border-t text-center">
        &copy; {new Date().getFullYear()} The Mattis Foundation
      </footer>
    </div>
  );
}
