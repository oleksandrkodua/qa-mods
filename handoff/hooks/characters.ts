// @ts-nocheck
// The drawing code below came from a canvas mock-up as plain JavaScript: untyped arrow parameters and per-character
// objects whose fields differ (the cat's eyes, the dog's head, the wizard's arms), about 111 strict-mode errors in tsc.
// Typing it would mean rewriting it; the exported API keeps its own annotations (Who, State, characterSvg,
// characterAlt), so register.tsx and the tests are still type-checked against it.
/**
 * The four helpers (paperclip, wizard, dog, cat) as one animated SVG for the desktop `Svg` element (drawn with
 * `isInteractive`, the only way SMIL plays there): 31 emotions, and the behaviours of the Office assistants
 * (Clippit, Merlin, Rocky, Links: their animation tables in clippy.js) redrawn as our own pictures, not their sprites.
 * A state is an emotion (`calm`, `sad`, ...) or a behaviour of that character (`save`, `getAttention`, ...).
 */
export type Who = 'clippy' | 'wizard' | 'dog' | 'cat'
export type State = { emotion?: string; behavior?: string }

export const WHO: readonly Who[] = ['clippy', 'wizard', 'dog', 'cat']

// the template keeps the canvas mock-up's syntax: <sc-if value="{{a.b}}"> blocks and {{a.b}} holes, filled by `fill`
const TEMPLATE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" width="{{w}}" height="{{h}}">
<sc-if value="{{X.has.door}}">
<g><g transform="translate({{X.at.door.x}} {{X.at.door.y}}) scale({{X.at.door.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<path d="M-14 32 L-14 -18 Q-14 -32 0 -32 Q14 -32 14 -18 L14 32 Z" fill="#a0442c" stroke="#5c2416" stroke-width="1.6" stroke-linejoin="round"></path>
<path d="M-8 -6 L-8 -16 Q-8 -24 0 -24 Q8 -24 8 -16 L8 -6 Z" fill="#cfe3f7" stroke="#5c2416" stroke-width="1"></path>
<circle cx="9" cy="10" r="1.6" fill="#f6c445"></circle>
</g></g></g>
</sc-if>
<sc-if value="{{X.has.cabinet}}">
<g><g transform="translate({{X.at.cabinet.x}} {{X.at.cabinet.y}}) scale({{X.at.cabinet.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<rect x="-12" y="-26" width="26" height="52" rx="2" fill="#8b939c" stroke="#4b5563" stroke-width="1.4"></rect>
<path d="M-10 0 L12 0 M-10 13 L12 13 M-2 5 L4 5 M-2 18 L4 18" fill="none" stroke="#4b5563" stroke-width="1.2"></path>
<g><animateTransform attributeName="transform" type="translate" values="0 0;-12 0;-12 0;0 0" keyTimes="0;0.25;0.75;1" dur="{{T.dur}}" repeatCount="indefinite"></animateTransform><rect x="-10" y="-31" width="14" height="10" fill="#f6d77a" stroke="#b8860b" stroke-width="1"></rect><rect x="-14" y="-23" width="27" height="14" fill="#9aa3ad" stroke="#4b5563" stroke-width="1.2"></rect><path d="M-3 -16 L3 -16" fill="none" stroke="#4b5563" stroke-width="1.4"></path></g>
</g></g></g>
</sc-if>
<sc-if value="{{X.has.sunburst}}">
<g><g transform="translate({{X.at.sunburst.x}} {{X.at.sunburst.y}}) scale({{X.at.sunburst.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="scale" values="0.8;1.2;0.8" dur="1.2s" repeatCount="indefinite"></animateTransform><path d="M0 -24 L3.9 -14.5 L12 -20.8 L10.6 -10.6 L20.8 -12 L14.5 -3.9 L24 0 L14.5 3.9 L20.8 12 L10.6 10.6 L12 20.8 L3.9 14.5 L0 24 L-3.9 14.5 L-12 20.8 L-10.6 10.6 L-20.8 12 L-14.5 3.9 L-24 0 L-14.5 -3.9 L-20.8 -12 L-10.6 -10.6 L-12 -20.8 L-3.9 -14.5 Z" fill="#ffe24a" stroke="#f2b632" stroke-width="1"></path></g>
</g></g></g>
</sc-if>
<sc-if value="{{isClippy}}">
<svg x="0" y="0" width="120" height="150" viewBox="-30 -20 200 250">
<path d="M-6 112 L112 88 L136 206 L18 228 Z" fill="#fbf1b8" stroke="#d8c46e" stroke-width="2" stroke-linejoin="round"></path>
<path d="{{P.paperLines}}" fill="none" stroke="#9fb7d9" stroke-width="1.8"></path>
<path d="M30 112 L50 214" fill="none" stroke="#e79a9a" stroke-width="1.6"></path>
<g><animate attributeName="opacity" values="{{T.base}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g transform="translate({{Q.cx}} {{Q.cy}})"><g><animateTransform attributeName="transform" type="{{Q.type}}" values="{{Q.v}}" keyTimes="{{Q.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animateTransform><g transform="translate({{Q.ncx}} {{Q.ncy}})">
<g>
<animateTransform attributeName="transform" type="translate" values="{{M.bob}}" dur="{{M.bobDur}}" repeatCount="indefinite"></animateTransform>
<g transform="translate({{P.x}} {{P.y}})"><g>
<animateTransform attributeName="transform" type="scale" values="{{M.scale}}" keyTimes="{{M.scaleKT}}" dur="{{M.scaleDur}}" repeatCount="indefinite"></animateTransform>
<g transform="translate({{P.nx}} {{P.ny}})"><g>
<animateTransform attributeName="transform" type="rotate" values="{{M.sway}}" keyTimes="{{M.swayKT}}" dur="{{M.swayDur}}" repeatCount="indefinite"></animateTransform>
<path d="M45 200 L45 20 Q45 -5 70 -5 Q95 -5 95 20 L95 175 Q95 195 75 195 Q55 195 55 175 L55 40 Q55 28 70 28 Q85 28 85 40 L85 160" fill="none" stroke="#7d8792" stroke-width="13" stroke-linecap="round"></path>
<path d="M45 200 L45 20 Q45 -5 70 -5 Q95 -5 95 20 L95 175 Q95 195 75 195 Q55 195 55 175 L55 40 Q55 28 70 28 Q85 28 85 40 L85 160" fill="none" stroke="#b9c1ca" stroke-width="8" stroke-linecap="round"></path>
<ellipse cx="{{F.L.cx}}" cy="{{F.ey}}" rx="{{F.L.a}}" ry="{{F.L.b}}" opacity="{{F.L.scl}}" fill="{{F.L.sclFill}}" stroke="{{F.est}}" stroke-width="{{F.esw}}"><animate attributeName="ry" values="{{F.L.bv}}" keyTimes="{{F.bkt}}" dur="{{F.blink}}" repeatCount="indefinite"></animate></ellipse>
<ellipse cx="{{F.R.cx}}" cy="{{F.ey}}" rx="{{F.R.a}}" ry="{{F.R.b}}" opacity="{{F.R.scl}}" fill="{{F.R.sclFill}}" stroke="{{F.est}}" stroke-width="{{F.esw}}"><animate attributeName="ry" values="{{F.R.bv}}" keyTimes="{{F.bkt}}" dur="{{F.blink}}" repeatCount="indefinite"></animate></ellipse>
<path transform="translate({{F.L.cx}} {{F.ey}})" d="{{F.L.d}}" opacity="{{F.L.path}}" fill="{{F.L.fill}}" stroke="{{F.L.stroke}}" stroke-width="{{F.L.sw}}" stroke-linecap="round" stroke-linejoin="round"><animateTransform attributeName="transform" type="scale" values="{{F.pulse}}" dur="0.8s" additive="sum" repeatCount="indefinite"></animateTransform></path>
<path transform="translate({{F.R.cx}} {{F.ey}})" d="{{F.R.d}}" opacity="{{F.R.path}}" fill="{{F.R.fill}}" stroke="{{F.R.stroke}}" stroke-width="{{F.R.sw}}" stroke-linecap="round" stroke-linejoin="round"><animateTransform attributeName="transform" type="scale" values="{{F.pulse}}" dur="0.8s" additive="sum" repeatCount="indefinite"></animateTransform></path>
<g><animateTransform attributeName="transform" type="translate" values="{{F.glance}}" keyTimes="{{F.glanceKT}}" dur="{{F.glanceDur}}" repeatCount="indefinite"></animateTransform>
<ellipse cx="{{F.L.px}}" cy="{{F.L.py}}" rx="{{F.L.pr}}" ry="{{F.L.pr}}" opacity="{{F.L.pup}}" fill="{{F.L.pupFill}}"><animate attributeName="ry" values="{{F.L.pv}}" keyTimes="{{F.bkt}}" dur="{{F.blink}}" repeatCount="indefinite"></animate></ellipse>
<ellipse cx="{{F.R.px}}" cy="{{F.R.py}}" rx="{{F.R.pr}}" ry="{{F.R.pr}}" opacity="{{F.R.pup}}" fill="{{F.R.pupFill}}"><animate attributeName="ry" values="{{F.R.pv}}" keyTimes="{{F.bkt}}" dur="{{F.blink}}" repeatCount="indefinite"></animate></ellipse>
</g>
<g><animateTransform attributeName="transform" type="translate" values="{{F.browAnim}}" keyTimes="{{F.browKT}}" dur="{{F.browDur}}" repeatCount="indefinite"></animateTransform>
<path d="{{F.brow}}" opacity="{{F.browOp}}" fill="none" stroke="{{F.browO}}" stroke-width="{{F.browOW}}" stroke-linecap="round"></path>
<path d="{{F.brow}}" opacity="{{F.browOp}}" fill="none" stroke="{{F.browC}}" stroke-width="{{F.browW}}" stroke-linecap="round"></path>
</g>
<path d="{{F.mouth}}" opacity="{{F.mouthOp}}" fill="{{F.mouthFill}}" stroke="{{F.mc}}" stroke-width="{{F.msw}}" stroke-linecap="round" stroke-linejoin="round"></path>
<ellipse cx="{{F.mx}}" cy="{{F.tcy}}" rx="{{F.trx}}" ry="1" opacity="{{F.talkOp}}" fill="#7f1d1d" stroke="{{F.mc}}" stroke-width="{{F.msw}}"><animate attributeName="ry" values="{{F.talkVals}}" dur="0.7s" repeatCount="indefinite"></animate></ellipse>
<g opacity="{{F.blushOp}}"><ellipse cx="{{F.c1x}}" cy="{{F.c1y}}" rx="{{F.crx}}" ry="{{F.cry}}" fill="#ff6f86"></ellipse><ellipse cx="{{F.c2x}}" cy="{{F.c2y}}" rx="{{F.crx}}" ry="{{F.cry}}" fill="#ff6f86"></ellipse></g>
<g opacity="{{F.tearOp}}" transform="translate({{F.tx}} {{F.ty}}) scale({{F.u}})"><path d="M0 0 Q3 4.5 0 7 Q-3 4.5 0 0" fill="#5aa9f0"><animateTransform attributeName="transform" type="translate" values="0 0;0 10" dur="1.6s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="1;1;0" dur="1.6s" repeatCount="indefinite"></animate></path></g>
<g opacity="{{F.sweatOp}}" transform="translate({{F.sx}} {{F.sy}}) scale({{F.u}})"><path d="M0 -5 Q4 2 0 6 Q-4 2 0 -5" fill="#378ADD"><animateTransform attributeName="transform" type="translate" values="0 0;0 8" dur="1.3s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="1;1;0" dur="1.3s" repeatCount="indefinite"></animate></path></g>
</g></g>
</g></g>
</g>
</g></g></g>
</g>
</svg>
</sc-if>
<sc-if value="{{isWizard}}">
<g>
<g><animate attributeName="opacity" values="{{T.base}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g transform="translate({{Q.cx}} {{Q.cy}})"><g><animateTransform attributeName="transform" type="{{Q.type}}" values="{{Q.v}}" keyTimes="{{Q.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animateTransform><g transform="translate({{Q.ncx}} {{Q.ncy}})">
<g>
<animateTransform attributeName="transform" type="translate" values="{{M.bob}}" dur="{{M.bobDur}}" repeatCount="indefinite"></animateTransform>
<g transform="translate({{P.x}} {{P.y}})"><g>
<animateTransform attributeName="transform" type="scale" values="{{M.scale}}" keyTimes="{{M.scaleKT}}" dur="{{M.scaleDur}}" repeatCount="indefinite"></animateTransform>
<g transform="translate({{P.nx}} {{P.ny}})"><g>
<animateTransform attributeName="transform" type="rotate" values="{{M.sway}}" keyTimes="{{M.swayKT}}" dur="{{M.swayDur}}" repeatCount="indefinite"></animateTransform>
<path d="M38 86 Q60 80 82 86 L104 146 Q60 152 16 146 Z" fill="#2f4fb3" stroke="#1e3a8a" stroke-width="2.5" stroke-linejoin="round"></path>
<path transform="translate(44 126)" d="M0 -6 L1.8 -1.9 L5.7 -1.9 L2.6 0.8 L3.5 5 L0 2.6 L-3.5 5 L-2.6 0.8 L-5.7 -1.9 L-1.8 -1.9 Z" fill="#f6c445"><animate attributeName="opacity" values="1;0.3;1" dur="2.4s" repeatCount="indefinite"></animate></path>
<path transform="translate(76 136)" d="M0 -6 L1.8 -1.9 L5.7 -1.9 L2.6 0.8 L3.5 5 L0 2.6 L-3.5 5 L-2.6 0.8 L-5.7 -1.9 L-1.8 -1.9 Z" fill="#f6c445"><animate attributeName="opacity" values="1;0.3;1" dur="2.4s" begin="0.8s" repeatCount="indefinite"></animate></path>
<path transform="translate(88 114) scale(0.8)" d="M0 -6 L1.8 -1.9 L5.7 -1.9 L2.6 0.8 L3.5 5 L0 2.6 L-3.5 5 L-2.6 0.8 L-5.7 -1.9 L-1.8 -1.9 Z" fill="#f6c445"><animate attributeName="opacity" values="1;0.3;1" dur="2.4s" begin="1.6s" repeatCount="indefinite"></animate></path>
<path transform="translate(58 112)" d="M2 -6 A6 6 0 1 0 2 6 A4.6 4.6 0 1 1 2 -6 Z" fill="#f6c445"></path>
<path transform="translate(32 104) scale(0.7)" d="M2 -6 A6 6 0 1 0 2 6 A4.6 4.6 0 1 1 2 -6 Z" fill="#f6c445"></path>
<circle cx="60" cy="60" r="16" fill="#f3c4a8" stroke="#c98d72" stroke-width="1.5"></circle>
<path d="M43 62 Q40 90 60 106 Q80 90 77 62 Q70 72 60 70 Q50 72 43 62 Z" fill="#f5f5f2" stroke="#c9c9c4" stroke-width="1.5"></path>
<path d="{{F.mouth}}" opacity="{{F.mouthOp}}" fill="{{F.mouthFill}}" stroke="{{F.mc}}" stroke-width="{{F.msw}}" stroke-linecap="round" stroke-linejoin="round"></path>
<ellipse cx="{{F.mx}}" cy="{{F.tcy}}" rx="{{F.trx}}" ry="1" opacity="{{F.talkOp}}" fill="#7f1d1d"><animate attributeName="ry" values="{{F.talkVals}}" dur="0.7s" repeatCount="indefinite"></animate></ellipse>
<path d="M60 70 Q52 66 45 72 Q52 75 60 72 Q68 75 75 72 Q68 66 60 70 Z" fill="#ffffff" stroke="#c9c9c4" stroke-width="1.2"></path>
<ellipse cx="60" cy="66" rx="5" ry="4.2" fill="#e8998a"></ellipse>
<g opacity="{{F.blushOp}}"><ellipse cx="{{F.c1x}}" cy="{{F.c1y}}" rx="{{F.crx}}" ry="{{F.cry}}" fill="#ff6f86"></ellipse><ellipse cx="{{F.c2x}}" cy="{{F.c2y}}" rx="{{F.crx}}" ry="{{F.cry}}" fill="#ff6f86"></ellipse></g>
<ellipse cx="{{F.L.cx}}" cy="{{F.ey}}" rx="{{F.L.a}}" ry="{{F.L.b}}" opacity="{{F.L.scl}}" fill="{{F.L.sclFill}}" stroke="{{F.est}}" stroke-width="{{F.esw}}"><animate attributeName="ry" values="{{F.L.bv}}" keyTimes="{{F.bkt}}" dur="{{F.blink}}" repeatCount="indefinite"></animate></ellipse>
<ellipse cx="{{F.R.cx}}" cy="{{F.ey}}" rx="{{F.R.a}}" ry="{{F.R.b}}" opacity="{{F.R.scl}}" fill="{{F.R.sclFill}}" stroke="{{F.est}}" stroke-width="{{F.esw}}"><animate attributeName="ry" values="{{F.R.bv}}" keyTimes="{{F.bkt}}" dur="{{F.blink}}" repeatCount="indefinite"></animate></ellipse>
<path transform="translate({{F.L.cx}} {{F.ey}})" d="{{F.L.d}}" opacity="{{F.L.path}}" fill="{{F.L.fill}}" stroke="{{F.L.stroke}}" stroke-width="{{F.L.sw}}" stroke-linecap="round" stroke-linejoin="round"><animateTransform attributeName="transform" type="scale" values="{{F.pulse}}" dur="0.8s" additive="sum" repeatCount="indefinite"></animateTransform></path>
<path transform="translate({{F.R.cx}} {{F.ey}})" d="{{F.R.d}}" opacity="{{F.R.path}}" fill="{{F.R.fill}}" stroke="{{F.R.stroke}}" stroke-width="{{F.R.sw}}" stroke-linecap="round" stroke-linejoin="round"><animateTransform attributeName="transform" type="scale" values="{{F.pulse}}" dur="0.8s" additive="sum" repeatCount="indefinite"></animateTransform></path>
<g><animateTransform attributeName="transform" type="translate" values="{{F.glance}}" keyTimes="{{F.glanceKT}}" dur="{{F.glanceDur}}" repeatCount="indefinite"></animateTransform>
<ellipse cx="{{F.L.px}}" cy="{{F.L.py}}" rx="{{F.L.pr}}" ry="{{F.L.pr}}" opacity="{{F.L.pup}}" fill="{{F.L.pupFill}}"><animate attributeName="ry" values="{{F.L.pv}}" keyTimes="{{F.bkt}}" dur="{{F.blink}}" repeatCount="indefinite"></animate></ellipse>
<ellipse cx="{{F.R.px}}" cy="{{F.R.py}}" rx="{{F.R.pr}}" ry="{{F.R.pr}}" opacity="{{F.R.pup}}" fill="{{F.R.pupFill}}"><animate attributeName="ry" values="{{F.R.pv}}" keyTimes="{{F.bkt}}" dur="{{F.blink}}" repeatCount="indefinite"></animate></ellipse>
</g>
<g><animateTransform attributeName="transform" type="translate" values="{{F.browAnim}}" keyTimes="{{F.browKT}}" dur="{{F.browDur}}" repeatCount="indefinite"></animateTransform>
<path d="{{F.brow}}" opacity="{{F.browOp}}" fill="none" stroke="{{F.browO}}" stroke-width="{{F.browOW}}" stroke-linecap="round"></path>
<path d="{{F.brow}}" opacity="{{F.browOp}}" fill="none" stroke="{{F.browC}}" stroke-width="{{F.browW}}" stroke-linecap="round"></path>
</g>
<g opacity="{{F.tearOp}}" transform="translate({{F.tx}} {{F.ty}}) scale({{F.u}})"><path d="M0 0 Q3 4.5 0 7 Q-3 4.5 0 0" fill="#5aa9f0"><animateTransform attributeName="transform" type="translate" values="0 0;0 10" dur="1.6s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="1;1;0" dur="1.6s" repeatCount="indefinite"></animate></path></g>
<g opacity="{{F.sweatOp}}" transform="translate({{F.sx}} {{F.sy}}) scale({{F.u}})"><path d="M0 -5 Q4 2 0 6 Q-4 2 0 -5" fill="#378ADD"><animateTransform attributeName="transform" type="translate" values="0 0;0 8" dur="1.3s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="1;1;0" dur="1.3s" repeatCount="indefinite"></animate></path></g>
<path d="{{RIG.aL.d0}}" fill="none" stroke="#1e3a8a" stroke-width="10.5" stroke-linecap="round"><animate attributeName="d" values="{{RIG.aL.d}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate></path>
<path d="{{RIG.aL.d0}}" fill="none" stroke="#2f4fb3" stroke-width="7.5" stroke-linecap="round"><animate attributeName="d" values="{{RIG.aL.d}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate></path>
<circle cx="{{RIG.aL.x0}}" cy="{{RIG.aL.y0}}" r="5.5" fill="#f3c4a8" stroke="#c98d72" stroke-width="1.5"><animate attributeName="cx" values="{{RIG.aL.cx}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate><animate attributeName="cy" values="{{RIG.aL.cy}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate></circle>
<path d="{{RIG.aR.d0}}" fill="none" stroke="#1e3a8a" stroke-width="10.5" stroke-linecap="round"><animate attributeName="d" values="{{RIG.aR.d}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate></path>
<path d="{{RIG.aR.d0}}" fill="none" stroke="#2f4fb3" stroke-width="7.5" stroke-linecap="round"><animate attributeName="d" values="{{RIG.aR.d}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate></path>
<g opacity="{{RIG.wandOp}}"><animateTransform attributeName="transform" type="translate" values="{{RIG.wand}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animateTransform>
<g><animateTransform attributeName="transform" type="rotate" values="{{RIG.spin}}" dur="{{RIG.spinDur}}" repeatCount="indefinite"></animateTransform>
<path d="M97 125 L111 99" fill="none" stroke="#6b4a2a" stroke-width="2.8" stroke-linecap="round"></path>
<path transform="translate(111.5 97.5) scale(0.6)" d="M0 -6 L1.8 -1.9 L5.7 -1.9 L2.6 0.8 L3.5 5 L0 2.6 L-3.5 5 L-2.6 0.8 L-5.7 -1.9 L-1.8 -1.9 Z" fill="#ffe27a" stroke="#b8860b" stroke-width="1"></path>
<g transform="translate(111.5 97.5)"><g opacity="0"><animate attributeName="opacity" values="{{A.wandOp}}" keyTimes="{{A.wandKT}}" dur="{{A.wandDur}}" repeatCount="indefinite"></animate>
<path transform="translate(-6 -6) scale(0.45)" d="M0 -8 Q1.2 -1.2 8 0 Q1.2 1.2 0 8 Q-1.2 1.2 -8 0 Q-1.2 -1.2 0 -8 Z" fill="#ffe27a" stroke="#b8860b" stroke-width="1.5"></path>
<path transform="translate(4.5 -8) scale(0.35)" d="M0 -8 Q1.2 -1.2 8 0 Q1.2 1.2 0 8 Q-1.2 1.2 -8 0 Q-1.2 -1.2 0 -8 Z" fill="#ffe27a" stroke="#b8860b" stroke-width="1.5"></path>
<path transform="translate(-1 -13) scale(0.3)" d="M0 -8 Q1.2 -1.2 8 0 Q1.2 1.2 0 8 Q-1.2 1.2 -8 0 Q-1.2 -1.2 0 -8 Z" fill="#ffe27a" stroke="#b8860b" stroke-width="1.5"></path>
</g></g>
</g>
</g>
<circle cx="{{RIG.aR.x0}}" cy="{{RIG.aR.y0}}" r="5.5" fill="#f3c4a8" stroke="#c98d72" stroke-width="1.5"><animate attributeName="cx" values="{{RIG.aR.cx}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate><animate attributeName="cy" values="{{RIG.aR.cy}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate></circle>
<g>
<animateTransform attributeName="transform" type="rotate" values="{{A.hat}}" keyTimes="{{A.hatKT}}" dur="{{A.hatDur}}" repeatCount="indefinite"></animateTransform>
<path d="M40 46 Q50 27 58 13 Q63 4 73 6 Q67 10 67 17 Q72 32 80 46 Z" fill="#2f4fb3" stroke="#1e3a8a" stroke-width="2" stroke-linejoin="round"></path>
<ellipse cx="60" cy="46" rx="25" ry="5" fill="#2f4fb3" stroke="#1e3a8a" stroke-width="2"></ellipse>
<path transform="translate(58 33) scale(0.75)" d="M0 -6 L1.8 -1.9 L5.7 -1.9 L2.6 0.8 L3.5 5 L0 2.6 L-3.5 5 L-2.6 0.8 L-5.7 -1.9 L-1.8 -1.9 Z" fill="#f6c445"><animate attributeName="opacity" values="1;0.35;1" dur="2s" begin="0.4s" repeatCount="indefinite"></animate></path>
<path transform="translate(69 40) scale(0.55)" d="M2 -6 A6 6 0 1 0 2 6 A4.6 4.6 0 1 1 2 -6 Z" fill="#f6c445"></path>
</g>
</g></g>
</g></g>
</g>
</g></g></g>
</g>
</g>
</sc-if>
<sc-if value="{{isDog}}">
<g>
<g><animate attributeName="opacity" values="{{T.base}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g transform="translate({{Q.cx}} {{Q.cy}})"><g><animateTransform attributeName="transform" type="{{Q.type}}" values="{{Q.v}}" keyTimes="{{Q.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animateTransform><g transform="translate({{Q.ncx}} {{Q.ncy}})">
<g>
<animateTransform attributeName="transform" type="translate" values="{{M.bob}}" dur="{{M.bobDur}}" repeatCount="indefinite"></animateTransform>
<g transform="translate({{P.x}} {{P.y}})"><g>
<animateTransform attributeName="transform" type="scale" values="{{M.scale}}" keyTimes="{{M.scaleKT}}" dur="{{M.scaleDur}}" repeatCount="indefinite"></animateTransform>
<g transform="translate({{P.nx}} {{P.ny}})"><g>
<animateTransform attributeName="transform" type="rotate" values="{{M.sway}}" keyTimes="{{M.swayKT}}" dur="{{M.swayDur}}" repeatCount="indefinite"></animateTransform>
<g>
<animateTransform attributeName="transform" type="rotate" values="{{A.tail}}" keyTimes="{{A.tailKT}}" dur="{{A.tailDur}}" repeatCount="indefinite"></animateTransform>
<path d="M84 132 Q104 128 108 106" fill="none" stroke="#c98a12" stroke-width="9" stroke-linecap="round"></path>
<path d="M84 132 Q104 128 108 106" fill="none" stroke="#f2b632" stroke-width="5.5" stroke-linecap="round"></path>
</g>
<g opacity="{{RIG.hindOp}}">
<path d="{{RIG.hd0}}" fill="none" stroke="#c98a12" stroke-width="12" stroke-linecap="round"><animate attributeName="d" values="{{RIG.hd}}" keyTimes="{{RIG.hkt}}" dur="{{RIG.hdur}}" repeatCount="indefinite"></animate></path>
<path d="{{RIG.hd0}}" fill="none" stroke="#f2b632" stroke-width="8" stroke-linecap="round"><animate attributeName="d" values="{{RIG.hd}}" keyTimes="{{RIG.hkt}}" dur="{{RIG.hdur}}" repeatCount="indefinite"></animate></path>
</g>
<path d="M38 146 Q30 112 44 96 L76 96 Q90 112 82 146 Z" fill="#f2b632" stroke="#c98a12" stroke-width="2" stroke-linejoin="round"></path>
<ellipse cx="60" cy="124" rx="13" ry="16" fill="#f9d97e"></ellipse>
<path d="M40 92 Q60 100 80 92 L80 99 Q60 107 40 99 Z" fill="#d32f2f" stroke="#9a1f1f" stroke-width="1.5"></path>
<circle cx="60" cy="105" r="3.5" fill="#f6c445" stroke="#b8860b" stroke-width="1"></circle>
<g>
<animateTransform attributeName="transform" type="rotate" values="{{A.head}}" keyTimes="{{A.headKT}}" dur="{{A.headDur}}" repeatCount="indefinite"></animateTransform>
<circle cx="60" cy="62" r="25" fill="#f2b632" stroke="#c98a12" stroke-width="2"></circle>
<g>
<animateTransform attributeName="transform" type="rotate" values="{{A.earL}}" keyTimes="0;0.7;0.8;1" dur="5s" repeatCount="indefinite"></animateTransform>
<path d="M42 42 Q24 40 22 64 Q22 78 30 80 Q38 70 44 54 Z" fill="#d9941c" stroke="#b07414" stroke-width="2" stroke-linejoin="round"></path>
</g>
<g>
<animateTransform attributeName="transform" type="rotate" values="{{A.earR}}" keyTimes="0;0.7;0.8;1" dur="5s" begin="0.15s" repeatCount="indefinite"></animateTransform>
<path d="M78 42 Q96 40 98 64 Q98 78 90 80 Q82 70 76 54 Z" fill="#d9941c" stroke="#b07414" stroke-width="2" stroke-linejoin="round"></path>
</g>
<ellipse cx="60" cy="74" rx="13" ry="9.5" fill="#f9d97e"></ellipse>
<g opacity="{{F.blushOp}}"><ellipse cx="{{F.c1x}}" cy="{{F.c1y}}" rx="{{F.crx}}" ry="{{F.cry}}" fill="#ff6f86"></ellipse><ellipse cx="{{F.c2x}}" cy="{{F.c2y}}" rx="{{F.crx}}" ry="{{F.cry}}" fill="#ff6f86"></ellipse></g>
<ellipse cx="{{F.L.cx}}" cy="{{F.ey}}" rx="{{F.L.a}}" ry="{{F.L.b}}" opacity="{{F.L.scl}}" fill="{{F.L.sclFill}}" stroke="{{F.est}}" stroke-width="{{F.esw}}"><animate attributeName="ry" values="{{F.L.bv}}" keyTimes="{{F.bkt}}" dur="{{F.blink}}" repeatCount="indefinite"></animate></ellipse>
<ellipse cx="{{F.R.cx}}" cy="{{F.ey}}" rx="{{F.R.a}}" ry="{{F.R.b}}" opacity="{{F.R.scl}}" fill="{{F.R.sclFill}}" stroke="{{F.est}}" stroke-width="{{F.esw}}"><animate attributeName="ry" values="{{F.R.bv}}" keyTimes="{{F.bkt}}" dur="{{F.blink}}" repeatCount="indefinite"></animate></ellipse>
<path transform="translate({{F.L.cx}} {{F.ey}})" d="{{F.L.d}}" opacity="{{F.L.path}}" fill="{{F.L.fill}}" stroke="{{F.L.stroke}}" stroke-width="{{F.L.sw}}" stroke-linecap="round" stroke-linejoin="round"><animateTransform attributeName="transform" type="scale" values="{{F.pulse}}" dur="0.8s" additive="sum" repeatCount="indefinite"></animateTransform></path>
<path transform="translate({{F.R.cx}} {{F.ey}})" d="{{F.R.d}}" opacity="{{F.R.path}}" fill="{{F.R.fill}}" stroke="{{F.R.stroke}}" stroke-width="{{F.R.sw}}" stroke-linecap="round" stroke-linejoin="round"><animateTransform attributeName="transform" type="scale" values="{{F.pulse}}" dur="0.8s" additive="sum" repeatCount="indefinite"></animateTransform></path>
<g><animateTransform attributeName="transform" type="translate" values="{{F.glance}}" keyTimes="{{F.glanceKT}}" dur="{{F.glanceDur}}" repeatCount="indefinite"></animateTransform>
<ellipse cx="{{F.L.px}}" cy="{{F.L.py}}" rx="{{F.L.pr}}" ry="{{F.L.pr}}" opacity="{{F.L.pup}}" fill="{{F.L.pupFill}}"><animate attributeName="ry" values="{{F.L.pv}}" keyTimes="{{F.bkt}}" dur="{{F.blink}}" repeatCount="indefinite"></animate></ellipse>
<ellipse cx="{{F.R.px}}" cy="{{F.R.py}}" rx="{{F.R.pr}}" ry="{{F.R.pr}}" opacity="{{F.R.pup}}" fill="{{F.R.pupFill}}"><animate attributeName="ry" values="{{F.R.pv}}" keyTimes="{{F.bkt}}" dur="{{F.blink}}" repeatCount="indefinite"></animate></ellipse>
</g>
<g><animateTransform attributeName="transform" type="translate" values="{{F.browAnim}}" keyTimes="{{F.browKT}}" dur="{{F.browDur}}" repeatCount="indefinite"></animateTransform>
<path d="{{F.brow}}" opacity="{{F.browOp}}" fill="none" stroke="{{F.browO}}" stroke-width="{{F.browOW}}" stroke-linecap="round"></path>
<path d="{{F.brow}}" opacity="{{F.browOp}}" fill="none" stroke="{{F.browC}}" stroke-width="{{F.browW}}" stroke-linecap="round"></path>
</g>
<g transform="translate(60 70)"><g><animateTransform attributeName="transform" type="scale" values="{{A.sniff}}" keyTimes="{{A.sniffKT}}" dur="{{A.sniffDur}}" repeatCount="indefinite"></animateTransform><ellipse cx="0" cy="0" rx="5.5" ry="4" fill="#222"></ellipse><ellipse cx="-1.6" cy="-1.3" rx="1.6" ry="1" fill="#6b6b66"></ellipse></g></g>
<path d="{{F.mouth}}" opacity="{{F.mouthOp}}" fill="{{F.mouthFill}}" stroke="{{F.mc}}" stroke-width="{{F.msw}}" stroke-linecap="round" stroke-linejoin="round"></path>
<ellipse cx="{{F.mx}}" cy="{{F.tcy}}" rx="{{F.trx}}" ry="1" opacity="{{F.talkOp}}" fill="#7f1d1d"><animate attributeName="ry" values="{{F.talkVals}}" dur="0.7s" repeatCount="indefinite"></animate></ellipse>
<ellipse cx="{{F.mx}}" cy="{{F.tgy}}" rx="{{F.tgrx}}" ry="{{F.tgry}}" opacity="{{F.tongueOp}}" fill="#e8607a"><animate attributeName="ry" values="{{F.tgVals}}" dur="0.45s" repeatCount="indefinite"></animate></ellipse>
<g opacity="{{F.tearOp}}" transform="translate({{F.tx}} {{F.ty}}) scale({{F.u}})"><path d="M0 0 Q3 4.5 0 7 Q-3 4.5 0 0" fill="#5aa9f0"><animateTransform attributeName="transform" type="translate" values="0 0;0 10" dur="1.6s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="1;1;0" dur="1.6s" repeatCount="indefinite"></animate></path></g>
<g opacity="{{F.sweatOp}}" transform="translate({{F.sx}} {{F.sy}}) scale({{F.u}})"><path d="M0 -5 Q4 2 0 6 Q-4 2 0 -5" fill="#378ADD"><animateTransform attributeName="transform" type="translate" values="0 0;0 8" dur="1.3s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="1;1;0" dur="1.3s" repeatCount="indefinite"></animate></path></g>
</g>
<path d="{{RIG.lL.d0}}" fill="none" stroke="#c98a12" stroke-width="13" stroke-linecap="round"><animate attributeName="d" values="{{RIG.lL.d}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate></path>
<path d="{{RIG.lL.d0}}" fill="none" stroke="#f2b632" stroke-width="9" stroke-linecap="round"><animate attributeName="d" values="{{RIG.lL.d}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate></path>
<ellipse cx="{{RIG.lL.x0}}" cy="{{RIG.lL.y0}}" rx="8" ry="4" fill="#f2b632" stroke="#c98a12" stroke-width="2"><animate attributeName="cx" values="{{RIG.lL.cx}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate><animate attributeName="cy" values="{{RIG.lL.cy}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate></ellipse>
<path d="{{RIG.lR.d0}}" fill="none" stroke="#c98a12" stroke-width="13" stroke-linecap="round"><animate attributeName="d" values="{{RIG.lR.d}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate></path>
<path d="{{RIG.lR.d0}}" fill="none" stroke="#f2b632" stroke-width="9" stroke-linecap="round"><animate attributeName="d" values="{{RIG.lR.d}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate></path>
<ellipse cx="{{RIG.lR.x0}}" cy="{{RIG.lR.y0}}" rx="8" ry="4" fill="#f2b632" stroke="#c98a12" stroke-width="2"><animate attributeName="cx" values="{{RIG.lR.cx}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate><animate attributeName="cy" values="{{RIG.lR.cy}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate></ellipse>
</g></g>
</g></g>
</g>
</g></g></g>
</g>
</g>
</sc-if>
<sc-if value="{{isCat}}">
<g>
<g><animate attributeName="opacity" values="{{T.base}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g transform="translate({{Q.cx}} {{Q.cy}})"><g><animateTransform attributeName="transform" type="{{Q.type}}" values="{{Q.v}}" keyTimes="{{Q.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animateTransform><g transform="translate({{Q.ncx}} {{Q.ncy}})">
<g>
<animateTransform attributeName="transform" type="translate" values="{{M.bob}}" dur="{{M.bobDur}}" repeatCount="indefinite"></animateTransform>
<g transform="translate({{P.x}} {{P.y}})"><g>
<animateTransform attributeName="transform" type="scale" values="{{M.scale}}" keyTimes="{{M.scaleKT}}" dur="{{M.scaleDur}}" repeatCount="indefinite"></animateTransform>
<g transform="translate({{P.nx}} {{P.ny}})"><g>
<animateTransform attributeName="transform" type="rotate" values="{{M.sway}}" keyTimes="{{M.swayKT}}" dur="{{M.swayDur}}" repeatCount="indefinite"></animateTransform>
<g>
<animateTransform attributeName="transform" type="rotate" values="{{A.ctail}}" dur="{{A.ctailDur}}" repeatCount="indefinite"></animateTransform>
<path d="M80 140 Q110 138 106 112 Q104 96 112 90" fill="none" stroke="#b8862e" stroke-width="{{A.ctW1}}" stroke-linecap="round"></path>
<path d="M80 140 Q110 138 106 112 Q104 96 112 90" fill="none" stroke="#f5cf7c" stroke-width="{{A.ctW2}}" stroke-linecap="round"></path>
</g>
<g opacity="{{RIG.hindOp}}">
<path d="{{RIG.hd0}}" fill="none" stroke="#b8862e" stroke-width="12" stroke-linecap="round"><animate attributeName="d" values="{{RIG.hd}}" keyTimes="{{RIG.hkt}}" dur="{{RIG.hdur}}" repeatCount="indefinite"></animate></path>
<path d="{{RIG.hd0}}" fill="none" stroke="#f5cf7c" stroke-width="8" stroke-linecap="round"><animate attributeName="d" values="{{RIG.hd}}" keyTimes="{{RIG.hkt}}" dur="{{RIG.hdur}}" repeatCount="indefinite"></animate></path>
</g>
<path d="M40 146 Q34 116 46 100 L74 100 Q86 116 80 146 Z" fill="#f5cf7c" stroke="#b8862e" stroke-width="2" stroke-linejoin="round"></path>
<ellipse cx="60" cy="120" rx="11" ry="14" fill="#fff3d6"></ellipse>
<path d="M42 96 Q60 104 78 96 L78 102 Q60 110 42 102 Z" fill="#2e9a52" stroke="#1d6b37" stroke-width="1.5"></path>
<circle cx="60" cy="108" r="3" fill="#f6c445" stroke="#b8860b" stroke-width="1"></circle>
<g>
<animateTransform attributeName="transform" type="rotate" values="{{A.head}}" keyTimes="{{A.headKT}}" dur="{{A.headDur}}" repeatCount="indefinite"></animateTransform>
<g>
<animateTransform attributeName="transform" type="rotate" values="{{A.cearL}}" keyTimes="{{A.cearKT}}" dur="{{A.cearDur}}" repeatCount="indefinite"></animateTransform>
<path d="M36 56 L38 24 L56 44 Z" fill="#f5cf7c" stroke="#b8862e" stroke-width="2" stroke-linejoin="round"></path>
<path d="M40 50 L41 32 L51 44 Z" fill="#e2553a"></path>
</g>
<g>
<animateTransform attributeName="transform" type="rotate" values="{{A.cearR}}" keyTimes="{{A.cearKT}}" dur="{{A.cearDur}}" repeatCount="indefinite"></animateTransform>
<path d="M84 56 L82 24 L64 44 Z" fill="#f5cf7c" stroke="#b8862e" stroke-width="2" stroke-linejoin="round"></path>
<path d="M80 50 L79 32 L69 44 Z" fill="#e2553a"></path>
</g>
<ellipse cx="60" cy="66" rx="27" ry="22" fill="#f5cf7c" stroke="#b8862e" stroke-width="2"></ellipse>
<g opacity="{{F.blushOp}}"><ellipse cx="{{F.c1x}}" cy="{{F.c1y}}" rx="{{F.crx}}" ry="{{F.cry}}" fill="#ff6f86"></ellipse><ellipse cx="{{F.c2x}}" cy="{{F.c2y}}" rx="{{F.crx}}" ry="{{F.cry}}" fill="#ff6f86"></ellipse></g>
<ellipse cx="{{F.L.cx}}" cy="{{F.ey}}" rx="{{F.L.a}}" ry="{{F.L.b}}" opacity="{{F.L.scl}}" fill="{{F.L.sclFill}}" stroke="{{F.est}}" stroke-width="{{F.esw}}"><animate attributeName="ry" values="{{F.L.bv}}" keyTimes="{{F.bkt}}" dur="{{F.blink}}" repeatCount="indefinite"></animate></ellipse>
<ellipse cx="{{F.R.cx}}" cy="{{F.ey}}" rx="{{F.R.a}}" ry="{{F.R.b}}" opacity="{{F.R.scl}}" fill="{{F.R.sclFill}}" stroke="{{F.est}}" stroke-width="{{F.esw}}"><animate attributeName="ry" values="{{F.R.bv}}" keyTimes="{{F.bkt}}" dur="{{F.blink}}" repeatCount="indefinite"></animate></ellipse>
<path transform="translate({{F.L.cx}} {{F.ey}})" d="{{F.L.d}}" opacity="{{F.L.path}}" fill="{{F.L.fill}}" stroke="{{F.L.stroke}}" stroke-width="{{F.L.sw}}" stroke-linecap="round" stroke-linejoin="round"><animateTransform attributeName="transform" type="scale" values="{{F.pulse}}" dur="0.8s" additive="sum" repeatCount="indefinite"></animateTransform></path>
<path transform="translate({{F.R.cx}} {{F.ey}})" d="{{F.R.d}}" opacity="{{F.R.path}}" fill="{{F.R.fill}}" stroke="{{F.R.stroke}}" stroke-width="{{F.R.sw}}" stroke-linecap="round" stroke-linejoin="round"><animateTransform attributeName="transform" type="scale" values="{{F.pulse}}" dur="0.8s" additive="sum" repeatCount="indefinite"></animateTransform></path>
<g><animateTransform attributeName="transform" type="translate" values="{{F.glance}}" keyTimes="{{F.glanceKT}}" dur="{{F.glanceDur}}" repeatCount="indefinite"></animateTransform>
<ellipse cx="{{F.L.px}}" cy="{{F.L.py}}" rx="{{F.L.pr}}" ry="{{F.L.pr}}" opacity="{{F.L.pup}}" fill="{{F.L.pupFill}}"><animate attributeName="ry" values="{{F.L.pv}}" keyTimes="{{F.bkt}}" dur="{{F.blink}}" repeatCount="indefinite"></animate></ellipse>
<ellipse cx="{{F.R.px}}" cy="{{F.R.py}}" rx="{{F.R.pr}}" ry="{{F.R.pr}}" opacity="{{F.R.pup}}" fill="{{F.R.pupFill}}"><animate attributeName="ry" values="{{F.R.pv}}" keyTimes="{{F.bkt}}" dur="{{F.blink}}" repeatCount="indefinite"></animate></ellipse>
</g>
<g><animateTransform attributeName="transform" type="translate" values="{{F.browAnim}}" keyTimes="{{F.browKT}}" dur="{{F.browDur}}" repeatCount="indefinite"></animateTransform>
<path d="{{F.brow}}" opacity="{{F.browOp}}" fill="none" stroke="{{F.browO}}" stroke-width="{{F.browOW}}" stroke-linecap="round"></path>
<path d="{{F.brow}}" opacity="{{F.browOp}}" fill="none" stroke="{{F.browC}}" stroke-width="{{F.browW}}" stroke-linecap="round"></path>
</g>
<path d="M56 70 L64 70 L60 74.5 Z" fill="#2b2b2b" stroke="#2b2b2b" stroke-width="1" stroke-linejoin="round"></path>
<path d="{{F.mouth}}" opacity="{{F.mouthOp}}" fill="{{F.mouthFill}}" stroke="{{F.mc}}" stroke-width="{{F.msw}}" stroke-linecap="round" stroke-linejoin="round"><animate attributeName="opacity" values="{{A.mouthHide}}" keyTimes="{{A.yawnKT}}" dur="{{A.yawnDur}}" repeatCount="indefinite"></animate></path>
<ellipse cx="60" cy="79" rx="4.2" ry="0.5" opacity="0" fill="#7f1d1d" stroke="#6b4a1a" stroke-width="1.4"><animate attributeName="opacity" values="{{A.yawnOp}}" keyTimes="{{A.yawnKT}}" dur="{{A.yawnDur}}" repeatCount="indefinite"></animate><animate attributeName="ry" values="{{A.yawnRy}}" keyTimes="{{A.yawnKT}}" dur="{{A.yawnDur}}" repeatCount="indefinite"></animate></ellipse>
<ellipse cx="{{F.mx}}" cy="{{F.tcy}}" rx="{{F.trx}}" ry="1" opacity="{{F.talkOp}}" fill="#7f1d1d"><animate attributeName="ry" values="{{F.talkVals}}" dur="0.7s" repeatCount="indefinite"></animate></ellipse>
<ellipse cx="{{F.mx}}" cy="{{F.tgy}}" rx="{{F.tgrx}}" ry="{{F.tgry}}" opacity="{{F.tongueOp}}" fill="#e8607a"><animate attributeName="ry" values="{{F.tgVals}}" dur="0.45s" repeatCount="indefinite"></animate></ellipse>
<g>
<animateTransform attributeName="transform" type="rotate" values="0 46 72;0 46 72;-7 46 72;0 46 72" keyTimes="0;0.5;0.55;1" dur="4s" repeatCount="indefinite"></animateTransform>
<path d="M46 71 L24 67 M46 74.5 L23 76" fill="none" stroke="#6b4a1a" stroke-width="1.4" stroke-linecap="round"></path>
</g>
<g>
<animateTransform attributeName="transform" type="rotate" values="0 74 72;0 74 72;7 74 72;0 74 72" keyTimes="0;0.5;0.55;1" dur="4.6s" repeatCount="indefinite"></animateTransform>
<path d="M74 71 L96 67 M74 74.5 L97 76" fill="none" stroke="#6b4a1a" stroke-width="1.4" stroke-linecap="round"></path>
</g>
<g opacity="{{F.tearOp}}" transform="translate({{F.tx}} {{F.ty}}) scale({{F.u}})"><path d="M0 0 Q3 4.5 0 7 Q-3 4.5 0 0" fill="#5aa9f0"><animateTransform attributeName="transform" type="translate" values="0 0;0 10" dur="1.6s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="1;1;0" dur="1.6s" repeatCount="indefinite"></animate></path></g>
<g opacity="{{F.sweatOp}}" transform="translate({{F.sx}} {{F.sy}}) scale({{F.u}})"><path d="M0 -5 Q4 2 0 6 Q-4 2 0 -5" fill="#378ADD"><animateTransform attributeName="transform" type="translate" values="0 0;0 8" dur="1.3s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="1;1;0" dur="1.3s" repeatCount="indefinite"></animate></path></g>
</g>
<path d="{{RIG.lL.d0}}" fill="none" stroke="#b8862e" stroke-width="13" stroke-linecap="round"><animate attributeName="d" values="{{RIG.lL.d}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate></path>
<path d="{{RIG.lL.d0}}" fill="none" stroke="#f5cf7c" stroke-width="9" stroke-linecap="round"><animate attributeName="d" values="{{RIG.lL.d}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate></path>
<ellipse cx="{{RIG.lL.x0}}" cy="{{RIG.lL.y0}}" rx="7.5" ry="3.8" fill="#f5cf7c" stroke="#b8862e" stroke-width="2"><animate attributeName="cx" values="{{RIG.lL.cx}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate><animate attributeName="cy" values="{{RIG.lL.cy}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate></ellipse>
<path d="{{RIG.lR.d0}}" fill="none" stroke="#b8862e" stroke-width="13" stroke-linecap="round"><animate attributeName="d" values="{{RIG.lR.d}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate></path>
<path d="{{RIG.lR.d0}}" fill="none" stroke="#f5cf7c" stroke-width="9" stroke-linecap="round"><animate attributeName="d" values="{{RIG.lR.d}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate></path>
<ellipse cx="{{RIG.lR.x0}}" cy="{{RIG.lR.y0}}" rx="7.5" ry="3.8" fill="#f5cf7c" stroke="#b8862e" stroke-width="2"><animate attributeName="cx" values="{{RIG.lR.cx}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate><animate attributeName="cy" values="{{RIG.lR.cy}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animate></ellipse>
</g></g>
</g></g>
</g>
</g></g></g>
</g>
</g>
</sc-if>
<g>
<g transform="translate({{X.ax}} {{X.ay}})">
<g opacity="{{X.excl}}"><g><animateTransform attributeName="transform" type="translate" values="0 3;0 -2;0 0;0 0" dur="1.2s" repeatCount="indefinite"></animateTransform><path d="M-2.4 -12 L2.4 -12 L1.4 3 L-1.4 3 Z" fill="#d92d20"></path><circle cx="0" cy="8" r="2.5" fill="#d92d20"></circle></g></g>
<g opacity="{{X.quest}}"><g><animateTransform attributeName="transform" type="rotate" values="-12 1 0;12 1 0;-12 1 0" dur="1.6s" repeatCount="indefinite"></animateTransform><path d="M-5 -6 Q-5 -12 1 -12 Q7 -12 7 -6 Q7 -1.5 1 0.5 L1 3.5" fill="none" stroke="#2f6fde" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="1" cy="9" r="2.3" fill="#2f6fde"></circle></g></g>
<g opacity="{{X.dots}}">
<circle cx="-7" cy="0" r="2.6" fill="#6b6b66"><animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite"></animate></circle>
<circle cx="0" cy="0" r="2.6" fill="#6b6b66"><animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" begin="0.25s" repeatCount="indefinite"></animate></circle>
<circle cx="7" cy="0" r="2.6" fill="#6b6b66"><animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" begin="0.5s" repeatCount="indefinite"></animate></circle>
</g>
<g opacity="{{X.zzz}}">
<path transform="translate(-9 3)" d="M0 0 H7 L0 7 H7" fill="none" stroke="#5b6fd6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><animate attributeName="opacity" values="0;1;1;0" dur="3s" repeatCount="indefinite"></animate></path>
<path transform="translate(-1 -6)" d="M0 0 H5.5 L0 5.5 H5.5" fill="none" stroke="#5b6fd6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><animate attributeName="opacity" values="0;1;1;0" dur="3s" begin="1s" repeatCount="indefinite"></animate></path>
<path transform="translate(6 -14)" d="M0 0 H4 L0 4 H4" fill="none" stroke="#5b6fd6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><animate attributeName="opacity" values="0;1;1;0" dur="3s" begin="2s" repeatCount="indefinite"></animate></path>
</g>
<g opacity="{{X.heart}}">
<path d="M0 6 C-8 0 -6.5 -7.5 0 -3 C6.5 -7.5 8 0 0 6 Z" fill="#e5484d"><animateTransform attributeName="transform" type="translate" values="0 6;0 -6" dur="1.8s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite"></animate></path>
<g transform="translate(9 2) scale(0.6)"><path d="M0 6 C-8 0 -6.5 -7.5 0 -3 C6.5 -7.5 8 0 0 6 Z" fill="#e5484d"><animateTransform attributeName="transform" type="translate" values="0 6;0 -8" dur="1.8s" begin="0.9s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="0.9s" repeatCount="indefinite"></animate></path></g>
</g>
<g opacity="{{X.sparkle}}">
<path transform="translate(0 -3)" d="M0 -8 Q1.2 -1.2 8 0 Q1.2 1.2 0 8 Q-1.2 1.2 -8 0 Q-1.2 -1.2 0 -8 Z" fill="#f6c445" stroke="#b8860b" stroke-width="0.8"><animate attributeName="opacity" values="0.25;1;0.25" dur="1.1s" repeatCount="indefinite"></animate></path>
<path transform="translate(-10 8) scale(0.6)" d="M0 -8 Q1.2 -1.2 8 0 Q1.2 1.2 0 8 Q-1.2 1.2 -8 0 Q-1.2 -1.2 0 -8 Z" fill="#f6c445" stroke="#b8860b" stroke-width="1"><animate attributeName="opacity" values="0.25;1;0.25" dur="1.1s" begin="0.4s" repeatCount="indefinite"></animate></path>
<path transform="translate(9 7) scale(0.5)" d="M0 -8 Q1.2 -1.2 8 0 Q1.2 1.2 0 8 Q-1.2 1.2 -8 0 Q-1.2 -1.2 0 -8 Z" fill="#f6c445" stroke="#b8860b" stroke-width="1"><animate attributeName="opacity" values="0.25;1;0.25" dur="1.1s" begin="0.7s" repeatCount="indefinite"></animate></path>
</g>
<g opacity="{{X.anger}}"><g><animateTransform attributeName="transform" type="scale" values="1;1.25;1" dur="0.9s" repeatCount="indefinite"></animateTransform><path d="M-7 -2.5 Q-2.5 -2.5 -2.5 -7 M2.5 -7 Q2.5 -2.5 7 -2.5 M7 2.5 Q2.5 2.5 2.5 7 M-2.5 7 Q-2.5 2.5 -7 2.5" fill="none" stroke="#d92d20" stroke-width="2.6" stroke-linecap="round"></path></g></g>
<g opacity="{{X.steam}}" transform="translate(-16 4)">
<circle cx="0" cy="0" r="3" fill="#c4c4be"><animateTransform attributeName="transform" type="translate" values="0 4;-3 -10" dur="1.5s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="0;0.95;0" dur="1.5s" repeatCount="indefinite"></animate></circle>
<circle cx="4" cy="0" r="4" fill="#c4c4be"><animateTransform attributeName="transform" type="translate" values="0 4;2 -12" dur="1.5s" begin="0.5s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="0;0.95;0" dur="1.5s" begin="0.5s" repeatCount="indefinite"></animate></circle>
<circle cx="-3" cy="0" r="3" fill="#c4c4be"><animateTransform attributeName="transform" type="translate" values="0 4;-6 -9" dur="1.5s" begin="1s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="0;0.95;0" dur="1.5s" begin="1s" repeatCount="indefinite"></animate></circle>
</g>
<g opacity="{{X.bulb}}">
<path d="M0 -15.5 L0 -12.5 M-9 -11.5 L-7 -9.5 M9 -11.5 L7 -9.5 M-12.5 -3 L-10 -3 M12.5 -3 L10 -3" fill="none" stroke="#e0a800" stroke-width="2" stroke-linecap="round"><animate attributeName="opacity" values="0.2;1;0.2" dur="1s" repeatCount="indefinite"></animate></path>
<circle cx="0" cy="-3" r="6.5" fill="#ffd84a" stroke="#b8860b" stroke-width="1.2"></circle>
<rect x="-3" y="3.2" width="6" height="4.5" rx="1.2" fill="#8d96a0"></rect>
</g>
<g opacity="{{X.check}}"><g><animateTransform attributeName="transform" type="scale" values="0.9;1.1;0.9" dur="1.4s" repeatCount="indefinite"></animateTransform><circle cx="0" cy="0" r="8" fill="#2e9a52"></circle><path d="M-4 0.2 L-1.2 3.2 L4.4 -3" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path></g></g>
<g opacity="{{X.magnifier}}"><g><animateTransform attributeName="transform" type="translate" values="0 0;-5 3;3 4;0 0" dur="2.6s" repeatCount="indefinite"></animateTransform><circle cx="-2" cy="-2" r="6.5" fill="#dbeafe" fill-opacity="0.85" stroke="#4b5563" stroke-width="2.4"></circle><path d="M2.8 2.8 L8.5 8.5" fill="none" stroke="#4b5563" stroke-width="3.4" stroke-linecap="round"></path></g></g>
<g opacity="{{X.gear}}"><g><animateTransform attributeName="transform" type="rotate" values="0;360" dur="2.4s" repeatCount="indefinite"></animateTransform><circle cx="0" cy="0" r="6.3" fill="none" stroke="#6b6b66" stroke-width="3.2" stroke-dasharray="2.9 2"></circle><circle cx="0" cy="0" r="4.4" fill="#8b8b87"></circle><circle cx="0" cy="0" r="1.7" fill="#fafaf9"></circle></g></g>
<g opacity="{{X.hourglass}}"><g><animateTransform attributeName="transform" type="rotate" values="0;0;180;180" keyTimes="0;0.75;0.9;1" dur="2.4s" repeatCount="indefinite"></animateTransform><path d="M-6 -9 L6 -9 L0.8 -0.5 L6 9 L-6 9 L-0.8 -0.5 Z" fill="#fde8b0" stroke="#8a6420" stroke-width="1.6" stroke-linejoin="round"></path><path d="M-3.4 6.8 L3.4 6.8 L0 2.6 Z" fill="#d9941c"></path></g></g>
<g opacity="{{X.warn}}"><g><animateTransform attributeName="transform" type="scale" values="1;1.12;1" dur="0.9s" repeatCount="indefinite"></animateTransform><path d="M0 -10 L10 7.5 L-10 7.5 Z" fill="#f6a623" stroke="#9a5b00" stroke-width="1.6" stroke-linejoin="round"></path><path d="M0 -3.5 L0 2" fill="none" stroke="#3a2600" stroke-width="2.4" stroke-linecap="round"></path><circle cx="0" cy="4.8" r="1.4" fill="#3a2600"></circle></g></g>
<g opacity="{{X.pencil}}">
<rect x="-10" y="-7" width="15" height="17" rx="1.5" fill="#fffbe6" stroke="#b8a76a" stroke-width="1"></rect>
<path d="M-7.5 -2 L2.5 -2 M-7.5 2 L2.5 2 M-7.5 6 L-1 6" fill="none" stroke="#4b5563" stroke-width="1.2" stroke-dasharray="32" stroke-dashoffset="32"><animate attributeName="stroke-dashoffset" values="32;0;0" keyTimes="0;0.8;1" dur="2.2s" repeatCount="indefinite"></animate></path>
<g><animateTransform attributeName="transform" type="translate" values="-7 -2;2 -2;-7 2;2 2;-7 6;-1 6" dur="2.2s" repeatCount="indefinite"></animateTransform><path d="M0 0 L8 -8 L10.5 -5.5 L2.5 2.5 Z" fill="#f6c445" stroke="#8a6420" stroke-width="0.9" stroke-linejoin="round"></path><path d="M0 0 L2.5 2.5 L-1 3.5 Z" fill="#4b5563"></path></g>
</g>
<g opacity="{{X.floppy}}"><g><animateTransform attributeName="transform" type="scale" values="0.9;1.1;1;1" keyTimes="0;0.2;0.35;1" dur="1.6s" repeatCount="indefinite"></animateTransform><rect x="-8" y="-8" width="16" height="16" rx="2" fill="#2f5fb3" stroke="#1e3a8a" stroke-width="1.2"></rect><rect x="-4.5" y="-8" width="9" height="5.5" fill="#d7dde6"></rect><rect x="2" y="-7.2" width="1.8" height="3.8" fill="#2f5fb3"></rect><rect x="-5.5" y="1" width="11" height="6" rx="1" fill="#fafaf9"></rect></g></g>
<g opacity="{{X.envelope}}"><g><animateTransform attributeName="transform" type="translate" values="-4 6;-4 6;10 -12" keyTimes="0;0.45;1" dur="1.8s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="1;1;0" keyTimes="0;0.6;1" dur="1.8s" repeatCount="indefinite"></animate><rect x="-8" y="-5.5" width="16" height="11" rx="1.5" fill="#ffffff" stroke="#4b5563" stroke-width="1.3"></rect><path d="M-8 -5 L0 1.5 L8 -5" fill="none" stroke="#4b5563" stroke-width="1.3" stroke-linejoin="round"></path></g></g>
<g opacity="{{X.trash}}">
<circle cx="0" cy="-14" r="2.6" fill="#fffbe6" stroke="#b8a76a" stroke-width="0.8"><animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 16;0 16" keyTimes="0;0.35;0.55;1" dur="2s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.56;1" dur="2s" repeatCount="indefinite"></animate></circle>
<path d="M-6 -3 L6 -3 L5 9 L-5 9 Z" fill="#9aa3ad" stroke="#4b5563" stroke-width="1.2" stroke-linejoin="round"></path>
<path d="M-2.5 0 L-2 7 M2.5 0 L2 7" fill="none" stroke="#4b5563" stroke-width="0.9"></path>
<g><animateTransform attributeName="transform" type="rotate" values="0 7 -4;0 7 -4;-35 7 -4;-35 7 -4;0 7 -4" keyTimes="0;0.25;0.35;0.6;1" dur="2s" repeatCount="indefinite"></animateTransform><rect x="-7" y="-6" width="14" height="2.6" rx="1" fill="#8b939c" stroke="#4b5563" stroke-width="1"></rect><rect x="-2" y="-8" width="4" height="2.2" rx="0.8" fill="#8b939c"></rect></g>
</g>
<g opacity="{{X.hand}}" transform="translate(2 14)"><g><animateTransform attributeName="transform" type="rotate" values="-22 0 8;22 0 8;-22 0 8" dur="{{X.handDur}}" repeatCount="indefinite"></animateTransform><path d="M-4 8 L-4 -2 Q-4 -8 0 -8 Q4 -8 4 -2 L4 8 Z" fill="#ffffff" stroke="#4b5563" stroke-width="1.3" stroke-linejoin="round"></path><path d="M-4 1.5 Q-8.5 -0.5 -7.5 -4" fill="none" stroke="#4b5563" stroke-width="1.3" stroke-linecap="round"></path><path d="M-1.3 -7.5 L-1.3 -3 M1.3 -7.5 L1.3 -3" fill="none" stroke="#9aa3ad" stroke-width="0.8"></path></g></g>
</g>
</g>
<sc-if value="{{X.has.headphones}}"><g><g transform="translate({{X.at.headphones.x}} {{X.at.headphones.y}}) scale({{X.at.headphones.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<path d="M-21 2 Q-21 -25 0 -25 Q21 -25 21 2" fill="none" stroke="#2b2b2b" stroke-width="3.6" stroke-linecap="round"></path>
<rect x="-27" y="-5" width="9" height="14" rx="3.5" fill="#2b2b2b"></rect><rect x="18" y="-5" width="9" height="14" rx="3.5" fill="#2b2b2b"></rect>
<path d="M31 -4 Q35 2 31 8 M36 -8 Q42 2 36 12" fill="none" stroke="#6b6b66" stroke-width="1.6" stroke-linecap="round"><animate attributeName="opacity" values="0;1;0" dur="0.9s" repeatCount="indefinite"></animate></path>
</g></g></g></sc-if>
<sc-if value="{{X.has.glasses}}"><g><g transform="translate({{X.at.glasses.x}} {{X.at.glasses.y}}) scale({{X.at.glasses.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<circle cx="-8.5" cy="0" r="7" fill="#dbeafe" fill-opacity="0.35" stroke="#2b2b2b" stroke-width="2"></circle><circle cx="8.5" cy="0" r="7" fill="#dbeafe" fill-opacity="0.35" stroke="#2b2b2b" stroke-width="2"></circle>
<path d="M-1.5 -1 Q0 -3 1.5 -1 M-15.5 -1 L-20 -3 M15.5 -1 L20 -3" fill="none" stroke="#2b2b2b" stroke-width="1.8" stroke-linecap="round"></path>
</g></g></g></sc-if>
<sc-if value="{{X.has.glassesScan}}"><g><g transform="translate({{X.at.glassesScan.x}} {{X.at.glassesScan.y}}) scale({{X.at.glassesScan.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="translate" values="-18 -16;14 -20;-18 -6;14 -10;-18 4;14 0;-18 -16" dur="{{T.dur}}" repeatCount="indefinite"></animateTransform>
<circle cx="-8" cy="0" r="7.5" fill="#ffffff" stroke="#4b5563" stroke-width="2.4"></circle><circle cx="8" cy="0" r="7.5" fill="#ffffff" stroke="#4b5563" stroke-width="2.4"></circle>
<circle cx="-7" cy="2" r="3.2" fill="#111"></circle><circle cx="9" cy="2" r="3.2" fill="#111"></circle>
<path d="M-0.5 -1 L0.5 -1" fill="none" stroke="#4b5563" stroke-width="2.4"></path>
<path d="M-14 -10 Q-8 -14 -2 -10 M2 -10 Q8 -14 14 -10" fill="none" stroke="#111" stroke-width="2.8" stroke-linecap="round"></path>
</g>
</g></g></g></sc-if>
<sc-if value="{{X.has.catGlasses}}"><g><g transform="translate({{X.at.catGlasses.x}} {{X.at.catGlasses.y}}) scale({{X.at.catGlasses.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<path d="M-16 -3 Q-15 -9 -7 -7 Q-1 -6 -2 0 Q-3 6 -9 6 Q-16 6 -16 -3 Z" fill="#cfeff0" fill-opacity="0.45" stroke="#178f8a" stroke-width="2"></path>
<path d="M16 -3 Q15 -9 7 -7 Q1 -6 2 0 Q3 6 9 6 Q16 6 16 -3 Z" fill="#cfeff0" fill-opacity="0.45" stroke="#178f8a" stroke-width="2"></path>
<path d="M-2 -2 Q0 -4 2 -2" fill="none" stroke="#178f8a" stroke-width="1.8"></path>
</g></g></g></sc-if>
<sc-if value="{{X.has.sunglasses}}"><g><g transform="translate({{X.at.sunglasses.x}} {{X.at.sunglasses.y}}) scale({{X.at.sunglasses.s}})"><g>
<animateTransform attributeName="transform" type="translate" values="0 -40;0 -40;0 0;0 0" keyTimes="0;0.6;0.7;1" dur="{{T.dur}}" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="0;0;1;1" keyTimes="0;0.6;0.7;1" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<path d="M-17 -4 L-3 -4 L-4 3 Q-10 7 -16 3 Z" fill="#111"></path><path d="M17 -4 L3 -4 L4 3 Q10 7 16 3 Z" fill="#111"></path><path d="M-3 -3 L3 -3" fill="none" stroke="#111" stroke-width="2"></path>
</g></g></g></sc-if>
<sc-if value="{{X.has.welder}}"><g><g transform="translate({{X.at.welder.x}} {{X.at.welder.y}}) scale({{X.at.welder.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<rect x="-17" y="-16" width="34" height="30" rx="8" fill="#6b7480" stroke="#3d434b" stroke-width="1.6"></rect>
<rect x="-12" y="-6" width="24" height="7" rx="2" fill="#1f2937"></rect>
<rect x="6" y="52" width="20" height="14" fill="#fffbe6" stroke="#b8a76a" stroke-width="1"></rect>
<path d="M-6 40 L14 54" fill="none" stroke="#4b5563" stroke-width="3" stroke-linecap="round"></path>
<path d="M14 54 L19 57" fill="none" stroke="#5aa9f0" stroke-width="3" stroke-linecap="round"><animate attributeName="opacity" values="0.4;1;0.4" dur="0.25s" repeatCount="indefinite"></animate></path>
<circle cx="22" cy="56" r="1.4" fill="#f6a623"><animate attributeName="opacity" values="1;0;1" dur="0.3s" repeatCount="indefinite"></animate></circle><circle cx="20" cy="51" r="1.2" fill="#f6c445"><animate attributeName="opacity" values="0;1;0" dur="0.3s" repeatCount="indefinite"></animate></circle><circle cx="25" cy="53" r="1" fill="#f6a623"><animate attributeName="opacity" values="1;0;1" dur="0.4s" repeatCount="indefinite"></animate></circle>
</g></g></g></sc-if>
<sc-if value="{{X.has.bigEars}}"><g><g transform="translate({{X.at.bigEars.x}} {{X.at.bigEars.y}}) scale({{X.at.bigEars.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g transform="translate(-19 0)"><g><animateTransform attributeName="transform" type="scale" values="1 1;1.8 1.4;1.8 1.4;1 1" keyTimes="0;0.2;0.8;1" dur="{{T.dur}}" repeatCount="indefinite"></animateTransform><ellipse cx="-4" cy="0" rx="5" ry="7" fill="#f3c4a8" stroke="#c98d72" stroke-width="1.2"></ellipse><ellipse cx="-4" cy="0" rx="2.4" ry="4" fill="#e8998a"></ellipse></g></g>
<g transform="translate(19 0)"><g><animateTransform attributeName="transform" type="scale" values="1 1;1.8 1.4;1.8 1.4;1 1" keyTimes="0;0.2;0.8;1" dur="{{T.dur}}" repeatCount="indefinite"></animateTransform><ellipse cx="4" cy="0" rx="5" ry="7" fill="#f3c4a8" stroke="#c98d72" stroke-width="1.2"></ellipse><ellipse cx="4" cy="0" rx="2.4" ry="4" fill="#e8998a"></ellipse></g></g>
</g></g></g></sc-if>
<sc-if value="{{X.has.telescope}}"><g><g transform="translate({{X.at.telescope.x}} {{X.at.telescope.y}}) scale({{X.at.telescope.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="rotate" values="-14;4;-14" dur="4s" repeatCount="indefinite"></animateTransform>
<path d="M6 -4 L32 -9 L32 9 L6 4 Z" fill="#e9d8a6" stroke="#8a6420" stroke-width="1.4" stroke-linejoin="round"></path>
<rect x="30" y="-10" width="6" height="20" rx="1.5" fill="#c9b77a" stroke="#8a6420" stroke-width="1.2"></rect><rect x="12" y="-5.5" width="4" height="11" fill="#c9b77a"></rect>
<circle cx="4" cy="0" r="5.5" fill="#cfe3f7" stroke="#4b5563" stroke-width="1.6"></circle>
</g>
</g></g></g></sc-if>
<sc-if value="{{X.has.knock}}"><g><g transform="translate({{X.at.knock.x}} {{X.at.knock.y}}) scale({{X.at.knock.s}})"><g>
<path d="M-30 -10 Q-36 0 -30 10 M-37 -15 Q-45 0 -37 15" fill="none" stroke="#6b6b66" stroke-width="2.2" stroke-linecap="round"><animate attributeName="opacity" values="0;0;1;0;1;0;0" keyTimes="0;0.2;0.3;0.45;0.55;0.7;1" dur="{{T.dur}}" repeatCount="indefinite"></animate></path>
<path d="M30 -10 Q36 0 30 10 M37 -15 Q45 0 37 15" fill="none" stroke="#6b6b66" stroke-width="2.2" stroke-linecap="round"><animate attributeName="opacity" values="0;0;1;0;1;0;0" keyTimes="0;0.2;0.3;0.45;0.55;0.7;1" dur="{{T.dur}}" repeatCount="indefinite"></animate></path>
</g></g></g></sc-if>
<sc-if value="{{X.has.scratchWire}}"><g><g transform="translate({{X.at.scratchWire.x}} {{X.at.scratchWire.y}}) scale({{X.at.scratchWire.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="rotate" values="-10 8 14;10 8 14;-10 8 14" dur="0.35s" repeatCount="indefinite"></animateTransform><path d="M10 22 Q16 2 6 -4 Q-2 -8 -6 -2" fill="none" stroke="#7d8792" stroke-width="5" stroke-linecap="round"></path><path d="M10 22 Q16 2 6 -4 Q-2 -8 -6 -2" fill="none" stroke="#b9c1ca" stroke-width="2.6" stroke-linecap="round"></path></g>
<path d="M-12 -10 Q-10 -13 -8 -10 Q-6 -7 -4 -10" fill="none" stroke="#6b6b66" stroke-width="1.4"><animate attributeName="opacity" values="0;1;0" dur="0.5s" repeatCount="indefinite"></animate></path>
</g></g></g></sc-if>
<sc-if value="{{X.has.tapWire}}"><g><g transform="translate({{X.at.tapWire.x}} {{X.at.tapWire.y}}) scale({{X.at.tapWire.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="translate" values="0 0;0 4;0 0;0 4;0 0;0 0" dur="1.1s" repeatCount="indefinite"></animateTransform><path d="M-10 -16 Q0 -20 2 -8 L2 0" fill="none" stroke="#7d8792" stroke-width="4.5" stroke-linecap="round"></path><path d="M-10 -16 Q0 -20 2 -8 L2 0" fill="none" stroke="#b9c1ca" stroke-width="2.2" stroke-linecap="round"></path></g>
<path d="M6 2 L10 -1 M6 6 L11 6" fill="none" stroke="#6b6b66" stroke-width="1.4" stroke-linecap="round"><animate attributeName="opacity" values="0;1;0;1;0;0" dur="1.1s" repeatCount="indefinite"></animate></path>
</g></g></g></sc-if>
<sc-if value="{{X.has.coil}}"><g><g transform="translate({{X.at.coil.x}} {{X.at.coil.y}}) scale({{X.at.coil.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="scale" values="1 1;1.06 0.8;1 1" dur="1.6s" repeatCount="indefinite"></animateTransform>
<ellipse cx="0" cy="22" rx="17" ry="4.5" fill="none" stroke="#7d8792" stroke-width="5"></ellipse><ellipse cx="0" cy="22" rx="17" ry="4.5" fill="none" stroke="#b9c1ca" stroke-width="2.4"></ellipse>
<ellipse cx="0" cy="14" rx="16" ry="4.5" fill="none" stroke="#7d8792" stroke-width="5"></ellipse><ellipse cx="0" cy="14" rx="16" ry="4.5" fill="none" stroke="#b9c1ca" stroke-width="2.4"></ellipse>
<ellipse cx="0" cy="6" rx="15" ry="4.5" fill="none" stroke="#7d8792" stroke-width="5"></ellipse><ellipse cx="0" cy="6" rx="15" ry="4.5" fill="none" stroke="#b9c1ca" stroke-width="2.4"></ellipse>
<ellipse cx="0" cy="-2" rx="14" ry="4.5" fill="none" stroke="#7d8792" stroke-width="5"></ellipse><ellipse cx="0" cy="-2" rx="14" ry="4.5" fill="none" stroke="#b9c1ca" stroke-width="2.4"></ellipse>
<circle cx="-6" cy="-13" r="5.5" fill="#fff" stroke="#111" stroke-width="1.6"></circle><circle cx="6" cy="-13" r="5.5" fill="#fff" stroke="#111" stroke-width="1.6"></circle><circle cx="-5" cy="-12" r="2.4" fill="#111"></circle><circle cx="7" cy="-12" r="2.4" fill="#111"></circle>
<path d="M-12 -22 Q-6 -25 -1 -22 M1 -22 Q6 -25 12 -22" fill="none" stroke="#111" stroke-width="2.4" stroke-linecap="round"></path>
</g>
</g></g></g></sc-if>
<sc-if value="{{X.has.atom}}"><g><g transform="translate({{X.at.atom.x}} {{X.at.atom.y}}) scale({{X.at.atom.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="rotate" values="0;360" dur="8s" repeatCount="indefinite"></animateTransform>
<ellipse cx="0" cy="0" rx="26" ry="9" fill="none" stroke="#7d8792" stroke-width="4"></ellipse><ellipse cx="0" cy="0" rx="26" ry="9" fill="none" stroke="#b9c1ca" stroke-width="2"></ellipse>
<g transform="rotate(60)"><ellipse cx="0" cy="0" rx="26" ry="9" fill="none" stroke="#7d8792" stroke-width="4"></ellipse><ellipse cx="0" cy="0" rx="26" ry="9" fill="none" stroke="#b9c1ca" stroke-width="2"></ellipse></g>
<g transform="rotate(120)"><ellipse cx="0" cy="0" rx="26" ry="9" fill="none" stroke="#7d8792" stroke-width="4"></ellipse><ellipse cx="0" cy="0" rx="26" ry="9" fill="none" stroke="#b9c1ca" stroke-width="2"></ellipse></g>
<g><animateTransform attributeName="transform" type="rotate" values="0;360" dur="1.6s" repeatCount="indefinite"></animateTransform><circle cx="26" cy="0" r="4.5" fill="#fff" stroke="#111" stroke-width="1.5"></circle><circle cx="27" cy="0" r="2" fill="#111"></circle></g>
</g>
<circle cx="0" cy="0" r="8" fill="#fff" stroke="#111" stroke-width="2"></circle><circle cx="1.5" cy="1" r="3.6" fill="#111"></circle>
<path d="M-8 -12 Q0 -17 8 -12" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"></path>
</g></g></g></sc-if>
<sc-if value="{{X.has.check}}"><g><g transform="translate({{X.at.check.x}} {{X.at.check.y}}) scale({{X.at.check.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="scale" values="0.6;1.1;1;1" keyTimes="0;0.15;0.25;1" dur="{{T.dur}}" repeatCount="indefinite"></animateTransform>
<path d="M-24 -2 L-8 18 L26 -28" fill="none" stroke="#7d8792" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M-24 -2 L-8 18 L26 -28" fill="none" stroke="#b9c1ca" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"></path>
<circle cx="-22" cy="-14" r="5" fill="#fff" stroke="#111" stroke-width="1.5"></circle><circle cx="-11" cy="-16" r="5" fill="#fff" stroke="#111" stroke-width="1.5"></circle><circle cx="-21" cy="-13" r="2.2" fill="#111"></circle><circle cx="-10" cy="-15" r="2.2" fill="#111"></circle>
<path d="M-27 -23 Q-22 -26 -18 -23 M-15 -25 Q-10 -28 -6 -25" fill="none" stroke="#111" stroke-width="2.4" stroke-linecap="round"></path>
</g>
</g></g></g></sc-if>
<sc-if value="{{X.has.exclaim}}"><g><g transform="translate({{X.at.exclaim.x}} {{X.at.exclaim.y}}) scale({{X.at.exclaim.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="0.6s" repeatCount="indefinite"></animateTransform>
<path d="M0 -30 L0 8" fill="none" stroke="#7d8792" stroke-width="8" stroke-linecap="round"></path><path d="M0 -30 L0 8" fill="none" stroke="#b9c1ca" stroke-width="4.4" stroke-linecap="round"></path>
<circle cx="0" cy="22" r="6" fill="#b9c1ca" stroke="#7d8792" stroke-width="2"></circle>
<circle cx="-7" cy="-24" r="5" fill="#fff" stroke="#111" stroke-width="1.5"></circle><circle cx="7" cy="-24" r="5" fill="#fff" stroke="#111" stroke-width="1.5"></circle><circle cx="-7" cy="-23" r="2.2" fill="#111"></circle><circle cx="7" cy="-23" r="2.2" fill="#111"></circle>
<path d="M-12 -33 Q-7 -37 -2 -33 M2 -33 Q7 -37 12 -33" fill="none" stroke="#111" stroke-width="2.4" stroke-linecap="round"></path>
</g>
</g></g></g></sc-if>
<sc-if value="{{X.has.folder}}"><g><g transform="translate({{X.at.folder.x}} {{X.at.folder.y}}) scale({{X.at.folder.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="scale" values="0.7;1.05;1;1" keyTimes="0;0.15;0.25;1" dur="{{T.dur}}" repeatCount="indefinite"></animateTransform>
<path d="M-26 -16 L-8 -16 L-4 -11 L26 -11 L26 24 L-26 24 Z" fill="#e8bf4f" stroke="#b8860b" stroke-width="1.6" stroke-linejoin="round"></path>
<rect x="-18" y="-20" width="34" height="16" fill="#fbf1b8" stroke="#d8c46e" stroke-width="1"></rect>
<circle cx="-6" cy="-25" r="5" fill="#fff" stroke="#111" stroke-width="1.5"></circle><circle cx="6" cy="-25" r="5" fill="#fff" stroke="#111" stroke-width="1.5"></circle><circle cx="-6" cy="-23" r="2.2" fill="#111"></circle><circle cx="6" cy="-23" r="2.2" fill="#111"></circle>
<path d="M-26 -6 L26 -6 L26 24 L-26 24 Z" fill="#f6d77a" stroke="#b8860b" stroke-width="1.6" stroke-linejoin="round"></path>
</g>
</g></g></g></sc-if>
<sc-if value="{{X.has.tornado}}"><g><g transform="translate({{X.at.tornado.x}} {{X.at.tornado.y}}) scale({{X.at.tornado.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="rotate" values="-5;5;-5" dur="0.5s" repeatCount="indefinite"></animateTransform>
<ellipse cx="0" cy="-26" rx="25" ry="6" fill="none" stroke="#7d8792" stroke-width="4"></ellipse><ellipse cx="3" cy="-15" rx="19" ry="5" fill="none" stroke="#7d8792" stroke-width="4"></ellipse><ellipse cx="-2" cy="-5" rx="14" ry="4" fill="none" stroke="#7d8792" stroke-width="4"></ellipse><ellipse cx="2" cy="4" rx="10" ry="3" fill="none" stroke="#7d8792" stroke-width="4"></ellipse><ellipse cx="0" cy="12" rx="5" ry="2.4" fill="none" stroke="#7d8792" stroke-width="4"></ellipse>
<ellipse cx="0" cy="-26" rx="25" ry="6" fill="none" stroke="#b9c1ca" stroke-width="2"></ellipse><ellipse cx="3" cy="-15" rx="19" ry="5" fill="none" stroke="#b9c1ca" stroke-width="2"></ellipse><ellipse cx="-2" cy="-5" rx="14" ry="4" fill="none" stroke="#b9c1ca" stroke-width="2"></ellipse>
</g>
<g><animateTransform attributeName="transform" type="rotate" values="0;360" dur="1s" repeatCount="indefinite"></animateTransform><rect x="18" y="-24" width="7" height="9" fill="#fbf1b8" stroke="#d8c46e" stroke-width="0.8"></rect><rect x="-26" y="-14" width="6" height="8" fill="#fbf1b8" stroke="#d8c46e" stroke-width="0.8"></rect><rect x="8" y="2" width="5" height="6" fill="#fbf1b8" stroke="#d8c46e" stroke-width="0.8"></rect></g>
</g></g></g></sc-if>
<sc-if value="{{X.has.mobile}}"><g><g transform="translate({{X.at.mobile.x}} {{X.at.mobile.y}}) scale({{X.at.mobile.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="rotate" values="-10 0 -30;10 0 -30;-10 0 -30" dur="3s" repeatCount="indefinite"></animateTransform>
<path d="M0 -34 L0 -20 M-26 -20 L24 -20 M-18 -20 L-18 -8 M2 -20 L2 0 M18 -20 L18 -6" fill="none" stroke="#7d8792" stroke-width="2.6" stroke-linecap="round"></path>
<ellipse cx="-18" cy="0" rx="9" ry="8" fill="#fff" stroke="#4b5563" stroke-width="1.6"></ellipse><circle cx="-16" cy="1" r="3.6" fill="#111"></circle>
<path d="M-4 4 Q2 -2 8 4 Q4 12 -2 10 Z" fill="#9aa3ad" stroke="#4b5563" stroke-width="1.4"></path>
<circle cx="18" cy="-2" r="4" fill="none" stroke="#7d8792" stroke-width="2.2"></circle><circle cx="18" cy="6" r="3" fill="none" stroke="#7d8792" stroke-width="2.2"></circle>
</g>
</g></g></g></sc-if>
<sc-if value="{{X.has.shovel}}"><g><g transform="translate({{X.at.shovel.x}} {{X.at.shovel.y}}) scale({{X.at.shovel.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="rotate" values="-12 2 8;14 2 8;-12 2 8" dur="1.2s" repeatCount="indefinite"></animateTransform>
<path d="M-8 -34 L4 8" fill="none" stroke="#7d8792" stroke-width="5" stroke-linecap="round"></path><path d="M-8 -34 L4 8" fill="none" stroke="#b9c1ca" stroke-width="2.6" stroke-linecap="round"></path>
<path d="M-4 6 L14 9 L11 26 L-3 23 Z" fill="#c0c7cf" stroke="#6b7480" stroke-width="1.6" stroke-linejoin="round"></path>
<circle cx="-12" cy="-30" r="4.5" fill="#fff" stroke="#111" stroke-width="1.4"></circle><circle cx="-3" cy="-32" r="4.5" fill="#fff" stroke="#111" stroke-width="1.4"></circle><circle cx="-11" cy="-29" r="2" fill="#111"></circle><circle cx="-2" cy="-31" r="2" fill="#111"></circle>
</g>
<rect x="10" y="20" width="6" height="7" fill="#fbf1b8" stroke="#d8c46e" stroke-width="0.8"><animateTransform attributeName="transform" type="translate" values="0 0;-24 -26" dur="1.2s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="1;0" dur="1.2s" repeatCount="indefinite"></animate></rect>
<rect x="14" y="22" width="5" height="6" fill="#fbf1b8" stroke="#d8c46e" stroke-width="0.8"><animateTransform attributeName="transform" type="translate" values="0 0;-14 -30" dur="1.2s" begin="0.4s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="1;0" dur="1.2s" begin="0.4s" repeatCount="indefinite"></animate></rect>
</g></g></g></sc-if>
<sc-if value="{{X.has.sheets}}"><g><g transform="translate({{X.at.sheets.x}} {{X.at.sheets.y}}) scale({{X.at.sheets.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<rect x="-6" y="-6" width="14" height="16" fill="#fffbe6" stroke="#b8a76a" stroke-width="1"><animateTransform attributeName="transform" type="translate" values="-10 0;18 4" dur="1.5s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="0;1;1;0" dur="1.5s" repeatCount="indefinite"></animate></rect>
<rect x="-6" y="-6" width="14" height="16" fill="#fffbe6" stroke="#b8a76a" stroke-width="1"><animateTransform attributeName="transform" type="translate" values="-10 0;18 4" dur="1.5s" begin="0.75s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="0;1;1;0" dur="1.5s" begin="0.75s" repeatCount="indefinite"></animate></rect>
</g></g></g></sc-if>
<sc-if value="{{X.has.plane}}"><g><g transform="translate({{X.at.plane.x}} {{X.at.plane.y}}) scale({{X.at.plane.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="translate" values="0 0;0 0;28 -34;60 -86" keyTimes="0;0.25;0.6;1" dur="{{T.dur}}" repeatCount="indefinite"></animateTransform>
<path d="M-12 2 L12 -7 L-3 9 Z" fill="#fbf1b8" stroke="#b8a76a" stroke-width="1.2" stroke-linejoin="round"></path><path d="M-3 9 L0 0 L12 -7" fill="none" stroke="#b8a76a" stroke-width="1"></path>
</g>
</g></g></g></sc-if>
<sc-if value="{{X.has.bike}}"><g><g transform="translate({{X.at.bike.x}} {{X.at.bike.y}}) scale({{X.at.bike.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="translate" values="{{X.bikeV}}" keyTimes="{{X.bikeKT}}" dur="{{T.dur}}" repeatCount="indefinite"></animateTransform>
<g transform="translate(-15 10)"><g><animateTransform attributeName="transform" type="rotate" values="0;360" dur="0.6s" repeatCount="indefinite"></animateTransform><circle cx="0" cy="0" r="10" fill="none" stroke="#7d8792" stroke-width="2.8"></circle><path d="M-10 0 L10 0 M0 -10 L0 10 M-7 -7 L7 7 M-7 7 L7 -7" fill="none" stroke="#b9c1ca" stroke-width="1"></path></g></g>
<g transform="translate(15 10)"><g><animateTransform attributeName="transform" type="rotate" values="0;360" dur="0.6s" repeatCount="indefinite"></animateTransform><circle cx="0" cy="0" r="10" fill="none" stroke="#7d8792" stroke-width="2.8"></circle><path d="M-10 0 L10 0 M0 -10 L0 10 M-7 -7 L7 7 M-7 7 L7 -7" fill="none" stroke="#b9c1ca" stroke-width="1"></path></g></g>
<path d="M-15 10 L-3 -4 L15 10 M-3 -4 L9 -4 L15 10 M9 -4 L11 -13 L16 -13" fill="none" stroke="#9aa3ad" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"></path>
<circle cx="13" cy="-21" r="4.5" fill="#fff" stroke="#111" stroke-width="1.4"></circle><circle cx="22" cy="-21" r="4.5" fill="#fff" stroke="#111" stroke-width="1.4"></circle><circle cx="14.5" cy="-21" r="2" fill="#111"></circle><circle cx="23.5" cy="-21" r="2" fill="#111"></circle>
</g>
</g></g></g></sc-if>
<sc-if value="{{X.has.notepad}}"><g><g transform="translate({{X.at.notepad.x}} {{X.at.notepad.y}}) scale({{X.at.notepad.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<rect x="-10" y="-12" width="17" height="22" rx="1.5" fill="#ffffff" stroke="#9aa3ad" stroke-width="1.2"></rect>
<path d="M-7 -6 L4 -6 M-7 -2 L4 -2 M-7 2 L4 2 M-7 6 L0 6" fill="none" stroke="#4b5563" stroke-width="1.1" stroke-dasharray="44" stroke-dashoffset="44"><animate attributeName="stroke-dashoffset" values="44;0;0" keyTimes="0;0.8;1" dur="2.4s" repeatCount="indefinite"></animate></path>
<g><animateTransform attributeName="transform" type="translate" values="-7 -6;4 -6;-7 -2;4 -2;-7 2;4 2;-7 6;0 6" dur="2.4s" repeatCount="indefinite"></animateTransform><path d="M0 0 L8 -9 L10.5 -6.5 L2.5 2.5 Z" fill="#f6c445" stroke="#8a6420" stroke-width="0.9" stroke-linejoin="round"></path><path d="M0 0 L2.5 2.5 L-1 3.5 Z" fill="#4b5563"></path></g>
</g></g></g></sc-if>
<sc-if value="{{X.has.arrowDown}}"><g><g transform="translate({{X.at.arrowDown.x}} {{X.at.arrowDown.y}}) scale({{X.at.arrowDown.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="translate" values="0 -3;0 3;0 -3" dur="0.9s" repeatCount="indefinite"></animateTransform><path d="M0 -12 L0 8 M-7 1 L0 9 L7 1" fill="none" stroke="#2f6fde" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"></path></g>
</g></g></g></sc-if>
<sc-if value="{{X.has.butterfly}}"><g><g transform="translate({{X.at.butterfly.x}} {{X.at.butterfly.y}}) scale({{X.at.butterfly.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="translate" values="-34 4;-12 -14;14 -8;30 6;10 12;-34 4" dur="{{T.dur}}" repeatCount="indefinite"></animateTransform>
<g><animateTransform attributeName="transform" type="scale" values="1 1;1 0.25;1 1" dur="0.25s" repeatCount="indefinite"></animateTransform><path d="M0 0 Q-10 -11 -11 -2 Q-9 5 0 0 Z M0 0 Q10 -11 11 -2 Q9 5 0 0 Z" fill="#3ab07a" stroke="#1d6b37" stroke-width="0.9"></path></g>
<path d="M0 -3 L0 4" fill="none" stroke="#1d3b2a" stroke-width="1.6" stroke-linecap="round"></path>
</g>
</g></g></g></sc-if>
<sc-if value="{{X.has.pettingHand}}"><g><g transform="translate({{X.at.pettingHand.x}} {{X.at.pettingHand.y}}) scale({{X.at.pettingHand.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="translate" values="8 -4;-6 2;8 -4" dur="1.2s" repeatCount="indefinite"></animateTransform>
<path d="M-14 -10 Q-22 -6 -20 2 Q-18 8 -10 8 L12 8 Q20 8 20 0 L20 -10 Z" fill="#ffffff" stroke="#4b5563" stroke-width="1.4" stroke-linejoin="round"></path>
<path d="M20 -10 L32 -10 L32 7 L20 7" fill="#e5e7eb" stroke="#4b5563" stroke-width="1.4" stroke-linejoin="round"></path>
<path d="M-12 -2 L8 -2 M-12 3 L8 3" fill="none" stroke="#9aa3ad" stroke-width="0.8"></path>
</g>
</g></g></g></sc-if>
<sc-if value="{{X.has.laptop}}"><g><g transform="translate({{X.at.laptop.x}} {{X.at.laptop.y}}) scale({{X.at.laptop.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<path d="M-17 -18 L17 -18 L17 4 L-17 4 Z" fill="#8b939c" stroke="#4b5563" stroke-width="1.4" stroke-linejoin="round"></path>
<circle cx="0" cy="-7" r="2.6" fill="#cfd5dc"></circle>
<path d="M-21 4 L21 4 L25 10 L-25 10 Z" fill="#6b7480" stroke="#4b5563" stroke-width="1.2" stroke-linejoin="round"></path>
</g></g></g></sc-if>
<sc-if value="{{X.has.printer}}"><g><g transform="translate({{X.at.printer.x}} {{X.at.printer.y}}) scale({{X.at.printer.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -18;0 -18;0 0" keyTimes="0;0.5;0.9;1" dur="{{T.dur}}" repeatCount="indefinite"></animateTransform><rect x="-8" y="-10" width="16" height="16" fill="#ffffff" stroke="#9aa3ad" stroke-width="0.8"></rect><ellipse cx="0" cy="-1" rx="3" ry="2.6" fill="#4b5563"></ellipse><circle cx="-3.5" cy="-5" r="1.2" fill="#4b5563"></circle><circle cx="0" cy="-6.2" r="1.2" fill="#4b5563"></circle><circle cx="3.5" cy="-5" r="1.2" fill="#4b5563"></circle></g>
<rect x="-14" y="-6" width="28" height="16" rx="3" fill="#f2a7b5" stroke="#b85a6b" stroke-width="1.4"></rect>
<rect x="-10" y="-8" width="20" height="3" fill="#d98a9a"></rect><circle cx="9" cy="3" r="1.6" fill="#2e9a52"></circle>
</g></g></g></sc-if>
<sc-if value="{{X.has.binary}}"><g><g transform="translate({{X.at.binary.x}} {{X.at.binary.y}}) scale({{X.at.binary.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g font-family="ui-monospace, Menlo, Consolas, monospace" font-size="8" font-weight="700" fill="#1f6b3a">
<g><animateTransform attributeName="transform" type="translate" values="0 -6;0 6;0 -6" dur="1.4s" repeatCount="indefinite"></animateTransform>
<text x="-24" y="-40">1010</text><text x="-2" y="-30">0110</text><text x="-26" y="-18">1101</text><text x="0" y="-6">0011</text><text x="-24" y="6">1001</text><text x="-2" y="18">0101</text><text x="-22" y="30">1110</text>
</g>
</g>
</g></g></g></sc-if>
<sc-if value="{{X.has.pawPrints}}"><g><g transform="translate({{X.at.pawPrints.x}} {{X.at.pawPrints.y}}) scale({{X.at.pawPrints.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g fill="#3b5bdb">
<g transform="translate(-32 -8) rotate(-15)"><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.8;1" dur="{{T.dur}}" repeatCount="indefinite"></animate><ellipse cx="0" cy="2" rx="4" ry="3.4"></ellipse><circle cx="-4" cy="-3" r="1.6"></circle><circle cx="0" cy="-5" r="1.7"></circle><circle cx="4" cy="-3" r="1.6"></circle></g>
<g transform="translate(-28 14) rotate(10)"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.2;0.3;0.8;1" dur="{{T.dur}}" repeatCount="indefinite"></animate><ellipse cx="0" cy="2" rx="4" ry="3.4"></ellipse><circle cx="-4" cy="-3" r="1.6"></circle><circle cx="0" cy="-5" r="1.7"></circle><circle cx="4" cy="-3" r="1.6"></circle></g>
<g transform="translate(30 -4) rotate(20)"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.4;0.5;0.8;1" dur="{{T.dur}}" repeatCount="indefinite"></animate><ellipse cx="0" cy="2" rx="4" ry="3.4"></ellipse><circle cx="-4" cy="-3" r="1.6"></circle><circle cx="0" cy="-5" r="1.7"></circle><circle cx="4" cy="-3" r="1.6"></circle></g>
<g transform="translate(32 16) rotate(-10)"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.55;0.65;0.8;1" dur="{{T.dur}}" repeatCount="indefinite"></animate><ellipse cx="0" cy="2" rx="4" ry="3.4"></ellipse><circle cx="-4" cy="-3" r="1.6"></circle><circle cx="0" cy="-5" r="1.7"></circle><circle cx="4" cy="-3" r="1.6"></circle></g>
</g>
</g></g></g></sc-if>
<sc-if value="{{X.has.shred}}"><g><g transform="translate({{X.at.shred.x}} {{X.at.shred.y}}) scale({{X.at.shred.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<rect x="-12" y="-14" width="24" height="26" fill="#fffbe6" stroke="#b8a76a" stroke-width="1"></rect>
<path d="M-8 -10 L4 10 M-3 -12 L9 8 M2 -13 L12 4" fill="none" stroke="#8a1f16" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="26" stroke-dashoffset="26"><animate attributeName="stroke-dashoffset" values="26;0;0" keyTimes="0;0.3;1" dur="1.2s" repeatCount="indefinite"></animate></path>
<rect x="8" y="-6" width="5" height="6" fill="#fffbe6" stroke="#b8a76a" stroke-width="0.7"><animateTransform attributeName="transform" type="translate" values="0 0;16 -14" dur="1.2s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite"></animate></rect>
<rect x="-12" y="0" width="5" height="5" fill="#fffbe6" stroke="#b8a76a" stroke-width="0.7"><animateTransform attributeName="transform" type="translate" values="0 0;-14 -12" dur="1.2s" begin="0.3s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="0;1;0" dur="1.2s" begin="0.3s" repeatCount="indefinite"></animate></rect>
</g></g></g></sc-if>
<sc-if value="{{X.has.scoreCard}}"><g><g transform="translate({{X.at.scoreCard.x}} {{X.at.scoreCard.y}}) scale({{X.at.scoreCard.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<rect x="-11" y="-14" width="22" height="26" rx="2" fill="#ffffff" stroke="#4b5563" stroke-width="1.4"></rect>
<text x="0" y="5" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-weight="800" font-size="14" fill="#1e3f80">10</text>
</g></g></g></sc-if>
<sc-if value="{{X.has.envelopeMouth}}"><g><g transform="translate({{X.at.envelopeMouth.x}} {{X.at.envelopeMouth.y}}) scale({{X.at.envelopeMouth.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="rotate" values="-6;6;-6" dur="0.8s" repeatCount="indefinite"></animateTransform><rect x="-10" y="-6" width="20" height="13" rx="1.5" fill="#fff" stroke="#4b5563" stroke-width="1.2"></rect><path d="M-10 -5 L0 2 L10 -5" fill="none" stroke="#4b5563" stroke-width="1.1"></path></g>
</g></g></g></sc-if>
<sc-if value="{{X.has.paperMouth}}"><g><g transform="translate({{X.at.paperMouth.x}} {{X.at.paperMouth.y}}) scale({{X.at.paperMouth.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="rotate" values="-6;6;-6" dur="0.5s" repeatCount="indefinite"></animateTransform><path d="M-8 -2 L10 -6 L12 14 L-6 16 Z" fill="#fff" stroke="#9aa3ad" stroke-width="1" stroke-linejoin="round"></path><path d="M-4 3 L8 0 M-3 7 L9 4 M-2 11 L6 9" fill="none" stroke="#9aa3ad" stroke-width="0.8"></path></g>
</g></g></g></sc-if>
<sc-if value="{{X.has.book}}"><g><g transform="translate({{X.at.book.x}} {{X.at.book.y}}) scale({{X.at.book.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<path d="M-24 -6 L24 -6 L24 12 L-24 12 Z" fill="#8b1e1e" stroke="#5c1414" stroke-width="1.2" stroke-linejoin="round"></path>
<path d="M0 -4 Q-11 -9 -22 -5 L-22 10 Q-11 6 0 10 Z" fill="#fffbf0" stroke="#b8a76a" stroke-width="0.8"></path>
<path d="M0 -4 Q11 -9 22 -5 L22 10 Q11 6 0 10 Z" fill="#fffbf0" stroke="#b8a76a" stroke-width="0.8"></path>
<path d="M-18 -1 L-4 1 M-18 3 L-4 5 M4 1 L18 -1 M4 5 L18 3" fill="none" stroke="#9aa3ad" stroke-width="0.8"></path>
<g><animateTransform attributeName="transform" type="scale" values="1 1;1 1;-1 1;-1 1" keyTimes="0;0.6;0.8;1" dur="2.4s" repeatCount="indefinite"></animateTransform><path d="M0 -4 Q11 -9 22 -5 L22 10 Q11 6 0 10 Z" fill="#fffbf0" stroke="#b8a76a" stroke-width="0.8"></path></g>
</g></g></g></sc-if>
<sc-if value="{{X.has.desk}}"><g><g transform="translate({{X.at.desk.x}} {{X.at.desk.y}}) scale({{X.at.desk.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<rect x="20" y="-26" width="18" height="14" rx="1.5" fill="#1f2937" stroke="#4b5563" stroke-width="1"></rect><rect x="22" y="-24" width="14" height="10" fill="#3b82f6" fill-opacity="0.5"><animate attributeName="opacity" values="0.6;1;0.6" dur="1.2s" repeatCount="indefinite"></animate></rect><rect x="27" y="-12" width="4" height="10" fill="#4b5563"></rect>
<rect x="-34" y="-2" width="72" height="6" rx="1.5" fill="#8b5a2b" stroke="#5c3a1a" stroke-width="1.2"></rect>
<rect x="-30" y="4" width="64" height="26" fill="#a0693a" stroke="#5c3a1a" stroke-width="1.2"></rect>
<rect x="-14" y="-6" width="28" height="4" rx="1" fill="#4b5563"></rect>
</g></g></g></sc-if>
<sc-if value="{{X.has.painting}}"><g><g transform="translate({{X.at.painting.x}} {{X.at.painting.y}}) scale({{X.at.painting.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<rect x="-17" y="-15" width="34" height="28" fill="#9fd0f5" stroke="#c98a12" stroke-width="4"></rect>
<circle cx="8" cy="-6" r="4" fill="#f6c445"></circle><path d="M-15 11 Q-6 -2 2 6 Q8 0 15 8 L15 11 Z" fill="#3a9a4a"></path>
</g></g></g></sc-if>
<sc-if value="{{X.has.trophy}}"><g><g transform="translate({{X.at.trophy.x}} {{X.at.trophy.y}}) scale({{X.at.trophy.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<path d="M-10 -14 L10 -14 Q10 0 0 3 Q-10 0 -10 -14 Z" fill="#f2c230" stroke="#a87d00" stroke-width="1.4" stroke-linejoin="round"></path>
<path d="M-10 -11 Q-16 -11 -14 -4 Q-12 0 -6 -1 M10 -11 Q16 -11 14 -4 Q12 0 6 -1" fill="none" stroke="#a87d00" stroke-width="1.8"></path>
<rect x="-2" y="3" width="4" height="6" fill="#f2c230" stroke="#a87d00" stroke-width="1"></rect><rect x="-7" y="9" width="14" height="4" rx="1" fill="#a87d00"></rect>
<path transform="translate(7 -18) scale(0.5)" d="M0 -8 Q1.2 -1.2 8 0 Q1.2 1.2 0 8 Q-1.2 1.2 -8 0 Q-1.2 -1.2 0 -8 Z" fill="#fff6c2"><animate attributeName="opacity" values="0;1;0" dur="0.9s" repeatCount="indefinite"></animate></path>
</g></g></g></sc-if>
<sc-if value="{{X.has.trumpet}}"><g><g transform="translate({{X.at.trumpet.x}} {{X.at.trumpet.y}}) scale({{X.at.trumpet.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<path d="M7 1 L20 -1 L20 18 L13.5 14 L7 18 Z" fill="#b3261e" stroke="#7a1712" stroke-width="1" stroke-linejoin="round"></path>
<path d="M0 0 L24 -3" fill="none" stroke="#e0b020" stroke-width="3.2" stroke-linecap="round"></path>
<path d="M22 -4 L34 -13 L34 7 Z" fill="#f2c230" stroke="#a87d00" stroke-width="1.2" stroke-linejoin="round"></path>
<g><animateTransform attributeName="transform" type="translate" values="0 0;8 -14" dur="1.2s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="1;0" dur="1.2s" repeatCount="indefinite"></animate><circle cx="38" cy="-8" r="2" fill="#4b5563"></circle><path d="M40 -8 L40 -16 L44 -14" fill="none" stroke="#4b5563" stroke-width="1.2"></path></g>
</g></g></g></sc-if>
<sc-if value="{{X.has.cauldron}}"><g><g transform="translate({{X.at.cauldron.x}} {{X.at.cauldron.y}}) scale({{X.at.cauldron.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<circle cx="-8" cy="-6" r="2.6" fill="#8ff0b6"><animateTransform attributeName="transform" type="translate" values="0 0;-2 -14" dur="1.2s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="1;0" dur="1.2s" repeatCount="indefinite"></animate></circle>
<circle cx="5" cy="-6" r="2.2" fill="#8ff0b6"><animateTransform attributeName="transform" type="translate" values="0 0;2 -16" dur="1.2s" begin="0.5s" repeatCount="indefinite"></animateTransform><animate attributeName="opacity" values="1;0" dur="1.2s" begin="0.5s" repeatCount="indefinite"></animate></circle>
<ellipse cx="0" cy="-2" rx="22" ry="5" fill="#57d38c"></ellipse>
<path d="M-22 -2 Q-22 22 0 22 Q22 22 22 -2 Z" fill="#3b3b3b" stroke="#1f1f1f" stroke-width="1.4" stroke-linejoin="round"></path>
<ellipse cx="0" cy="-2" rx="23" ry="5" fill="none" stroke="#5b5b5b" stroke-width="2.4"></ellipse>
</g></g></g></sc-if>
<sc-if value="{{X.has.crystal}}"><g><g transform="translate({{X.at.crystal.x}} {{X.at.crystal.y}}) scale({{X.at.crystal.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<circle cx="0" cy="0" r="14" fill="#8ff0b6" fill-opacity="0.35"><animate attributeName="r" values="12;18;12" dur="1.4s" repeatCount="indefinite"></animate></circle>
<ellipse cx="0" cy="12" rx="10" ry="3.5" fill="#6b4a2a"></ellipse>
<circle cx="0" cy="0" r="11" fill="#57d38c" fill-opacity="0.9" stroke="#1d6b37" stroke-width="1.2"></circle>
<circle cx="-4" cy="-4" r="3.5" fill="#ffffff" fill-opacity="0.7"></circle>
</g></g></g></sc-if>
<sc-if value="{{X.has.quill}}"><g><g transform="translate({{X.at.quill.x}} {{X.at.quill.y}}) scale({{X.at.quill.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="translate" values="{{X.quillV}}" keyTimes="{{RIG.kt}}" dur="{{RIG.dur}}" repeatCount="indefinite"></animateTransform><path d="M0 0 L8 -14 Q12 -22 6 -24 Q0 -18 0 0 Z" fill="#ffffff" stroke="#8d8d86" stroke-width="1" stroke-linejoin="round"></path><path d="M0 0 L7 -18" fill="none" stroke="#8d8d86" stroke-width="0.8"></path></g>
</g></g></g></sc-if>
<sc-if value="{{X.has.cloud}}"><g><g transform="translate({{X.at.cloud.x}} {{X.at.cloud.y}}) scale({{X.at.cloud.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="scale" values="0.3;1.2;1.4" keyTimes="0;0.5;1" dur="{{T.dur}}" repeatCount="indefinite"></animateTransform>
<circle cx="0" cy="0" r="8" fill="#ffffff" stroke="#c4c4be" stroke-width="1.2"></circle><circle cx="9" cy="-3" r="7" fill="#ffffff" stroke="#c4c4be" stroke-width="1.2"></circle><circle cx="-8" cy="2" r="6" fill="#ffffff" stroke="#c4c4be" stroke-width="1.2"></circle><circle cx="3" cy="5" r="6" fill="#ffffff"></circle>
</g>
</g></g></g></sc-if>
<sc-if value="{{X.has.spiral}}"><g><g transform="translate({{X.at.spiral.x}} {{X.at.spiral.y}}) scale({{X.at.spiral.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g><animateTransform attributeName="transform" type="rotate" values="0;360" dur="1.2s" repeatCount="indefinite"></animateTransform>
<path transform="translate(11 0) scale(0.5)" d="M0 -8 Q1.2 -1.2 8 0 Q1.2 1.2 0 8 Q-1.2 1.2 -8 0 Q-1.2 -1.2 0 -8 Z" fill="#ffe27a" stroke="#b8860b" stroke-width="1.4"></path>
<path transform="translate(0 11) scale(0.4)" d="M0 -8 Q1.2 -1.2 8 0 Q1.2 1.2 0 8 Q-1.2 1.2 -8 0 Q-1.2 -1.2 0 -8 Z" fill="#ffe27a" stroke="#b8860b" stroke-width="1.4"></path>
<path transform="translate(-11 0) scale(0.5)" d="M0 -8 Q1.2 -1.2 8 0 Q1.2 1.2 0 8 Q-1.2 1.2 -8 0 Q-1.2 -1.2 0 -8 Z" fill="#ffe27a" stroke="#b8860b" stroke-width="1.4"></path>
<path transform="translate(0 -11) scale(0.4)" d="M0 -8 Q1.2 -1.2 8 0 Q1.2 1.2 0 8 Q-1.2 1.2 -8 0 Q-1.2 -1.2 0 -8 Z" fill="#ffe27a" stroke="#b8860b" stroke-width="1.4"></path>
</g>
</g></g></g></sc-if>
<sc-if value="{{X.has.soundWaves}}"><g><g transform="translate({{X.at.soundWaves.x}} {{X.at.soundWaves.y}}) scale({{X.at.soundWaves.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<path d="M10 -6 Q14 0 10 6 M15 -10 Q21 0 15 10" fill="none" stroke="#6b6b66" stroke-width="1.8" stroke-linecap="round"><animate attributeName="opacity" values="0;1;0" dur="0.9s" repeatCount="indefinite"></animate></path>
</g></g></g></sc-if>
<sc-if value="{{X.has.clap}}"><g><g transform="translate({{X.at.clap.x}} {{X.at.clap.y}}) scale({{X.at.clap.s}})"><g>
<path d="M0 -8 L0 -14 M-7 -6 L-11 -10 M7 -6 L11 -10" fill="none" stroke="#f6a623" stroke-width="2" stroke-linecap="round"><animate attributeName="opacity" values="0;0;1;0;1;0;0" keyTimes="0;0.15;0.2;0.4;0.6;0.75;1" dur="{{T.dur}}" repeatCount="indefinite"></animate></path>
</g></g></g></sc-if>
<sc-if value="{{X.has.pawPads}}"><g><g transform="translate({{X.at.pawPads.x}} {{X.at.pawPads.y}}) scale({{X.at.pawPads.s}})"><g><animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.3;0.35;0.7;0.75;1" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<g transform="translate(-14 0)"><circle cx="0" cy="0" r="9" fill="#f5cf7c" stroke="#b8862e" stroke-width="1.6"></circle><ellipse cx="0" cy="2" rx="4" ry="3.2" fill="#f2a7b5"></ellipse><circle cx="-4" cy="-3.5" r="1.6" fill="#f2a7b5"></circle><circle cx="0" cy="-5" r="1.6" fill="#f2a7b5"></circle><circle cx="4" cy="-3.5" r="1.6" fill="#f2a7b5"></circle></g>
<g transform="translate(14 0)"><circle cx="0" cy="0" r="9" fill="#f5cf7c" stroke="#b8862e" stroke-width="1.6"></circle><ellipse cx="0" cy="2" rx="4" ry="3.2" fill="#f2a7b5"></ellipse><circle cx="-4" cy="-3.5" r="1.6" fill="#f2a7b5"></circle><circle cx="0" cy="-5" r="1.6" fill="#f2a7b5"></circle><circle cx="4" cy="-3.5" r="1.6" fill="#f2a7b5"></circle></g>
</g></g></g></sc-if>
<sc-if value="{{X.has.floppyHeld}}"><g><g transform="translate({{X.at.floppyHeld.x}} {{X.at.floppyHeld.y}}) scale({{X.at.floppyHeld.s}})"><g><animate attributeName="opacity" values="{{T.prop}}" keyTimes="{{T.kt}}" dur="{{T.dur}}" repeatCount="indefinite"></animate>
<rect x="-10" y="-10" width="20" height="20" rx="2" fill="#2f5fb3" stroke="#1e3a8a" stroke-width="1.4"></rect><rect x="-5.5" y="-10" width="11" height="7" fill="#d7dde6"></rect><rect x="2.5" y="-9" width="2" height="4.6" fill="#2f5fb3"></rect><rect x="-7" y="1" width="14" height="7.5" rx="1" fill="#fafaf9"></rect>
</g></g></g></sc-if>
</svg>`

const look = (v: unknown, path: string): unknown => path.split('.').reduce<any>((o, k) => (o == null ? o : o[k]), v)

/** An `<sc-if value="{{a.b}}">` block stays when the value is truthy; a `{{a.b}}` hole becomes the value. */
export const fill = (tpl: string, v: unknown): string =>
  tpl
    .replace(/<sc-if value="\{\{([\w.]+)\}\}">([\s\S]*?)<\/sc-if>/g, (_, k: string, inner: string) => (look(v, k) ? inner : ''))
    .replace(/\{\{([\w.]+)\}\}/g, (_, p: string) => String(look(v, p) ?? ''))

const r1 = n => Math.round(n * 100) / 100
const r3 = n => Math.round(n * 1000) / 1000
const pts = list => list.map(([x, y]) => r1(x) + ' ' + r1(y)).join(';')
const rot = (vals, c) => vals.map(v => v + ' ' + c[0] + ' ' + c[1]).join(';')
const even = n => Array.from({ length: n }, (_, i) => r3(i / (n - 1))).join(';')
const O = (cx, cy, rx, ry) => 'M' + r1(cx - rx) + ' ' + r1(cy) + ' A' + r1(rx) + ' ' + r1(ry) + ' 0 1 0 ' + r1(cx + rx) + ' ' + r1(cy) + ' A' + r1(rx) + ' ' + r1(ry) + ' 0 1 0 ' + r1(cx - rx) + ' ' + r1(cy) + ' Z'
const NAME = { clippy: 'Скріпка', wizard: 'Чарівник', dog: 'Пес', cat: 'Кіт' }

// characters: eye centres and sizes, brows, mouth, cheeks, tear and sweat anchors, body pivot, head pivot
const CH = {
  clippy: { pivot: [70, 195], center: [70, 100], u: 1.6, eye: { lx: 58, rx: 82, y: 40, a: 10, b: 10, scl: '#fff', pup: '#111', st: '#111', sw: 3, psw: 3.6, pr: 4, lid: 1 }, brow: { gap: 5, bl: 9, t: 3, c: '#111', o: '#111', w: 4.6, ow: 4.6, always: true }, m: { x: 70, y: 64, w: 10, c: '#111', sw: 3, smile: 'M60 64 Q70 72 80 64' }, cheek: { l: [46, 56], r: [94, 56], r0: 7 }, tear: [55, 52], sweat: [101, 28], extra: [92, 16] },
  wizard: { pivot: [60, 148], center: [60, 105], u: 1, eye: { lx: 53, rx: 67, y: 58, a: 3.6, b: 4, scl: '#fff', pup: '#222', st: '#333', sw: 1.2, psw: 1.7, pr: 1.9, lid: 0.5 }, brow: { gap: 2.6, bl: 5.5, t: 1.5, c: '#fbfbf8', o: '#7d7d76', w: 2.8, ow: 4.6, always: true }, m: { x: 60, y: 76.5, w: 5, c: '#8a5a4a', sw: 1.8 }, cheek: { l: [46.5, 62.5], r: [73.5, 62.5], r0: 3 }, tear: [53, 63], sweat: [83, 50], extra: [97, 24], arms: { SL: [40, 92], SR: [80, 92], L: [22, 126], R: [98, 126] } },
  dog: { pivot: [60, 148], center: [60, 105], head: [60, 88], u: 1, eye: { lx: 51, rx: 69, y: 57, a: 6, b: 7, scl: '#fff', pup: '#111', st: '#333', sw: 1.5, psw: 2.4, pr: 3.6, lid: 0.6 }, brow: { gap: 3, bl: 5.5, t: 2.5, c: '#8a5a00', o: '#8a5a00', w: 2.4, ow: 2.4 }, m: { x: 60, y: 77, w: 8, c: '#5a3a00', sw: 2, smile: 'M52 77 Q56 81 60 77 Q64 81 68 77' }, cheek: { l: [41, 70], r: [79, 70], r0: 4 }, tear: [49, 65], sweat: [88, 46], extra: [101, 22], tongue: true, legs: { SL: [47, 112], SR: [73, 112], L: [47, 145], R: [73, 145], hip: [82, 132] } },
  cat: { pivot: [60, 148], center: [60, 108], head: [60, 90], u: 1, eye: { lx: 50, rx: 70, y: 62, a: 3.4, b: 4.6, scl: '#2b2b2b', pup: '#fff', st: '#2b2b2b', sw: 1.2, psw: 2, pr: 1.1, lid: 0.5, cat: true }, brow: { gap: 3, bl: 4.5, t: 2, c: '#8a6420', o: '#8a6420', w: 2, ow: 2 }, m: { x: 60, y: 75.5, w: 7, c: '#6b4a1a', sw: 1.8, smile: 'M60 74.5 Q57 79 53 76.5 M60 74.5 Q63 79 67 76.5' }, cheek: { l: [41, 72], r: [79, 72], r0: 3.6 }, tear: [49, 68], sweat: [90, 50], extra: [103, 26], legs: { SL: [49, 118], SR: [71, 118], L: [49, 145], R: [71, 145], hip: [78, 134] } },
}

// emotions: eyes, look, brows, mouth, marks, body motion, tail / ears / hat
const DEF = { eyes: 'open', ek: 1, ps: 1, look: [0, 0.1], blink: '11s', glance: 'idle', brow: 'none', mouth: 'smile', x: [], motion: 'idle', tail: 'wag', ctail: 'swish', ears: 'neutral', cears: 'neutral', hat: 'sway', idle: false }
const E = {
  calm: { idle: true },
  worried: { ek: 1.1, look: [-0.5, 0.2], blink: '6s', glance: 'dart', brow: 'worried', mouth: 'frown', motion: 'nervous', tail: 'slow', ctail: 'nervous', ears: 'droop', cears: 'flat', hat: 'nervous' },
  panic: { ek: 1.2, ps: 0.7, look: [0, 0], blink: '12s', glance: 'none', brow: 'raised', mouth: 'O', x: ['sweat'], motion: 'shake', tail: 'up', ctail: 'puff', ears: 'perk', cears: 'back', hat: 'jitter' },
  talking: { blink: '9s', brow: 'raised', mouth: 'talk', motion: 'talk', idle: true },
  hello: { eyes: 'happy', brow: 'raised', mouth: 'grin', x: ['hand'], motion: 'wave', tail: 'fast', ctail: 'up', ears: 'perk', cears: 'perk', hat: 'bounce' },
  goodbye: { eyes: 'closed', brow: 'raised', mouth: 'smile', x: ['hand'], motion: 'wave', tail: 'slow', ctail: 'up', hat: 'bounce' },
  curious: { ek: 1.1, look: [-0.6, 0.6], brow: 'oneUp', mouth: 'o', x: ['quest'], motion: 'tilt', tail: 'slow', ctail: 'up', ears: 'perk', cears: 'perk', hat: 'tilt' },
  thinking: { look: [0.7, -0.75], blink: '12s', glance: 'none', brow: 'oneUp', mouth: 'flat', x: ['dots'], motion: 'drift', tail: 'slow', hat: 'still' },
  focused: { ek: 0.9, look: [0, 0.4], blink: '12s', glance: 'none', brow: 'focused', mouth: 'flat', x: ['gear'], motion: 'still', tail: 'still', ctail: 'still', ears: 'perk', cears: 'perk', hat: 'still' },
  investigating: { look: [0.8, 0.2], glance: 'scan', brow: 'oneUp', mouth: 'flat', x: ['magnifier'], motion: 'lean', tail: 'slow', ears: 'perk', cears: 'perk', hat: 'tilt' },
  writing: { look: [0.5, 0.7], glance: 'none', brow: 'focused', mouth: 'flat', x: ['pencil'], motion: 'drift', tail: 'slow', ears: 'perk', cears: 'perk', hat: 'still' },
  waiting: { ek: 1.05, look: [0, 0.8], glance: 'none', brow: 'raised', mouth: 'flat', x: ['hourglass'], motion: 'knock', tail: 'slow', ears: 'perk', cears: 'perk' },
  happy: { eyes: 'happy', mouth: 'grin', motion: 'bounce', tail: 'fast', ctail: 'up', ears: 'perk', cears: 'perk', hat: 'bounce' },
  celebrate: { eyes: 'star', brow: 'raised', mouth: 'grin', x: ['sparkle'], motion: 'jump', tail: 'fast', ctail: 'up', ears: 'perk', cears: 'perk', hat: 'bounce' },
  proud: { eyes: 'happy', brow: 'raised', mouth: 'smirk', x: ['check'], motion: 'nod', ctail: 'up', ears: 'perk', cears: 'perk', hat: 'still' },
  saving: { eyes: 'happy', brow: 'raised', mouth: 'smile', x: ['floppy'], motion: 'nod', ctail: 'up', ears: 'perk', cears: 'perk' },
  sending: { look: [0.8, -0.7], glance: 'none', brow: 'raised', mouth: 'o', x: ['envelope'], motion: 'tilt', tail: 'fast', ctail: 'up', ears: 'perk', cears: 'perk', hat: 'tilt' },
  trash: { look: [0.7, -0.2], glance: 'none', brow: 'focused', mouth: 'smirk', x: ['trash'], motion: 'still', tail: 'slow', hat: 'still' },
  idea: { ek: 1.2, ps: 0.85, look: [0.3, -0.7], glance: 'none', brow: 'raised', mouth: 'grin', x: ['bulb'], motion: 'pop', tail: 'fast', ctail: 'up', ears: 'perk', cears: 'perk', hat: 'bounce' },
  surprised: { ek: 1.3, ps: 0.6, look: [0, 0], glance: 'none', brow: 'raised', mouth: 'O', x: ['excl'], motion: 'pop', tail: 'up', ctail: 'up', ears: 'perk', cears: 'perk', hat: 'jitter' },
  confused: { ekL: 1.15, ekR: 0.85, look: [-0.4, -0.4], glance: 'dart', brow: 'oneUp', mouth: 'wavy', x: ['quest'], motion: 'wobble', tail: 'slow', ears: 'asym', cears: 'asym', hat: 'tilt' },
  sad: { ek: 0.95, look: [0, 0.8], blink: '8s', glance: 'none', brow: 'sad', mouth: 'frown', x: ['tear'], motion: 'droop', tail: 'down', ctail: 'limp', ears: 'droop', cears: 'flat', hat: 'droop' },
  annoyed: { eyes: 'half', look: [0, 0], glance: 'none', brow: 'angry', mouth: 'grit', x: ['anger', 'steam'], motion: 'stomp', tail: 'up', ctail: 'lash', ears: 'droop', cears: 'back', hat: 'jitter' },
  suspicious: { eyes: 'half', look: [0.9, 0], glance: 'none', brow: 'oneUp', mouth: 'flat', motion: 'lean', tail: 'still', ctail: 'nervous', ears: 'perk', cears: 'flat', hat: 'tilt' },
  alert: { ek: 1.2, ps: 0.8, look: [0.4, 0.1], glance: 'none', brow: 'raised', mouth: 'flat', x: ['warn'], motion: 'still', tail: 'up', ctail: 'up', ears: 'perk', cears: 'perk', hat: 'still' },
  scared: { ek: 1.25, ps: 0.55, look: [0, 0], glance: 'dart', brow: 'worried', mouth: 'wavy', x: ['sweat'], motion: 'tremble', tail: 'down', ctail: 'puff', ears: 'droop', cears: 'back', hat: 'jitter' },
  embarrassed: { look: [-0.9, 0.4], glance: 'none', brow: 'worried', mouth: 'wavy', x: ['blush', 'sweat'], motion: 'shy', tail: 'slow', ctail: 'limp', ears: 'droop', cears: 'flat', hat: 'tilt' },
  relieved: { eyes: 'closed', brow: 'worried', mouth: 'smile', x: ['sweat'], motion: 'sigh' },
  bored: { eyes: 'half', look: [-0.85, 0.1], glance: 'none', brow: 'flat', mouth: 'flat', motion: 'tap', tail: 'still', ctail: 'limp', ears: 'droop', hat: 'droop' },
  sleepy: { eyes: 'closed', mouth: 'o', x: ['zzz'], motion: 'breathe', tail: 'still', ctail: 'still', ears: 'droop', hat: 'droop' },
  love: { eyes: 'heart', brow: 'raised', mouth: 'smile', x: ['blush', 'heart'], motion: 'sway', tail: 'fast', ctail: 'up', ears: 'perk', cears: 'perk' },
}
const UK = { calm: 'спокій', worried: 'тривога', panic: 'паніка', talking: 'говорить', hello: 'привітання', goodbye: 'прощання', curious: 'цікавість', thinking: 'думає', focused: 'зосереджений', investigating: 'шукає', writing: 'пише', waiting: 'чекає', happy: 'радість', celebrate: 'тріумф', proud: 'гордість', saving: 'зберігає', sending: 'відправляє', trash: 'прибирає', idea: 'ідея', surprised: 'здивування', confused: 'розгубленість', sad: 'сум', annoyed: 'роздратування', suspicious: 'підозра', alert: 'насторога', scared: 'страх', embarrassed: 'збентеження', relieved: 'полегшення', bored: 'нудьга', sleepy: 'сонливість', love: 'вдячність' }

// the original Office behaviours, redrawn: e = emotion underneath, o = overrides, arms / legs / hind = rig keyframes,
// q = whole-body pose, sc = squash, props = drawn objects, tl = how the body and the objects swap, d = loop length
const K3 = '0;0.2;0.8;1', K6 = '0;0.15;0.35;0.55;0.75;1'
const up = (rest, t) => [rest, t, t, rest]
const W0 = { L: [22, 126], R: [98, 126] }, D0 = { L: [47, 145], R: [73, 145] }, C0 = { L: [49, 145], R: [71, 145] }
const LIE = { v: '1 1;1.12 0.6;1.12 0.6;1 1', kt: '0;0.15;0.85;1' }, CROUCH = { v: '1 1;1.06 0.8;1.06 0.8;1 1', kt: '0;0.15;0.85;1' }
const BEH = {
  clippy: {
    idle: { e: 'calm', d: '9s' },
    brows: { e: 'calm', o: { browFx: 'fast' }, d: '4s' },
    sideToSide: { e: 'calm', o: { glance: 'side', motion: 'still' }, d: '4s' },
    headScratch: { e: 'calm', o: { look: [0.4, -0.6], brow: 'oneUp', mouth: 'flat', motion: 'tilt', idle: false }, props: ['scratchWire'], tl: 'show', d: '4s' },
    fingerTap: { e: 'bored', o: { look: [0.6, 0.7] }, props: ['tapWire'], tl: 'always', d: '3s' },
    snooze: { e: 'sleepy', q: 'lieClip', tl: 'always', d: '8s' },
    ropePile: { e: 'calm', props: ['coil'], tl: 'swap', d: '6s' },
    atom: { e: 'thinking', o: { x: [] }, props: ['atom'], tl: 'swap', d: '5s' },
    look: { e: 'calm', o: { glance: 'around', idle: false }, d: '8s' },
    gesture: { e: 'calm', o: { look: [0.5, 0.8], brow: 'raised', idle: false }, props: ['arrowDown'], tl: 'show', d: '4s' },
    greeting: { e: 'hello', o: { x: [] }, props: ['bike'], bike: 'in', tl: 'rideIn', d: '5s' },
    goodbye: { e: 'goodbye', o: { x: [] }, props: ['bike'], bike: 'out', tl: 'rideOut', d: '5s' },
    wave: { e: 'hello', props: ['exclaim'], tl: 'late', d: '5s' },
    explain: { e: 'talking', d: '4s' },
    getAttention: { e: 'waiting', o: { x: [], ek: 1.2, motion: 'still' }, q: 'zoom135', props: ['knock'], tl: 'always', d: '3s' },
    alert: { e: 'alert', o: { x: [] }, props: ['headphones'], tl: 'show', d: '5s' },
    checking: { e: 'investigating', o: { x: [] }, props: ['glassesScan'], tl: 'swap', d: '6s' },
    searching: { e: 'investigating', o: { x: [], look: [0.9, 0], glance: 'none' }, props: ['telescope'], tl: 'show', d: '6s' },
    writing: { e: 'writing', o: { x: [] }, props: ['notepad'], tl: 'show', d: '5s' },
    processing: { e: 'focused', o: { x: [] }, props: ['shovel'], tl: 'swap', d: '4s' },
    save: { e: 'saving', o: { x: [] }, props: ['folder'], tl: 'swap', d: '5s' },
    print: { e: 'focused', o: { x: [] }, props: ['coil', 'sheets'], tl: 'swap', d: '6s' },
    sendMail: { e: 'sending', o: { x: [] }, props: ['plane'], tl: 'show', d: '5s' },
    emptyTrash: { e: 'trash', o: { x: [] }, props: ['tornado'], tl: 'swap', d: '5s' },
    congratulate: { e: 'celebrate', o: { x: [] }, props: ['check'], tl: 'swap', d: '4s' },
    getArtsy: { e: 'calm', props: ['mobile'], tl: 'swap', d: '5s' },
  },
  wizard: {
    idle: { e: 'calm', d: '9s' },
    wand: { e: 'calm', o: { look: [0.7, 0.3], idle: false }, arms: { R: up(W0.R, [86, 104]), kt: K3 }, spin: true, props: ['spiral'], tl: 'show', d: '5s' },
    clasp: { e: 'happy', o: { motion: 'idle', eyes: 'open', mouth: 'smile' }, arms: { L: [[54, 116]], R: [[66, 116]] }, d: '4s' },
    yawn: { e: 'sleepy', o: { mouth: 'yawn', x: [], motion: 'still' }, arms: { L: up(W0.L, [8, 70]), R: up(W0.R, [112, 70]), kt: K3 }, d: '4s' },
    lookDown: { e: 'calm', o: { look: [0, 0.9], glance: 'none', motion: 'still', idle: false }, d: '5s' },
    look: { e: 'calm', o: { glance: 'around', idle: false }, d: '8s' },
    gesture: { e: 'calm', o: { look: [0.6, 0.7], brow: 'raised', idle: false }, arms: { R: up(W0.R, [114, 112]), kt: K3 }, props: ['arrowDown'], tl: 'show', d: '4s' },
    greet: { e: 'hello', o: { eyes: 'closed', x: [], motion: 'still' }, sc: { v: '1 1;1 1;1.02 0.82;1.02 0.82;1 1;1 1', kt: '0;0.2;0.35;0.65;0.8;1' }, hatV: { v: [0, 0, -28, -28, 0, 0], kt: '0;0.2;0.35;0.65;0.8;1' }, arms: { R: [W0.R, W0.R, [84, 112], [84, 112], W0.R, W0.R], kt: '0;0.2;0.35;0.65;0.8;1' }, d: '3s' },
    wave: { e: 'hello', o: { x: [], motion: 'still' }, arms: { R: [W0.R, [104, 58], [112, 64], [104, 58], [112, 64], W0.R], kt: K6 }, d: '2.4s' },
    acknowledge: { e: 'happy', o: { eyes: 'open', mouth: 'smile', motion: 'nod' }, d: '1.6s' },
    think: { e: 'thinking', o: { x: [] }, arms: { R: [W0.R, [66, 98], [62, 104], [66, 98], [62, 104], W0.R], kt: K6 }, d: '5s' },
    suggest: { e: 'idea', o: { motion: 'still' }, arms: { R: up(W0.R, [104, 72]), kt: K3 }, d: '3s' },
    explain: { e: 'talking', arms: { L: up(W0.L, [6, 104]), R: up(W0.R, [114, 104]), kt: K3 }, d: '3s' },
    announce: { e: 'talking', o: { mouth: 'o', motion: 'still' }, arms: { R: up(W0.R, [74, 82]), kt: K3 }, props: ['trumpet'], tl: 'show', d: '4s' },
    decline: { e: 'sad', o: { eyes: 'closed', mouth: 'flat', x: [], tear: false, motion: 'no' }, arms: { L: up(W0.L, [8, 108]), R: up(W0.R, [112, 108]), kt: K3 }, d: '2.4s' },
    uncertain: { e: 'confused', o: { x: [], motion: 'still' }, sc: { v: '1 1;1 1.05;1 1.05;1 1', kt: K3 }, arms: { L: up(W0.L, [10, 100]), R: up(W0.R, [110, 100]), kt: K3 }, d: '2s' },
    confused: { e: 'confused', arms: { L: [W0.L, [8, 104], [8, 104], [8, 104], [8, 104], W0.L], R: [W0.R, [76, 44], [72, 48], [76, 44], [72, 48], W0.R], kt: K6 }, d: '3s' },
    dontRecognize: { e: 'curious', o: { x: [] }, arms: { R: up(W0.R, [80, 58]), kt: K3 }, props: ['soundWaves'], tl: 'show', d: '3s' },
    stopListening: { e: 'annoyed', o: { eyes: 'closed', mouth: 'flat', x: [], motion: 'still' }, arms: { L: up(W0.L, [42, 58]), R: up(W0.R, [78, 58]), kt: K3 }, d: '3s' },
    hearing: { e: 'curious', o: { x: [] }, props: ['bigEars'], tl: 'always', d: '4s' },
    getAttention: { e: 'waiting', o: { x: [], motion: 'still' }, q: 'zoom125', arms: { R: [W0.R, [96, 72], [92, 66], [96, 72], [92, 66], [96, 72], W0.R], kt: '0;0.15;0.3;0.45;0.6;0.75;1' }, props: ['knock'], tl: 'always', d: '3s' },
    alert: { e: 'alert', d: '3s' },
    surprised: { e: 'surprised', d: '2.4s' },
    sad: { e: 'sad', d: '4s' },
    read: { e: 'investigating', o: { x: [], look: [0, 0.9], glance: 'scan', motion: 'still' }, arms: { L: [[40, 112]], R: [[80, 112]] }, props: ['book'], tl: 'always', d: '5s' },
    write: { e: 'writing', o: { x: [], motion: 'still' }, arms: { L: [[40, 114]], R: [[70, 104], [78, 106], [70, 108], [78, 110], [70, 104]], kt: '0;0.25;0.5;0.75;1', d: '2s' }, props: ['book', 'quill'], tl: 'always', d: '4s' },
    search: { e: 'investigating', o: { x: [], look: [0, 0.8], glance: 'none', motion: 'still' }, arms: { L: [[46, 114]], R: [[74, 114]] }, props: ['crystal'], tl: 'always', d: '4s' },
    process: { e: 'focused', o: { x: [], look: [0, 0.9] }, arms: { L: [[40, 116]], R: [[72, 112], [64, 116], [72, 120], [80, 116], [72, 112]], kt: '0;0.25;0.5;0.75;1', d: '2s' }, props: ['cauldron'], tl: 'always', d: '4s' },
    magic1: { e: 'happy', o: { eyes: 'open', look: [0.7, -0.6], motion: 'still' }, arms: { R: up(W0.R, [104, 74]), kt: K3 }, spin: true, props: ['spiral'], tl: 'show', d: '3s' },
    magic2: { e: 'happy', o: { eyes: 'open', mouth: 'grin', motion: 'still' }, arms: { R: up(W0.R, [112, 98]), kt: K3 }, props: ['cloud'], tl: 'show', d: '3s' },
    congratulate: { e: 'celebrate', o: { x: [], motion: 'still' }, arms: { R: [W0.R, [100, 66], [100, 66], W0.R], kt: '0;0.2;0.85;1' }, props: ['trophy'], tl: 'show', d: '4s' },
    clap: { e: 'happy', o: { motion: 'still' }, arms: { L: [W0.L, [54, 112], [46, 112], [54, 112], [46, 112], W0.L], R: [W0.R, [66, 112], [74, 112], [66, 112], [74, 112], W0.R], kt: K6 }, props: ['clap'], tl: 'always', d: '2s' },
  },
  dog: {
    idle: { e: 'calm', d: '9s' },
    lookAround: { e: 'calm', o: { glance: 'around', motion: 'still', idle: false, head: { v: [0, 0, -12, -12, 12, 12, 0], kt: '0;0.15;0.2;0.45;0.5;0.8;1' } }, d: '6s' },
    sniffAir: { e: 'curious', o: { x: [], look: [0, -0.8], mouth: 'flat', sniff: 'fast', head: { v: [0, -10, -10, 0], kt: K3 } }, d: '4s' },
    pant: { e: 'happy', o: { eyes: 'open', motion: 'idle' }, d: '3s' },
    tilt: { e: 'curious', o: { x: [], head: { v: [0, 14, 14, 0], kt: K3 } }, d: '4s' },
    turnAround: { e: 'calm', o: { idle: false }, q: 'flip', d: '5s' },
    bigTongue: { e: 'happy', o: { tongueBig: true, motion: 'idle' }, d: '3s' },
    scratch: { e: 'calm', o: { eyes: 'happy', motion: 'still', idle: false, head: { v: [0, 12, 12, 0], kt: K3 } }, hind: { P: [[92, 64], [88, 58], [92, 64], [88, 58], [92, 64]], d: '0.4s' }, d: '3s' },
    sniffGround: { e: 'investigating', o: { x: [], look: [0, 1], glance: 'none', sniff: 'fast', head: { v: [0, 18, 18, 0], kt: K3 } }, q: 'sniffWalk', d: '6s' },
    impatient: { e: 'bored', o: { eyes: 'open', glance: 'around', motion: 'tap' }, legs: { L: [[66, 106]], R: [[54, 108]] }, d: '4s' },
    sleep: { e: 'sleepy', sc: LIE, d: '8s' },
    look: { e: 'calm', o: { glance: 'around', idle: false }, d: '8s' },
    gesture: { e: 'calm', o: { look: [0.6, 0.8], brow: 'raised', idle: false }, legs: { R: up(D0.R, [92, 128]), kt: K3 }, props: ['arrowDown'], tl: 'show', d: '4s' },
    greeting: { e: 'hello', o: { x: [] }, q: 'walkInDoor', props: ['door'], tl: 'walkIn', d: '5s' },
    goodbye: { e: 'goodbye', o: { x: [] }, q: 'walkOutDoor', props: ['door'], tl: 'walkOut', d: '5s' },
    wave: { e: 'happy', q: 'bow', d: '3s' },
    explain: { e: 'talking', o: { ears: 'asym' }, d: '3s' },
    hearing: { e: 'curious', o: { x: [], ears: 'asym' }, d: '3s' },
    alert: { e: 'alert', d: '3s' },
    thinking: { e: 'thinking', o: { x: [] }, legs: { R: [D0.R, [64, 88], [64, 88], D0.R], kt: '0;0.2;0.85;1' }, d: '5s' },
    getAttention: { e: 'waiting', o: { x: [], tail: 'fast', motion: 'still' }, q: 'zoom13', props: ['knock'], tl: 'always', d: '3s' },
    checking: { e: 'investigating', o: { x: [], look: [0, 0.9], glance: 'scan', motion: 'still' }, legs: { L: [[48, 114]], R: [[72, 114]] }, props: ['book'], tl: 'always', d: '5s' },
    writing: { e: 'writing', o: { x: [] }, legs: { L: [[52, 118], [52, 112], [52, 118]], R: [[68, 112], [68, 118], [68, 112]], d: '0.5s' }, props: ['desk'], tl: 'always', d: '4s' },
    save: { e: 'saving', o: { x: [] }, legs: { R: [D0.R, [84, 104], [84, 104], D0.R], kt: '0;0.2;0.85;1' }, props: ['floppyHeld'], tl: 'show', d: '4s' },
    print: { e: 'happy', o: { eyes: 'open', mouth: 'flat', motion: 'idle' }, props: ['paperMouth'], tl: 'always', d: '4s' },
    sendMail: { e: 'sending', o: { x: [], mouth: 'flat' }, props: ['envelopeMouth'], tl: 'always', d: '4s' },
    emptyTrash: { e: 'focused', o: { x: [] }, props: ['welder'], tl: 'always', d: '4s' },
    congratulate: { e: 'celebrate', o: { x: [], motion: 'still' }, legs: { R: [D0.R, [82, 100], [82, 100], D0.R], kt: '0;0.15;0.85;1' }, props: ['scoreCard', 'sunglasses'], tl: 'show', d: '5s' },
    getWizardy: { e: 'happy', o: { eyes: 'closed', mouth: 'smile', motion: 'still' }, props: ['sunburst'], tl: 'show', d: '3s' },
    getArtsy: { e: 'proud', o: { x: [], motion: 'still' }, legs: { L: [[48, 108]], R: [[72, 108]] }, props: ['painting'], tl: 'always', d: '4s' },
  },
  cat: {
    idle: { e: 'calm', d: '9s' },
    twitch: { e: 'calm', o: { cearV: { L: [0, 0, 0, 0, 0], R: [0, 16, 0, 16, 0], kt: '0;0.1;0.2;0.3;1', d: '2s' } }, d: '2s' },
    tailA: { e: 'calm', o: { ctailV: { v: [0, 30, -5, 30, 0], d: '1.4s' } }, d: '3s' },
    tailB: { e: 'calm', o: { ctailV: { v: [-20, 15, -20, 15, -20], d: '1.7s' } }, d: '3s' },
    tailC: { e: 'calm', o: { ctailV: { v: [0, -30, -30, 0, 0], d: '1.9s' } }, d: '3s' },
    tailD: { e: 'calm', o: { ctailV: { v: [0, 6, 0, 6, 0, 6, 0], d: '0.8s' } }, d: '3s' },
    yawn: { e: 'sleepy', o: { mouth: 'yawn', x: [], motion: 'still' }, d: '3s' },
    stretch: { e: 'calm', o: { eyes: 'closed', idle: false, ctail: 'up' }, q: 'bow', legs: { L: up(C0.L, [30, 146]), R: up(C0.R, [50, 146]), kt: K3 }, d: '4s' },
    scratch: { e: 'calm', o: { eyes: 'closed', motion: 'still', idle: false, head: { v: [0, 12, 12, 0], kt: K3 } }, hind: { P: [[86, 56], [82, 50], [86, 56], [82, 50], [86, 56]], d: '0.4s' }, d: '3s' },
    cleaning: { e: 'calm', o: { eyes: 'closed', mouth: 'smile', tongue: true, idle: false, head: { v: [0, -8, -8, 0], kt: K3 } }, legs: { R: [C0.R, [58, 74], [52, 66], [58, 74], [52, 66], C0.R], kt: K6 }, d: '3s' },
    legLick: { e: 'calm', o: { eyes: 'closed', tongue: true, idle: false, head: { v: [0, 10, 10, 0], kt: K3 } }, legs: { R: [C0.R, [60, 86], [60, 86], C0.R], kt: '0;0.2;0.85;1' }, d: '3s' },
    butterfly: { e: 'curious', o: { x: [], glance: 'scan' }, legs: { R: [C0.R, C0.R, [88, 74], C0.R], kt: '0;0.8;0.88;1' }, props: ['butterfly'], tl: 'always', d: '4s' },
    curlSleep: { e: 'sleepy', sc: LIE, d: '8s' },
    roll: { e: 'happy', q: 'roll', d: '4s' },
    look: { e: 'calm', o: { glance: 'around', idle: false }, d: '8s' },
    gesture: { e: 'calm', o: { look: [0.6, 0.8], brow: 'raised', idle: false }, legs: { R: up(C0.R, [90, 128]), kt: K3 }, props: ['arrowDown'], tl: 'show', d: '4s' },
    greeting: { e: 'hello', o: { x: [] }, q: 'walkIn', tl: 'walkInFade', d: '4s' },
    goodbye: { e: 'goodbye', o: { x: [] }, q: 'walkOut', tl: 'walkOutFade', d: '4s' },
    wave: { e: 'happy', q: 'rollHold', qc: [60, 84], props: ['pawPads'], tl: 'always', d: '4s' },
    explain: { e: 'talking', o: { ctailV: { v: [0, -30, -30, 0], d: '2s' } }, d: '3s' },
    thinking: { e: 'thinking', o: { x: [], head: { v: [0, 10, 10, 0], kt: K3 } }, d: '4s' },
    hearing: { e: 'curious', o: { x: [] }, q: 'zoom12', d: '3s' },
    alert: { e: 'alert', d: '3s' },
    getAttention: { e: 'waiting', o: { x: [], motion: 'still' }, q: 'zoom13', legs: { L: [C0.L, [44, 72], [48, 78], [44, 72], C0.L], R: [C0.R, [76, 72], [72, 78], [76, 72], C0.R], kt: '0;0.2;0.45;0.7;1' }, props: ['knock'], tl: 'always', d: '3s' },
    getWizardy: { e: 'happy', q: 'zoom13', d: '3s' },
    checking: { e: 'writing', o: { x: [], motion: 'still' }, legs: { R: [[66, 112], [70, 114], [66, 112]], d: '0.6s' }, props: ['catGlasses', 'notepad'], tl: 'always', d: '4s' },
    searching: { e: 'investigating', o: { x: [], look: [0.8, 0.6], glance: 'scan', cears: 'perk' }, sc: CROUCH, q: 'creep', d: '5s' },
    writing: { e: 'writing', o: { x: [] }, sc: { v: '1 1;1.1 0.7;1.1 0.7;1 1', kt: '0;0.1;0.9;1' }, props: ['notepad'], tl: 'always', d: '5s' },
    save: { e: 'saving', o: { x: [] }, legs: { R: up(C0.R, [92, 118]), kt: K3 }, props: ['cabinet'], tl: 'always', d: '4s' },
    print: { e: 'happy', o: { x: [] }, props: ['printer'], tl: 'always', d: '4s' },
    sendMail: { e: 'focused', o: { x: [], look: [0, 0.9] }, legs: { L: [[52, 122], [52, 117], [52, 122]], R: [[68, 117], [68, 122], [68, 117]], d: '0.4s' }, props: ['laptop'], tl: 'always', d: '4s' },
    emptyTrash: { e: 'annoyed', o: { x: [] }, legs: { R: [C0.R, [84, 112], [66, 126], [84, 112], C0.R], kt: '0;0.25;0.5;0.75;1', d: '1.2s' }, props: ['shred'], tl: 'always', d: '4s' },
    congratulate: { e: 'love', o: { eyes: 'happy', x: [], cears: 'flat' }, props: ['pettingHand'], tl: 'always', d: '4s' },
    getTechy: { e: 'focused', o: { x: [] }, props: ['binary'], tl: 'dim', d: '4s' },
    getArtsy: { e: 'happy', o: { x: [], motion: 'still' }, legs: { L: [C0.L, [42, 118], C0.L, C0.L, C0.L], R: [C0.R, C0.R, C0.R, [78, 118], C0.R], kt: '0;0.2;0.4;0.6;1' }, props: ['pawPrints'], tl: 'always', d: '4s' },
  },
}

export const EMOTIONS: readonly string[] = Object.keys(E)
export const BEHAVIORS: Record<Who, readonly string[]> = { clippy: Object.keys(BEH.clippy), wizard: Object.keys(BEH.wizard), dog: Object.keys(BEH.dog), cat: Object.keys(BEH.cat) }
export { NAME, UK }

function vals(props: { who: Who; emotion?: string; behavior?: string; w?: number; mood?: string; talking?: boolean }): any {
  const who = NAME[props.who] ? props.who : 'clippy'
  const talking = props.talking === true || props.talking === 'true'
  const w = Number(props.w ?? 92)

  const bh = (BEH[who] || {})[props.behavior] || null
  const id0 = bh ? bh.e : props.emotion || (talking ? 'talking' : props.mood || 'calm')
  const id = E[id0] ? id0 : 'calm'
  const s = Object.assign({}, DEF, E[id], bh && bh.o ? bh.o : {})
  const c = CH[who], e = c.eye, has = k => s.x.indexOf(k) >= 0
  const dur = (bh && bh.d) || '6s'

  // irregular blinking: two single blinks and one double blink per cycle; the cat adds a slow blink while calm
  const slowBlink = e.cat && s.idle ? 0.66 : null
  const marks = slowBlink == null ? [0.17, 0.52, 0.56, 0.86] : [0.17, 0.86]
  const win = marks.map(t => [t - 0.01, t, t + 0.006, t + 0.018])
  if (slowBlink != null) win.push([slowBlink, slowBlink + 0.04, slowBlink + 0.1, slowBlink + 0.14])
  win.sort((p, q) => p[0] - q[0])
  const bk = [0]; win.forEach(x => bk.push(x[0], x[1], x[2], x[3])); bk.push(1)
  const bseq = (open, shut) => { const out = [open]; win.forEach(() => out.push(open, shut, shut, open)); out.push(open); return out.map(r1).join(';'); }

  // eyes
  const wideCat = e.cat && (s.ekL || s.ek) >= 1.2
  const star = R => { const p = []; for (let i = 0; i < 10; i++) { const rr = i % 2 ? R * 0.45 : R; const an = -Math.PI / 2 + i * Math.PI / 5; p.push(r1(rr * Math.cos(an)) + ' ' + r1(rr * Math.sin(an))); } return 'M' + p.join(' L') + ' Z'; }
  const gap = (e.rx - e.lx) / 2
  const eye = side => {
    const k = (side === 'L' ? s.ekL : s.ekR) ?? s.ek
    const cx = side === 'L' ? e.lx : e.rx
    const a = e.a * k, b = e.b * k
    const sclFill = wideCat ? '#ffffff' : e.scl, pupFill = wideCat ? '#2b2b2b' : e.pup
    let pr = (wideCat ? 1.6 : e.pr) * s.ps * (e.cat ? 1 : k)
    let px = cx + s.look[0] * Math.max(0, a - pr) * 0.8, py = e.y + s.look[1] * Math.max(0, b - pr) * 0.8
    if (e.cat && !wideCat) { px = cx + 0.3 * a + s.look[0] * 0.3 * a; py = e.y - 0.3 * b + s.look[1] * 0.3 * b; }
    const o = { cx, a: r1(a), b: r1(b), sclFill, pupFill, scl: 0, path: 0, pup: 0, d: 'M0 0', fill: 'none', stroke: e.st, sw: e.psw }
    if (s.eyes === 'open') { o.scl = 1; o.pup = 1; }
    if (s.eyes === 'half') { o.path = 1; o.pup = 1; o.d = 'M' + r1(-a) + ' 0 A' + r1(a) + ' ' + r1(b) + ' 0 0 0 ' + r1(a) + ' 0 Z'; o.fill = sclFill; o.sw = e.sw * 1.4; py = e.y + (e.cat ? 0.25 : 0.42) * b; pr = pr * 0.8; px = cx + s.look[0] * Math.max(0, a - pr) * 0.75; }
    if (s.eyes === 'happy') { o.path = 1; o.d = 'M' + r1(-a * 1.1) + ' ' + r1(0.35 * b) + ' Q0 ' + r1(-0.95 * b) + ' ' + r1(a * 1.1) + ' ' + r1(0.35 * b); }
    if (s.eyes === 'closed') { o.path = 1; o.d = 'M' + r1(-a * 1.1) + ' ' + r1(-0.1 * b) + ' Q0 ' + r1(0.75 * b) + ' ' + r1(a * 1.1) + ' ' + r1(-0.1 * b); }
    if (s.eyes === 'heart') { const h = Math.min(b * 1.15, gap * 0.95); o.path = 1; o.d = 'M0 ' + r1(0.9 * h) + ' C' + r1(-1.3 * h) + ' ' + r1(0.1 * h) + ' ' + r1(-0.95 * h) + ' ' + r1(-0.95 * h) + ' 0 ' + r1(-0.4 * h) + ' C' + r1(0.95 * h) + ' ' + r1(-0.95 * h) + ' ' + r1(1.3 * h) + ' ' + r1(0.1 * h) + ' 0 ' + r1(0.9 * h) + ' Z'; o.fill = '#e5484d'; o.stroke = '#a3262b'; o.sw = e.sw * 0.6; }
    if (s.eyes === 'star') { o.path = 1; o.d = star(Math.min(b * 1.25, gap * 0.9)); o.fill = '#f6c445'; o.stroke = '#b8860b'; o.sw = e.sw * 0.6; }
    o.px = r1(px); o.py = r1(py); o.pr = r1(pr)
    o.bv = bseq(o.b, e.lid); o.pv = bseq(o.pr, e.lid * 0.4)
    return o
  }
  const L = eye('L'), R = eye('R')

  // eye movement: quick saccades between held looks (down = at the prompt box)
  const A0 = e.a * 0.25
  const sacc = list => { const n = list.length, v = [list[0]], k = [0]; for (let i = 0; i < n; i++) { v.push(list[i]); k.push(r3((i + 1) / n - 0.03)); if (i < n - 1) { v.push(list[i + 1]); k.push(r3((i + 1) / n)); } } v.push(list[0]); k.push(1); return [pts(v), k.join(';')]; }
  const GL = {
    idle: [[[0, 0], [-A0, 0], [0, 0.9 * A0], [0, 0], [0.7 * A0, -0.5 * A0]], '12s'],
    dart: [[[-A0, 0], [A0, 0.3 * A0], [-0.5 * A0, 0.5 * A0], [A0, -0.2 * A0]], '2.4s'],
    scan: [[[-A0, 0.2 * A0], [A0, 0.2 * A0], [-A0, 0.5 * A0], [A0, 0.5 * A0]], '3s'],
    side: [[[-A0, 0], [A0, 0], [-A0, 0], [A0, 0]], '2.4s'],
    around: [[[0, -A0], [A0, -A0], [A0, 0], [A0, A0], [0, A0], [-A0, A0], [-A0, 0], [-A0, -A0]], '8s'],
    none: [[[0, 0]], '1s'],
  }[s.glance]
  const glance = sacc(GL[0])

  // brows; the paperclip and the wizard always show theirs (Clippit's eyebrows are his main feature)
  const bc = c.brow, kMax = Math.max(s.ekL ?? s.ek, s.ekR ?? s.ek), y0 = e.y - e.b * kMax - bc.gap, bl = bc.bl, t = bc.t
  const seg = (x1, y1, x2, y2) => 'M' + r1(x1) + ' ' + r1(y1) + ' L' + r1(x2) + ' ' + r1(y2)
  const arc = (cx, y, hh) => 'M' + r1(cx - bl) + ' ' + r1(y) + ' Q' + r1(cx) + ' ' + r1(y - hh) + ' ' + r1(cx + bl) + ' ' + r1(y)
  const bt = s.brow === 'none' && bc.always ? 'soft' : s.brow
  const BR = {
    none: 'M0 0',
    soft: arc(e.lx, y0, t * 0.7) + ' ' + arc(e.rx, y0, t * 0.7),
    flat: seg(e.lx - bl, y0, e.lx + bl, y0) + ' ' + seg(e.rx - bl, y0, e.rx + bl, y0),
    raised: arc(e.lx, y0 - t, t * 1.2) + ' ' + arc(e.rx, y0 - t, t * 1.2),
    worried: seg(e.lx - bl, y0 + t, e.lx + bl, y0 - t) + ' ' + seg(e.rx - bl, y0 - t, e.rx + bl, y0 + t),
    sad: seg(e.lx - bl, y0 + t * 1.6, e.lx + bl, y0 - t * 0.4) + ' ' + seg(e.rx - bl, y0 - t * 0.4, e.rx + bl, y0 + t * 1.6),
    angry: seg(e.lx - bl, y0 - t * 0.6, e.lx + bl, y0 + t * 1.4) + ' ' + seg(e.rx - bl, y0 + t * 1.4, e.rx + bl, y0 - t * 0.6),
    focused: seg(e.lx - bl, y0 + t * 0.4, e.lx + bl, y0 + t) + ' ' + seg(e.rx - bl, y0 + t, e.rx + bl, y0 + t * 0.4),
    oneUp: arc(e.lx, y0 - t * 1.2, t * 1.3) + ' ' + seg(e.rx - bl, y0 + t * 0.4, e.rx + bl, y0 + t * 0.4),
  }
  // idle eyebrow raise (Office: IdleEyeBrowRaise), twice in a row once a cycle
  const lift = -t * 1.6
  const browAnim = s.browFx === 'fast' ? ['0 0;0 ' + r1(lift) + ';0 0;0 ' + r1(lift) + ';0 0;0 0', '0;0.1;0.2;0.3;0.4;1', '2s']
    : s.idle && bc.always ? ['0 0;0 0;0 ' + r1(lift) + ';0 0;0 ' + r1(lift) + ';0 0;0 0', '0;0.4;0.43;0.46;0.49;0.52;1', '13s']
    : s.mouth === 'talk' ? ['0 0;0 ' + r1(lift * 0.6) + ';0 0;0 0', '0;0.15;0.3;1', '2.8s'] : ['0 0;0 0', '0;1', '1s']

  // mouth
  const m = c.m, mx = m.x, my = m.y, mw = m.w
  const MO = {
    smile: [m.smile || 'M' + (mx - mw) + ' ' + my + ' Q' + mx + ' ' + r1(my + 0.8 * mw) + ' ' + (mx + mw) + ' ' + my, 'none'],
    grin: ['M' + r1(mx - mw) + ' ' + my + ' L' + r1(mx + mw) + ' ' + my + ' Q' + mx + ' ' + r1(my + 1.5 * mw) + ' ' + r1(mx - mw) + ' ' + my + ' Z', '#7f1d1d'],
    flat: [seg(mx - 0.6 * mw, my + 0.25 * mw, mx + 0.6 * mw, my + 0.25 * mw), 'none'],
    frown: ['M' + r1(mx - 0.8 * mw) + ' ' + r1(my + 0.6 * mw) + ' Q' + mx + ' ' + r1(my - 0.1 * mw) + ' ' + r1(mx + 0.8 * mw) + ' ' + r1(my + 0.6 * mw), 'none'],
    o: [O(mx, my + 0.35 * mw, 0.28 * mw, 0.36 * mw), '#7f1d1d'],
    O: [O(mx, my + 0.45 * mw, 0.5 * mw, 0.7 * mw), '#7f1d1d'],
    yawn: [O(mx, my + 0.55 * mw, 0.45 * mw, 0.85 * mw), '#7f1d1d'],
    wavy: ['M' + r1(mx - 0.8 * mw) + ' ' + r1(my + 0.35 * mw) + ' Q' + r1(mx - 0.6 * mw) + ' ' + r1(my + 0.05 * mw) + ' ' + r1(mx - 0.4 * mw) + ' ' + r1(my + 0.35 * mw) + ' T' + mx + ' ' + r1(my + 0.35 * mw) + ' T' + r1(mx + 0.4 * mw) + ' ' + r1(my + 0.35 * mw) + ' T' + r1(mx + 0.8 * mw) + ' ' + r1(my + 0.35 * mw), 'none'],
    smirk: ['M' + r1(mx - 0.7 * mw) + ' ' + r1(my + 0.35 * mw) + ' Q' + r1(mx + 0.2 * mw) + ' ' + r1(my + 0.6 * mw) + ' ' + r1(mx + 0.8 * mw) + ' ' + r1(my - 0.05 * mw), 'none'],
    grit: ['M' + r1(mx - 0.8 * mw) + ' ' + my + ' L' + r1(mx + 0.8 * mw) + ' ' + my + ' L' + r1(mx + 0.8 * mw) + ' ' + r1(my + 0.55 * mw) + ' L' + r1(mx - 0.8 * mw) + ' ' + r1(my + 0.55 * mw) + ' Z M' + r1(mx - 0.27 * mw) + ' ' + my + ' L' + r1(mx - 0.27 * mw) + ' ' + r1(my + 0.55 * mw) + ' M' + r1(mx + 0.27 * mw) + ' ' + my + ' L' + r1(mx + 0.27 * mw) + ' ' + r1(my + 0.55 * mw), '#ffffff'],
    talk: ['M0 0', 'none'],
  }
  const mouth = MO[s.mouth] || MO.smile
  const mouthOp = s.mouth === 'talk' ? 0 : 1
  const tongue = s.tongue || s.tongueBig || (c.tongue && ['happy', 'hello', 'celebrate', 'love', 'worried', 'writing'].indexOf(id) >= 0 && s.mouth !== 'flat')
  const tk = s.tongueBig ? 1.5 : 1

  // body motion: rotate (weight shifts), bob, and squash / stretch or breathing around the feet
  const SQ = k => (1 + k) + ' ' + r3(1 - k * 1.2) + ';' + r3(1 - k * 0.6) + ' ' + (1 + k) + ';1 1;' + r3(1 - k * 0.6) + ' ' + (1 + k) + ';' + (1 + k) + ' ' + r3(1 - k * 1.2)
  const MOT = {
    idle: { s: [-2, -2, 1.5, 1.5, -1, -1, -2], sk: '0;0.2;0.3;0.55;0.65;0.85;1', sd: '9s' },
    talk: { s: [-2, 2, -2], sd: '2.4s', b: [0, -1.2, 0, -0.6, 0], bd: '0.7s' },
    nervous: { s: [-1.2, 1.2, -1.2], sd: '1.8s' },
    shake: { s: [-4, 4, -4, 4, -3, 3, 0, 0, 0, 0], sd: '1.6s', sc: '1 1;1 1' },
    no: { s: [0, -4, 4, -4, 4, 0, 0], sd: '2.4s' },
    still: { s: [0, 0], sd: '1s' },
    drift: { s: [-1, 1, -1], sd: '5s' },
    bounce: { s: [-2, 2, -2], sd: '1.2s', b: [0, -2, -4, -2, 0], bd: '0.6s', sc: SQ(0.05), scd: '0.6s' },
    jump: { s: [-4, 4, -4], sd: '0.8s', b: [0, -2, -4, -2, 0], bd: '0.8s', sc: SQ(0.06), scd: '0.8s' },
    tremble: { s: [-1.2, 1.2, -1.2], sd: '0.15s', b: [2, 2], bd: '1s', sc: '0.98 0.97;0.98 0.97' },
    droop: { s: [3, 4, 3], sd: '4s', b: [3, 4.5, 3], bd: '4s', sc: '1.01 0.97;1.01 0.96;1.01 0.97', scd: '4s' },
    tilt: { s: [-1, 9, 9, 9, 9, -1], sd: '5s' },
    wobble: { s: [-7, 7, -7], sd: '2.2s' },
    nod: { s: [0, 0], sd: '1s', b: [-2, 0, -2], bd: '1.6s' },
    breathe: { s: [4, 4], sd: '1s', b: [1, 2.5, 1], bd: '3.5s', sc: '1 1;1.012 1.03;1 1', scd: '3.5s' },
    lean: { s: [-6, -5, -6], sd: '3s' },
    sigh: { s: [0, 0], sd: '1s', b: [0, 3, 3, 0, 0], bd: '4s', sc: '1 1;1.02 0.96;1.02 0.96;1 1;1 1', scd: '4s' },
    tap: { s: [0, 0, 2, 0, 2, 0, 0, 0], sd: '2.4s' },
    knock: { s: [0, 0], sd: '1s', sc: '1 1;1.07 1.07;1 1;1.07 1.07;1 1;1 1;1 1;1 1', scd: '2.6s' },
    wave: { s: [-6, 6, -6, 6, 0, 0, 0, 0], sd: '2s', b: [0, -3, 0, 0], bd: '1s' },
    pop: { s: [0, 0], sd: '1s', b: [0, 1, -5, -2, -2, -2], bd: '2.4s', sc: '1 1;1.06 0.92;0.95 1.07;1 1;1 1;1 1', scd: '2.4s' },
    stomp: { s: [-1.5, 1.5, -1.5], sd: '0.5s', b: [0, 2, 0], bd: '0.5s', sc: '1 1;1.04 0.95;1 1', scd: '0.5s' },
    shy: { s: [-3, -1, -3], sd: '2.5s', sc: '0.99 0.98;0.99 0.98' },
    sway: { s: [-3, 3, -3], sd: '2s', b: [0, -1.5, 0], bd: '1s' },
  }[s.motion]
  const bob = (MOT.b || [0, 0]).map(y => [0, y * c.u])
  const scV = bh && bh.sc ? bh.sc.v : MOT.sc || '1 1;1.006 1.014;1 1'
  const scKT = bh && bh.sc ? bh.sc.kt : even(scV.split(';').length)
  const scD = bh && bh.sc ? dur : MOT.scd || '3.6s'

  // tail, ears, hat, head, and the idle habits: the dog sniffs and tilts its head, the cat yawns, the wizard's wand sparkles
  const WAG = '0;0.6;0.68;0.76;0.84;0.92;1'
  const TAIL = { wag: [[-6, -6, 20, -8, 20, -6, -6], WAG, '5s'], fast: [[-12, 22, -12, 22, -12, 22, -12], even(7), '0.9s'], slow: [[4, 4, 8, 4, 8, 4, 4], WAG, '4s'], still: [[0, 0, 0, 0, 0, 0, 0], even(7), '1s'], down: [[-95, -95, -97, -95, -97, -95, -95], even(7), '3s'], up: [[-35, -31, -35, -31, -35, -35, -35], even(7), '1s'] }[s.tail]
  const EARS = { neutral: [[0, 0, 10, 0], [0, 0, -10, 0]], perk: [[12, 12, 14, 12], [-12, -12, -14, -12]], droop: [[-8, -8, -8, -8], [8, 8, 8, 8]], asym: [[12, 12, 12, 12], [8, 8, 8, 8]] }[s.ears]
  const CTAIL = s.ctailV ? [s.ctailV.v, s.ctailV.d, 9, 5.5] : { swish: [[-6, 8, -6, 8, -6], '6s', 9, 5.5], nervous: [[-3, 3, -3, 3, -3], '2s', 9, 5.5], lash: [[-14, 14, -14, 14, -14], '0.7s', 9, 5.5], puff: [[-12, 12, -12, 12, -12], '0.8s', 13, 9], up: [[-28, -24, -28, -24, -28], '2.5s', 9, 5.5], still: [[0, 0, 0, 0, 0], '1s', 9, 5.5], limp: [[0, 0, -3, 0, 0], '4s', 8, 4.5] }[s.ctail]
  const CE = { neutral: [[0, 0, 0, 0], [0, 0, 12, 0]], perk: [[0, 0, 0, 0], [0, 0, 0, 0]], flat: [[-14, -14, -14, -14], [14, 14, 14, 14]], back: [[-22, -22, -22, -22], [22, 22, 22, 22]], asym: [[0, 0, 0, 0], [16, 16, 16, 16]] }[s.cears]
  const CEARS = s.cearV ? [s.cearV.L, s.cearV.R, s.cearV.kt, s.cearV.d] : [CE[0], CE[1], '0;0.85;0.9;1', '6s']
  const HAT = bh && bh.hatV ? [bh.hatV.v, dur, bh.hatV.kt] : { sway: [[-3, 3, -3], '3s'], nervous: [[-1.5, 1.5, -1.5], '1.4s'], jitter: [[-9, 9, -9, 9, 0, 0, 0], '1.6s'], still: [[0, 0], '1s'], bounce: [[-5, 5, -5], '0.8s'], tilt: [[-1, 6, 6, 6, -1], '5s'], droop: [[8, 9, 8], '4s'] }[s.hat]
  const hp = c.head || [60, 88]
  const HEAD = s.head ? [s.head.v, s.head.kt, dur] : s.idle ? [[0, 0, 10, 10, 0, 0], '0;0.55;0.58;0.7;0.73;1', '11s'] : id === 'curious' ? [[12, 12], '0;1', '1s'] : id === 'confused' ? [[-10, 10, -10], '0;0.5;1', '2.2s'] : id === 'investigating' ? [[6, 6], '0;1', '1s'] : [[0, 0], '0;1', '1s']
  const SNIFF = s.sniff === 'fast' || id === 'investigating' ? ['1;1.18;1', '0;0.5;1', '0.35s'] : s.idle ? ['1;1;1.18;1;1.18;1;1', '0;0.7;0.72;0.74;0.76;0.78;1', '9s'] : ['1;1', '0;1', '1s']
  const yawn = e.cat && s.idle && !bh
  const YKT = '0;0.62;0.66;0.74;0.78;1'
  const WAND = s.idle ? ['0;0;1;0;0', '0;0.45;0.5;0.6;1', '7s'] : ['hello', 'happy', 'celebrate', 'idea', 'love', 'proud', 'saving'].indexOf(id) >= 0 || (bh && bh.spin) ? ['0.2;1;0.2', '0;0.5;1', '0.8s'] : ['0;0', '0;1', '1s']

  // rig: wizard arms (sleeve from the shoulder to a hand), dog and cat front legs and the hind leg that scratches
  const curve = (S, H, out, k) => { const mx2 = (S[0] + H[0]) / 2, my2 = (S[1] + H[1]) / 2; let px = -(H[1] - S[1]), py = H[0] - S[0]; const len = Math.hypot(px, py) || 1; px /= len; py /= len; if (px * out < 0) { px = -px; py = -py; } return 'M' + r1(S[0]) + ' ' + r1(S[1]) + ' Q' + r1(mx2 + px * k) + ' ' + r1(my2 + py * k) + ' ' + r1(H[0]) + ' ' + r1(H[1]); }
  const rig = c.arms || c.legs
  const RIG = { kt: '0;1', dur: '1s', hindOp: 0, hd0: 'M0 0', hd: 'M0 0;M0 0', hkt: '0;1', hdur: '1s', wandOp: 1, wand: '0 0;0 0', spin: '0 98 126;0 98 126', spinDur: '1s' }
  if (rig) {
    const spec = bh ? (c.arms ? bh.arms : bh.legs) : null
    let Ls = spec && spec.L ? spec.L : [rig.L], Rs = spec && spec.R ? spec.R : [rig.R]
    const n = Math.max(Ls.length, Rs.length, 2)
    const fit = a => (a.length === n ? a : Array.from({ length: n }, () => a[0]))
    Ls = fit(Ls); Rs = fit(Rs)
    RIG.kt = spec && spec.kt ? spec.kt : even(n)
    RIG.dur = spec && spec.d ? spec.d : spec ? dur : '1s'
    const side = (S, list, out, k, key) => { const d = list.map(H => curve(S, H, out, k)); RIG[key] = { d0: d[0], d: d.join(';'), x0: list[0][0], y0: list[0][1], cx: list.map(H => r1(H[0])).join(';'), cy: list.map(H => r1(H[1])).join(';') }; }
    const k = c.arms ? 5 : 2
    side(rig.SL, Ls, -1, k, c.arms ? 'aL' : 'lL')
    side(rig.SR, Rs, 1, k, c.arms ? 'aR' : 'lR')
    if (c.arms) {
      RIG.wand = Rs.map(H => r1(H[0] - 98) + ' ' + r1(H[1] - 126)).join(';')
      if (bh && bh.spin) { RIG.spin = '0 98 126;360 98 126'; RIG.spinDur = '1s'; }
      RIG.wandOp = bh && ['read', 'write', 'search', 'process', 'congratulate', 'clap', 'clasp', 'announce'].indexOf(props.behavior) >= 0 ? 0 : 1
      RIG.quill = Rs
    }
    if (c.legs) {
      const hind = bh && bh.hind
      const P2 = hind ? hind.P : [c.legs.hip, c.legs.hip]
      const hd = P2.map(H => curve(c.legs.hip, H, 1, 6))
      RIG.hindOp = hind ? 1 : 0; RIG.hd0 = hd[0]; RIG.hd = hd.join(';'); RIG.hkt = even(P2.length); RIG.hdur = hind ? hind.d : '1s'
    }
  }

  // whole-body pose around the centre, and how the body and the drawn objects swap during the loop
  const QP = {
    none: ['translate', '0 0;0 0', '0;1'],
    zoom12: ['scale', '1 1;1.2 1.2;1.2 1.2;1 1', K3], zoom125: ['scale', '1 1;1.25 1.25;1.25 1.25;1 1', '0;0.15;0.8;1'],
    zoom13: ['scale', '1 1;1.3 1.3;1.3 1.3;1 1', '0;0.15;0.8;1'], zoom135: ['scale', '1 1;1.35 1.35;1.35 1.35;1 1', '0;0.15;0.8;1'],
    flip: ['scale', '1 1;1 1;-1 1;-1 1;1 1;1 1', '0;0.3;0.38;0.7;0.78;1'],
    roll: ['rotate', '0;0;360;360', '0;0.3;0.6;1'], rollHold: ['rotate', '0;0;180;180;360;360', '0;0.15;0.3;0.7;0.85;1'],
    bow: ['rotate', '0;0;16;16;0;0', '0;0.15;0.25;0.75;0.85;1'], lieClip: ['rotate', '0;0;80;80;0;0', '0;0.12;0.25;0.85;0.95;1'],
    walkOutDoor: ['translate', '0 0;0 0;40 0;40 0;0 0', '0;0.15;0.5;0.95;1'], walkInDoor: ['translate', '40 0;40 0;0 0;0 0', '0;0.08;0.45;1'],
    walkOut: ['translate', '0 0;0 0;80 0;80 0;0 0', '0;0.15;0.55;0.95;1'], walkIn: ['translate', '-80 0;-80 0;0 0;0 0', '0;0.05;0.4;1'],
    creep: ['translate', '0 0;-6 0;6 0;0 0', '0;0.33;0.66;1'], sniffWalk: ['translate', '0 0;-8 0;8 0;0 0', '0;0.33;0.66;1'],
  }
  const q = QP[(bh && bh.q) || 'none']
  const qc = (bh && bh.qc) || c.center
  const TL = {
    always: ['0;1', '1;1', '1;1'],
    swap: ['0;0.12;0.2;0.8;0.88;1', '1;1;0;0;1;1', '0;0;1;1;0;0'],
    show: ['0;0.12;0.2;0.8;0.88;1', '1;1;1;1;1;1', '0;0;1;1;0;0'],
    late: ['0;0.45;0.5;0.85;0.9;1', '1;1;0;0;1;1', '0;0;1;1;0;0'],
    dim: ['0;0.12;0.2;0.8;0.88;1', '1;1;0.15;0.15;1;1', '0;0;1;1;0;0'],
    rideIn: ['0;0.5;0.6;1', '0;0;1;1', '1;1;0;0'],
    rideOut: ['0;0.3;0.38;0.92;1', '1;1;0;0;1', '0;0;1;1;0'],
    walkOut: ['0;0.45;0.55;0.92;1', '1;1;0;0;1', '1;1;1;1;1'],
    walkIn: ['0;0.08;0.18;1', '0;0;1;1', '1;1;1;1'],
    walkOutFade: ['0;0.4;0.55;0.92;1', '1;1;0;0;1', '1;1;1;1;1'],
    walkInFade: ['0;0.05;0.25;1', '0;0;1;1', '1;1;1;1'],
  }[(bh && bh.tl) || 'always']

  // anchors for the drawn objects (in the 120 x 150 overlay), per character
  const AN = {
    clippy: { face: [60, 36], head: [60, 10], body: [60, 82], front: [57, 112], side: [100, 84], mouth: [60, 50], ground: [60, 132], fs: 0.8 },
    wizard: { face: [60, 58], head: [60, 24], body: [60, 100], front: [60, 116], side: [104, 100], mouth: [60, 77], ground: [60, 146], fs: 0.85 },
    dog: { face: [60, 57], head: [60, 36], body: [60, 110], front: [60, 124], side: [106, 108], mouth: [60, 81], ground: [60, 146], fs: 1.15 },
    cat: { face: [60, 62], head: [60, 42], body: [60, 112], front: [60, 126], side: [106, 110], mouth: [60, 79], ground: [60, 146], fs: 1.1 },
  }[who]
  const PA = {
    headphones: ['face', 0, 0, 'fs'], glasses: ['face', 0, 0, 'fs'], catGlasses: ['face', 0, 0, 'fs'], sunglasses: ['face', 0, 0, 'fs'], welder: ['face', 0, 2, 'fs'], bigEars: ['face', 0, 0, 'fs'], telescope: ['face', 6, 0, 'fs'], knock: ['face', 0, 0, 'fs'],
    scratchWire: ['head', 8, 6, 1], tapWire: ['front', 30, 10, 1], coil: ['body', 0, 8, 1], atom: ['body', 0, -24, 1], check: ['body', 0, -6, 1], exclaim: ['body', 0, -4, 1], folder: ['front', 0, -6, 1], tornado: ['body', 0, 0, 1], mobile: ['body', 0, -20, 1], shovel: ['body', 0, 0, 1], sheets: ['front', 14, 4, 1], plane: ['front', 0, 0, 1], glassesScan: ['front', 0, 0, 1], bike: ['ground', 0, -10, 1],
    notepad: ['side', -4, 6, 1], arrowDown: ['side', 0, 30, 1], butterfly: ['head', 0, -6, 1], pettingHand: ['head', 4, 6, 1], laptop: ['front', 0, -2, 1], cabinet: ['side', 0, 8, 1], printer: ['side', 0, 14, 1], binary: ['body', 0, 0, 1], pawPrints: ['front', 0, 0, 1], shred: ['front', 0, 2, 1], scoreCard: ['body', 22, -16, 1], envelopeMouth: ['mouth', 0, 2, 1], paperMouth: ['mouth', 2, 4, 1], book: ['front', 0, -10, 1], sunburst: ['head', 0, 8, 1], desk: ['front', 0, -2, 1], painting: ['body', 0, -6, 1], door: ['side', -4, 8, 1], trophy: ['head', 40, 24, 1], trumpet: ['mouth', 4, 1, 1], cauldron: ['front', 0, 4, 1], crystal: ['front', 0, -6, 1], cloud: ['side', 4, -8, 1], soundWaves: ['face', 26, 0, 1], clap: ['front', 0, -8, 1], pawPads: ['head', 0, -18, 1], floppyHeld: ['body', 26, -14, 1],
  }
  const drawn = (bh && bh.props) || []
  const X = { ax: c.extra[0], ay: c.extra[1], handDur: id === 'goodbye' ? '1.1s' : '0.7s', has: {}, at: {}, bikeV: '0 0;0 0', bikeKT: '0;1', quillV: '0 0;0 0' }
  Object.keys(PA).concat(['quill', 'spiral']).forEach(p => { X.has[p] = drawn.indexOf(p) >= 0; X.at[p] = { x: 0, y: 0, s: 1 }; })
  drawn.forEach(p => { const a = PA[p]; if (!a) return; const base = AN[a[0]] || [0, 0]; X.at[p] = { x: r1(base[0] + a[1]), y: r1(base[1] + a[2]), s: a[3] === 'fs' ? AN.fs : a[3] }; })
  if (bh && bh.bike === 'in') { X.bikeV = '-110 0;-110 0;0 0;0 0'; X.bikeKT = '0;0.05;0.45;1'; }
  if (bh && bh.bike === 'out') { X.bikeV = '0 0;0 0;110 0;110 0'; X.bikeKT = '0;0.35;0.85;1'; }
  if (RIG.quill) X.quillV = pts(RIG.quill)
  if (RIG.quill && X.has.spiral) { const tgt = RIG.quill[1] || RIG.quill[0]; X.at.spiral = { x: r1(tgt[0] + 13), y: r1(tgt[1] - 26), s: 1 }; }
  ['excl', 'quest', 'dots', 'zzz', 'heart', 'sparkle', 'anger', 'steam', 'bulb', 'check', 'magnifier', 'gear', 'hourglass', 'warn', 'pencil', 'floppy', 'envelope', 'trash', 'hand'].forEach(k => { X[k] = has(k) ? 1 : 0; })

  // lined yellow sheet behind the paperclip (as in Office), lines parallel to its top edge
  const sheet = []
  for (let i = 1; i <= 7; i++) { const f = 0.08 + i * 0.11, sx = -6 + 24 * f, sy = 112 + 116 * f, ex = 112 + 24 * f, ey = 88 + 118 * f; sheet.push(seg(sx + (ex - sx) * 0.05, sy + (ey - sy) * 0.05, sx + (ex - sx) * 0.95, sy + (ey - sy) * 0.95)); }

  return {
    w, h: Math.round(w * 1.25),
    isClippy: who === 'clippy', isWizard: who === 'wizard', isDog: who === 'dog', isCat: who === 'cat',
    label: NAME[who] + ': ' + UK[id],
    P: { x: c.pivot[0], y: c.pivot[1], nx: -c.pivot[0], ny: -c.pivot[1], paperLines: sheet.join(' ') },
    Q: { type: q[0], v: q[1], kt: q[2], cx: qc[0], cy: qc[1], ncx: -qc[0], ncy: -qc[1] },
    T: { kt: TL[0], base: TL[1], prop: TL[2], dur },
    RIG,
    F: {
      ey: e.y, est: e.st, esw: e.sw, blink: s.blink, bkt: bk.map(r3).join(';'),
      pulse: s.eyes === 'heart' ? '1;1.18;1' : s.eyes === 'star' ? '1;1.12;1' : '1;1',
      glance: glance[0], glanceKT: glance[1], glanceDur: GL[1], L, R,
      brow: BR[bt], browOp: bt === 'none' ? 0 : 1, browO: bc.o, browOW: bc.ow, browC: bc.c, browW: bc.w,
      browAnim: browAnim[0], browKT: browAnim[1], browDur: browAnim[2],
      mouth: mouth[0], mouthFill: mouth[1], mouthOp, mc: m.c, msw: m.sw,
      mx, tcy: r1(my + 0.35 * mw), trx: r1(0.5 * mw), talkOp: s.mouth === 'talk' ? 1 : 0,
      talkVals: [0.15, 0.55, 0.25, 0.6, 0.15].map(v => r1(v * mw)).join(';'),
      tgy: r1(my + 0.6 * mw * tk), tgrx: r1(0.42 * mw * tk), tgry: r1(0.55 * mw * tk), tongueOp: tongue ? 1 : 0, tgVals: [0.55, 0.72, 0.55].map(v => r1(v * mw * tk)).join(';'),
      blushOp: has('blush') ? 0.55 : 0, c1x: c.cheek.l[0], c1y: c.cheek.l[1], c2x: c.cheek.r[0], c2y: c.cheek.r[1], crx: r1(c.cheek.r0 * 1.2), cry: r1(c.cheek.r0 * 0.65),
      tearOp: has('tear') && s.tear !== false ? 1 : 0, tx: c.tear[0], ty: c.tear[1], u: c.u,
      sweatOp: has('sweat') ? 1 : 0, sx: c.sweat[0], sy: c.sweat[1],
    },
    M: { sway: rot(MOT.s, c.pivot), swayKT: MOT.sk || even(MOT.s.length), swayDur: MOT.sd, bob: pts(bob), bobDur: MOT.bd || '1s', scale: scV, scaleKT: scKT, scaleDur: scD },
    A: {
      tail: rot(TAIL[0], [86, 130]), tailKT: TAIL[1], tailDur: TAIL[2],
      earL: rot(EARS[0], [40, 46]), earR: rot(EARS[1], [80, 46]),
      ctail: rot(CTAIL[0], [82, 138]), ctailDur: CTAIL[1], ctW1: CTAIL[2], ctW2: CTAIL[3],
      cearL: rot(CEARS[0], [44, 48]), cearR: rot(CEARS[1], [76, 48]), cearKT: CEARS[2], cearDur: CEARS[3],
      hat: rot(HAT[0], [60, 46]), hatKT: HAT[2] || even(HAT[0].length), hatDur: HAT[1],
      head: rot(HEAD[0], hp), headKT: HEAD[1], headDur: HEAD[2],
      sniff: SNIFF[0], sniffKT: SNIFF[1], sniffDur: SNIFF[2],
      yawnKT: YKT, yawnDur: '16s',
      yawnOp: yawn ? '0;0;1;1;0;0' : '0;0;0;0;0;0',
      yawnRy: yawn ? '0.5;0.5;6;6;0.5;0.5' : '0.5;0.5;0.5;0.5;0.5;0.5',
      mouthHide: yawn ? [mouthOp, mouthOp, 0, 0, mouthOp, mouthOp].join(';') : [mouthOp, mouthOp, mouthOp, mouthOp, mouthOp, mouthOp].join(';'),
      wandOp: WAND[0], wandKT: WAND[1], wandDur: WAND[2],
    },
    X,
  }
}

/** The SVG document of `who` in `state`; an unknown behaviour falls back to the emotion, an unknown emotion to calm. */
export const characterSvg = (who: Who, state: State, w = 46): string => fill(TEMPLATE, vals({ who, ...state, w })).replace(/>\s+</g, '><')

/** What the picture says, for the `alt` of the Svg. */
export const characterAlt = (who: Who, state: State): string => vals({ who, ...state }).label
