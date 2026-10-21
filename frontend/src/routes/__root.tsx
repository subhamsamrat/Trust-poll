import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
// import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
// import { TanStackDevtools } from '@tanstack/react-devtools'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { ThemeProvider } from '../lib/ThemeContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' 
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toast } from "@heroui/react";
import { SocketProvider } from '../socket/socketProvider'

import appCss from '../styles.css?url'


  const queryClient = new QueryClient()

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TrustPoll',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})
  
function RootDocument({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] bg-[#F5F5F5] text-slate-900
       dark:bg-[#000000] dark:text-white min-h-screen flex flex-col transition-colors duration-200">
        <SocketProvider>
        <QueryClientProvider client={queryClient}>
        <ThemeProvider>
         <Header/>
          <main className="flex-1">{children}</main>
          <Footer/>
           <ReactQueryDevtools initialIsOpen={false} />
            <Toast.Provider placement="top" />
        </ThemeProvider>
        </QueryClientProvider>
        </SocketProvider>
        <Scripts />
      </body>
    </html>
  )
}
