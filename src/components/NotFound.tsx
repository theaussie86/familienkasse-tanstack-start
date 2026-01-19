import { Link } from '@tanstack/react-router'
import { FileQuestion, MoveLeft } from 'lucide-react'

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 text-center">
      <div className="bg-neutral-100 dark:bg-neutral-900 p-6 rounded-full mb-6">
        <FileQuestion size={48} className="text-neutral-400" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-2">404 - Seite nicht gefunden</h1>
      <p className="text-neutral-500 dark:text-neutral-400 max-w-md mb-8">
        Hoppla! Die Seite, nach der Sie suchen, scheint nicht zu existieren oder wurde verschoben.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        <MoveLeft size={18} />
        Zurück zum Dashboard
      </Link>
    </div>
  )
}
