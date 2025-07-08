import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <header className="bg-gray-100 border-b border-gray-300">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">The Mattis Foundation</h1>
          <nav className="flex space-x-6 text-gray-700 text-sm">
            <Link href="/" className="hover:text-accent">Home</Link>
            <Link href="/about" className="hover:text-accent">About</Link>
            <Link href="/programs" className="hover:text-accent">Programs</Link>
            <Link href="/media" className="hover:text-accent">Media</Link>
            <Link href="/events" className="hover:text-accent">Events</Link>
            <Link href="/contact" className="hover:text-accent">Contact</Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-5xl mx-auto px-6 py-10">
        {children}
      </main>

      <footer className="bg-gray-100 border-t border-gray-300 text-center text-sm py-6 text-gray-600">
        &copy; {new Date().getFullYear()} The Mattis Foundation. All rights reserved.
      </footer>
    </div>
  );
}
