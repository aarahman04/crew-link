// CrewLink demo: hash-routed static SPA. State kept in localStorage (per browser only).
const KEY = "crewlink-demo-v2";
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

let state = load();

// ?demo=builder or ?demo=provider: open straight into a filled-in demo (for presentations).
const demo = new URLSearchParams(location.search).get("demo");
if (demo === "builder" || demo === "provider") {
  const b = demo === "builder";
  state.profile = b ? { role: demo, trades: ["Labourers", "Masons", "Bar Benders"], city: "Mumbai" } : { role: demo, trades: ["Electricians", "Plumbers"], city: "Hyderabad" };
  const other = b ? PROVIDERS[0] : PROJECTS[4];
  state.threads = [{
    id: "demo-" + demo, otherId: other.id, kind: b ? "p" : "j", name: b ? other.name : other.company, contact: b ? other.owner : "Site manager", city: other.city,
    status: "accepted", request: b ? { crew: { Labourers: 20, Masons: 10, "Bar Benders": 12 }, start: "Dec 01 2026" } : { crew: { Electricians: 15, Plumbers: 8 }, start: "Jan 01 2027" },
    messages: [
      { from: "system", text: "Request sent · " + (b ? 42 : 23) + " workers" },
      { from: "me", text: b ? "Namaste, we need a crew for our site in Mumbai. Can you mobilise by the start date?" : "Namaste, we can supply experienced workers for this project.", time: "10:02" },
      { from: "them", text: b ? "Thanks for the request! These workers are free from that date. Our supervisor can visit your site this week." : "Thanks — can you share ID proofs and safety training details?", time: "10:05" },
      { from: "them", text: "All good from our side. Request accepted ✅", time: "10:07" },
      { from: "system", text: "🎉 Crew booked · next: share site address & sign the work order" },
    ],
  }];
  save();
  history.replaceState(null, "", location.pathname + (location.hash || "#/find"));
}
function load() {
  try { return { profile: null, threads: [], posts: [], ...JSON.parse(localStorage.getItem(KEY)) }; }
  catch { return { profile: null, threads: [], posts: [] }; }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }

const isBuilder = () => state.profile?.role === "builder";
const allProjects = () => [...state.posts, ...PROJECTS];
const total = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);
const chipsOf = (obj, hl = []) => Object.entries(obj).map(([t, n]) => `<span class="chip ${hl.includes(t) ? "on" : ""}"><b>${n}</b> ${esc(t)}</span>`).join("");
const stars = (n) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));

// Match score: share of the viewer's trades the other side covers, plus same-city bonus.
function score(theirTrades, theirCity) {
  const p = state.profile;
  const hit = p.trades.filter((t) => theirTrades.includes(t)).length;
  return Math.min(100, Math.round((hit / p.trades.length) * 80 + (p.city === theirCity ? 20 : 0)));
}

/* ---------- views ---------- */
function home() {
  const workers = PROVIDERS.reduce((a, p) => a + total(p.crew), 0);
  return `
  <section class="hero"><div class="wrap">
    <p class="eyebrow">For construction across India</p>
    <h1>Builders need crews.<br><span class="accent">Crews need sites.</span></h1>
    <p class="lead">Find verified labour contractors, or find projects that need your workers. Match, request and chat — in minutes, not weeks.</p>
    <div class="roles">
      <button class="role-card" data-role="builder">
        <span class="icon" aria-hidden="true">🏗️</span>
        <span><h3>I'm a builder</h3><p>I need workers for my site.</p></span>
        <span class="go" aria-hidden="true">→</span>
      </button>
      <button class="role-card" data-role="provider">
        <span class="icon" aria-hidden="true">👷</span>
        <span><h3>I supply crews</h3><p>I have labourers, electricians, masons and more.</p></span>
        <span class="go" aria-hidden="true">→</span>
      </button>
    </div>
    <div class="trust"><span>✔ Verified contractors</span><span>✔ Direct chat, no middleman</span><span>✔ Free to use</span></div>
  </div></section>
  <section class="block"><div class="wrap">
    <div class="stats reveal">
      <div class="stat"><b data-count="${workers}">0</b><span>workers ready</span></div>
      <div class="stat"><b data-count="${PROVIDERS.length}">0</b><span>crew providers</span></div>
      <div class="stat"><b data-count="${allProjects().length}">0</b><span>open projects</span></div>
      <div class="stat"><b data-count="${CITIES.length}">0</b><span>cities</span></div>
    </div>
    <h2 class="reveal">How it works</h2>
    <div class="steps">
      ${[["Pick your side", "Builder or crew provider. Choose trades and city."],
         ["See your matches", "Ranked by trade fit and city, with ratings and verified badges."],
         ["Send a request", "Headcount per trade and a start date — clear from day one."],
         ["Chat & book", "Agree on details in chat. Once accepted, the crew is booked."]]
        .map(([h, p], i) => `<div class="step reveal" style="--i:${i}"><span class="num">0${i + 1}</span><h3>${h}</h3><p>${p}</p></div>`).join("")}
    </div>
  </div></section>`;
}

