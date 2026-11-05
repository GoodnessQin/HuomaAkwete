import { useEffect, useRef, useState } from 'react'

const RAW = `AF|Afghanistan|93;AL|Albania|355;DZ|Algeria|213;AD|Andorra|376;AO|Angola|244;AG|Antigua and Barbuda|1268;AR|Argentina|54;AM|Armenia|374;AU|Australia|61;AT|Austria|43;AZ|Azerbaijan|994;BS|Bahamas|1242;BH|Bahrain|973;BD|Bangladesh|880;BB|Barbados|1246;BY|Belarus|375;BE|Belgium|32;BZ|Belize|501;BJ|Benin|229;BT|Bhutan|975;BO|Bolivia|591;BA|Bosnia and Herzegovina|387;BW|Botswana|267;BR|Brazil|55;BN|Brunei|673;BG|Bulgaria|359;BF|Burkina Faso|226;BI|Burundi|257;KH|Cambodia|855;CM|Cameroon|237;CA|Canada|1;CV|Cape Verde|238;CF|Central African Republic|236;TD|Chad|235;CL|Chile|56;CN|China|86;CO|Colombia|57;KM|Comoros|269;CG|Congo|242;CD|DR Congo|243;CR|Costa Rica|506;CI|Côte d'Ivoire|225;HR|Croatia|385;CU|Cuba|53;CY|Cyprus|357;CZ|Czechia|420;DK|Denmark|45;DJ|Djibouti|253;DM|Dominica|1767;DO|Dominican Republic|1809;EC|Ecuador|593;EG|Egypt|20;SV|El Salvador|503;GQ|Equatorial Guinea|240;ER|Eritrea|291;EE|Estonia|372;SZ|Eswatini|268;ET|Ethiopia|251;FJ|Fiji|679;FI|Finland|358;FR|France|33;GA|Gabon|241;GM|Gambia|220;GE|Georgia|995;DE|Germany|49;GH|Ghana|233;GR|Greece|30;GD|Grenada|1473;GT|Guatemala|502;GN|Guinea|224;GW|Guinea-Bissau|245;GY|Guyana|592;HT|Haiti|509;HN|Honduras|504;HK|Hong Kong|852;HU|Hungary|36;IS|Iceland|354;IN|India|91;ID|Indonesia|62;IR|Iran|98;IQ|Iraq|964;IE|Ireland|353;IL|Israel|972;IT|Italy|39;JM|Jamaica|1876;JP|Japan|81;JO|Jordan|962;KZ|Kazakhstan|7;KE|Kenya|254;KW|Kuwait|965;KG|Kyrgyzstan|996;LA|Laos|856;LV|Latvia|371;LB|Lebanon|961;LS|Lesotho|266;LR|Liberia|231;LY|Libya|218;LI|Liechtenstein|423;LT|Lithuania|370;LU|Luxembourg|352;MO|Macao|853;MG|Madagascar|261;MW|Malawi|265;MY|Malaysia|60;MV|Maldives|960;ML|Mali|223;MT|Malta|356;MR|Mauritania|222;MU|Mauritius|230;MX|Mexico|52;MD|Moldova|373;MC|Monaco|377;MN|Mongolia|976;ME|Montenegro|382;MA|Morocco|212;MZ|Mozambique|258;MM|Myanmar|95;NA|Namibia|264;NP|Nepal|977;NL|Netherlands|31;NZ|New Zealand|64;NI|Nicaragua|505;NE|Niger|227;NG|Nigeria|234;MK|North Macedonia|389;NO|Norway|47;OM|Oman|968;PK|Pakistan|92;PS|Palestine|970;PA|Panama|507;PG|Papua New Guinea|675;PY|Paraguay|595;PE|Peru|51;PH|Philippines|63;PL|Poland|48;PT|Portugal|351;PR|Puerto Rico|1787;QA|Qatar|974;RO|Romania|40;RU|Russia|7;RW|Rwanda|250;KN|Saint Kitts and Nevis|1869;LC|Saint Lucia|1758;VC|Saint Vincent|1784;WS|Samoa|685;SM|San Marino|378;ST|São Tomé and Príncipe|239;SA|Saudi Arabia|966;SN|Senegal|221;RS|Serbia|381;SC|Seychelles|248;SL|Sierra Leone|232;SG|Singapore|65;SK|Slovakia|421;SI|Slovenia|386;SB|Solomon Islands|677;SO|Somalia|252;ZA|South Africa|27;KR|South Korea|82;SS|South Sudan|211;ES|Spain|34;LK|Sri Lanka|94;SD|Sudan|249;SR|Suriname|597;SE|Sweden|46;CH|Switzerland|41;SY|Syria|963;TW|Taiwan|886;TJ|Tajikistan|992;TZ|Tanzania|255;TH|Thailand|66;TL|Timor-Leste|670;TG|Togo|228;TO|Tonga|676;TT|Trinidad and Tobago|1868;TN|Tunisia|216;TR|Türkiye|90;TM|Turkmenistan|993;UG|Uganda|256;UA|Ukraine|380;AE|United Arab Emirates|971;GB|United Kingdom|44;US|United States|1;UY|Uruguay|598;UZ|Uzbekistan|998;VU|Vanuatu|678;VE|Venezuela|58;VN|Vietnam|84;YE|Yemen|967;ZM|Zambia|260;ZW|Zimbabwe|263`
export const COUNTRIES = RAW.split(';').map(s => { const [iso, name, d] = s.split('|'); return { iso, name, dial: '+' + d } })
export const DEFAULT_COUNTRY = COUNTRIES.find(c => c.iso === 'NG')

export const Flag = ({ iso }) => (
  <img className="flag" src={`https://flagcdn.com/w40/${iso.toLowerCase()}.png`} alt="" width="22" height="15" loading="lazy" />
)

export default function CountryPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [hi, setHi] = useState(0)
  const box = useRef(null)
  const search = useRef(null)
  const ql = q.trim().toLowerCase()
  const list = COUNTRIES.filter(c => !ql || c.name.toLowerCase().includes(ql) || c.dial.includes(ql) || c.iso.toLowerCase() === ql)

  useEffect(() => {
    if (!open) return
    search.current?.focus()
    const away = e => { if (!box.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', away)
    return () => document.removeEventListener('mousedown', away)
  }, [open])
  useEffect(() => setHi(0), [q])

  const pick = c => { onChange(c); setOpen(false); setQ('') }
  const key = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi(h => Math.min(h + 1, list.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi(h => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (list[hi]) pick(list[hi]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className="cp" ref={box}>
      <button type="button" className="cp-btn" onClick={() => setOpen(o => !o)} aria-haspopup="listbox" aria-expanded={open} aria-label={`Country code, ${value.name} ${value.dial}`}>
        <Flag iso={value.iso} /><span>{value.dial}</span><i className="caret" />
      </button>
      {open && (
        <div className="cp-menu" onKeyDown={key}>
          <input ref={search} className="cp-search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search country or code" aria-label="Search country" />
          <ul role="listbox">
            {list.map((c, i) => (
              <li key={c.iso} role="option" aria-selected={c.iso === value.iso} className={i === hi ? 'hi' : ''}
                  ref={el => { if (el && i === hi) el.scrollIntoView({ block: 'nearest' }) }}
                  onMouseEnter={() => setHi(i)} onMouseDown={e => { e.preventDefault(); pick(c) }}>
                <Flag iso={c.iso} /><span className="nm">{c.name}</span><span className="dl">{c.dial}</span>
              </li>
            ))}
            {!list.length && <li className="none">No country found</li>}
          </ul>
        </div>
      )}
    </div>
  )
}
