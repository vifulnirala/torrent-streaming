# Mystery Vault update

## What's changed
- Torrent sessions are no longer started during server startup.
- Search/file inspection starts a torrent only after the user selects a result.
- Closing the player destroys all active torrent sessions and peer connections.
- Idle metadata-only sessions are cleaned up after 60 seconds.
- YTS results are sorted ahead of other providers.
- YTS search requests can return up to 50 movies/torrent variants; the page initially shows 10 and lets the user reveal more in batches of 10, 20, 30, or 50.
- Refreshed responsive UI with dark/light themes, subtle animations, accessible controls, and mobile layouts.
- Video range handling and existing provider search flow are retained.

## Install
1. Stop the running server.
2. Back up your current `server.js` and `public/index.html`.
3. Replace `server.js` with the included `server.js`.
4. Replace `public/index.html` with the included `public/index.html`.
5. Keep your existing `package.json`, lockfile, and `node_modules`.
6. From the project folder run:
   ```powershell
   node --check server.js
   node server.js
   ```
7. Open `http://localhost:3000`.

The syntax checks cover both server JavaScript and the page's inline JavaScript. They do not replace a runtime test against live torrent peers and external search providers.

## Playback speed
Faster playback cannot be guaranteed by frontend styling. It depends heavily on active seeders, the upload capacity of peers, the size/codec of the release, and whether the release is compatible with the browser. Prefer a well-seeded 720p MP4/H.264 release when available.


## VidSrc external-player integration
The external-player form is configured by default for the URL patterns in the VidSrc documentation:
- Movie: `https://vidsrc.sh/embed/movie/{id}`
- Specific TV episode: `https://vidsrc.sh/embed/tv/{id}/{season}/{episode}`

Enter an IMDb ID (for example, `tt1234567`) or numeric TMDB ID. Select Movie or TV episode; for TV, enter season and episode. The player is shown in the app's responsive iframe modal. Closing the modal clears the iframe source. Existing YTS/torrent playback remains separate.

The app builds the iframe URL on the server and restricts it to the configured HTTPS origin. If you need to change providers, set these environment variables before starting Node (the app does not automatically load `.env` files unless you start Node with `--env-file=.env`):
- `EMBED_PROVIDER_NAME`
- `EMBED_PROVIDER_BASE_URL`
- `EMBED_MOVIE_PATH_TEMPLATE`
- `EMBED_TV_PATH_TEMPLATE`

The provider controls its own playback, availability, ads, cookies, and iframe policy. An iframe URL pattern in documentation does not itself establish that the provider has rights to every title or that playback will work on every browser/network. Use content and providers you are authorized to access.

PowerShell example (optional; this is already the default configuration):
```powershell
$env:EMBED_PROVIDER_NAME = "VidSrc"
$env:EMBED_PROVIDER_BASE_URL = "https://vidsrc.sh"
$env:EMBED_MOVIE_PATH_TEMPLATE = "/embed/movie/{id}"
$env:EMBED_TV_PATH_TEMPLATE = "/embed/tv/{id}/{season}/{episode}"
node server.js
```
