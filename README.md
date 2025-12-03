**SP Club Frontend**

This repository holds the React (Vite + TypeScript + Tailwind) frontend for the SP Club website (SP Kabaddi Group Dhanbad). The site is built with a small component library and focuses on club info, gallery, registration, and contact pages. The site is deployed to Vercel; the backend APIs run on Render.

**What this repo contains:**
- **`src/`**: React app source (pages, components, hooks)
- **`public/`**: Static assets (logo, images, `robots.txt`, `sitemap.xml`)
- **`index.html`**: App HTML and site-level structured data
- **`package.json`**: Scripts and deps

**Quick Setup**
- Install dependencies:
```powershell
cd "c:\Users\impra\OneDrive\Desktop\sp\SP-Club-Frontend"
npm install
```

- Start development server (PowerShell):
```powershell
# temporary allow scripts in this session
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass;
cd "c:\Users\impra\OneDrive\Desktop\sp\SP-Club-Frontend";
npm run dev
```

If you prefer not to change execution policy, run the same commands in `cmd.exe` instead.

**Build & Preview**
```powershell
npm run build
npm run preview
```

**Useful maintenance commands**
- Update `caniuse-lite` (Browserslist DB) without requiring Bun:
```powershell
npm run update-caniuse
```

**SEO & Deployment notes**
- Per-page SEO is implemented using `react-helmet-async` via `src/components/Seo.tsx` — each main page (`Home`, `About`, `Gallery`, `Register`, `Contact`) includes a `Seo` component.
- `index.html` contains JSON-LD Organization and WebSite structured data and a canonical link.
- `public/sitemap.xml` is provided and referenced from `public/robots.txt`.
- For best social previews, replace `public/Logo.png` with a dedicated OG image (`public/og-image.png`) sized ~1200×630 and update `index.html` / `Seo` if needed.

Deployment checklist (Vercel + Render)
- Push your changes to your Git repo connected to Vercel; Vercel will automatically build and deploy the frontend.
- Ensure the backend (API) is running on Render and CORS/URLs are correct (the code points to `https://sp-club-backend.onrender.com` in `Contact`/`Register`).
- Verify sitemap: `https://spkabaddi.me/sitemap.xml` and `robots.txt`.
- Submit the sitemap to Google Search Console and request indexing for primary URLs.

**Verification & testing**
- Google Rich Results Test: check pages with structured data.
- Twitter Card Validator and Facebook Sharing Debugger: confirm Open Graph/Twitter Card previews.
- Mobile-Friendly Test: verify mobile usability.

**Where to find SEO configuration**
- Site-level meta + JSON-LD: `index.html`
- Per-page meta: `src/components/Seo.tsx` and usages inside `src/pages/*.tsx`
- Sitemap: `public/sitemap.xml`
- robots: `public/robots.txt`

**Contacts & Social**
- Domain: `https://spkabaddi.me`
- Social handle used in JSON-LD: `spkabaddigroupdhanbad` (Facebook/Instagram). Update `index.html` if your exact social URLs differ.

If you want, I can:
- Generate a proper OG preview image and add it to `public/og-image.png`.
- Add GitHub Actions to auto-run `npm run update-caniuse` on a schedule.
- Add LocalBusiness/Events structured data with full address & phone for improved local SEO.

---
Created and maintained for SP Club (SP Kabaddi Group Dhanbad). If you want the README expanded with contributor or license details, tell me what to add.
