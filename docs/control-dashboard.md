# VestControl কন্ট্রোল ড্যাশবোর্ড – পূর্ণাঙ্গ গাইড (বাংলা সংস্করণ)

এই ডকুমেন্টে রয়েছে UI ডিজাইন, বর্তমান অপারেশনাল ফ্লো, ভবিষ্যৎ NestJS ব্যাকএন্ড ব্লুপ্রিন্ট এবং ফ্লাটার মোবাইল অ্যাপ সেটআপ নিয়ে সম্পূর্ণ ব্যাখ্যা। লক্ষ্য হলো যে কেউ এই ড্যাশবোর্ড ব্যবহার বা ইন্টিগ্রেট করতে চাইলে এক জায়গায় সব নির্দেশনা পেয়ে যাওয়া।

---

## ১. লক্ষ্য ও ব্যবহারকারী গল্প

- **মুখ্য সমস্যা:** ছড়ানো স্ক্রিপ্ট/ম্যানুয়াল টগল দিয়ে শেল অ্যাপকে “Safe Mode” (নেটিভ ক্যালকুলেটর/টাইমার) ও “Money Mode” (WebView) এর মাঝে সুইচ করতে গেলে হাই-রিস্ক বিলম্ব হচ্ছিল।
- **সমাধান:** একটি সিঙ্গেল কন্ট্রোল প্লেন যেখানে প্রতিটি অ্যাপের অবস্থা দেখা যায়, তাত্ক্ষণিক মোড টগল করা যায়, টার্গেট URL ও জিও-ফেন্স কমান্ড করা যায়।
- **বর্তমান ব্যবহারকারী:** অপারেশন দল, সেফটি রিভিউয়ার, এবং শেল অ্যাপ ডেপ্লয়মেন্ট ইঞ্জিনিয়াররা।

---

## ২. টেক স্ট্যাকের অবস্থা ও পরিকল্পনা

| স্তর             | টুল         | উদ্দেশ্য |
|-----------------|-------------|----------|
| ফ্রন্টএন্ড UI   | Next.js 14 (App Router) | আধুনিক সার্ভার-প্রথম আর্কিটেকচার, কিন্তু এই পেজ পুরোপুরি ক্লায়েন্ট কম্পোনেন্ট যাতে রিয়েল-টাইম আপডেট চালানো যায়। |
| ভাষা            | TypeScript (strict) | ডোমেইন মডেল শক্ত করে, NestJS API এর সাথেও একই টাইপ পুনরায় ব্যবহার করা যাবে। |
| স্টাইল          | Tailwind CSS v4 | গ্লাসমরফিজম + হ্যাকার থিম দ্রুত ইটারেট করার জন্য ইউটিলিটি ক্লাস। |
| আইকন           | Lucide বা কাস্টম SVG | ডিপেন্ডেন্সি কম রেখে ভেক্টর আইকন। |
| ভবিষ্যৎ ব্যাকএন্ড | NestJS | REST + WebSocket + CQRS সাপোর্ট, সহজে role-based auth ইমপ্লিমেন্ট করা যাবে। |

---

## ৩. ডেটা মডেল (`types/app.ts`)

```ts
export interface AppConfig {
  id: string;
  name: string;
  bundleId: string;
  status: "active" | "inactive" | "banned";
  mode: "native" | "webview";
  targetUrl: string;
  geoFencing: string;
  lastUpdated: Date;
}
```

- একই ইন্টারফেস NestJS DTO/Entity তেও ব্যবহার হবে।  
- `MOCK_APPS` সাময়িক ডেটা; API রেডি হলে SWR/React Query দিয়ে লাইভ ডেটা ফেচ করা হবে।

---

## ৪. UI ব্লুপ্রিন্ট (বর্তমান বাস্তবায়ন)

```
HomePage (client)
└── DashboardGrid
    ├── Header: সিস্টেম ব্যাজ, লাইভ ক্লক, ফ্লিট কাউন্টার
    └── ControlCard (প্রতিটি অ্যাপ)
        ├── Title block: নাম, bundleId, status, mode pill
        ├── Kill switch strip: কাস্টম টগল + স্ট্যাটাস লাইন
        ├── Config inputs: Target URL, Geo-Fence (truncate + lock state)
        ├── Runtime signals: MODE/STATUS/GEO এক লাইনে
        └── Actions: Flush Cache, Save Config (state-aware disabled)
```

