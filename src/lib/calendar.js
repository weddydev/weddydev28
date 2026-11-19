/* .ics (Apple / Outlook) and Google Calendar — generated client-side */
import C from '../config.js';
import { plain } from './utils.js';

const utc = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const esc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const fold = (line) => { const out = []; while (line.length > 74) { out.push(line.slice(0, 74)); line = ' ' + line.slice(74); } out.push(line); return out.join('\r\n'); };
const couple = () => `${C.couple.partner1} & ${C.couple.partner2}`;
const slug = (s) => plain(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const vevent = (e, i) => [
  'BEGIN:VEVENT',
  `UID:${utc(e.start)}-${i}-maison-${C.couple.initials.join('').toLowerCase()}@wedding`,
  `DTSTAMP:${utc(new Date().toISOString())}`,
  `DTSTART:${utc(e.start)}`, `DTEND:${utc(e.end || e.start)}`,
  `SUMMARY:${esc(`${plain(e.title)} · ${couple()}`)}`,
  `LOCATION:${esc(`${e.venue}, ${e.address}`)}`,
  `DESCRIPTION:${esc(`${e.kind}\nDress: ${e.dress}\n${e.note}\nDirections: ${e.mapUrl}`)}`,
  `URL:${e.mapUrl}`,
  'BEGIN:VALARM', 'TRIGGER:-PT3H', 'ACTION:DISPLAY', `DESCRIPTION:${esc(plain(e.title))}`, 'END:VALARM',
  'END:VEVENT'
];
const build = (idx) => ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//Maison ${couple()}//Wedding//EN`, 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', `X-WR-CALNAME:${esc(couple())}`]
  .concat(...idx.map((i) => vevent(C.events[i], i)), ['END:VCALENDAR']).map(fold).join('\r\n');

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
export function addToCalendar(i, kind) {
  const e = C.events[i];
  if (kind === 'google') {
    const q = new URLSearchParams({ action: 'TEMPLATE', text: `${plain(e.title)} · ${couple()}`, dates: `${utc(e.start)}/${utc(e.end || e.start)}`, details: `${e.kind}\nDress: ${e.dress}\n${e.note}`, location: `${e.venue}, ${e.address}` });
    window.open(`https://calendar.google.com/calendar/render?${q}`, '_blank', 'noopener');
  } else download(`${slug(couple())}-${slug(e.title)}.ics`, build([i]));
}
export const addAllToCalendar = () => download(`${slug(couple())}-programme.ics`, build(C.events.map((_, i) => i)));
