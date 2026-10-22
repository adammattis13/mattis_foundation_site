#!/usr/bin/env python3
"""Validate static-site routes, form boundaries, content state, and CSP."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import base64
import hashlib
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
errors = []

def check(condition, message):
    if not condition:
        errors.append(message)

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path = path
        self.ids = set()
        self.links = []
        self.tags = []
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.tags.append((tag, a))
        if 'id' in a:
            check(a['id'] not in self.ids, f'{self.path.name}: duplicate id {a["id"]}')
            self.ids.add(a['id'])
        check('style' not in a and not any(k.startswith('on') for k in a), f'{self.path.name}: inline code/style')
        if tag == 'a' and 'href' in a:
            self.links.append(a['href'])
        for attribute in ('src', 'srcset'):
            if attribute in a:
                for value in a[attribute].split(','):
                    self.links.append(value.strip().split()[0])
        if tag == 'link' and a.get('rel') == 'stylesheet':
            self.links.append(a['href'])

pages = {p.name: Page(p) for p in ROOT.glob('*.html')}
for name, page in pages.items():
    check(sum(t == 'h1' for t, _ in page.tags) == 1, f'{name}: exactly one h1 required')
    check(sum(t == 'main' for t, _ in page.tags) == 1, f'{name}: exactly one main required')
    check(any(t == 'link' and a.get('rel') == 'canonical' for t, a in page.tags), f'{name}: missing canonical')
    for href in page.links:
        url = urlsplit(href)
        if url.scheme or url.netloc:
            continue
        path = unquote(url.path).lstrip('/') or name
        check((ROOT / path).is_file(), f'{name}: missing file {path}')
        if url.fragment and path in pages:
            check(unquote(url.fragment) in pages[path].ids, f'{name}: missing anchor {href}')
    for tag, attrs in page.tags:
        if tag == 'img':
            check(bool(attrs.get('alt')), f'{name}: image needs alt text')
        if tag == 'form':
            check(attrs.get('action') == 'https://formspree.io/f/xreegpav' and attrs.get('method') == 'POST', f'{name}: unexpected form destination/method')
        if tag == 'input':
            check(attrs.get('type') != 'file', f'{name}: unprovisioned file upload')
    text = page.path.read_text()
    forms = sum(t == 'form' for t, _ in page.tags)
    check(text.count('name="_gotcha"') == forms, f'{name}: each form needs honeypot')
    for label, href in [('Scholarship','/scholarship.html'),('Community Fund','/community-fund.html'),('Our Impact','/our-impact.html'),('Support Our Work','/giving.html')]:
        check(href in page.links, f'{name}: missing shared route {label}')

scholarship = (ROOT / 'scholarship.html').read_text()
check('Next scholarship cycle: 2027' in scholarship, 'Scholarship next cycle must be 2027')
check('dates have not yet been announced' in scholarship, 'Scholarship must clearly state pending dates')
check(not any(t == 'form' for t, _ in pages['scholarship.html'].tags), 'Do not collect applications against expired cycle')
check(sum(t == 'form' for p in pages.values() for t, _ in p.tags) == 3, 'Expected three inquiry forms')
for name in pages:
    check(not re.search(r'1000\+|\$150K\+|10\+|Apply Now|Now Accepting|Active Relief', (ROOT / name).read_text()), f'{name}: stale/unverified claim')
config = json.loads((ROOT / 'vercel.json').read_text())
policy = next(h['value'] for h in config['headers'][0]['headers'] if h['key'] == 'Content-Security-Policy')
for name in pages:
    for attrs, code in re.findall(r'<script([^>]*)>(.*?)</script>', (ROOT / name).read_text(), re.S):
        if code.strip():
            digest = base64.b64encode(hashlib.sha256(code.encode()).digest()).decode()
            check(f"'sha256-{digest}'" in policy, f'{name}: CSP inline script hash mismatch')
            check('application/ld+json' in attrs, f'{name}: unexpected inline executable script')
            json.loads(code)
check("'unsafe-inline'" not in policy and "'unsafe-eval'" not in policy, 'CSP must stay restrictive')
locations = [e.text for e in ET.parse(ROOT / 'sitemap.xml').findall('.//{*}loc')]
check(len(locations) == len(pages) - 1, 'Sitemap should include all public pages except 404')
for location in locations:
    check(urlsplit(location).hostname == 'www.mattisfoundation.org', 'Sitemap must use canonical www host')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(pages)} pages; local links/anchors/assets; inquiry-only forms; 2027 scholarship state; metadata; sitemap; CSP.')
