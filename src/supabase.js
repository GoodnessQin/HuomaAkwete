import { createClient } from '@supabase/supabase-js'
const env = import.meta.env
const url = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const configured = Boolean(url && key)
export const supabase = configured ? createClient(url, key) : null
export const WA = `https://wa.me/${env.VITE_BRAND_WHATSAPP || env.NEXT_PUBLIC_BRAND_WHATSAPP || ''}`
// Igbo name: Ísī Ọ́dụ̀m (copy it exactly, the tone marks and dots under the letters matter)
export const IGBO = 'Ísī Ọ́dụ̀m'
export const PIECE = `Odogwu (ODG) aka ${IGBO}`
export const LION_HEADS = [['Gold', '#D3AF37'], ['Silver', '#B0AFAC'], ['Black', '#000000']]
// Images in the piece-page gallery, in order. Put the files in the `public` folder and list them here.
// The dots and the "1/4" counter follow the number of images in this list.
export const GALLERY = ['/hero.png', '/hero.png', '/hero.png', '/hero.png']
export const SIZES = ['XS', 'S', 'M', 'L', 'XL']
export const COLOURS = [
  ['Ivory', '#EAE5D1'], ['Ink black', '#161616'], ['Oxblood', '#5C1A14'], ['Royal blue', '#1B4A9A'],
  ['Gold', '#B48A2A'], ['Forest green', '#2B4A36'], ['Navy blue', '#0E1531'],
]
export const MEASURES = [
  ['chest', 'Chest'], ['shoulder', 'Shoulder'], ['sleeve', 'Sleeve length'],
  ['waist', 'Waist'], ['top', 'Top length'], ['trouser', 'Trouser length'],
]
// Without Supabase keys the form runs in preview mode so you can check the UI.
export async function reserve(p) {
  if (!configured) {
    // Preview mode only exists on your own computer (npm run dev). On the live site, no keys = a visible error.
    if (import.meta.env.DEV) { await new Promise(r => setTimeout(r, 800)); return { code: 'HA-R018' } }
    return { error: new Error('Supabase keys are missing on this site') }
  }
  const { data, error } = await supabase.rpc('reserve_place', p)
  return error ? { error } : { code: data }
}
