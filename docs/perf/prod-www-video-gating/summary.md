# prod-www-video-gating

Median of 3 runs. kb = total transfer.

| page | perf | lcp | fcp | tbt | cls | kb | scriptKb | mediaKb | requests | lcp element |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| adacore-desktop | 98 | 1019 | 518 | 1 | 0 | 1800 | 1122 | 0 | 77 | div.contents > div > picture > img.aspect-5/4 |
| adacore-mobile | 72 | 6293 | 1874 | 151 | 0 | 1761 | 1122 | 0 | 78 | div.contents > div > picture > img.aspect-5/4 |
| home-desktop | 91 | 1876 | 556 | 7 | 0 | 3392 | 1100 | 1852 | 80 | article.relative > section.relative > div.pointe |
| home-mobile | 64 | 10181 | 2027 | 298 | 0 | 2311 | 1100 | 796 | 78 | article.relative > section.relative > div.pointe |
| vault-desktop | 90 | 1938 | 556 | 15 | 0 | 4105 | 1122 | 1921 | 88 | header.flex > div.contents > div > video.h-auto |
| vault-mobile | 69 | 8814 | 2028 | 202 | 0 | 4084 | 1122 | 1921 | 88 | header.flex > div.contents > div > video.h-auto |