function setup(role) {
  const b = role === "builder";
  const p = state.profile?.role === role ? state.profile : { trades: [], city: "" };
  return `<div class="wrap narrow page-head">
    <a class="back" href="#/">← Back</a>
    <h2>${b ? "What workers do you need?" : "What workers do you have?"}</h2>
    <form id="setup" class="panel">
      <p class="label">Trades <span class="muted">· pick one or more</span></p>
      <div class="chips pick" id="tradePick">${TRADES.map((t) => `<button type="button" class="chip ${p.trades.includes(t) ? "on" : ""}" data-pick="${esc(t)}" aria-pressed="${p.trades.includes(t)}">${esc(t)}</button>`).join("")}</div>
      <p class="label">City</p>
      <div class="chips pick" id="cityPick">${CITIES.map((c) => `<button type="button" class="chip ${c === p.city ? "on" : ""}" data-city="${c}" aria-pressed="${c === p.city}">${c}</button>`).join("")}</div>
      <button class="btn block">Show my matches →</button>
    </form></div>`;
}

function listing() {
  const b = isBuilder();
  const items = (b ? PROVIDERS : allProjects()).map((x) => {
    const trades = Object.keys(b ? x.crew : x.needs);
    return { x, trades, s: score(trades, x.city) };
  }).sort((a, c) => c.s - a.s);
  const post = state.justPosted && b ? state.posts.find((p) => p.id === state.justPosted) : null;
  state.justPosted = null;
  return `<div class="wrap">
    <div class="page-head">
      ${post ? `<div class="banner">✅ <b>${esc(post.title)}</b> is live. Crew providers below match it — send them a request.</div>` : ""}
      <h2>${b ? "Crews for you" : "Projects for your crew"}</h2>
      <p class="muted">${esc(state.profile.trades.join(", "))} · ${esc(state.profile.city)} · <a href="#/setup/${state.profile.role}">Change</a></p>
    </div>
    <div class="filters">
      <input id="q" type="search" placeholder="Search name, trade or city" aria-label="Search">
      <select id="fCity" aria-label="City"><option value="">All cities</option>${CITIES.map((c) => `<option>${c}</option>`).join("")}</select>
      <label class="toggle"><input type="checkbox" id="fVer"> Verified only</label>
    </div>
    <div class="grid" id="results">${items.map(({ x, trades, s }, i) => card(x, trades, s, b, i)).join("")}</div>
  </div>`;
}

function card(x, trades, s, b, i) {
  const href = `#/${b ? "p" : "j"}/${x.id}`;
  return `<article class="card" style="--i:${Math.min(i, 8)}" data-search="${esc([b ? x.name : x.title, b ? "" : x.company, x.city, ...trades].join(" ").toLowerCase())}" data-city="${x.city}" data-ver="${x.verified}">
    <div class="row">
      <div><h3><a href="${href}" class="stretch">${esc(b ? x.name : x.title)}</a></h3>
        <div class="meta"><span>📍 ${x.city}</span>${b ? `<span>★ ${x.rating} (${x.jobs})</span>` : `<span>${esc(x.company)}</span>`}${x.verified ? `<span class="verified">✔ Verified</span>` : ""}${x.mine ? `<span class="new">New</span>` : ""}</div></div>
      <div class="ring" style="--p:${s}" title="${s}% match"><span>${s}%</span></div>
    </div>
    <div class="chips">${chipsOf(b ? x.crew : x.needs, state.profile.trades)}</div>
    <div class="row foot-row"><span class="meta">${b ? `👷 ${total(x.crew)} workers · ${esc(x.available)}` : `👷 ${total(x.needs)} needed · ${esc(x.start)}`}</span>
      <button class="btn sm" data-request="${x.id}">${b ? "Request" : "Offer crew"}</button></div>
  </article>`;
}

