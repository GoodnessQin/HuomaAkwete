import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { reserve, WA, PIECE, COLOURS, SIZES, MEASURES } from './supabase.js'
import CountryPicker, { DEFAULT_COUNTRY } from './CountryPicker.jsx'

const Arrow = ({ back }) => (
  <svg className={'arrow' + (back ? ' back' : '')} width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M0 7h24M18 1l6 6-6 6" />
  </svg>
)
const Logo = () => <Link to="/" className="logo" aria-label="Huoma Akwetelier home"><img src="/logo.png" alt="" /></Link>
const Ask = () => (
  <a className="wa" href={WA} target="_blank" rel="noreferrer">Ask the brand on WhatsApp
    <svg className="nea" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true"><path d="M2 8L8 2M3 2h5v5" /></svg>
  </a>
)
const useTop = () => useEffect(() => { window.scrollTo(0, 0) }, [])

/* ---------- Landing ---------- */
const TopNav = () => (
  <nav className="topnav">
    <Link to="/story" className="ourstory">Our story</Link>
    <Link to="/odogwu" className="pill sq">Join waitlist</Link>
  </nav>
)

export function Landing() {
  useTop()
  return (
    <main className="hero page">
      <Logo />
      <TopNav />
      <div className="hero-copy">
        <h1>Cloth with a memory.</h1>
        <p>Contemporary Nigerian form, beginning on the loom.</p>
        <Link to="/odogwu" className="cta"><span>Join waitlist</span><i><Arrow /></i></Link>
      </div>
    </main>
  )
}

/* ---------- Our Story (copy from the brand deck) ---------- */
const STORY = [
  ['The cloth', ['Akwete is a handwoven cloth from southeastern Nigeria, made for generations by Akwete women. It is known for its strength, its symbolism and the intricate patterns worked into it by hand. A well-made length of Akwete can last for decades, and it is often passed down as a family heirloom.', 'It is worn to mark milestones, to honour Igbo heritage and to carry craftsmanship that does not date. Every pattern is built thread by thread, on a loom, by hands that know the work.']],
  ['Why we began', ['Huoma Akwetelier began with a simple belief: Akwete deserves to be seen as luxury. Not as costume, not as nostalgia, but as material, as serious as any cloth in the world and as relevant now as it has ever been.', 'We started with the loom and worked outward. We asked what Akwete becomes when it is cut with precision, finished with care and designed for the way people live and dress today. The house is built around that question, and every piece we make is an answer to it.']],
  ['Original by design', ['Akwete has always been a language of pattern. We add to it.', 'Our designs are original. Each pattern is conceived and composed in-house, then given to the loom to be woven by hand. We draw on the logic of traditional Akwete, its structure, its symbolism and its discipline, and we combine it with new compositions, new proportions and new ways of mixing pattern and colour.', 'Some of our cloth follows traditional weaving styles. Some is a hybrid: a new weaving style that brings old methods and new ideas together.', 'The result is cloth that is unmistakably Akwete and unmistakably ours. These designs belong to Huoma Akwetelier, and you will find them only here.']],
  ['Design as art', ['We treat every piece as a work of art as much as a garment. Composition, balance, colour and proportion are decided on paper before a single thread is set up on the loom. Then the loom takes over, and the pattern becomes cloth. It is slow work, and it shows.']],
  ['Odogwu, our first design line', ['Our first original design line, Odogwu, is made for men. It is marked with the tiger head, a classic of Igbo menswear, reimagined in our own composition and woven by hand in the colour you choose. It is the first of many.']],
  ['How we make', ['Each piece begins on a loom and ends in refined form. The cloth is woven by hand in southeastern Nigeria. We cut it, tailor it and finish it into pieces made to be worn often and kept for years.', 'We make in small numbers, because handwoven cloth cannot be rushed, and because a piece made slowly is a piece that lasts.']],
  ['The women who keep it alive', ['Behind every length of Akwete are the women who preserve the craft. Their skill is the foundation of everything we make. We work with them as partners, we pay fairly for their work, and we credit their craft. Preserving a tradition means passing it on, and we want to help make that possible for the next generation.']],
  ['Formed for the world', ['Huoma Akwetelier is made in Nigeria and sent to wherever you are. Handwoven in southeastern Nigeria. Formed for the world.']],
]

