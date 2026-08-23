#!/usr/bin/env python3
"""课程网站本地预览服务器（带 no-cache 头，改文件即刻生效）。
用法：python3 scripts/serve.py [端口]   （默认 8000）
"""
import sys, os
from http.server import HTTPServer, SimpleHTTPRequestHandler

class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
    print(f'《人工智能导论》课程网站预览 → http://localhost:{port}/  （Ctrl+C 停止）')
    HTTPServer(('127.0.0.1', port), NoCacheHandler).serve_forever()
