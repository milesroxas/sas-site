# MCP block tools benchmark

Written by `scripts/mcp-bench.ts compare`. Bytes are exact; tokens are an estimate at 4 characters a token. "Read" is what a client takes in to find the block; "write" is what it has to send to save the change (output tokens, the expensive side). Cases: `scripts/mcp-cases.ts`.

## Captures

| Label | Date | Git sha | Server | Tools | tools/list | Block tools |
| --- | --- | --- | --- | --- | --- | --- |
| baseline | 2026-09-21 23:53 | 5406580 | https://www.suits-sandals.com | 107 | 1617.6KB (~414,106) | no |
| local-block-tools | 2026-09-21 23:58 | 5406580 | http://localhost:55030 | 104 | 1598.4KB (~409,186) | yes |

## Per case

### privacy-policy: Privacy Policy

| Label | Blocks | List, no id | Read, generated | Write, generated | Read, block tools | Write, block tools | Read saved | Write saved |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| baseline | 2 | 57.3KB (~14,658) | 31.0KB (~7,948) | 29.7KB (~7,599) |  | 29.5KB (~7,555) |  | 1% |
| local-block-tools | 2 | 57.3KB (~14,658) | 31.0KB (~7,948) | 29.7KB (~7,599) | 30.0KB (~7,692) | 29.5KB (~7,555) | 3% | 1% |

### about-us: About Us

| Label | Blocks | List, no id | Read, generated | Write, generated | Read, block tools | Write, block tools | Read saved | Write saved |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| baseline | 1 | 57.3KB (~14,658) | 3.3KB (~847) | 1.8KB (~461) |  | 1.8KB (~461) |  | 0% |
| local-block-tools | 1 | 57.3KB (~14,658) | 3.3KB (~847) | 1.8KB (~461) | 2.2KB (~559) | 1.8KB (~461) | 34% | 0% |

### work-adacore: AdaCore

| Label | Blocks | List, no id | Read, generated | Write, generated | Read, block tools | Write, block tools | Read saved | Write saved |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| baseline | 8 | 27.0KB (~6,903) | 8.9KB (~2,266) | 6.4KB (~1,651) |  | 1.0KB (~245) |  | 85% |
| local-block-tools | 8 | 27.0KB (~6,905) | 8.9KB (~2,268) | 6.5KB (~1,653) | 2.7KB (~703) | 1.0KB (~245) | 69% | 85% |

### lab-shader-studio: Building a shader studio in Payload CMS

| Label | Blocks | List, no id | Read, generated | Write, generated | Read, block tools | Write, block tools | Read saved | Write saved |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| baseline | 71 | 100.2KB (~25,664) | 42.7KB (~10,925) | 41.2KB (~10,551) |  | 0.7KB (~185) |  | 98% |
| local-block-tools | 49 | 37.4KB (~9,562) | 37.3KB (~9,554) | 35.9KB (~9,183) | 9.4KB (~2,417) | 0.7KB (~185) | 75% | 98% |

### expertise-web: Website Strategy, UX & Development

| Label | Blocks | List, no id | Read, generated | Write, generated | Read, block tools | Write, block tools | Read saved | Write saved |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| baseline | 18 | 251.4KB (~64,352) | 41.9KB (~10,736) | 39.1KB (~10,016) |  | 2.6KB (~666) |  | 93% |
| local-block-tools | 18 | 251.4KB (~64,352) | 41.9KB (~10,736) | 39.1KB (~10,016) | 7.2KB (~1,843) | 2.6KB (~666) | 83% | 93% |

### home: Home

| Label | Blocks | List, no id | Read, generated | Write, generated | Read, block tools | Write, block tools | Read saved | Write saved |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| baseline | 3 |  | 7.4KB (~1,890) | 5.7KB (~1,464) |  | 4.2KB (~1,088) |  | 26% |
| local-block-tools | 3 |  | 7.2KB (~1,843) | 5.5KB (~1,417) | 5.1KB (~1,309) | 4.2KB (~1,088) | 29% | 23% |

## Tool list

| Label | Tools | Bytes | update | create | find | delete | Largest |
| --- | --- | --- | --- | --- | --- | --- | --- |
| baseline | 107 | 1617.6KB | 809.4KB | 727.6KB | 49.8KB | 30.8KB | updateWorkPages 128.0KB, createWorkPages 127.8KB, updateLabPages 118.2KB |
| local-block-tools | 104 | 1598.4KB | 797.9KB | 721.8KB | 46.9KB | 29.0KB | updateWorkPages 128.0KB, createWorkPages 127.8KB, updateLabPages 118.2KB |

