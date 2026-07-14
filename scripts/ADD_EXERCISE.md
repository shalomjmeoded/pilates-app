# Adding a Pilates exercise (free workflow)

1. Draft name, description, 4–6 instructions, 2–3 common mistakes, equipment, muscle group.
2. Capture offline media (max ~720px wide):
   - Start pose → `assets/exercises/thumbnails/{id}.jpg`
   - Motion → `assets/exercises/gifs/{id}.gif` (preferred) or `.webp` / `.jpg`
3. Optional: curated Pilates Anytime YouTube **video ID** only if Share → Embed works. Attribution = `Pilates Anytime`.
4. Add via helper:

```bash
npm run add-exercise -- \
  --id Magic_Circle_Squeeze \
  --name "Magic Circle Squeeze" \
  --equipment "magic circle" \
  --muscle core \
  --donor Pilates_Hundred \
  --youtube 9mlone4NObI
```

Or pass `--thumb` / `--gif` paths instead of `--donor`.

5. Bump `EXERCISE_LIBRARY_VERSION` in `src/db/seed/exerciseSeed.ts`.
6. Validate:

```bash
npm run validate-seed
npm run audit-exercises
npm run validate-youtube   # optional; needs network
```
