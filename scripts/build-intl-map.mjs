/**
 * يولّد هندسة خريطة «التنسيق الدولي» مرة واحدة (لا وقت البناء ولا وقت الزيارة):
 *   - public/maps/intl-world.svg      اليابسة والحدود (Natural Earth 1:50m عبر world-atlas)
 *   - src/lib/intl-map-data.js         نقاط العواصم المسقطة + أشكال الدول المعنية + ثوابت الإسقاط
 *
 * الإسقاط: Equal Earth مدوَّرًا إلى خط الطول 28° شرقًا، ومقصوصًا على نطاق يضمّ واشنطن وبكين.
 * نقاط النهاية: إحداثيات العواصم الحقيقية (خطوط الطول/العرض أدناه). الخطوط لا تمثّل مكاتب ولا فروعًا.
 *
 * التشغيل (الحزم لا تُضاف إلى package.json — أدوات توليد فقط):
 *   npm i --no-save d3-geo@3 topojson-client@3 world-atlas@2 && node scripts/build-intl-map.mjs
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { geoEqualEarth, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import { presimplify, quantile, simplify, filter, filterWeight } from 'topojson-simplify';

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
/* تبسيط Visvalingam يحفظ ربع النقاط تقريبًا ويُسقط الجزر الأصغر من عتبة المساحة:
   يبقى خطّ ساحل الخليج مقروءًا عند الاقتراب، والملف خفيف للعالم كله. */
const KEEP = Number(process.env.MAP_KEEP || 0.25);
const lighten = (topo) => {
  const p = presimplify(JSON.parse(JSON.stringify(topo)));
  const w = quantile(p, KEEP);
  return filter(simplify(p, w), filterWeight(p, w * 4));
};
const land50 = lighten(require('world-atlas/land-50m.json'));
const countries50 = lighten(require('world-atlas/countries-50m.json'));
const countries110 = require('world-atlas/countries-110m.json');

const WIDTH = 1600;
const ROTATE = -28;
/* نطاق الإطار (درجات): يضمّ واشنطن غربًا وبكين شرقًا مع هامش، ولندن شمالًا ومسقط جنوبًا */
const FRAME = { lon0: -104, lon1: 142, lat0: -6, lat1: 66 };

/* المرتكز والعواصم — [خط الطول، خط العرض]. المفتاح = name_en كما يرد من قاعدة البيانات. */
const ANCHOR = { key: 'Kuwait', atlas: 'Kuwait', capital: 'Kuwait City', at: [47.9783, 29.3759] };
const PLACES = [
  { key: 'Bahrain', atlas: 'Bahrain', capital: 'Manama', at: [50.586, 26.2285], group: 1 },
  { key: 'Saudi Arabia', atlas: 'Saudi Arabia', capital: 'Riyadh', at: [46.6753, 24.7136], group: 1 },
  { key: 'Qatar', atlas: 'Qatar', capital: 'Doha', at: [51.531, 25.2854], group: 1 },
  { key: 'United Arab Emirates', atlas: 'United Arab Emirates', capital: 'Abu Dhabi', at: [54.3773, 24.4539], group: 1 },
  { key: 'Oman', atlas: 'Oman', capital: 'Muscat', at: [58.4059, 23.588], group: 1 },
  { key: 'Jordan', atlas: 'Jordan', capital: 'Amman', at: [35.9106, 31.9539], group: 2 },
  { key: 'Egypt', atlas: 'Egypt', capital: 'Cairo', at: [31.2357, 30.0444], group: 2 },
  { key: 'Turkey', atlas: 'Turkey', capital: 'Ankara', at: [32.8597, 39.9334], group: 2 },
  { key: 'United Kingdom', atlas: 'United Kingdom', capital: 'London', at: [-0.1276, 51.5072], group: 3 },
  { key: 'United States', atlas: 'United States of America', capital: 'Washington, D.C.', at: [-77.0369, 38.9072], group: 3 },
  { key: 'China', atlas: 'China', capital: 'Beijing', at: [116.4074, 39.9042], group: 3 },
];
/* الدول الصغيرة تُرسم من 1:50m كي تبقى مقروءة عند الاقتراب؛ الكبيرة من 1:110m لحجم أصغر */
const SMALL = new Set(['Kuwait', 'Bahrain', 'Qatar', 'United Arab Emirates', 'Jordan']);

