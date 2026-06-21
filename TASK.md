# JobFunke JobTok Improvement Task

## Issues Found (Visual Audit)

### Feed (Desktop + Mobile)
1. **Too sparse / lots of empty space** — card content doesn't fill the screen. Description is too short, lots of blank area between description and action bar.
2. **No visual background texture** — the feed bg image barely shows; cards are plain white/cream, feels very flat
3. **Desktop: card is too narrow** — full 1440px width but content sits in a tiny column
4. **Desktop: typography too small** — title looks fine on mobile but on 1440px the card should scale up
5. **Scroll hint overlaps action bar** on 390px (it shows at bottom-6.5rem)
6. **LandSelect on desktop** — tiles very tall with lots of empty space, 3-col is good but feels stretched
7. **No visual richness** — cards need more design elements (tags, date badge, colored sections)

### Functional Issues
8. **Desktop keyboard navigation** — can't use arrow keys to navigate cards (TikTok on desktop does this)
9. **Touch swipe on mobile** — scroll snap works but feels sluggish without momentum  
10. **No job count / loading indicator feedback** when changing land mid-session
11. **Beruf pill still could overflow** on very long names at 360px
12. **PWA**: no keyboard shortcut for navigate (need to test)

## Plan

### Card redesign
- Fill card top-to-bottom with sections: header zone / body zone / footer CTA  
- Add a colored/gradient top section with company name, type badge, location on accent bg
- Add more info: Einstellungstermin if available, tags for arbeitszeit
- Progress dots/counter styled nicer in top bar
- Desktop: constrain card to max ~800px centered, bigger font for title

### Feed UX
- Keyboard arrow keys on desktop (up/down to navigate)
- Swipe velocity sensitivity improvement
- Add "loading next" overlay when fetching more

### LandSelect
- Better visual on desktop: max-width container, more breathing room
- Add subtle hover animations

### PWA
- Make sure manifest and SW are correct

## Files to edit
- src/components/jobtok/Card.tsx — major redesign
- src/components/jobtok/Feed.tsx — keyboard nav, desktop layout fix
- src/components/jobtok/LandSelect.tsx — desktop polish
- src/app/globals.css — jobtok-scroll desktop centering