function crewTable(obj) {
  const max = Math.max(...Object.values(obj));
  return `<div class="bars">${Object.entries(obj).map(([t, n], i) => `<div class="bar-row"><span>${esc(t)}</span><div class="bar"><i style="--w:${(n / max) * 100}%;--i:${i}"></i></div><b>${n}</b></div>`).join("")}</div>`;
}

function provider(p) {
  return `<div class="wrap"><a class="back" href="#/find">← All matches</a><div class="detail">
    <div class="panel">
      <div class="title-row"><div class="avatar">${esc(p.name[0])}</div><div><h2>${esc(p.name)}</h2>
      <p class="muted">${esc(p.owner)} · since ${p.since} · ${p.verified ? `<span class="verified">✔ Verified</span>` : "Not yet verified"}</p></div></div>
      <p>${esc(p.bio)}</p>
      <h3>Workforce · ${total(p.crew)} workers</h3>
      ${crewTable(p.crew)}
      <h3>Reviews <span class="muted">★ ${p.rating} · ${p.jobs} jobs</span></h3>
      ${p.reviews.map(([who, r, text]) => `<blockquote class="review"><span class="stars">${stars(r)}</span> ${esc(text)}<cite>— ${esc(who)}</cite></blockquote>`).join("")}
    </div>
    <aside class="panel sticky">
      <dl class="kv"><dt>City</dt><dd>${p.city}</dd><dt>Rates</dt><dd>${esc(p.rate)}</dd><dt>Available</dt><dd>${esc(p.available)}</dd><dt>Replies</dt><dd>within ~2 hours</dd></dl>
      <button class="btn block" data-request="${p.id}">Request crew</button>
    </aside></div></div>`;
}

function project(j) {
  return `<div class="wrap"><a class="back" href="#/find">← All matches</a><div class="detail">
    <div class="panel">
      <div class="title-row"><div class="avatar">${esc(j.company[0])}</div><div><h2>${esc(j.title)}</h2>
      <p class="muted">${esc(j.company)} · ${j.verified ? `<span class="verified">✔ Verified builder</span>` : "Not yet verified"}</p></div></div>
      <p>${esc(j.desc)}</p>
      <h3>Crew needed · ${total(j.needs)} workers</h3>
      ${crewTable(j.needs)}
    </div>
    <aside class="panel sticky">
      <dl class="kv"><dt>City</dt><dd>${j.city}</dd><dt>Start</dt><dd>${esc(j.start)}</dd><dt>Duration</dt><dd>${esc(j.duration)}</dd><dt>Pay</dt><dd>${esc(j.budget)}</dd></dl>
      <button class="btn block" data-request="${j.id}">Offer my crew</button>
    </aside></div></div>`;
}

function postForm() {
  return `<div class="wrap narrow page-head">
    <a class="back" href="#/find">← Back</a>
    <h2>Post a requirement</h2>
    <p class="muted">Crew providers in your city will see it and can offer their crew.</p>
    <form id="post" class="panel">
      <label class="field">Project name<input name="title" required placeholder="e.g. G+7 apartment, Andheri"></label>
      <label class="field">Company<input name="company" required placeholder="e.g. Horizon Builders"></label>
      <div class="two">
        <label class="field">City<select name="city">${CITIES.map((c) => `<option ${c === state.profile.city ? "selected" : ""}>${c}</option>`).join("")}</select></label>
        <label class="field">Start date<input name="start" type="date" required value="2026-12-15"></label>
      </div>
      <p class="label">Workers needed</p>
      <div class="trade-inputs">${state.profile.trades.map((t) => `<label>${esc(t)}</label><input type="number" min="0" max="999" value="10" data-trade="${esc(t)}" aria-label="${esc(t)} needed">`).join("")}</div>
      <label class="field">Pay range<input name="budget" placeholder="e.g. ₹800–1,500 / day"></label>
      <button class="btn block">Post requirement</button>
    </form></div>`;
}

