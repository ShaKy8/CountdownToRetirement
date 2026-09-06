"""Add a quiet 'back to the site' control to the synced console.

Injected at sync time rather than committed upstream: the console lives in its
own repo as a standalone app and should not carry this site's chrome.
"""
import sys

path = sys.argv[1]
s = open(path).read()

if 'site-back' in s:
    sys.exit(0)

s = s.replace(
    '    <div class="brand">',
    '    <a class="site-back" href="/" title="branyontech.com"'
    ' aria-label="Back to branyontech.com">&#8592;</a>\n'
    '    <div class="brand">',
    1,
)

STYLE = """<style>
/* Back to the site that hosts this. Deliberately quiet: the console is the
   content here, not the navigation. */
.site-back {
  display: grid; place-items: center;
  width: 26px; height: 26px; flex: 0 0 auto;
  color: var(--dim); text-decoration: none; font-size: 1rem;
  border: 1px solid rgba(0,234,255,.16);
  clip-path: polygon(5px 0,100% 0,100% calc(100% - 5px),calc(100% - 5px) 100%,0 100%,0 5px);
  transition: all .18s;
}
.site-back:hover { color: var(--cy); border-color: var(--cy); background: rgba(0,234,255,.1); }
</style>
</head>"""

s = s.replace('</head>', STYLE, 1)
open(path, 'w').write(s)