/* إطار الدرجات مُعيَّنًا بنقاط كثيفة على حوافه، كي يقيس fitWidth الشكل المنحني الحقيقي */
function frameOutline() {
  const pts = [];
  for (let lon = FRAME.lon0; lon <= FRAME.lon1; lon += 2) pts.push([lon, FRAME.lat0], [lon, FRAME.lat1]);
  for (let lat = FRAME.lat0; lat <= FRAME.lat1; lat += 2) pts.push([FRAME.lon0, lat], [FRAME.lon1, lat]);
  return { type: 'MultiPoint', coordinates: pts };
}

const projection = geoEqualEarth().rotate([ROTATE, 0]).fitWidth(WIDTH, frameOutline());
const [[x0, y0], [x1, y1]] = geoPath(projection).bounds(frameOutline());
projection.translate([projection.translate()[0] - x0, projection.translate()[1] - y0]);
const HEIGHT = Math.round(y1 - y0);
projection.clipExtent([[-2, -2], [WIDTH + 2, HEIGHT + 2]]);
const path = geoPath(projection).digits(1);

const r1 = (v) => Math.round(v * 10) / 10;
const xy = (lonlat) => { const [x, y] = projection(lonlat); return [r1(x), r1(y)]; };

const byName = (topo) => new Map(feature(topo, topo.objects.countries).features.map((f) => [f.properties.name, f]));
const c50 = byName(require('world-atlas/countries-50m.json')); /* أشكال الدول المعنية دون تبسيط — البحرين جزيرة صغيرة */
const c110 = byName(countries110);
const shapeOf = (name) => {
  const f = (SMALL.has(name) ? c50.get(name) : c110.get(name)) || c50.get(name);
  if (!f) throw new Error(`no geometry for ${name}`);
  return path(f);
};

/* ── اليابسة والحدود: ملف SVG ثابت بألوان الهوية (لا متغيّرات CSS داخل <image>) ── */
const landD = path(feature(land50, land50.objects.land));
const bordersD = path(mesh(countries50, countries50.objects.countries, (a, b) => a !== b));
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">`
  + `<path d="${landD}" fill="#1A2738" fill-opacity=".92"/>`
  + `<path d="${bordersD}" fill="none" stroke="#3A4A5E" stroke-width=".45" stroke-opacity=".7" stroke-linejoin="round"/>`
  + '</svg>\n';
await mkdir(join(ROOT, 'public', 'maps'), { recursive: true });
await writeFile(join(ROOT, 'public', 'maps', 'intl-world.svg'), svg);

/* ── وحدة البيانات ── */
const anchor = { key: ANCHOR.key, capital: ANCHOR.capital, lonlat: ANCHOR.at, xy: xy(ANCHOR.at), shape: shapeOf(ANCHOR.atlas) };
const places = PLACES.map((p) => ({ key: p.key, capital: p.capital, group: p.group, lonlat: p.at, xy: xy(p.at), shape: shapeOf(p.atlas) }));
const out = `/* مولَّد بواسطة scripts/build-intl-map.mjs — لا تعدّله يدويًا. */
/* المصدر: Natural Earth عبر world-atlas@2 · الإسقاط: Equal Earth، rotate(${ROTATE}°)، عرض ${WIDTH}. */
export const MAP = ${JSON.stringify({ width: WIDTH, height: HEIGHT, land: '/maps/intl-world.svg', projection: 'equalEarth', rotate: ROTATE })};
export const ANCHOR = ${JSON.stringify(anchor)};
export const PLACES = ${JSON.stringify(places)};
/* أسماء بديلة قد ترد من قاعدة البيانات */
export const ALIASES = ${JSON.stringify({ 'Türkiye': 'Turkey', 'United States of America': 'United States', USA: 'United States', UK: 'United Kingdom', UAE: 'United Arab Emirates', 'KSA': 'Saudi Arabia' })};
`;
await writeFile(join(ROOT, 'src', 'lib', 'intl-map-data.js'), out);
console.log(`map ${WIDTH}x${HEIGHT}; land svg ${svg.length} bytes; data ${out.length} bytes`);
console.log('anchor', anchor.xy, places.map((p) => `${p.key}:${p.xy}`).join(' | '));
