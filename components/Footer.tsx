export default function Footer() {
  return (
    <footer className="border-t border-ink/10 mt-20">
      <div className="max-w-5xl mx-auto px-5 py-10 text-sm text-ink/60 flex flex-col sm:flex-row justify-between gap-4">
        <p>&copy; {new Date().getFullYear()} Gary's Bookshelf</p>
        <div className="flex gap-5">
          <a href="/#about" className="hover:text-clay-600">About</a>
          <a href="mailto:hello@garysbookshelf.com" className="hover:text-clay-600">Contact</a>
          <a href="https://instagram.com/gary_bookshelf" target="_blank" className="hover:text-clay-600">Instagram</a>
        </div>
      </div>
    </footer>
  );
}
