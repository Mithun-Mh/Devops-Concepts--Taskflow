import { Navbar } from "@/components/navbar";
import { Dashboard } from "@/components/dashboard";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50">
      <Navbar />
      <Dashboard />
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 dark:border-slate-800/80 dark:bg-slate-900 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 TaskFlow Platform. DevOps Learning Architecture.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Frontend: Ready
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-amber-400"></span>
              Backend: Phase 3
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