function inbox(id) {
  if (!state.threads.length) return `<div class="wrap page-head"><h2>Chats</h2><div class="empty"><div class="big">💬</div>No conversations yet. Send a request to start one.<br><br><a class="btn" href="#/find">Browse matches</a></div></div>`;
  const t = state.threads.find((x) => x.id === id) || state.threads[0];
  return `<div class="wrap"><div class="page-head"><h2>Chats</h2></div>
  <div class="inbox ${id ? "open" : ""}">
    <div class="threads">${state.threads.map((x) => `<a class="thread ${x.id === t.id ? "on" : ""}" href="#/inbox/${x.id}">
      <div class="avatar sm">${esc(x.name[0])}</div>
      <div class="t-body"><div class="t-top"><b>${esc(x.name)}</b><span class="status ${x.status}">${x.status}</span></div>
      <small>${esc(x.messages.at(-1).text)}</small></div></a>`).join("")}</div>
    <div class="chat">
      <div class="chat-head"><a class="back-chat" href="#/inbox" aria-label="All chats">←</a><div class="avatar sm">${esc(t.name[0])}</div>
        <div class="grow"><b>${esc(t.name)}</b><div class="muted small">${esc(t.contact)} · ${esc(t.city)}</div></div>
        <a class="btn sm ghost" href="#/${t.kind}/${t.otherId}">Profile</a></div>
      <div class="deal ${t.status}"><div><b>Request:</b> ${Object.entries(t.request.crew).map(([k, n]) => `${n} ${esc(k)}`).join(", ")} · from ${esc(t.request.start)}</div><span class="status ${t.status}">${t.status === "accepted" ? "✔ booked" : t.status}</span></div>
      <div class="messages" id="msgs">${t.messages.map(msg).join("")}${t.typing ? `<div class="msg them typing" aria-label="typing"><i></i><i></i><i></i></div>` : ""}</div>
      <div class="quick">${["Share site address", "Send rate card", "Schedule a site visit"].map((q) => `<button class="chip" data-quick="${q}">${q}</button>`).join("")}</div>
      <form class="composer" id="composer" data-id="${t.id}"><input name="m" placeholder="Write a message…" autocomplete="off" aria-label="Message"><button class="btn sm" aria-label="Send">Send</button></form>
    </div>
  </div></div>`;
}
const msg = (m) => `<div class="msg ${m.from}">${esc(m.text)}${m.from !== "system" ? `<time>${m.time}</time>` : ""}</div>`;

/* ---------- request modal ---------- */
function openRequest(id) {
  const b = isBuilder();
  const other = b ? PROVIDERS.find((p) => p.id === id) : allProjects().find((j) => j.id === id);
  const theirs = b ? other.crew : other.needs;
  const shared = Object.keys(theirs).filter((t) => state.profile.trades.includes(t));
  const rows = (shared.length ? shared : Object.keys(theirs)).map((t) => `<label>${esc(t)} <span class="muted">(${b ? "has" : "needs"} ${theirs[t]})</span></label><input type="number" min="0" max="${theirs[t]}" value="${Math.min(theirs[t], 10)}" data-trade="${esc(t)}" aria-label="${esc(t)} headcount">`).join("");
  const m = $("#modal");
  m.innerHTML = `<form class="modal-box" id="reqForm" role="dialog" aria-modal="true" aria-labelledby="reqTitle">
    <h2 id="reqTitle">${b ? "Request crew" : "Offer your crew"}</h2>
    <p class="muted">${esc(b ? other.name : `${other.title} · ${other.company}`)}</p>
    <p class="label">Workers</p>
    <div class="trade-inputs">${rows}</div>
    <label class="field">Start date<input name="start" type="date" required value="2026-12-01"></label>
    <label class="field">Message<textarea name="note" rows="3">${b ? `Namaste, we need a crew for our site in ${state.profile.city}. Can you mobilise by the start date?` : `Namaste, we can supply experienced workers for this project. Happy to share ID proofs and past work.`}</textarea></label>
    <div class="modal-actions"><button type="button" class="btn ghost sm" data-close>Cancel</button><button class="btn sm">Send request</button></div>
  </form>`;
  m.hidden = false;
  requestAnimationFrame(() => m.classList.add("show"));
  $("input", m).focus();
  $("#reqForm").onsubmit = (e) => {
    e.preventDefault();
    const f = e.target, crew = {};
    $$("[data-trade]", f).forEach((i) => { if (+i.value > 0) crew[i.dataset.trade] = +i.value; });
    if (!Object.keys(crew).length) return toast("Add at least one worker");
    const t = {
      id: "t" + Date.now(), otherId: other.id, kind: b ? "p" : "j",
      name: b ? other.name : other.company, contact: b ? other.owner : "Site manager", city: other.city,
      status: "pending", request: { crew, start: new Date(f.start.value).toDateString().slice(4) },
      messages: [{ from: "system", text: `Request sent · ${total(crew)} workers` }, { from: "me", text: f.note.value, time: now() }],
    };
    state.threads.unshift(t); save(); closeModal();
    toast("Request sent ✓");
    go("#/inbox/" + t.id);
    simulateReply(t.id);
  };
}
function closeModal() {
  const m = $("#modal");
  m.classList.remove("show");
  setTimeout(() => { m.hidden = true; m.innerHTML = ""; }, reduceMotion ? 0 : 200);
}

