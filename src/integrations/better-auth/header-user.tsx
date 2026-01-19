import { authClient } from '@/lib/auth-client'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function BetterAuthHeader() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return <Skeleton className="h-9 w-20" />
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image ? (
          <img src={session.user.image} alt="" className="h-8 w-8 rounded-full" />
        ) : (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground">
              {session.user.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => authClient.signOut()}
        >
          Abmelden
        </Button>
      </div>
    )
  }

  return (
    <Button variant="outline" size="sm" asChild>
      <Link to="/login">Anmelden</Link>
    </Button>
  )
}
