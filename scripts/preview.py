#!/usr/bin/env python3
"""Local static preview with the same security headers as Vercel."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import argparse
from urllib.parse import urlsplit
ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / 'vercel.json').read_text())
HEADERS = CONFIG['headers'][0]['headers']

class Handler(SimpleHTTPRequestHandler):
    def redirect_if_needed(self):
        parsed = urlsplit(self.path)
        for redirect in CONFIG.get('redirects', []):
            if parsed.path == redirect['source']:
                location = redirect['destination'] + ('?' + parsed.query if parsed.query else '')
                self.send_response(308 if redirect.get('permanent') else 307)
                self.send_header('Location', location)
                self.send_header('Content-Length', '0')
                self.end_headers()
                return True
        return False

    def do_GET(self):
        if not self.redirect_if_needed():
            super().do_GET()

    def do_HEAD(self):
        if not self.redirect_if_needed():
            super().do_HEAD()

    def end_headers(self):
        for header in HEADERS:
            self.send_header(header['key'], header['value'])
        super().end_headers()

    def send_error(self, code, message=None, explain=None):
        if code != 404:
            return super().send_error(code, message, explain)
        body = (ROOT / '404.html').read_bytes()
        self.send_response(404)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(body)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8765)
    port = parser.parse_args().port
    server = ThreadingHTTPServer(('127.0.0.1', port), partial(Handler, directory=str(ROOT)))
    print(f'Local: http://127.0.0.1:{port}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