export function OurStory() {
  useTop()
  return (
    <main className="story page">
      <header className="shero">
        <Logo />
        <TopNav />
        <div><h1>Material first. Always.</h1><p>The story of Huoma Akwetelier.</p></div>
      </header>
      <div className="sbody">
        {STORY.map(([h, ps]) => (
          <section key={h}>
            <h2>{h}</h2>
            <div>
              {ps.map(t => <p key={t}>{t}</p>)}
              {h.startsWith('Odogwu') && <Link to="/odogwu" className="btn mixed between">Reserve your colour <Arrow /></Link>}
            </div>
          </section>
        ))}
        <Link to="/odogwu" className="btn mixed between">Join waitlist <Arrow /></Link>
      </div>
    </main>
  )
}

/* ---------- Piece page ---------- */
const emptyM = { unit: 'cm', chest: '', shoulder: '', sleeve: '', waist: '', top: '', trouser: '', notes: '' }
const filled = m => MEASURES.filter(([k]) => String(m[k]).trim()).length

export function Odogwu() {
  useTop()
  const nav = useNavigate()
  const [colour, setColour] = useState('Ivory')
  const [size, setSize] = useState(null)
  const [mode, setMode] = useState('standard')
  const [m, setM] = useState(emptyM)
  const [open, setOpen] = useState(false)
  const [liked, setLiked] = useState(false)
  const [tried, setTried] = useState(0)
  const [mErr, setMErr] = useState(false)
  const [slide, setSlide] = useState(0)
  const [x0, setX0] = useState(null)
  const slides = [0, 1, 2, 3]
  const go = i => setSlide((i + slides.length) % slides.length)
  const n = filled(m)
  const ready = (mode === 'standard' && !!size) || (mode === 'custom' && n === 6)

  useEffect(() => {
    if (!open) return
    const esc = e => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [open])

  const reserveNow = () => {
    if (!ready) {
      setTried(t => t + 1)
      document.getElementById('size-block')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    nav('/reserve', { state: { colour, size: mode === 'custom' ? 'Made to measure' : size, measurements: mode === 'custom' ? m : null } })
  }

  return (
    <main className="split piece page">
      <div className="gallery" onTouchStart={e => setX0(e.touches[0].clientX)}
           onTouchEnd={e => { if (x0 !== null) { const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 40) go(slide + (d < 0 ? 1 : -1)); setX0(null) } }}>
        <div className="track" style={{ transform: `translateX(-${slide * 100}%)` }}>
          {slides.map(i => <div key={i} className="slide" role="img" aria-label={`${PIECE}, image ${i + 1} of 4`} />)}
        </div>
        <div className="dots">
          <div>{slides.map(i => <button key={i} className={i === slide ? 'on' : ''} onClick={() => go(i)} aria-label={`Image ${i + 1}`} />)}</div>
          <span>{slide + 1}/4</span>
        </div>
      </div>

      <section className="panel">
        <Link to="/" className="back"><Arrow back /> Back</Link>
        <div className="titlerow">
          <div>
            <small>Bespoke/ 01</small>
            <h2 className="thin">{PIECE.toUpperCase()}</h2>
          </div>
          <button className={'heart' + (liked ? ' on' : '')} onClick={() => setLiked(!liked)} aria-pressed={liked} aria-label="Save piece">
            <svg width="20" height="18" viewBox="0 0 24 22" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8"><path d="M12 20.5S2 14.5 2 7.8A5.3 5.3 0 0 1 12 5a5.3 5.3 0 0 1 10 2.8c0 6.700-10 12.700-10 12.700Z" /></svg>
          </button>
        </div>
        <h3>#Waitlist</h3>
        <p className="copy">Odogwu (ODG) is our first original design line, made for men. Akwete cloth marked with the tiger head, a classic of Igbo menswear, composed in our own pattern and woven by hand in southeastern Nigeria. Choose your colour and hold your place.</p>
        <hr />
        <small className="lab">Select colour</small>
        <div className="swatches" role="radiogroup" aria-label="Colour">
          {COLOURS.map(([name, hex]) => (
            <button key={name} role="radio" aria-checked={colour === name} className={colour === name ? 'on' : ''} onClick={() => setColour(name)}>
              <span style={{ background: hex }} />{name}
            </button>
          ))}
        </div>
        <hr />
        <div key={tried} id="size-block" className={'sizerow' + (tried && !ready ? ' shake' : '')}>
          <small className="lab">Select size</small>
          <div className="sizes">
            <div className={'std' + (mode === 'standard' ? ' active' : '')}>
              <span className="sl">Standard size</span>
              <div className="cells" role="radiogroup" aria-label="Standard size">
                {SIZES.map(s => (
                  <button key={s} role="radio" aria-checked={mode === 'standard' && size === s} className={mode === 'standard' && size === s ? 'on' : ''}
                          onClick={() => { setSize(s); setMode('standard') }}>{s}</button>
                ))}
              </div>
            </div>
            <button className={'mm' + (mode === 'custom' && n === 6 ? ' active' : '')} onClick={() => { setMErr(false); setOpen(true) }}>
              <span><b>My measurement</b><em>{n === 6 ? '6 details added' : n ? `${n} of 6 details added` : 'Add 6 Details'}</em></span>
              <Arrow />
            </button>
          </div>
        </div>
        <hr />
        {!ready && tried > 0 && <p className="err pick" role="alert">Choose a standard size or add your measurement to continue.</p>}
        <button className={'btn between' + (ready ? '' : ' off')} aria-disabled={!ready} onClick={reserveNow}>Reserve your place <Arrow /></button>
        <Ask />
      </section>

      {open && (
        <div className="scrim" onMouseDown={e => e.target === e.currentTarget && setOpen(false)}>
          <form className="drawer" role="dialog" aria-modal="true" aria-label="My measurement"
                onSubmit={e => { e.preventDefault(); if (n < 6) { setMErr(true); return } setMode('custom'); setOpen(false) }}>
            <div className="dh"><h2 className="thin">My measurement</h2><button type="button" className="x" onClick={() => setOpen(false)} aria-label="Close">×</button></div>
            <div className="unit" role="radiogroup" aria-label="Unit">
              {['cm', 'in'].map(u => <button type="button" key={u} role="radio" aria-checked={m.unit === u} className={m.unit === u ? 'on' : ''} onClick={() => setM({ ...m, unit: u })}>{u === 'cm' ? 'Centimetres' : 'Inches'}</button>)}
            </div>
            <div className="mgrid">
              {MEASURES.map(([k, l]) => (
                <label key={k} className="f">{l} ({m.unit})
                  <input inputMode="decimal" value={m[k]} onChange={e => setM({ ...m, [k]: e.target.value.replace(/[^\d.]/g, '') })} placeholder="0" />
                </label>
              ))}
            </div>
            <label className="f">Notes<input value={m.notes} onChange={e => setM({ ...m, notes: e.target.value })} placeholder="Anything we should know" /></label>
            {mErr && n < 6 && <p className="err" role="alert">Please fill in all 6 measurements.</p>}
            <button className="btn">Save measurements</button>
          </form>
        </div>
      )}
    </main>
  )
}

/* ---------- Reserve ---------- */
const rules = {
  name: v => v.trim().length < 2 && 'Enter your full name',
  email: v => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim()) && 'Enter a valid email address',
  phone: v => { const d = v.replace(/\D/g, '').replace(/^0/, ''); return (d.length < 6 || d.length > 14) && 'Enter a valid WhatsApp number' },
}

