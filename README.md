# CrewLink

Concept demo: connects **builders** (who need workers) with **crew providers** (contractors who have laborers, electricians, masons, technicians under them).

Static site: plain HTML/CSS/JS, no build step. All data in `data.js` is fictional. Requests and chats are saved in the visitor's browser (localStorage) only, and the other side's replies are simulated.

## Flow
1. Landing page: choose **I'm a builder** or **I supply crews**.
2. Pick trades + city (8 Indian metros).
3. See matches ranked by trade fit and city (crew providers for builders, open projects for providers). Search, filter by city, verified only. Provider profiles show workforce bars and reviews.
4. Open a profile, send a structured request (headcount per trade, start date, message).
5. Builders can also **Post a job**; it shows up (tagged New) for crew providers.
6. Chat room opens; the other side replies and accepts (simulated), crew is booked.

## Run locally
```bash
npx http-server -p 5173
```
Then open http://localhost:5173.

## Deploy
- **Vercel:** `npx vercel` in this folder (framework: Other, no build command).
- **GitHub Pages:** push to a repo, Settings → Pages → deploy from branch, root folder.
