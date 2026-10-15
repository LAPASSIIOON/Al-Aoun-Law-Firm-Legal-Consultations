/**
 * أصول مولَّدة على Higgsfield — تُنزَّل وقت البناء إلى public/media/ (intro/ للرئيسية، intl/ للصفحة الدولية).
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
const MEDIA = join(ROOT, 'public', 'media');
const CDN = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3KUxFqvehKRZJpA8gf5ro89H3pe';

/* file = المسار داخل public/media */
const ASSETS = [
  { file: 'intro/atmosphere.mp4', url: `${CDN}/e92fff1a-a8bf-4998-83b9-fe9e6326bb42.mp4`, sha256: '32cefad68af414e95decbbc59c4d21a3eb5e1d1264fb8bc46eec05398f59a76d' },
  { file: 'intro/atmosphere-portrait.mp4', url: `${CDN}/a7cc3d5f-cf90-4be1-a208-c5bf3ddb3360.mp4`, sha256: 'e1e50aceb62674d5733fa46e97934b259ff9beae1982b322cfcae4c7c1a1d600' },
  { file: 'intro/atmosphere-poster.jpg', url: `${CDN}/886e46b5-7b6b-4fb5-98e5-f24bbf1a1951.jpg`, sha256: '708f342dd1cd731efee330476e7b8e975537d00f1059509f8edad5d8d07328d8' },
  { file: 'intro/atmosphere-portrait-poster.jpg', url: `${CDN}/e09efba8-cd7a-4ec7-baac-5c84609ff9a2.jpg`, sha256: 'a1a1a8e6df48b1395e194b21862ea4328b9ae8c00dfdc3f0e9050a6f18522882' },
  /* الصفحة الدولية: قاعة معمارية داكنة بضوء نحاسي خافت (gpt_image_2_5) — خلفية ثابتة لا فيديو */
  { file: 'intl/backdrop.webp', url: `${CDN}/0a36a5ed-e790-4e06-b7eb-9c71f8b2939b.webp`, sha256: '6aa7b3bf1a3a1757bf0a6363e8e065b10e839bfe249ee6a85321c610057e8e35' },
  { file: 'intl/backdrop-portrait.webp', url: `${CDN}/41beab1a-8f08-4a3e-bae1-25d30e669a7d.webp`, sha256: 'f43a96f4ef43538954c804cb592d7aa0225aac59fbca2bcb6226a6308222eece' },
];

const sha = (buf) => createHash('sha256').update(buf).digest('hex');

async function present(path, expected) {
  try { return sha(await readFile(path)) === expected; } catch { return false; }
}

async function fetchOne({ file, url, sha256 }) {
  const path = join(MEDIA, file);
  await mkdir(dirname(path), { recursive: true });
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

for (const asset of ASSETS) console.log(`[intro-media] ${await fetchOne(asset)}`);
