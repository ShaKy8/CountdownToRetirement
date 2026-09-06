# branyon.tech, 2018 edition

Salvaged from `s3://aws-website-branyontechcom-uxvwg` before that bucket was
deleted on 2026-09-06. The bucket held the original site alongside a January 2026
copy of the countdown page; only these images were not already in git.

The site was a single splash screen built with Mobirise 4.6.6 (theme
"mobirise3", Montserrat/Lora/Raleway, primary `#c0a375`). Its entire copy:

> **Branyon.Tech Home**
> *Where it's always CLOUDy with a 100% chance of AWeSome!*

| File | What it is |
|---|---|
| `branyon.tech-2-128x82.png` | The wordmark — power-button "O" over BRANYON.TECH. The one original asset here. |
| `logo.png` | Mobirise's stock placeholder logo, never replaced. Kept for completeness. |
| `mbr-1-1620x1080.jpg` | The hero photo: cumulus at golden hour, chosen for the CLOUDy pun. |

The bucket's other 21 objects were Bootstrap, jQuery, tether, animate.css,
jarallax, smooth-scroll and the Mobirise icon font — all public libraries — plus
`index.html`/`script.js`/`styles.css`, which matched the tree at commit
`f513cefb` byte for byte and are recoverable with `git show f513cefb:index.html`.

The Mobirise project file (`project.mobirise`) carried a contact phone number, so
it was kept out of this public repo. It is at
`~/Projects/branyontech-private-archive/` on omarchy.
