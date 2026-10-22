# The Mattis Foundation website

A static, five-page website built with HTML, CSS, and JavaScript. No package installation or build step is required.

## Preview locally

From this folder, run `python3 -m http.server 8765 --bind 127.0.0.1`, then open `http://127.0.0.1:8765`. Stop the server with Ctrl+C. A local server is important for testing the same asset paths used in production.

## Where to make changes

- `index.html`: homepage, programs, story, and contact form.
- `scholarship.html`: eligibility, application dates, and application form.
- `community-fund.html` and `evening-under-the-oaks.html`: program pages.
- `404.html`: missing-page fallback.
- `css/base.css`: design tokens, typography, shared controls, and utilities.
- `css/components.css`: navigation, homepage sections, and footer.
- `css/pages.css` and `css/scholarship.css`: page-specific layouts.
- `js/main.js`: navigation and shared form handling.
- `vercel.json`: hosting headers. Assets use revalidation because filenames are not content-hashed.

Navigation and footer HTML are intentionally present on every page so links work without JavaScript. Keep those sections consistent across all five pages.

## Before publishing

Check all pages on desktop and mobile, including menu close, Escape, keyboard navigation, anchor links, and images. Hosting is case-sensitive: `assets/Union3.webp` must retain its uppercase U.

The scholarship page retains the supplied March 31, 2026 deadline and asks visitors to confirm availability. Confirm the next application cycle before changing dates or restoring open-application messaging. Existing award amounts, impact figures, and founder quotations have not been independently verified in this polish pass.

Both forms use the existing Formspree endpoint. Test with intercepted requests, never real submissions. Website maintenance must not send subscriber emails, newsletters, notifications, or broadcasts.

Form enhancement validates fields, prevents duplicate requests, keeps entries on failure, and shows persistent feedback. The scholarship success state reminds applicants that their essay must be emailed separately. Native form submission remains available without JavaScript.

Review staged changes in Visual Studio, create a commit, and push when ready. No deployment command is required for local review.

## Security maintenance

The site is static and has no PHP runtime or application package dependencies. Keep hosting, GitHub, domain registrar, and Formspree account access restricted to maintainers and enable multi-factor authentication where available.

`vercel.json` enforces a Content Security Policy allowing local scripts and images, Google Fonts styles/fonts, and Formspree submissions. The script hash permits the homepage's JSON-LD only. If that inline block changes, update its SHA-256 CSP hash. Avoid inline scripts, event handlers, styles, or broad `unsafe-inline` / `unsafe-eval` exceptions. Verify the deployed policy in the browser after publishing.

Both forms include Formspree's `_gotcha` honeypot, which also works without JavaScript. It reduces automated spam but does not replace provider-side abuse protection. In the Formspree dashboard for `xreegpav`, verify spam filtering, restrict submissions to the production domain (including its www variant as supported), review submission access and notification recipients, and set an appropriate retention/deletion process for scholarship personal information. These account settings have not been verified or changed from this repository. Do not enable automated replies or send test submissions during maintenance.

After deployment, verify all five pages, Google Fonts, navigation, and form feedback with intercepted requests. Confirm CSP, HSTS, `X-Frame-Options`, and `X-Content-Type-Options` on the final www destination. The obsolete `X-XSS-Protection` header is intentionally omitted; CSP provides modern injection restrictions.
