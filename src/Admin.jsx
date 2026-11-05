import { useEffect, useState } from 'react'
import { supabase, configured, MEASURES } from './supabase.js'

const code = r => 'HA-R' + String(r.id).padStart(3, '0')
const meas = r => r.measurements
  ? MEASURES.filter(([k]) => r.measurements[k]).map(([k, l]) => `${l} ${r.measurements[k]}`).join(', ') + ` (${r.measurements.unit})` + (r.measurements.notes ? ` | ${r.measurements.notes}` : '')
  : ''

export default function Admin() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [msg, setMsg] = useState('')
  const [cred, setCred] = useState({ email: '', password: '' })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!configured) return setReady(true)
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    supabase.rpc('is_admin').then(({ data: ok, error: e1 }) => {
      if (e1 || !ok) { setRows([]); setMsg(`You are signed in as ${session.user.email}, but this email is not in the admins table. Add it in Supabase (SQL Editor), then press Refresh.`); return }
      supabase.from('waitlist').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
        if (error) setMsg('Could not load the list: ' + error.message); else { setMsg(''); setRows(data) }
      })
    })
  }, [session, tick])

  async function login(e) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword(cred)
    setMsg(error ? 'Sign in failed. Check your email and password.' : '')
  }
  const shown = rows.filter(r => (code(r) + ' ' + Object.values(r).join(' ') + meas(r)).toLowerCase().includes(q.toLowerCase()))
  const csv = () => {
    const head = ['Reservation', 'Date', 'Piece', 'Colour', 'Size', 'Measurements', 'Name', 'Email', 'WhatsApp']
    const lines = rows.map(r => [code(r), r.created_at, r.piece, r.colour, r.size || '', meas(r), r.full_name, r.email, r.whatsapp].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([[head.join(','), ...lines].join('\n')], { type: 'text/csv' }))
    a.download = 'huoma-waitlist.csv'; a.click()
  }

  if (!ready) return null
  if (!configured) return <main className="admin"><p>Add your Supabase keys to .env to use the admin page.</p></main>
  if (!session) return (
    <main className="admin"><form className="login" onSubmit={login}>
      <h2 className="thin">Admin</h2>
      <label className="f"><span>Email</span><input type="email" value={cred.email} onChange={e => setCred({ ...cred, email: e.target.value })} autoComplete="username" /></label>
      <label className="f"><span>Password</span><input type="password" value={cred.password} onChange={e => setCred({ ...cred, password: e.target.value })} autoComplete="current-password" /></label>
      {msg && <p className="err">{msg}</p>}
      <button className="btn mixed">Sign in</button>
    </form></main>
  )
  return (
    <main className="admin">
      <header>
        <h2 className="thin">Waitlist <small>{rows.length} reservations</small></h2>
        <input placeholder="Search name, email, colour…" value={q} onChange={e => setQ(e.target.value)} />
        <button className="pill" onClick={() => setTick(t => t + 1)}>Refresh</button>
        <button className="pill dark" onClick={csv}>Export CSV</button>
        <button className="pill" onClick={() => supabase.auth.signOut()}>Sign out</button>
      </header>
      {msg && <p className="err">{msg}</p>}
      <div className="scroll"><table>
        <thead><tr><th>Reservation</th><th>Date</th><th>Piece</th><th>Colour</th><th>Size</th><th>Measurements</th><th>Name</th><th>Email</th><th>WhatsApp</th></tr></thead>
        <tbody>{shown.map(r => (
          <tr key={r.id}><td>{code(r)}</td><td>{new Date(r.created_at).toLocaleString()}</td><td>{r.piece}</td><td>{r.colour}</td><td>{r.size || '–'}</td><td className="wrap">{meas(r) || '–'}</td><td>{r.full_name}</td><td><a href={`mailto:${r.email}`}>{r.email}</a></td><td><a href={`https://wa.me/${r.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{r.whatsapp}</a></td></tr>
        ))}</tbody>
      </table>{!shown.length && !msg && <p className="empty">No reservations yet.</p>}</div>
    </main>
  )
}
