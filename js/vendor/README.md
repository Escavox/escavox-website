# Vendored third-party JavaScript

Copied unmodified from the official npm release tarballs (`npm pack <pkg>@<version>`) so the
site never loads script from a CDN. To update: `npm pack` the new version, copy the same files,
update the hashes below and bump the `?v=` on the page that loads them.

| File | Package | Source path in tarball | SHA-256 |
|---|---|---|---|
| `motion.js` | motion@12.42.2 | `dist/motion.js` | `3a87f9a05922df2b36582155001fd8e9da3ab5edee10cd07112571cb2d9c94a5` |
| `three/three.module.min.js` | three@0.169.0 | `build/three.module.min.js` | `f7cee3c7533449a1505cc12cb5128b89e3d4fd3d7ea62b05f9f5464a217472ee` |
| `gsap/index.js` | gsap@3.13.0 | `index.js` | `070038235ba75ec2186d054ebd83ae94e6de6a971f5d3f3d6cd1037551f94faa` |
| `gsap/gsap-core.js` | gsap@3.13.0 | `gsap-core.js` | `ffb65f1764ff3eaa636a35fa51f68bb5e29798ec4e3739ca997fab8bea81f762` |
| `gsap/CSSPlugin.js` | gsap@3.13.0 | `CSSPlugin.js` | `4a7b9a200dbcaaff43c3c565ad0aa0b25ac1980505c7cb72ff99c9cedf97feb4` |
| `gsap/ScrollTrigger.js` | gsap@3.13.0 | `ScrollTrigger.js` | `51e697711cb743876a6f4af7c632d8294c4b6fe0768ef73697d473b3554e27c0` |
| `gsap/Observer.js` | gsap@3.13.0 | `Observer.js` | `f170e483a72a4a3f6bb61aede31e37e177c6db84622e7debd69a1ae488b3d202` |
| `lenis/lenis.mjs` | lenis@1.1.20 | `dist/lenis.mjs` | `ac4976213d309ba9aeae8eefe8166e8946c9546303ddc297f7291dd7891a760a` |

`motion.js` is used by every page (via `js/main.js`); three, gsap and lenis are used only by
`experience.html` through its import map. Licences: three and lenis (MIT) are alongside their files;
GSAP's licence terms are in the header of each GSAP file.
