// Supabase Edge Function: sends the customer's confirmation email and a studio alert via Resend.
// Triggered by a Database Webhook on INSERT into public.waitlist. Secrets (set in Supabase, never in Vercel):
//   RESEND_API_KEY, FROM_EMAIL, STUDIO_EMAIL, WEBHOOK_SECRET   (optional: SITE_URL)

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))

const MEASURES: [string, string][] = [
  ['chest', 'Chest'], ['shoulder', 'Shoulder'], ['sleeve', 'Sleeve length'],
  ['waist', 'Waist'], ['top', 'Top length'], ['trouser', 'Trouser length'],
]

function customerHtml(first: string, r: any, code: string, site: string) {
  // Mirrors the "You're on the list" confirmation screen: piece, priority reservation code, return button.
  return `<!doctype html><html><body style="margin:0;padding:0;background:#C8AD8F">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#C8AD8F"><tr><td align="center" style="padding:36px 16px 48px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;font-family:Georgia,'Times New Roman',serif;color:#000;text-align:center">
<tr><td align="left" style="padding-bottom:36px"><a href="${site}"><img src="${site}/logo.png" width="44" alt="Huoma Akwetelier" style="display:block;border:0"></a></td></tr>
<tr><td style="font-size:22px;letter-spacing:10px;padding-bottom:30px">&#9671; &#9670; &#9671;</td></tr>
<tr><td style="font-size:38px;line-height:1.15;letter-spacing:1px;font-weight:bold;text-transform:uppercase;padding-bottom:28px">You're on<br>the list.</td></tr>
<tr><td style="font-size:16px;line-height:1.7;padding:0 12px 34px">Thank you for reserving our unique Odogwu ODG piece with Huoma Akwetelier. Your place is held. We will contact you before release, with first access.</td></tr>
<tr><td style="padding-bottom:26px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#E6E3CE;text-align:left"><tr>
<td width="100" style="padding:14px"><img src="${site}/hero.png" width="86" height="100" alt="" style="display:block;border:0;object-fit:cover"></td>
<td style="padding:14px 14px 14px 4px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:2;text-transform:uppercase;color:#000">
YOUR PIECE<br><b style="font-family:Georgia,'Times New Roman',serif;font-size:16px">${esc(String(r.piece || 'Odogwu (ODG)').toUpperCase())}</b><br>PRIORITY RESERVATION &bull; ${esc(code)}</td></tr></table></td></tr>
<tr><td><a href="${site}" style="display:block;background:#000;color:#E6E3CE;text-decoration:none;font-size:16px;letter-spacing:1px;padding:18px 0">Return to Homepage &rarr;</a></td></tr>
</table></td></tr></table></body></html>`
}

function studioHtml(r: any, code: string) {
  const m = r.measurements
  const meas = m ? MEASURES.filter(([k]) => m[k]).map(([k, l]) => `${l}: ${m[k]} ${m.unit}`).join('<br>') + (m.notes ? `<br>Notes: ${esc(m.notes)}` : '') : '-'
  const row = (k: string, v: string) => `<tr><td style="padding:4px 12px 4px 0;color:#555">${k}</td><td>${v}</td></tr>`
  return `<div style="font-family:Arial,sans-serif;font-size:15px"><p><b>New waitlist reservation ${esc(code)}</b></p><table>
${row('Name', esc(r.full_name))}${row('Email', esc(r.email))}${row('WhatsApp', esc(r.whatsapp))}${row('Piece', esc(r.piece))}
${row('Fabric colour', esc(r.colour))}${row('Lion head colour', esc(r.lion_head_colour || '-'))}${r.size ? row('Size', esc(r.size)) : ''}${m ? row('Measurements', meas) : ''}</table></div>`
}

Deno.serve(async (req: Request) => {
  if (req.headers.get('x-webhook-secret') !== Deno.env.get('WEBHOOK_SECRET')) return new Response('forbidden', { status: 403 })
  let payload: any
  try { payload = await req.json() } catch { return new Response('bad request', { status: 400 }) }
  const r = payload?.record
  if (payload?.type !== 'INSERT' || !r) return new Response('ignored')

  const code = 'HA-R' + String(r.id).padStart(3, '0')
  const first = String(r.full_name || '').trim().split(/\s+/)[0] || 'there'
  const from = Deno.env.get('FROM_EMAIL')!
  const studio = Deno.env.get('STUDIO_EMAIL')
  const site = (Deno.env.get('SITE_URL') || 'https://huoma-akwete.vercel.app').replace(/\/$/, '')
  const send = (body: unknown) =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

  const jobs = [send({ from, to: [r.email], subject: `You're on the list, ${first}`, html: customerHtml(first, r, code, site), reply_to: studio })]
  if (studio) jobs.push(send({ from, to: [studio], subject: `New reservation ${code}: ${r.full_name}`, html: studioHtml(r, code) }))

  const results = await Promise.all(jobs)
  const failed = results.filter((x) => !x.ok)
  if (failed.length) {
    console.error('Resend error', failed[0].status, await failed[0].text())
    return new Response('email failed', { status: 500 })
  }
  return new Response('ok')
})
