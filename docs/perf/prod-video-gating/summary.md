# prod-video-gating

Median of 3 runs. kb = total transfer.

| page | perf | lcp | fcp | tbt | cls | kb | scriptKb | mediaKb | requests | lcp element |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| adacore-desktop | 98 | 1042 | 517 | 1 | 0 | 1858 | 1145 | 0 | 83 | div.contents > div > picture > img.aspect-5/4 |
| adacore-mobile | 81 | 3456 | 1881 | 286 | 0 | 1762 | 1122 | 0 | 80 | div.contents > div > picture > img.aspect-5/4 |
| home-desktop | 94 | 1403 | 526 | 15 | 0 | 3425 | 1123 | 1856 | 86 | article.relative > section.relative > div.pointe |
| home-mobile | 65 | 9290 | 2035 | 290 | 0 | 2471 | 1100 | 956 | 79 | article.relative > section.relative > div.pointe |
| vault-desktop | 90 | 1922 | 556 | 16 | 0 | 4164 | 1145 | 1921 | 94 | header.flex > div.contents > div > video.h-auto |
| vault-mobile | 67 | 8970 | 2032 | 256 | 0 | 4085 | 1122 | 1921 | 90 | header.flex > div.contents > div > video.h-auto |
