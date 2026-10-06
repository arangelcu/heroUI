import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Keeps a single copy of React in the graph: react-select and HeroUI each pull
  // their own peer copy otherwise, and two copies of React break hooks.
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  server: {
    watch: {
      /*
       * Some tooling writes a file through a temp directory and then renames it, e.g.
       * `.HeroUIReactTable.tsx.12752.<guid>.tmpdir/HeroUIReactTable.tsx.tmp`. The watcher
       * tried to watch that transient file and died with
       * `EBUSY: resource busy or locked` (node:internal/fs/watchers), which took the whole
       * dev server down and happened repeatedly. These patterns keep it out of the watcher.
       */
      ignored: ['**/.*.tmpdir/**', '**/*.tmpdir/**', '**/*.tmp']
    }
  }
})
