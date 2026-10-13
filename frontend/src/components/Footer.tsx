export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
      <p>© {year} TrustPoll. All rights reserved.</p>
    </footer>
  )
}
