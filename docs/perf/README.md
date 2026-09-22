# Perf runs

One directory per run, produced by [performance-measurement.md](../performance-measurement.md).

`ask-jev/` is the exception: Ask endpoint captures from `scripts/ask-bench.ts` (one JSON per label, plus `report.md`), the before-and-after record for [ask-jev-roadmap.md](../ask-jev-roadmap.md).

`mcp-tools/` is the same shape for the sas-cms MCP: captures from `scripts/mcp-bench.ts` (bytes a client reads and sends per authoring task, and the size of the tool list) and `locate-<label>.json` from `scripts/mcp-locate-eval.ts` (whether `locateBlock` picks the right block, with every candidate and the Jev request's cost), the record for [typesafe-mcp-roadmap.md](../typesafe-mcp-roadmap.md).