**মূল বৈশিষ্ট্য:**
- প্রতিটি টেক্সট ফিল্ডে `whitespace-nowrap + truncate` ব্যবহৃত, ফলে উচ্চতা নির্দিষ্ট থাকে।
- গ্লাসমরফিক ব্যাকগ্রাউন্ড (`bg-slate-900/60` + `backdrop-blur-xl`) এবং conditional glow শেল অ্যাপের মোড বোঝায়।
- ক্লক প্রতি সেকেন্ডে `useEffect` দিয়ে আপডেট হয়।

---

## ৫. বর্তমান অপারেশনাল ওয়ার্কফ্লো (ব্যাকএন্ড ছাড়া)

1. পেজ লোড হলে `MOCK_APPS` থেকে লোকাল স্টেট তৈরি হয়।  
2. কন্ট্রোল কার্ডে **Kill Switch** টগল করলে:
   - UI স্তরে `mode` বদলায় ও `lastUpdated` নতুন হয়।
   - ভবিষ্যতে এই অ্যাকশন NestJS API (`PATCH /apps/:id/mode`) এ যাবে, রেসপন্স এলে স্টেট হালনাগাদ হবে।
3. Target URL বা Geo-Fence ইনপুট শুধুমাত্র `status === active` এবং `mode === webview` হলে এডিটেবল। অন্যথায় ডিম হয়ে থাকে।
4. **Flush Cache** ও **Save Config** বোতাম বর্তমানে শুধু টাইমস্ট্যাম্প আপডেট করে—এগুলো পরবর্তীতে NestJS সার্ভিসে কল করে WAF/CDN বা কনফিগ সার্ভারে অ্যাকশন ট্রিগার করবে।

এভাবে পুরো ড্যাশবোর্ড এখনো ফ্রন্টএন্ড-মকড, কিন্তু লজিক ইতিমধ্যে ব্যাকএন্ড সিগনেচার ধরে লেখা।

---

## ৬. NestJS ব্যাকএন্ড প্রস্তুতির রূপরেখা

### ৬.১ প্রজেক্ট সেটআপ
```bash
npm i -g @nestjs/cli
nest new vest-control-api
cd vest-control-api
npm install @nestjs/config @nestjs/typeorm typeorm pg
```

### ৬.২ মডিউল স্ট্রাকচার
```
src
├── apps
│   ├── apps.controller.ts    // REST endpoint
│   ├── apps.gateway.ts       // (ঐচ্ছিক) WebSocket push
│   ├── apps.service.ts       // business logic
│   ├── dto                   // Create/Update DTO (AppConfig ভিত্তিক)
│   └── entities/app.entity.ts
└── common
    └── filters / guards / interceptors (RBAC, logging)
```

### ৬.৩ এন্ডপয়েন্ট প্ল্যান
| মেথড | পথ | কাজ |
|-------|----|-----|
| `GET /apps` | সব অ্যাপ কনফিগ লিস্ট |
| `PATCH /apps/:id/mode` | `mode` পরিবর্তন, অডিট স্ট্যাম্প |
| `PATCH /apps/:id/config` | Target URL + Geo-Fence আপডেট |
| `POST /apps/:id/flush-cache` | CDN বা ডিভাইস ক্যাশ ইনভ্যালিডেশন |
| `GET /events/stream` | (ঐচ্ছিক) SSE/WebSocket ফিড |

### ৬.৪ সিকিউরিটি
- JWT বা API key ভিত্তিক AuthGuard
- Role-based scope (viewer vs operator)
- Request logging + audit টেবিল

---

## ৭. Flutter শেল অ্যাপ সেটআপ গাইড

নিচের ধাপ অনুসরণ করলে যেকোনো Flutter শেল অ্যাপে এই কন্ট্রোল প্লেন ইন্টিগ্রেট করা যাবে।

1. **প্রজেক্ট বুটস্ট্র্যাপ**
   ```bash
   flutter create vest_shell
   cd vest_shell
   ```