// Demo-only: fake the other side replying and accepting so the flow can be shown end-to-end.
async function simulateReply(id) {
  const th = () => state.threads.find((x) => x.id === id);
  const lines = th().kind === "p"
    ? ["Thanks for the request! These workers are free from that date. Our supervisor can visit your site this week."]
    : ["Thanks — your crew looks like a good fit. Can you share ID proofs and safety training details?"];
  for (const text of [...lines, null]) {
    await wait(1000); setTyping(id, true);
    await wait(1500); setTyping(id, false);
    if (text) th().messages.push({ from: "them", text, time: now() });
    else {
      th().status = "accepted";
      th().messages.push({ from: "them", text: "All good from our side. Request accepted ✅", time: now() }, { from: "system", text: "🎉 Crew booked · next: share site address & sign the work order" });
    }
    save(); refreshChat(id);
    if (!location.hash.includes(id)) toast(`New message from ${th().name}`);
  }
}
function setTyping(id, on) { const t = state.threads.find((x) => x.id === id); t.typing = on; refreshChat(id); }
// Update only the chat parts (not the whole page) so the composer keeps focus and typed text.
function refreshChat(id) {
  nav();
  if ($("#composer")?.dataset.id !== id) { if (location.hash === "#/inbox") render(); return; }
  const tmp = document.createElement("div"); tmp.innerHTML = inbox(id);
  for (const sel of [".threads", ".deal"]) $(sel).replaceWith($(sel, tmp));
  const msgs = $("#msgs"), key = (el) => el.className.replace(" seen", "") + el.textContent;
  const old = new Set([...msgs.children].map(key));
  msgs.innerHTML = $("#msgs", tmp).innerHTML;
  [...msgs.children].forEach((el) => { if (old.has(key(el))) el.classList.add("seen"); }); // only new bubbles animate
  msgs.scrollTo({ top: msgs.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
}

function toast(text) {
  const el = document.createElement("div"); el.className = "toast"; el.textContent = text; el.setAttribute("role", "status");
  document.body.append(el); setTimeout(() => el.classList.add("out"), 2300); setTimeout(() => el.remove(), 2700);
}

/* ---------- router ---------- */
function nav() {
  const r = location.hash, n = state.threads.length;
  $("#nav").innerHTML = state.profile
    ? `<a href="#/find" class="${r.startsWith("#/find") ? "on" : ""}">${isBuilder() ? "Find crews" : "Find projects"}</a>
       ${isBuilder() ? `<a href="#/post" class="${r === "#/post" ? "on" : ""}">Post job</a>` : ""}
       <a href="#/inbox" class="${r.startsWith("#/inbox") ? "on" : ""}">Chats${n ? `<span class="badge-count">${n}</span>` : ""}</a>
       <a href="#/" data-switch title="Switch between builder and crew provider">${isBuilder() ? "🏗️" : "👷"}<span class="hide-sm"> Switch</span></a>`
    : "";
}

function go(hash) { location.hash = hash; }

function render() {
  const [, route, id] = location.hash.split("/");
  if (route && route !== "setup" && !state.profile) return go("#/");
  const views = {
    setup: () => setup(id === "provider" ? "provider" : "builder"),
    find: listing,
    post: () => (isBuilder() ? postForm() : listing()),
    p: () => provider(PROVIDERS.find((x) => x.id === id) || PROVIDERS[0]),
    j: () => project(allProjects().find((x) => x.id === id) || PROJECTS[0]),
    inbox: () => inbox(id),
  };
  const app = $("#app");
  app.innerHTML = (views[route] || home)();
  app.classList.remove("enter"); void app.offsetWidth; app.classList.add("enter");
  nav();
  if (!route || route === "") initHome();
  const msgs = $("#msgs"); if (msgs) { $$(".msg", msgs).forEach((el) => el.classList.add("seen")); msgs.scrollTop = msgs.scrollHeight; }
  window.scrollTo(0, 0);
}

function initHome() {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in"); io.unobserve(e.target);
    $$("[data-count]", e.target).forEach(countUp);
  }), { threshold: 0.2 });
  $$(".reveal").forEach((el) => io.observe(el));
}
function countUp(el) {
  const end = +el.dataset.count, t0 = performance.now(), dur = reduceMotion ? 0 : 1200;
  const tick = (t) => {
    const k = dur ? Math.min(1, (t - t0) / dur) : 1;
    el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))).toLocaleString("en-IN");
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- events ---------- */
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-role],[data-pick],[data-city],[data-request],[data-close],[data-switch],[data-quick]");
  if (!el) return;
  const d = el.dataset;
  if (d.role) go("#/setup/" + d.role);
  else if (d.pick) { el.classList.toggle("on"); el.setAttribute("aria-pressed", el.classList.contains("on")); }
  else if (d.city && el.closest("#cityPick")) { $$("#cityPick .chip").forEach((c) => { c.classList.toggle("on", c === el); c.setAttribute("aria-pressed", c === el); }); }
  else if (d.request) { e.preventDefault(); openRequest(d.request); }
  else if ("close" in d) closeModal();
  else if ("switch" in d) { state.profile = null; save(); }
  else if (d.quick) { const i = $("#composer input"); i.value = d.quick; i.focus(); }
});
$("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#modal").hidden) closeModal(); });

document.addEventListener("submit", (e) => {
  const f = e.target;
  if (f.id === "setup") {
    e.preventDefault();
    const trades = $$("#tradePick .on").map((b) => b.dataset.pick);
    const city = $("#cityPick .on")?.dataset.city;
    if (!trades.length) return toast("Pick at least one trade");
    if (!city) return toast("Pick your city");
    state.profile = { role: location.hash.split("/")[2] === "provider" ? "provider" : "builder", trades, city };
    save(); go("#/find");
  } else if (f.id === "post") {
    e.preventDefault();
    const needs = {};
    $$("[data-trade]", f).forEach((i) => { if (+i.value > 0) needs[i.dataset.trade] = +i.value; });
    if (!Object.keys(needs).length) return toast("Add at least one worker");
    const p = { id: "u" + Date.now(), mine: true, company: f.company.value.trim(), title: f.title.value.trim(), city: f.city.value, verified: false,
      start: new Date(f.start.value).toDateString().slice(4), duration: "—", budget: f.budget.value.trim() || "Negotiable", needs, desc: "Posted on CrewLink." };
    state.posts.unshift(p); state.justPosted = p.id; save(); go("#/find");
  } else if (f.id === "composer") {
    e.preventDefault();
    const text = f.m.value.trim();
    if (!text) return;
    state.threads.find((x) => x.id === f.dataset.id).messages.push({ from: "me", text, time: now() });
    save(); f.m.value = ""; refreshChat(f.dataset.id);
  }
});

document.addEventListener("input", (e) => {
  if (!["q", "fCity", "fVer"].includes(e.target.id)) return;
  const q = $("#q").value.toLowerCase().trim(), c = $("#fCity").value, v = $("#fVer").checked;
  let shown = 0;
  $$("#results .card").forEach((el) => {
    const ok = el.dataset.search.includes(q) && (!c || el.dataset.city === c) && (!v || el.dataset.ver === "true");
    el.hidden = !ok; shown += ok;
  });
  $("#results .empty")?.remove();
  if (!shown) $("#results").insertAdjacentHTML("beforeend", `<div class="empty">Nothing matches. Try another city or clear the search.</div>`);
});

window.addEventListener("hashchange", render);
render();
