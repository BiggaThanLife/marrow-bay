"""Bump the ?v=N cache-busting number on every script and stylesheet in index.html.
Run before pushing a change so browsers never mix old and new files:  python tools/bump_version.py"""
import re, pathlib
p = pathlib.Path(__file__).resolve().parent.parent / 'index.html'
s = p.read_text(encoding='utf8')
m = re.search(r'\?v=(\d+)', s)
n = int(m.group(1)) + 1 if m else 1
s = re.sub(r'\?v=\d+', '?v=%d' % n, s)
p.write_text(s, encoding='utf8', newline='\n')
print('cache version is now', n)