2. **ডিপেন্ডেন্সি**
   - HTTP ক্লায়েন্ট: `dio` বা `http`
   - Secure storage: `flutter_secure_storage` (API টোকেন রাখার জন্য)
   - WebView মোড প্রয়োজন হলে `webview_flutter`
3. **কনফিগারেশন মডেল**
   - `AppConfig` এর মতোই একটি Dart মডেল তৈরি করুন।
   - অ্যাপ শুরু হলে NestJS API থেকে `/apps/:bundleId` হিট করে বর্তমান `mode`, `targetUrl`, `geoFencing` ফেচ করুন।
4. **Safe Mode ইমপ্লিমেন্টেশন**
   - Flutter UI তে নেটিভ টাইমার/ক্যালকুলেটর স্ক্রিন থাকবে।
   - যখন ড্যাশবোর্ড থেকে `mode = native`, অ্যাপ কেবল এই স্ক্রিনেই লক থাকবে।
5. **Money Mode / WebView**
   - `targetUrl` অনুযায়ী `WebView` খুলবে।
   - Geo-Fence চেক করতে ডিভাইস লোকেশন বা IP geo API ব্যবহার করে NestJS-এ ভ্যালিডেট করে নিবে।
6. **রিয়েল-টাইম আপডেট (ঐচ্ছিক)**
   - WebSocket/SSE সাবস্ক্রাইব করে `mode` পরিবর্তন শুনলেই UI পুনরায় বিল্ড করবেন।
7. **রিলিজ চেকলিস্ট**
   - API key/Env ফাইল `.env.production` এ।
   - Obfuscation + store কমপ্লায়েন্স স্ক্রিপ্ট।

---

## ৮. ফ্লো কিভাবে কাজ করছে (সারাংশ)

1. ড্যাশবোর্ড থেকে কোনো অ্যাপের Kill Switch টগল → ভবিষ্যতে এটি NestJS `PATCH /mode` এ রিকোয়েস্ট পাঠাবে → সার্ভার ডাটাবেস আপডেট করে অডিট লগ রাখবে।
2. Flutter শেল অ্যাপ নির্দিষ্ট পোলিং ইন্টারভাল বা পুশ ইভেন্টে নতুন `mode` পেয়ে যায় → WebView/Safe স্ক্রিন বদলে দেয়।
3. Target URL ও Geo-Fence পরিবর্তন → `PATCH /config` এ যাবে → অ্যাপ পরবর্তী ফেচে নতুন মান নিয়ে চলবে।
4. Flush Cache → NestJS থেকে CDN/Webhook/FCM এ হুক পাঠিয়ে ইউজারের ডিভাইসে ক্যাশ ক্লিয়ার কমান্ড দেবে।

এই পুরো লুপ শেষ হলে ফ্রন্টএন্ড, NestJS ব্যাকএন্ড এবং Flutter ক্লায়েন্ট একই ডেটা কনট্র্যাক্ট মেনে কাজ করবে।

---

## ৯. সামনের কাজ

1. **API যুক্ত করা:** React Query + NestJS endpoint লাইভ করা।  
2. **অডিট লগ UI:** ডান পাশে সাম্প্রতিক মোড পরিবর্তন দেখানো।  
3. **Role-based UI:** শুধুমাত্র অপারেটরদের টগল অ্যাক্সেস থাকবে, ভিউয়াররা রিড-অনলি দেখবে।  
4. **Automation:** নির্দিষ্ট তারিখে bulk toggle করার জন্য scheduler (NestJS cron)।  

---

## ১০. উপসংহার

VestControl এখন এমন এক হাই-টেক ড্যাশবোর্ড যা একইসাথে অপারেশন টিমকে দ্রুত সিদ্ধান্ত নিতে সাহায্য করে এবং ভবিষ্যৎ NestJS ব্যাকএন্ড ও Flutter ডিপ্লয়মেন্টের জন্য স্পষ্ট রোডম্যাপ দেয়। এই ডকুমেন্ট অনুসরণ করলে নতুন যেকোনো সদস্য খুব সহজে পুরো সিস্টেমের কাজ বোঝতে পারবে এবং প্রোডাকশনে যোগ করতে প্রস্তুত থাকবে।


