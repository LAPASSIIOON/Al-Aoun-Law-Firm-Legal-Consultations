/**
 * خلفية المقدمة السينمائية للرئيسية — تُنزَّل وقت البناء إلى public/media/intro/.
 *
 * المصدر: لقطة ثابتة للمكان المعماري نفسه في صورة الهيرو (بلا العلامة) وُلّدت على Higgsfield
 * (gpt_image_2_5)، ثم فيديو صامت 5 ثوانٍ (kling3_0، الإطار الأول = الأخير فيدور بلا قطع)،
 * ثم ضُغطت H.264. الشعار والنص في المقدمة ليسا من هذه الملفات — هما SVG/HTML حقيقيان.
 *
 * لماذا وقت البناء: الملفات تُخدَم من نطاق الموقع نفسه كأصول ثابتة، ولا يطلب الزائر شيئًا من
 * Higgsfield. كل ملف مثبَّت ببصمة SHA-256؛ أي اختلاف أو فشل تنزيل يُترك الملف ولا يُكسر البناء —
 * والمقدمة عندها تعمل على التدرّج اللوني وحده (انظر HomeIntro.module.css).
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'media', 'intro');
const CDN = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3KUxFqvehKRZJpA8gf5ro89H3pe';

const ASSETS = [
  { file: 'atmosphere.mp4', url: `${CDN}/e92fff1a-a8bf-4998-83b9-fe9e6326bb42.mp4`, sha256: '32cefad68af414e95decbbc59c4d21a3eb5e1d1264fb8bc46eec05398f59a76d' },
  { file: 'atmosphere-portrait.mp4', url: `${CDN}/a7cc3d5f-cf90-4be1-a208-c5bf3ddb3360.mp4`, sha256: 'e1e50aceb62674d5733fa46e97934b259ff9beae1982b322cfcae4c7c1a1d600' },
  { file: 'atmosphere-poster.jpg', url: `${CDN}/886e46b5-7b6b-4fb5-98e5-f24bbf1a1951.jpg`, sha256: '708f342dd1cd731efee330476e7b8e975537d00f1059509f8edad5d8d07328d8' },
  { file: 'atmosphere-portrait-poster.jpg', url: `${CDN}/e09efba8-cd7a-4ec7-baac-5c84609ff9a2.jpg`, sha256: 'a1a1a8e6df48b1395e194b21862ea4328b9ae8c00dfdc3f0e9050a6f18522882' },
];

const sha = (buf) => createHash('sha256').update(buf).digest('hex');

async function present(path, expected) {
  try { return sha(await readFile(path)) === expected; } catch { return false; }
}

async function fetchOne({ file, url, sha256 }) {
  const path = join(OUT, file);
  if (await present(path, sha256)) return `${file}: already present`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return `${file}: skipped (HTTP ${res.status})`;
    const buf = Buffer.from(await res.arrayBuffer());
    if (sha(buf) !== sha256) return `${file}: skipped (checksum mismatch)`;
    await writeFile(path, buf);
    return `${file}: fetched (${buf.length} bytes)`;
  } catch (err) {
    return `${file}: skipped (${err.name === 'AbortError' ? 'timeout' : err.message})`;
  } finally {
    clearTimeout(timer);
  }
}

await mkdir(OUT, { recursive: true });
for (const asset of ASSETS) console.log(`[intro-media] ${await fetchOne(asset)}`);
