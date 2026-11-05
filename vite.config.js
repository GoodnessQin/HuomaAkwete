import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Accept Supabase's own variable names (NEXT_PUBLIC_...) as well as VITE_...
export default defineConfig({ plugins: [react()], envPrefix: ['VITE_', 'NEXT_PUBLIC_'] })
