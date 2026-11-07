# runners

A small, static browser game. It has no JavaScript build step or runtime dependencies. Open `index.html` in a modern browser to play; the game stores coins and unlocks in browser localStorage (`road-runners-save`). All asset URLs are relative, so the project can also be served from a repository subpath such as GitHub Pages. The hidden DEV panel works in the hosted game too: type `DEV` and press Enter to spawn any runner or car.

## Publish as a `runners` repository

Create an empty repository named `runners`, then from this folder run:

```sh
git add .
git commit -m "Add runners game"
git remote add origin https://github.com/YOUR-USERNAME/runners.git
git push -u origin main
```

Then enable GitHub Pages for the `main` branch and repository root. The game entry point is `index.html`.

## Add a runner or car

1. Drop the image or GIF into `assets/runners/` or `assets/cars/`.
2. Add an entry to the matching list in `roster.js` with a unique `id`, display `name`, exact `file`, `rarity`, and `weight`. `scale`, `aspect`, and `flip` are optional image settings.
3. Adjust rarity weights as desired. The displayed chance is that entry's weight divided by the total weight in its pool.

For animated GIFs, install the helper dependency with `python3 -m pip install -r requirements.txt`, then run `python3 tools/extract-gifs.py` after adding the file. It exports transparent PNG frames and updates `assets/frames.js`; the game advances those frames itself for consistent animation in the canvas.

Sounds and music live in `assets/audio/`. Engine and running loops play while their actors are on screen; the music loops quietly behind the game, cat meows play only for Cat, and crashes play on collisions. UI button clicks use `commonItem.mp3`; Common and Uncommon rarity toasts use `common.mp3`; higher-rarity toasts use `goodItem.mp3`. Runner reward coins fly from the toast to the counter. A browser gesture is needed before the browser will allow audio playback.

Runner and car speeds vary independently. Most use their usual speed; larger speed changes are progressively rarer. Faster variants sometimes display a short-lived speed label and connector line.

Use the small collection button beside the currency counter to open the centered index. Switch between runners and cars; entries are grouped by rarity, with each rarity's total chance shown in its divider and each item's chance shown on its card. Runners are collected when they get past, and cars are collected after they cross the screen. Locked previews appear as black silhouettes. The engine, running and music loops fade in and out as they become active or inactive.

The included panorama belongs in `assets/scene/`. The game scales it to the scene height and scrolls it continuously. Runner unlocks and currency persist on the device/browser.

Santa drops one to five presents during a run. If he makes it across without a crash, each present opens into one to three animated coins worth 5 to 50 each. Coins bounce on the road before zipping to the counter, where they are added and saved.
