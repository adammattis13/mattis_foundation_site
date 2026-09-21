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
