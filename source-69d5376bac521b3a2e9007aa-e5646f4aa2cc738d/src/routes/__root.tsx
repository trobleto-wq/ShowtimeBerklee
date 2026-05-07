import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import { AuthProvider } from '@/context/AuthContext'
import { Header } from '@/components/Header'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Showtime Berklee — Find Shows. Be The Scene.' },
      { name: 'description', content: 'Discover and post live music shows within the Berklee and DIY music scene.' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-neutral-950 text-white" style={{ fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="bg-black border-t border-neutral-800 py-8">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2">
            <span className="text-sm text-neutral-600">
              © {new Date().getFullYear()} Showtime Berklee · Berklee College of Music
            </span>
            <span className="text-sm text-neutral-700 font-medium tracking-wider uppercase text-xs">
              Find Shows. Be The Scene.
            </span>
          </div>
        </footer>
      </div>
    </AuthProvider>
  )
}
