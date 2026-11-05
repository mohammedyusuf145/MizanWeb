# ربط ميزان بـ Supabase (مجاني)

ما يلزم: بريد إلكتروني فقط. الخطة المجانية تكفي لميزان بالكامل.

## 1. أنشئ المشروع (دقيقتان)
1. افتح [supabase.com](https://supabase.com) ← **Start your project** وسجّل الدخول (يمكن بحساب GitHub).
2. **New project**:
   - الاسم: `mizan`
   - **Database password**: كلمة قوية، احفظها عندك ولا ترسلها لأحد.
   - **Region**: أقرب منطقة لك (مثل *Frankfurt* أو *Mumbai*).
3. انتظر حتى يجهز المشروع.

## 2. أنشئ قاعدة البيانات (لصقة واحدة)
1. من القائمة الجانبية: **SQL Editor** ← **New query**.
2. افتح الملف [`supabase/setup.sql`](../supabase/setup.sql) من المستودع، انسخ محتواه كاملًا والصقه.
3. اضغط **Run**. يجب أن تظهر *Success*. (تشغيله مرة ثانية آمن.)

## 3. إعدادات تسجيل الدخول
1. **Authentication ← URL Configuration**:
   - *Site URL*: رابط موقعك على Vercel (مثل `https://mizan.vercel.app`)، أو `http://localhost:5173` مؤقتًا.
   - *Redirect URLs*: أضف الرابطين معًا.
2. (اختياري) **Authentication ← Providers ← Google** لتسجيل الدخول بحساب Google.

## 4. أرسل لي مفتاحين فقط
من **Project Settings ← API** (أو **Data API**):
- **Project URL**: يشبه `https://abcdxyz.supabase.co`
- **anon / publishable key**: مفتاح عام، آمن في المتصفح لأن كل جدول محمي بسياسات الأمان (RLS).

> ⚠️ لا ترسل أبدًا **service_role key** ولا **كلمة مرور قاعدة البيانات**.

بعدها أضعهما في الإعدادات وأتحقق من الاتصال بالأمر:
```bash
npm run check:supabase
```

## 5. المعلّم الذكي (لاحقًا، اختياري)
يحتاج مفتاح Anthropic ويُضاف كسرّ على الخادم فقط:
```bash
npx supabase login
npx supabase link --project-ref <ref>
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-... TUTOR_MODEL=claude-sonnet-5-5 TUTOR_MODEL_LIGHT=claude-haiku-5-5
npx supabase functions deploy tutor delete-account
```
