# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.js >> تسجيل دخول ناجح بحساب حقيقي
- Location: tests\e2e\login.spec.js:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForFunction: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - button "مساعد الموقع" [ref=e4] [cursor=pointer]
  - generic [ref=e7]:
    - navigation [ref=e8]:
      - generic [ref=e9]:
        - link "THE LEADERS THE LEADERS معهد القادة الدولية للتدريب الأهلي" [ref=e10] [cursor=pointer]:
          - /url: /
          - img "THE LEADERS" [ref=e11]
          - generic [ref=e12]:
            - generic [ref=e13]: THE LEADERS
            - generic [ref=e14]: معهد القادة الدولية للتدريب الأهلي
        - list [ref=e15]:
          - listitem [ref=e16]:
            - link "الرئيسية" [ref=e17] [cursor=pointer]:
              - /url: /
          - listitem [ref=e18]:
            - link "عن المعهد" [ref=e19] [cursor=pointer]:
              - /url: /about
          - listitem [ref=e20]:
            - button "مسار الدورات" [ref=e21] [cursor=pointer]
          - listitem [ref=e24]:
            - link "المدربون" [ref=e25] [cursor=pointer]:
              - /url: /trainers
          - listitem [ref=e26]:
            - link "كلمة الرئيس" [ref=e27] [cursor=pointer]:
              - /url: /chairman
          - listitem [ref=e28]:
            - link "تواصل معنا" [ref=e29] [cursor=pointer]:
              - /url: /contact
          - listitem [ref=e30]:
            - link "دخول" [ref=e31] [cursor=pointer]:
              - /url: /login
    - generic [ref=e33]:
      - generic [ref=e34]: تسجيل الدخول
      - heading "مرحبًا بعودتك" [level=1] [ref=e35]
    - generic [ref=e39]:
      - button "الدخول عبر Google" [ref=e40] [cursor=pointer]
      - generic [ref=e46]: أو بالبريد الإلكتروني
      - generic [ref=e48]:
        - generic [ref=e49]:
          - generic [ref=e50]: البريد الإلكتروني
          - textbox "البريد الإلكتروني" [ref=e51]:
            - /placeholder: example@email.com
            - text: karimssaleh52@gmail.com
        - generic [ref=e52]:
          - generic [ref=e53]: كلمة المرور
          - textbox "كلمة المرور" [active] [ref=e54]: 1q2w3e4r
        - button "تسجيل الدخول" [ref=e57] [cursor=pointer]
      - paragraph [ref=e58]:
        - text: ليس لديك حساب؟
        - link "إنشاء حساب جديد" [ref=e59] [cursor=pointer]:
          - /url: /signup
    - contentinfo [ref=e60]:
      - generic [ref=e61]:
        - generic [ref=e62]:
          - generic [ref=e63]:
            - generic [ref=e64]:
              - img "معهد القادة الدولية للتدريب الأهلي" [ref=e65]
              - generic [ref=e66]:
                - generic [ref=e67]: THE LEADERS
                - generic [ref=e68]: معهد القادة الدولية للتدريب الأهلي
            - paragraph [ref=e69]: معهد القادة الدولية للتدريب الأهلي — نصنع قادة... لا نُخرّج متدربين
            - generic [ref=e70]: معهد معتمد من الهيئة العامة للتعليم التطبيقي والتدريب · برامج معتمدة لدى ديوان الخدمة المدنية
          - generic [ref=e75]:
            - heading "روابط سريعة" [level=4] [ref=e76]
            - list [ref=e77]:
              - listitem [ref=e78]:
                - link "الرئيسية" [ref=e79] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e80]:
                - link "عن المعهد" [ref=e81] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e82]:
                - link "مسار الدورات" [ref=e83] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e84]:
                - link "المدربون" [ref=e85] [cursor=pointer]:
                  - /url: /trainers
              - listitem [ref=e86]:
                - link "الأسئلة الشائعة" [ref=e87] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e88]:
                - link "التحقق من شهادة" [ref=e89] [cursor=pointer]:
                  - /url: /verify
              - listitem [ref=e90]:
                - link "شراكات مؤسسية" [ref=e91] [cursor=pointer]:
                  - /url: /partnership
          - generic [ref=e92]:
            - heading "المسارات التدريبية" [level=4] [ref=e93]
            - list [ref=e94]:
              - listitem [ref=e95]:
                - link "القيادة" [ref=e96] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e97]:
                - link "التنمية البشرية" [ref=e98] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e99]:
                - link "التحدث والإلقاء" [ref=e100] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e101]:
                - link "كلمة رئيس مجلس الإدارة" [ref=e102] [cursor=pointer]:
                  - /url: /chairman
          - generic [ref=e103]:
            - heading "تواصل معنا" [level=4] [ref=e104]
            - generic [ref=e105]: الكويت – حولي – مجمع الأندلس – الدور 11
            - generic [ref=e110]: aloun.law@gmail.com
            - generic [ref=e115]: +965 98717579
        - paragraph [ref=e120]: جميع الحقوق محفوظة لشركة القادة الدولية للأستشارات الإدارية ذ.م.م © 2026
  - alert [ref=e121]
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test('تسجيل دخول ناجح بحساب حقيقي', async ({ page }) => {
  4  |   const email = process.env.TEST_USER_EMAIL;
  5  |   const password = process.env.TEST_USER_PASSWORD;
  6  | 
  7  |   test.skip(!email || !password, 'محتاج TEST_USER_EMAIL و TEST_USER_PASSWORD في .env.test — شوف .env.test.example');
  8  | 
  9  |   await page.goto('/login');
  10 | 
  11 |   await page.fill('#email', email);
  12 |   await page.fill('#password', password);
  13 | 
  14 |   // (ملاحظة مهمة) Turnstile مصمَّم أصلًا يكتشف متصفحات آلية زي Playwright.
  15 |   // في وضع "Managed" ممكن يعدّي بصمت (زي ما تأكدنا يدويًا فعليًا)، أو يطلب
  16 |   // تحدٍّ حقيقي لو شكّ في البصمة — وقتها الاختبار هيفشل بـtimeout هنا،
  17 |   // مش خطأ في الكود. لو حصل ده بشكل متكرر، الحل القياسي المعروف هو استخدام
  18 |   // Cloudflare "testing sitekey" (مفتاح دايمًا-ناجح) بس وقت تشغيل الاختبارات
  19 |   // الآلية، بدل المفتاح الحقيقي — خطوة تالية لو احتجناها فعليًا.
> 20 |   await page.waitForFunction(() => {
     |              ^ Error: page.waitForFunction: Test timeout of 30000ms exceeded.
  21 |     const el = document.querySelector('input[name="cf-turnstile-response"]');
  22 |     return el && el.value && el.value.length > 20;
  23 |   }, { timeout: 15000 });
  24 | 
  25 |   await page.click('button[type="submit"]');
  26 | 
  27 |   await expect(page).toHaveURL(/\/account/, { timeout: 10000 });
  28 |   await expect(page.locator('body')).toContainText('حسابي');
  29 | });
  30 | 
```