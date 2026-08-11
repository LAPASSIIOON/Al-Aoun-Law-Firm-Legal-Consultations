# قاعدة بيانات مجموعة العون — Supabase

المشروع المتصل: **LAPASSIIOON's Project** (`ngyhplcnmedafjzotgho`) · Postgres 17 · eu-central-1.

المخططات (§٤ من وثيقة القرارات):
- `public` — محتوى الموقع العام (مجالات ممارسة، مقالات، أسئلة شائعة) + ملفات المستخدمين الإداريين.
- `ops` — بيانات تشغيلية حسّاسة (طلبات الاستشارة، سجل التدقيق، حد المعدل). لا وصول عام.
- `portal` — بوابة العملاء المستقبلية. فارغة الآن بمنع افتراضي.

## المبادئ الأمنية المطبَّقة
- **RLS مفعّل على كل الجداول** بمبدأ «منع افتراضي ثم سماح صريح».
- **البوابة القانونية على مستوى RLS لا الواجهة** (§٥): لا يُقرأ محتوى عامًا إلا إذا `status='published' AND legal_approved=true`. والنشر بدون اعتماد قانوني يرفضه محفّز على مستوى قاعدة البيانات.
- **جداول ترجمة منفصلة لا JSONB** (§٤): `slug` و`status` مستقلان لكل لغة.
- **طلبات الاستشارة لا تُدرَج مباشرةً**: المسار الوحيد هو دالة `public.submit_consultation` (SECURITY DEFINER) بعد حد معدل + تحقّق + تدقيق. الجدول نفسه لا يقبل INSERT من anon.
- **حد المعدل مبني على Postgres** (§٤: لا Redis) — جدول `ops.rate_limits` + دالة نافذة ثابتة.
- **conflict_check مرحلة صريحة** في دورة حياة الطلب (§٥).
- **تجزئة IP لا IP خام** (خصوصية CITRA §٥).
- **بحث عربي**: `pg_trgm` + `unaccent` + دالة `normalize_ar` (توحيد الألف/الياء/التاء المربوطة + إزالة التشكيل) — §٧.

## التحقق الأمني
شُغِّل `security advisor` بعد كل migration. النتيجة النهائية: تحذيران فقط، كلاهما على `submit_consultation` وهو **عام عمدًا** (المسار المقصود الوحيد للإدراج). كل الدوال الداخلية (`has_role`, `is_admin`, `enforce_legal_approval`, `handle_new_user`) محظور استدعاؤها عبر REST.

## المخطط (10 هجرات)
1. الأساس: المخططات + الامتدادات + `normalize_ar`/`slugify`
2. RBAC: `profiles` + `has_role`/`is_admin`
3. مجالات الممارسة + ترجماتها
4. التصنيفات + المقالات + الأسئلة الشائعة + ترجماتها
5. `ops.consultation_requests` (دورة حياة بـ conflict_check)
6. `ops.audit_log` + `ops.rate_limits` + `check_rate_limit`
7. سياسات RLS لكل الجداول
8. `submit_consultation` RPC الآمن
9. محفّزات البوابة القانونية + توفير المستخدم + `search_articles`
10. تصليب صلاحيات دوال SECURITY DEFINER

الهجرات مطبَّقة فعليًا على المشروع. لإعادة توليدها محليًا استخدم Supabase CLI:
```bash
supabase db pull   # لسحب المخطط الحالي
supabase db push   # لتطبيق هجرات جديدة
```

## متغيّرات البيئة المطلوبة
انسخ `.env.example` إلى `.env.local` واملأ القيم من لوحة Supabase (Settings → API):
- `NEXT_PUBLIC_SUPABASE_URL` — عام
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — عام (آمن للمتصفح)
- `SUPABASE_SERVICE_ROLE_KEY` — **سرّي، خادم فقط، لا يُكشف للمتصفح إطلاقًا**
