# The Mattis Foundation website

Eight static HTML pages with shared CSS and JavaScript. No package installation or build step is required. Hosting remains on Vercel, connected to this GitHub repository.

## Preview and checks

Run `python3 scripts/preview.py` from this folder, then open `http://127.0.0.1:8765`. This local server mirrors the security headers in `vercel.json` and serves the custom 404. Stop it with Ctrl+C.

Run `python3 scripts/check_site.py` for local link/anchor, asset, navigation, form, metadata, scholarship-state, and CSP checks. Run `node scripts/test_forms.cjs` for mocked success, failure, timeout, duplicate-submission, and topic-routing checks (no network submissions). If port 8765 is occupied, use `python3 scripts/preview.py --port 8766`. Review desktop and mobile layouts, menu keyboard behavior, all inquiry forms, and the no-JavaScript experience before publishing. Intercept Formspree requests when testing success and failure; never send real maintenance submissions.

## Pages and shared code

- `index.html`: mission, two programs, impact overview, founder story, benefit dinner, general inquiry.
- `scholarship.html`: next cycle **2027**, application status, previously published award and eligibility details, preparation and FAQ.
- `community-fund.html`: focus areas, past support, community support inquiry.
- `our-impact.html`: past areas of support and scholarship plans; no unverified aggregate totals or invented outcomes.
- `giving.html`: dedicated inquiry-based giving and partnership journey. No payment is taken.
- `evening-under-the-oaks.html`: benefit purpose, next-event inquiry, experience and attendance details.
- `privacy.html`: factual description of forms and external services; contact for data questions.
- `404.html`: recovery routes, including on nested missing URLs.
- `css/base.css`, `css/components.css`, `css/pages.css`: shared visual system and responsive layouts.
- `js/main.js`: accessible menu and progressively enhanced inquiries; URL `interest` values must match existing select options.
- `vercel.json`: deployed security/cache headers. Asset filenames are not content-hashed and must revalidate.

Navigation and footer are intentionally included in every page so they work without JavaScript. Keep all eight consistent. Asset paths begin at `/`; preview over HTTP. Retain the uppercase U in `assets/Union3.webp` if using that image.

## Confirmed content and publication gates

The owner confirmed on October 22, 2026 that the next scholarship cycle is **2027**. Opening date, deadline, notification date, renewal conditions, and 2027 eligibility are not confirmed. The expired 2026 application form was removed to prevent collection against an expired deadline. Previously published award/eligibility/essay details are clearly labeled historical, not promised for 2027.

Before opening applications: confirm the complete 2027 rules and dates; agree accessible essay formats; provision and verify a secure document upload and storage service, permissions, retention, and acknowledgment flow. Then implement a unified application and essay submission. Do not add a file input to an unverified Formspree plan or promise successful document storage. Until that infrastructure and policy are confirmed, this site takes scholarship **questions only**, with no application files or home addresses.

Giving is a conversation, not a checkout. Before adding direct payments: obtain the verified payment destination, organization’s legal-status documentation and approved tax wording, gift designation options, and acknowledgment process. Do not invent EINs, deductibility, gift equivalencies, or payment links.

For impact reporting: obtain dated contribution records, amounts and definitions, supported outcomes, and approved photographs/testimonials. The previous aggregate claims (1,000+ lives, $150K+, 10+ projects) were removed from public pages pending that evidence. Existing historic areas of support are retained without unsupported amounts, outcomes, current-activity badges, or formal-partnership claims. Add recipient stories only with permission. No illustrative or generated recipient photos are presented as real beneficiaries.

For the benefit dinner: confirm the next date, general location, invitation availability, contribution details, accessibility/dietary arrangements, and actual program before publishing specifics. No event date is invented and no private home address is exposed.

## Security and privacy maintenance

The static site has no PHP runtime or application package dependencies. Restrict Vercel, GitHub, registrar, and Formspree account access and use MFA where available.

The CSP permits local scripts/images, Google Fonts, and Formspree requests/submissions. Its SHA-256 hash permits the homepage JSON-LD block. If that block changes, update the hash in `vercel.json`; `check_site.py` verifies it. Avoid inline event handlers, inline styles, `unsafe-inline`, and `unsafe-eval`.

All three inquiry forms use the existing Formspree endpoint and `_gotcha` honeypots, also available without JavaScript. In Formspree, verify spam filtering, production-domain restrictions (including www as supported), recipient/access permissions, and retention/deletion. Those account settings have not been verified or changed from this repository. Align the privacy page with confirmed practices before making new privacy promises.

**Website maintenance must not send subscriber emails, newsletters, notifications, broadcasts, or test inquiries.** Do not enable automated replies. Submitting an inquiry must not enroll visitors in a mailing list or recurring donation.

## Publishing

Review the changes, commit, and push through Visual Studio Code as requested by the owner. Vercel handles deployment from GitHub. Check final www destination headers and representative pages after deployment. No separate hosting migration or Sites registration is needed for this existing site.