export function Reserve() {
  useTop()
  const nav = useNavigate()
  const sel = useLocation().state || {}
  const [f, setF] = useState({ name: '', email: '', phone: '' })
  const [country, setCountry] = useState(DEFAULT_COUNTRY)
  const [seen, setSeen] = useState({})
  const [busy, setBusy] = useState(false)
  const [fail, setFail] = useState('')
  const err = k => seen[k] && rules[k](f[k])
  const bind = k => ({ value: f[k], onChange: e => setF({ ...f, [k]: e.target.value }), onBlur: () => setSeen(s => ({ ...s, [k]: true })) })

  async function submit(e) {
    e.preventDefault()
    setSeen({ name: 1, email: 1, phone: 1 })
    if (Object.keys(rules).some(k => rules[k](f[k]))) return
    setBusy(true); setFail('')
    const res = await reserve({
      p_piece: PIECE, p_colour: sel.colour || 'Ivory', p_size: sel.size || null, p_measurements: sel.measurements || null,
      p_name: f.name, p_email: f.email, p_whatsapp: country.dial + f.phone.replace(/\D/g, '').replace(/^0/, ''),
    })
    setBusy(false)
    if (res.error) return setFail('Something went wrong. Please try again, or message us on WhatsApp.')
    nav('/confirmed', { state: { code: res.code } })
  }

  if (!sel.size && !sel.measurements) return <Navigate to="/odogwu" replace />

  return (
    <main className="split reserve page">
      <div className="photo"><Logo /><h1>Hold your place.</h1></div>
      <form className="panel" onSubmit={submit} noValidate>
        <nav><Link to="/story">Our story</Link><Link to="/" className="pill dark">Homepage</Link></nav>
        <h2 className="thin big">Reserve a piece</h2>
        <p className="lead">No payment today. We'll contact you before release with first access.</p>

        <div className="f"><span>Piece</span><b className="fixed">{PIECE.toUpperCase()}</b></div>
        <label className="f"><span>Full name</span>
          <input {...bind('name')} placeholder="Your Name" autoComplete="name" className={err('name') ? 'bad' : ''} aria-invalid={!!err('name')} />
          {err('name') && <p className="err" role="alert">{err('name')}</p>}
        </label>
        <label className="f"><span>Email</span>
          <input {...bind('email')} type="email" placeholder="you@example" autoComplete="email" className={err('email') ? 'bad' : ''} aria-invalid={!!err('email')} />
          {err('email') && <p className="err" role="alert">{err('email')}</p>}
        </label>
        <div className="f phonef"><span id="wl">WhatsApp number</span>
          <div className={'phone' + (err('phone') ? ' bad' : '')}>
            <CountryPicker value={country} onChange={setCountry} />
            <input {...bind('phone')} type="tel" inputMode="tel" placeholder="Your WhatsApp number" autoComplete="tel-national" aria-labelledby="wl" aria-invalid={!!err('phone')} />
          </div>
          {err('phone') && <p className="err" role="alert">{err('phone')}</p>}
        </div>
        {fail && <p className="err" role="alert">{fail}</p>}

        <button className="btn mixed gap" disabled={busy}>{busy ? <span className="spin" aria-label="Reserving" /> : <>Reserve my place <Arrow /></>}</button>
        <Link className="btn gap" to="/odogwu"><Arrow back /> Back to about piece</Link>
        <Ask />
        <p className="fine">By reserving, you agree to receive updates about Odogwu by email and WhatsApp. <Link to="/privacy">Read our Privacy page</Link>.</p>
      </form>
    </main>
  )
}

