# CLAUDE.md Gaps — Chunk 4 Go CLOB Conventions

Checked: `CLAUDE.md`

Required checks:
- int64 for price/qty rule
- uint64 sequence counter rule
- single goroutine engine rule
- no global state rule
- go mod tidy timing rule (after first .go file imports dep, never before)

Results:
- ✅ Present: int64 for price/qty rule
- ✅ Present: uint64 monotonic sequence counter rule
- ✅ Present: single goroutine engine rule
- ✅ Present: no global mutable state rule
- ❌ MISSING: go mod tidy timing rule (run after first .go file imports a dep; never before)

