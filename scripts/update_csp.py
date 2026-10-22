#!/usr/bin/env python3
"""Synchronize the CSP hashes with the site's inline JSON-LD, without allowing inline JS."""
from pathlib import Path
import base64
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[1]
hashes = set()
for page in ROOT.glob('*.html'):
    for attrs, body in re.findall(r'<script([^>]*)>(.*?)</script>', page.read_text(), re.S):
        if body.strip():
            if not re.search(r'type=[\"\']application/ld\+json[\"\']', attrs):
                raise SystemExit(f'{page.name}: unexpected inline executable script')
            json.loads(body)
            digest = base64.b64encode(hashlib.sha256(body.encode()).digest()).decode()
            hashes.add(f"'sha256-{digest}'")
path = ROOT / 'vercel.json'
config = json.loads(path.read_text())
for header in config['headers'][0]['headers']:
    if header['key'] == 'Content-Security-Policy':
        policy = re.sub(r" 'sha256-[^']+'", '', header['value'])
        header['value'] = policy.replace("script-src 'self'", "script-src 'self' " + ' '.join(sorted(hashes)))
path.write_text(json.dumps(config, indent=2) + '\n')
print(f'Updated CSP with {len(hashes)} JSON-LD hashes.')