/* ---------- Confirmation ---------- */
export function Confirmed() {
  useTop()
  const { state } = useLocation()
  if (!state?.code) return <Navigate to="/" replace />
  return (
    <main className="done page">
      <Logo />
      <Link to="/odogwu" className="pill corner cream"><span className="m">Join waitlist</span><span className="d">Homepage</span></Link>
      <div className="diamonds" aria-hidden="true"><i /><i className="fill" /><i /></div>
      <h1>You're on the list.</h1>
      <p className="lead">A confirmation email and WhatsApp message have been sent to you. The Huoma studio has also been notified of your reservation.</p>
      <div className="card">
        <div className="thumb" />
        <div><small>Your piece</small><b>{PIECE.toUpperCase()}</b><small>Priority reservation • {state.code}</small></div>
      </div>
      <Link to="/" className="btn mixed gap">Return to Homepage <Arrow /></Link>
    </main>
  )
}

/* ---------- Privacy ---------- */
export function Privacy() {
  useTop()
  return (
    <main className="legal page">
      <Logo />
      <h2 className="thin big">Privacy</h2>
      <p>We collect only what we need to serve you: your name, email address, WhatsApp number, delivery address and order details. We use them to confirm reservations and orders, to keep you updated, to deliver your piece and to answer your questions. With your consent, we may also send you news about new pieces.</p>
      <p>We do not sell your information. We share it only with the services that help us run the store, such as payment providers and couriers. You can ask us to see, correct or delete your information at any time by emailing hello@huomaakwetelier.com.</p>
      <Link to="/" className="btn mixed gap">Return to Homepage <Arrow /></Link>
    </main>
  )
}
