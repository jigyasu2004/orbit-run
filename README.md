# Orbit / Run

**Play live:** [DustRun racing](https://olive-gaur-614599.hostingersite.com/race/) · [Orbit / Run marble game](https://olive-gaur-614599.hostingersite.com/)

A 3D marble game with Three.js rendering and Cannon ES rigid-body physics. Roll through floating gardens, collect eight gems, and reach the finish. WASD/arrows move; Space brakes; R respawns; Escape pauses. Mobile includes touch controls.

Node 22+: `npm ci`, `npm run dev`. Production: `npm run build`, `npm start`. Static output is `dist/client` and can also be served directly. Personal-best times remain in the browser.

## DustRun racing mode
Visit `/race/` for a three-lap desert race against three bots. WASD/arrows drive, Space brakes, R recovers, Escape pauses. Touch steering and pedals are included. Run `node --experimental-strip-types tests/race.mjs` for simulation checks.
