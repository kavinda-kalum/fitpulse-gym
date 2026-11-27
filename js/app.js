/* =========================================================
   FitPulse — app logic (vanilla JS, hash routing, localStorage)
   ========================================================= */
(function () {
  const D = window.FP_DATA;
  const C = window.FPCharts;
  const KEY = "fitpulse-state-v3"; // bumped when the workout guide replaced the old programs
  const GOAL = D.weeklyGoal || 5;
  const $ = (s, r = document) => r.querySelector(s);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ic = (n, cls = "") => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const n0 = (v) => Math.round(v).toLocaleString("en-US");
  const n1 = (v) => (Math.round(v * 10) / 10).toFixed(1);
  const sign = (v, d = 1) => (v > 0 ? "+" : v < 0 ? "−" : "±") + Math.abs(v).toFixed(d);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  /* ---------- State ---------- */
  function defaults() {
    return {
      meals: clone(D.nutrition.meals), water: D.nutrition.water,
      weights: clone(D.body.weights), measures: clone(D.body.measures), updated: D.body.updated,
      history: clone(D.history), prs: clone(D.prs), extraKcal: 0, completed: 3, doneEx: {}, custom: []
    };
  }
  function load() {
    ["fitpulse-state-v1", "fitpulse-state-v2"].forEach(store.del); // old formats
    try { const s = JSON.parse(store.get(KEY)); if (s && Array.isArray(s.meals)) return Object.assign(defaults(), s); } catch (e) {}
    return defaults();
  }
  let S = load();
  const save = () => store.set(KEY, JSON.stringify(S));
  const ui = { range: "week", cat: "All", q: "", libG: "all", libQ: "" };

  /* ---------- Derived values ---------- */
  const workout = (id) => (id === "custom" ? customWorkout() : D.workouts.find((w) => w.id === id));
  /* ---------- Exercise library + custom workout ---------- */
  const DEF = { compound: [3, "10", 120], isolation: [3, "12", 75], core: [3, "15", 45], hold: [3, "45 sec", 45], carry: [3, "40 m", 90], interval: [3, "40 sec", 30], cardio: [1, "20 min", 60] };
  const libIndex = {};
  D.library.forEach((g) => g.exercises.forEach(([name, type]) => { if (!libIndex[name]) libIndex[name] = { name, type, group: g }; }));
  const usedIn = (name) => D.workouts.filter((w) => w.exercises.some((x) => x.name === name));
  function customWorkout() {
    const list = (S.custom || []).map((n) => libIndex[n]).filter(Boolean);
    if (!list.length) return null;
    const ex = list.map((e) => { const [sets, reps, rest] = DEF[e.type] || DEF.isolation; return { name: e.name, sets, reps, kg: null, rest, img: e.group.img }; });
    const mins = Math.max(10, Math.round(ex.reduce((a, x) => a + x.sets * (x.rest + 45), 0) / 60));
    return { id: "custom", title: "My Workout", short: "Mine", cat: "Custom", focus: [...new Set(list.map((e) => e.group.name))].join(" · "), level: "Custom",
      mins, kcal: Math.round(mins * 6.5), img: list[0].group.img, desc: "Your own session, built from the exercise library.", exercises: ex };
  }
  const eaten = () => S.meals.filter((m) => m.logged).reduce((a, m) => a + m.kcal, 0);
  const weekKcal = () => D.activity.week.kcal.reduce((a, b) => a + b, 0) + S.extraKcal;
  const weight = () => S.weights[S.weights.length - 1].w;
  const exDetail = (x) => `${x.sets} × ${x.reps}${x.kg ? ` · ${x.kg} kg` : x.kg === null ? " · bodyweight" : ""}`;
  const totalSets = (w) => w.exercises.reduce((a, x) => a + x.sets, 0);
  const volume = (w) => w.exercises.reduce((a, x) => a + (x.kg ? x.sets * (parseInt(x.reps, 10) || 0) * x.kg : 0), 0);
  const dayIdx = () => (new Date().getDay() + 6) % 7; // Monday = 0
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayWorkout = () => workout(D.split[dayIdx()]);
  const nextWorkout = () => { for (let k = 1; k <= 7; k++) { const id = D.split[(dayIdx() + k) % 7]; if (id) return { w: workout(id), day: DAYS[(dayIdx() + k) % 7] }; } return null; };
  const todayLabel = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const shortDate = () => { const d = new Date(); return `${d.toLocaleDateString("en-GB", { weekday: "short" })}, ${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "short" })}`; };
  const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };

  /* ---------- Shell ---------- */
  const NAV = [
    { href: "#/", label: "Dashboard", tab: "Home", icon: "grid", tabIcon: "home", key: "dashboard" },
    { href: "#/workouts", label: "Workouts", tab: "Gym", icon: "dumbbell", key: "workouts" },
    { href: "#/library", label: "Exercises", tab: "Library", icon: "book", key: "library" },
    { href: "#/activity", label: "Activity", tab: "Activity", icon: "activity", tabIcon: "chart", key: "activity" },
    { href: "#/body", label: "Body", tab: "Body", icon: "ruler", tabIcon: "user", key: "body" },
    { href: "#/nutrition", label: "Nutrition", tab: "Food", icon: "apple", key: "nutrition" }
  ];
  function renderNav(active) {
    $("#side-nav").innerHTML = NAV.map((n) => `<a href="${n.href}" ${n.key === active ? 'aria-current="page"' : ""}>${ic(n.icon)}${n.label}</a>`).join("");
    $("#tab-nav").innerHTML = NAV.map((n) => `<a href="${n.href}" aria-label="${n.label}" ${n.key === active ? 'aria-current="page"' : ""}>${ic(n.tabIcon || n.icon)}<span>${n.tab}</span></a>`).join("");
    const done = Math.min(S.completed, GOAL);
    $("#goal-ring").innerHTML = C.ring({ pct: done / GOAL, size: 56, stroke: 7, track: "rgba(255,255,255,.18)", label: `${done}/${GOAL}` });
    $("#goal-ring .ring__label b").style.cssText = "font-size:13px;color:#fff";
    $("#goal-text").textContent = done >= GOAL ? "Weekly target smashed. Great work!" : `${GOAL - done} more gym session${GOAL - done > 1 ? "s" : ""} to hit your target this week.`;
  }
  const themeBtn = () => {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    return `<button class="icon-btn" data-action="theme" type="button" aria-label="Switch to ${dark ? "light" : "dark"} mode">${ic(dark ? "sun" : "moon")}</button>`;
  };
  const footer = () => `<footer class="footer">
      <button class="link" type="button" data-action="reset-data">${ic("reset", "ic--sm")} Reset demo data</button>
      <p>FitPulse · Designed &amp; built by <a href="https://github.com/kavinda-kalum" target="_blank" rel="noopener">Kavinda Kalum</a></p>
    </footer>`;
  function head(title, sub, actions = "") {
    return `<header class="page-head"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</div><div class="head-actions">${actions}${themeBtn()}</div></header>`;
  }

  /* ---------- Reusable pieces ---------- */
  const kpi = (o) => `<div class="kpi glass">
      <div class="kpi__top"><span class="chip-ic ${o.neutral ? "chip-ic--neutral" : ""}" style="width:36px;height:36px">${ic(o.icon, "ic--sm")}</span><span class="pill">${o.delta}</span></div>
      <span class="kpi__label">${o.label}</span>
      <span class="kpi__value">${o.value}<small>${o.unit}</small></span></div>`;

  const wkCard = (w) => `<a class="wk-card glass" href="#/workout/${w.id}">
      <div class="wk-card__info">
        <span class="wk-card__cat">${esc(w.cat)}</span>
        <span class="wk-card__title">${esc(w.title)}</span>
        <span class="wk-card__meta">${esc(w.focus)}</span>
        <span class="wk-card__meta">${w.mins} min · ${w.exercises.length} exercises · ${w.kcal} kcal</span>
        <span class="wk-card__play" aria-hidden="true">${ic("play")}</span>
      </div>
      <img class="wk-card__img" src="${w.img}" alt="${esc(w.title)} workout" loading="lazy" width="132" height="124">
    </a>`;

  const exRow = (w, x, i, done, link) => {
    const tag = link ? "a" : "div";
    return `<${tag} class="row glass ${done ? "done" : ""}" ${link ? `href="#/workout/${w.id}"` : ""}>
      <img class="row__img" src="${x.img}" alt="" loading="lazy" width="56" height="56">
      <div class="row__body"><div class="row__title">${esc(x.name)}</div><div class="row__sub">${exDetail(x)}${link ? "" : ` · rest ${x.rest}s`}${done && link ? " · done" : ""}</div></div>
      ${link ? ic("chev") : `<button class="check-btn" type="button" data-action="ex" data-id="${w.id}" data-i="${i}" aria-pressed="${done}" aria-label="Mark ${esc(x.name)} ${done ? "not done" : "done"}">${ic("check")}</button>`}
    </${tag}>`;
  };

  const mealRow = (m, i) => `<div class="row glass">
      ${m.img ? `<img class="row__img" src="${m.img}" alt="${esc(m.dish)}" loading="lazy" width="56" height="56">` : `<span class="chip-ic" style="width:56px;height:56px;border-radius:14px">${ic("apple", "ic--lg")}</span>`}
      <div class="row__body"><div class="row__kicker">${esc(m.meal)}</div><div class="row__title">${esc(m.dish)}</div><div class="row__sub">${m.kcal} kcal</div></div>
      <button class="check-btn" type="button" data-action="meal" data-i="${i}" aria-pressed="${m.logged}" aria-label="${m.logged ? "Unlog" : "Log"} ${esc(m.dish)}">${ic(m.logged ? "check" : "plus")}</button>
    </div>`;

  const measureRow = (m, i) => `<div class="measure">
      <span class="chip-ic ${i % 2 ? "chip-ic--neutral" : ""}">${ic("ruler")}</span>
      <div class="row__body"><div class="row__title">${esc(m.label)}</div><div class="row__sub">Updated ${esc(S.updated)}</div></div>
      <div class="measure__val"><b>${n1(m.value)} cm</b><span>${sign(m.value - m.prev)} cm</span></div></div>`;

  function historyTable() {
    const rows = S.history.filter((h) => workout(h.workout)).slice(0, 8);
    return `<section class="card glass" aria-labelledby="h-hist">
      <div class="card-head"><h2 id="h-hist">Workout history</h2><span class="muted">${rows.length} sessions</span></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Date</th><th>Workout</th><th>Focus</th><th>Duration</th><th>Volume</th><th>Calories</th><th>Avg HR</th><th>Status</th></tr></thead>
        <tbody>${rows.map((h) => { const w = workout(h.workout); return `<tr>
          <td>${esc(h.date)}</td>
          <td><a class="td-workout" href="#/workout/${w.id}"><img src="${w.img}" alt="" loading="lazy" width="36" height="36">${esc(w.title)}</a></td>
          <td>${esc(w.focus)}</td><td>${w.mins} min</td><td>${volume(w) ? n0(volume(w)) + " kg" : "—"}</td><td class="strong">${w.kcal} kcal</td><td>${h.hr} bpm</td>
          <td><span class="pill ${h.status === "Personal best" ? "" : "pill--neutral"}">${esc(h.status)}</span></td></tr>`; }).join("")}
        </tbody></table></div></section>`;
  }

  function splitCard() {
    const t = dayIdx();
    return `<section class="card glass" aria-labelledby="h-split">
      <div class="card-head"><h2 id="h-split">Weekly schedule</h2><a class="link" href="#/library">From your gym guide</a></div>
      <div class="split">${D.split.map((id, i) => { const w = workout(id); const cls = i === t ? "today" : i < t ? "past" : "";
        return `<${w ? `a href="#/workout/${w.id}"` : "div"} class="split__day ${cls} ${w ? "" : "rest"}">
          <span class="split__name">${DAYS[i]}</span>
          <span class="split__w">${w ? esc(w.title) : "Rest"}</span><span class="split__s">${w ? esc(w.short) : "Rest"}</span>
          ${i < t && w ? `<span class="split__ok">${ic("check")}</span>` : ""}
        </${w ? "a" : "div"}>`; }).join("")}</div>
    </section>`;
  }

  function prCard() {
    return `<section aria-labelledby="h-pr" style="display:flex;flex-direction:column;gap:12px">
      <div class="card-head" style="margin:0"><h2 id="h-pr">Personal records</h2><button class="link" type="button" data-action="log-pr">+ New PR</button></div>
      <div class="pr-grid">${S.prs.map((p) => `<div class="pr glass">
        <img src="${p.img}" alt="" loading="lazy" width="64" height="64">
        <div><p class="muted">${esc(p.lift)}</p><p class="pr__kg">${n0(p.kg)}<span class="unit">kg</span></p><p class="pr__sub">${p.reps} reps · ${esc(p.date)}</p></div>
      </div>`).join("")}</div>
    </section>`;
  }

  /* ---------- Views ---------- */
  function viewDashboard() {
    const t = D.activity.today, wk = D.activity.week;
    const tw = todayWorkout(), nx = nextWorkout();
    const plan = tw || (nx && nx.w);
    const done = (plan && S.doneEx[plan.id]) || [];
    const wDelta = weight() - D.body.start;
    const e = eaten(), goal = D.nutrition.goal, ratio = e / 1450;
    return `
      <header class="page-head">
        <div><h1>${greeting()}, ${esc(D.user.first)}</h1><p>${todayLabel} · ${tw ? `${esc(tw.title)} today` : "Rest day — recover well"}</p></div>
        <div class="head-actions">
          <label class="search glass desktop-only">${ic("search")}<span class="sr-only">Search workouts</span><input type="search" placeholder="Search exercises…" data-action="global-search"></label>
          ${themeBtn()}
          <button class="icon-btn" type="button" aria-label="Notifications" data-action="notify">${ic("bell")}<span class="dot"></span></button>
          <span class="avatar desktop-only">${D.user.initials}</span>
        </div>
      </header>

      <div class="grid grid--hero">
        <section class="card card--fill glass" aria-labelledby="h-today">
          <div class="card-head"><h2 id="h-today">Today's Progress</h2><span class="muted">${shortDate()}</span></div>
          <div class="today">
            ${C.ring({ pct: t.goalPct / 100, size: 132, stroke: 15, label: t.goalPct + "%", sub: "of daily goal" })}
            <ul class="metric-list">
              <li><span><i class="dot-key" style="background:var(--red-500)"></i>Gym time</span><b>${t.workoutMin} min</b></li>
              <li><span><i class="dot-key" style="background:var(--charcoal-700)"></i>Calories</span><b>${n0(t.kcal)} kcal</b></li>
              <li><span><i class="dot-key" style="background:var(--gray-500)"></i>Steps</span><b>${n0(t.steps)}</b></li>
              <li><span><i class="dot-key" style="background:var(--silver-500)"></i>Active time</span><b>${t.active}</b></li>
            </ul>
          </div>
        </section>
        <div class="grid grid--kpi" style="grid-template-columns:repeat(2,minmax(0,1fr))">
          ${kpi({ icon: "flame", label: "Calories burned · week", value: n0(weekKcal()), unit: "kcal", delta: "+12%" })}
          ${kpi({ icon: "dumbbell", label: "Gym sessions", value: Math.min(S.completed, GOAL), unit: `of ${GOAL}`, delta: "+1", neutral: true })}
          ${kpi({ icon: "trend", label: "Volume lifted · week", value: n0(S.history.slice(0, Math.min(S.completed, GOAL)).reduce((a, h) => a + (workout(h.workout) ? volume(workout(h.workout)) : 0), 0)), unit: "kg", delta: "+8%" })}
          ${kpi({ icon: "scale", label: "Body weight", value: n1(weight()), unit: "kg", delta: sign(wDelta) + " kg", neutral: true })}
        </div>
      </div>

      <div class="grid grid--2-1">
        <section class="card glass" aria-labelledby="h-cal">
          <div class="card-head" style="align-items:flex-start">
            <div><p class="muted">Calories burned · ${wk.range}</p><p class="big" id="h-cal">${n0(weekKcal())}<span class="unit">kcal burned</span></p></div>
            <a class="link" href="#/activity">Details</a>
          </div>
          <div class="legend"><span><i style="background:var(--red-500)"></i>This week</span><span><i style="background:var(--gray-500)"></i>Last week</span></div>
          ${C.line({ values: wk.kcal, prev: wk.prev, labels: wk.labels, active: 5 })}
          <div class="axis">${wk.labels.map((l, i) => `<span class="${i === 5 ? "on" : ""}">${l}</span>`).join("")}</div>
        </section>
        <section class="card glass" aria-labelledby="h-rings">
          <div class="card-head"><h2 id="h-rings">Activity Rings</h2><span class="muted">Today</span></div>
          <div class="rings-wrap">${C.activityRings(D.activity.rings)}</div>
          ${ringsLegend()}
        </section>
      </div>

      <div class="grid grid--3">
        <section class="card glass" aria-labelledby="h-plan">
          <div class="card-head"><h2 id="h-plan">${tw ? "Today's workout" : `Next: ${nx ? nx.day : ""}`}</h2>${plan ? `<a class="link" href="#/workout/${plan.id}">Open</a>` : ""}</div>
          ${plan ? `<p class="muted" style="display:flex;gap:6px;align-items:center;margin:-6px 0 12px">${ic("dumbbell", "ic--sm")}${esc(plan.title)} · ${plan.mins} min · ${totalSets(plan)} sets</p>
          <div class="rows">${plan.exercises.slice(0, 5).map((x, i) => exRow(plan, x, i, done.includes(i), true)).join("")}</div>` : `<p class="muted">Rest day.</p>`}
        </section>
        <section class="card glass" aria-labelledby="h-body">
          <div class="card-head"><h2 id="h-body">Body measurements</h2><a class="link" href="#/body">History</a></div>
          <div style="display:flex;justify-content:space-between;align-items:flex-end;padding-bottom:8px">
            <div><p class="muted">Current weight</p><p class="big">${n1(weight())}<span class="unit">kg</span></p></div>
            <span class="pill">${sign(wDelta)} kg since ${esc(S.weights[0].d)}</span>
          </div>
          <div class="measure-list">${S.measures.slice(0, 5).map(measureRow).join("")}</div>
        </section>
        <section class="card glass" aria-labelledby="h-nut">
          <div class="card-head"><h2 id="h-nut">Nutrition</h2><a class="link" href="#/nutrition">Log food</a></div>
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:12px">
            <div><p class="muted">Eaten today</p><p class="big">${n0(e)}<span class="unit">kcal</span></p></div>
            <span class="muted" style="font-weight:700">Goal ${n0(goal)}</span>
          </div>
          <div class="progress"><span style="width:${Math.min(100, (e / goal) * 100)}%"></span></div>
          <div style="display:flex;flex-direction:column;gap:14px;margin-top:18px">
            ${D.nutrition.macros.map((m, i) => { const g = Math.round(m.g * ratio); return `<div class="hbar"><div class="hbar__row"><span>${m.label}</span><b>${g} / ${m.goal} g</b></div>
              <div class="progress progress--sm"><span style="width:${Math.min(100, (g / m.goal) * 100)}%;background:${["var(--charcoal-700)", "var(--red-500)", "var(--gray-500)"][i]}"></span></div></div>`; }).join("")}
            <div class="row" style="background:var(--red-100);padding:12px">
              <span class="chip-ic" style="background:var(--red-500);color:#fff;width:36px;height:36px">${ic("droplet", "ic--sm")}</span>
              <div class="row__body"><div class="row__title" style="font-size:14px">Water · ${(S.water * 0.25).toFixed(2)} / ${(D.nutrition.waterGoal * 0.25).toFixed(1)} L</div><div class="row__sub">${S.water} of ${D.nutrition.waterGoal} glasses</div></div>
              <button class="check-btn" style="background:var(--red-500);color:#fff" type="button" data-action="water-add" aria-label="Add a glass of water">${ic("plus")}</button>
            </div>
          </div>
        </section>
      </div>
      ${historyTable()}
      ${footer()}`;
  }

  function ringsLegend() {
    const r = D.activity.rings;
    const rows = [["Move", r.move, "kcal", "var(--red-500)"], ["Exercise", r.exercise, "min", "var(--charcoal-700)"], ["Stand", r.stand, "hr", "var(--gray-500)"]];
    return `<div class="legend-rows">${rows.map(([l, v, u, c]) => `<div><span><i class="dot-key" style="background:${c}"></i>${l}</span><span><b>${v[0]} / ${v[1]} ${u}</b><em>${Math.round((v[0] / v[1]) * 100)}%</em></span></div>`).join("")}</div>`;
  }

  function filteredWorkouts() {
    const q = ui.q.trim().toLowerCase();
    return D.workouts.filter((w) => (ui.cat === "All" || w.cat === ui.cat) &&
      (!q || w.title.toLowerCase().includes(q) || w.cat.toLowerCase().includes(q) || w.focus.toLowerCase().includes(q) || w.exercises.some((x) => x.name.toLowerCase().includes(q))));
  }
  function wkGrid() {
    const cw = customWorkout();
    const list = (cw && (ui.cat === "All" || ui.cat === "Custom") ? [cw] : []).concat(filteredWorkouts());
    return list.length ? list.map(wkCard).join("") : `<p class="muted" style="padding:20px 4px">No workouts match “${esc(ui.q)}”. Try another search.</p>`;
  }
  function viewWorkouts() {
    const cats = ["All", ...(customWorkout() ? ["Custom"] : []), ...new Set(D.workouts.map((w) => w.cat))];
    const done = Math.min(S.completed, GOAL);
    const mins = S.history.slice(0, done).reduce((a, h) => a + (workout(h.workout) ? workout(h.workout).mins : 0), 0);
    const tw = todayWorkout();
    return `${head("Gym Workouts", "Your split, your PRs and every program in one place.")}
      <section class="summary" aria-label="This week">
        <div style="flex:1"><p class="summary__k">THIS WEEK</p><p class="summary__v">${done} of ${GOAL} gym sessions</p><p class="summary__s">${Math.floor(mins / 60)}h ${mins % 60}m lifting · ${tw ? `today: ${esc(tw.title)}` : "today: rest day"}</p></div>
        ${tw ? `<a class="btn btn--sm desktop-only" style="background:#fff;color:var(--red-700)" href="#/workout/${tw.id}">${ic("play")}Start ${esc(tw.cat)}</a>` : ""}
        ${C.ring({ pct: done / GOAL, size: 68, stroke: 8, color: "#fff", track: "rgba(255,255,255,.28)", label: `${done}/${GOAL}` })}
      </section>
      ${splitCard()}
      ${prCard()}
      <label class="search glass" style="width:100%">${ic("search")}<span class="sr-only">Search workouts</span>
        <input id="wk-search" type="search" placeholder="Search programs or exercises (e.g. deadlift)…" value="${esc(ui.q)}" data-action="search"></label>
      <div class="chips" role="group" aria-label="Filter by category">${cats.map((c) => `<button class="chip" type="button" data-action="cat" data-cat="${c}" aria-pressed="${ui.cat === c}">${c}</button>`).join("")}</div>
      <a class="lib-banner glass" href="#/library"><span class="chip-ic">${ic("book")}</span><span class="row__body"><span class="row__title">Exercise library</span><span class="row__sub">${Object.keys(libIndex).length} exercises in ${D.library.length} muscle groups · build your own workout</span></span>${ic("chev")}</a>
      <div class="card-head" style="margin:0"><h2>Programs</h2><span class="muted">${D.workouts.length + (customWorkout() ? 1 : 0)} programs</span></div>
      <div class="wk-grid" id="wk-grid">${wkGrid()}</div>
      ${footer()}`;
  }

  function viewWorkout(id) {
    const w = workout(id);
    if (!w) return id === "custom" ? viewLibrary() : viewWorkouts();
    const done = S.doneEx[w.id] || [];
    const pct = done.length / w.exercises.length;
    return `<a class="back" href="#/workouts">${ic("back", "ic--sm")} All workouts</a>
      <section class="hero">
        <img src="${w.img}" alt="${esc(w.title)}">
        <div class="hero__body">
          <span class="hero__kicker">${esc(w.cat)} · ${esc(w.focus)}</span>
          <h1 class="hero__title">${esc(w.title)}</h1>
          <p style="opacity:.85;max-width:420px">${esc(w.desc)}</p>
          <div class="hero__actions"><button class="round-play" type="button" data-action="start" data-id="${w.id}" aria-label="Start ${esc(w.title)}">${ic("play")}</button>
            <span class="hero__badge">${w.exercises.length} exercises · ${totalSets(w)} sets · ${w.mins} min</span></div>
        </div>
      </section>
      <div class="stat-cards" style="grid-template-columns:repeat(4,minmax(0,1fr))">
        <div class="stat-card glass">${ic("clock")}<b>${w.mins} min</b><span class="muted">Duration</span></div>
        <div class="stat-card glass">${ic("flame")}<b>${w.kcal} kcal</b><span class="muted">Calories</span></div>
        <div class="stat-card glass">${ic("dumbbell")}<b>${totalSets(w)} sets</b><span class="muted">${esc(w.level)}</span></div>
        <div class="stat-card glass">${ic("trend")}<b>${volume(w) ? n0(volume(w)) + " kg" : "Bodyweight"}</b><span class="muted">Volume</span></div>
      </div>
      <div class="grid grid--2-1">
        <section class="card glass" aria-labelledby="h-ex">
          <div class="card-head"><h2 id="h-ex">Exercises</h2><span class="muted">${done.length}/${w.exercises.length} done</span></div>
          <div class="rows">${w.exercises.map((x, i) => exRow(w, x, i, done.includes(i), false)).join("")}</div>
        </section>
        <section class="card glass" aria-labelledby="h-sess" style="display:flex;flex-direction:column;gap:18px;align-self:start">
          <div class="card-head" style="margin:0"><h2 id="h-sess">Session</h2><span class="muted">Today</span></div>
          <div style="display:grid;place-items:center">${C.ring({ pct, size: 150, stroke: 16, label: Math.round(pct * 100) + "%", sub: "complete" })}</div>
          <div class="cal-split"><div><b>${Math.round(w.kcal * pct)} kcal</b><span>Burned so far</span></div><div><b>${w.exercises.length - done.length}</b><span>Exercises left</span></div></div>
          <button class="btn btn--primary btn--block" type="button" data-action="start" data-id="${w.id}">${ic("play")} Start Workout</button>
          <p class="muted" style="text-align:center;font-size:12px">The player walks you through every set with a rest timer.</p>
        </section>
      </div>
      ${footer()}`;
  }

  const PR = D.prescriptions;
  function libList() {
    const q = ui.libQ.trim().toLowerCase();
    const groups = D.library.filter((g) => ui.libG === "all" || g.key === ui.libG)
      .map((g) => ({ g, ex: g.exercises.filter(([n]) => !q || n.toLowerCase().includes(q) || g.name.toLowerCase().includes(q)) }))
      .filter((x) => x.ex.length);
    if (!groups.length) return `<p class="muted" style="padding:12px 4px">No exercises match “${esc(ui.libQ)}”.</p>`;
    return groups.map(({ g, ex }) => `<section class="lib-group glass" aria-labelledby="lg-${g.key}">
      <div class="lib-group__head"><img src="${g.img}" alt="" loading="lazy"><div><h2 id="lg-${g.key}">${esc(g.name)}</h2><span>${ex.length} exercise${ex.length > 1 ? "s" : ""}</span></div></div>
      <ul class="lib-list">${ex.map(([n, t]) => { const on = S.custom.includes(n); const u = usedIn(n); return `<li class="lib-ex">
        <div class="row__body"><div class="row__title">${esc(n)}</div>
          <div class="row__sub"><span class="tag tag--${t}">${PR[t].label}</span>${PR[t].text} · ${PR[t].rest}</div>
          ${u.length ? `<div class="lib-ex__used">In ${u.map((w) => `<a href="#/workout/${w.id}">${esc(w.title)}</a>`).join(", ")}</div>` : ""}</div>
        <button class="check-btn" type="button" data-action="lib-toggle" data-name="${esc(n)}" aria-pressed="${on}" aria-label="${on ? "Remove" : "Add"} ${esc(n)} ${on ? "from" : "to"} my workout">${ic(on ? "check" : "plus")}</button>
      </li>`; }).join("")}</ul></section>`).join("");
  }
  function viewLibrary() {
    const total = Object.keys(libIndex).length;
    const cw = customWorkout();
    return `${head("Exercise Library", `${total} exercises from your gym guide · tap + to build your own workout.`)}
      ${cw ? `<section class="summary" aria-label="My workout">
        <div style="flex:1;min-width:0"><p class="summary__k">MY WORKOUT</p><p class="summary__v">${cw.exercises.length} exercise${cw.exercises.length > 1 ? "s" : ""} · ~${cw.mins} min</p>
          <p class="summary__s lib-picked">${cw.exercises.map((x) => esc(x.name)).join(" · ")}</p></div>
        <div class="lib-actions"><button class="btn btn--sm" style="background:#fff;color:var(--red-700)" type="button" data-action="start" data-id="custom">${ic("play")}Start</button>
          <button class="btn btn--sm" style="background:rgba(255,255,255,.18);color:#fff" type="button" data-action="lib-clear">Clear</button></div>
      </section>` : ""}
      <label class="search glass" style="width:100%">${ic("search")}<span class="sr-only">Search exercises</span>
        <input id="lib-search" type="search" placeholder="Search ${total} exercises (e.g. curl, squat, row)…" value="${esc(ui.libQ)}" data-action="lib-search"></label>
      <div class="chips" role="group" aria-label="Muscle group">
        <button class="chip" type="button" data-action="lib-g" data-g="all" aria-pressed="${ui.libG === "all"}">All</button>
        ${D.library.map((g) => `<button class="chip" type="button" data-action="lib-g" data-g="${g.key}" aria-pressed="${ui.libG === g.key}">${esc(g.name)}</button>`).join("")}
      </div>
      <div class="lib-grid" id="lib-list">${libList()}</div>
      <div class="grid grid--2-1" style="grid-template-columns:repeat(2,minmax(0,1fr))">
        <section class="card glass" aria-labelledby="h-guid"><div class="card-head"><h2 id="h-guid">Sets, reps &amp; rest</h2></div>
          <ul class="tips">${D.guidelines.map((g) => `<li>${ic("check")}<span>${esc(g)}</span></li>`).join("")}</ul></section>
        <section class="card glass" aria-labelledby="h-safe"><div class="card-head"><h2 id="h-safe">Training &amp; safety tips</h2></div>
          <ul class="tips">${D.safety.map((g) => `<li>${ic("heart")}<span>${esc(g)}</span></li>`).join("")}</ul></section>
      </div>
      <p class="muted" style="text-align:center;font-size:12px">General exercise reference, not an individualised training or medical plan.</p>
      ${footer()}`;
  }

  function viewActivity() {
    const d = D.activity[ui.range];
    const total = d.kcal.reduce((a, b) => a + b, 0) + (ui.range === "week" ? S.extraKcal : 0);
    const prevTotal = d.prev.reduce((a, b) => a + b, 0);
    const pct = Math.round(((total - prevTotal) / prevTotal) * 100);
    const active = d.kcal.indexOf(Math.max(...d.kcal));
    const stepsAvg = Math.round(d.steps.reduce((a, b) => a + b, 0) / d.steps.length);
    const maxType = Math.max(...D.activity.byType.map((x) => x[1]));
    return `${head("Activity", "Calories burned, rings and steps.", `<div class="segmented" role="group" aria-label="Range">
        <button type="button" data-action="range" data-r="week" aria-pressed="${ui.range === "week"}">Week</button>
        <button type="button" data-action="range" data-r="month" aria-pressed="${ui.range === "month"}">Month</button></div>`)}
      <section class="card glass" aria-labelledby="h-burn">
        <div class="card-head" style="align-items:flex-start">
          <div><p class="muted">Calories burned · ${d.range}</p><p class="big" id="h-burn">${n0(total)}<span class="unit">kcal</span></p></div>
          <span class="pill">${ic("trend")}${pct >= 0 ? "+" : ""}${pct}% vs last ${ui.range}</span>
        </div>
        <div class="legend"><span><i style="background:var(--red-500)"></i>This ${ui.range}</span><span><i style="background:var(--gray-500)"></i>Last ${ui.range}</span></div>
        ${C.line({ values: d.kcal, prev: d.prev, labels: d.labels, active, w: 900, h: 260 })}
        <div class="axis">${d.labels.map((l, i) => `<span class="${i === active ? "on" : ""}">${l}</span>`).join("")}</div>
      </section>
      <div class="grid grid--3">
        <section class="card glass" aria-labelledby="h-r2">
          <div class="card-head"><h2 id="h-r2">Activity Rings</h2><span class="muted">Today</span></div>
          <div class="rings-wrap">${C.activityRings(D.activity.rings, 170, 15)}</div>${ringsLegend()}
        </section>
        <section class="card glass" aria-labelledby="h-steps">
          <div class="card-head"><h2 id="h-steps">Steps</h2><span class="muted">avg ${n0(stepsAvg)}/${ui.range === "week" ? "day" : "week"}</span></div>
          ${C.bars(d.steps, ui.range === "week" ? d.labels.map((l) => l[0]) : d.labels.map((l) => l.replace("Week ", "W")), ui.range === "week" ? dayIdx() : 3)}
        </section>
        <section class="card glass" aria-labelledby="h-type">
          <div class="card-head"><h2 id="h-type">Burned by session</h2><span class="muted">This week</span></div>
          <div style="display:flex;flex-direction:column;gap:16px">${D.activity.byType.map(([l, v], i) => `<div class="hbar"><div class="hbar__row"><span>${l}</span><b>${n0(v)} kcal</b></div>
            <div class="progress progress--sm"><span style="width:${(v / maxType) * 100}%;background:${["var(--red-500)", "var(--charcoal-700)", "var(--graphite-500)", "var(--gray-500)"][i]}"></span></div></div>`).join("")}</div>
        </section>
      </div>
      ${footer()}`;
  }

  function viewBody() {
    const ws = S.weights, cur = weight(), b = D.body;
    const toGoal = Math.max(0, Math.min(1, (b.start - cur) / (b.start - b.goal)));
    return `${head("Body", "Weight, composition and measurements.", `<button class="btn btn--primary btn--sm" type="button" data-action="log-measure">${ic("plus")}Log measurement</button>`)}
      <div class="grid grid--2-1">
        <section class="card glass" aria-labelledby="h-w">
          <div class="card-head" style="align-items:flex-start">
            <div><p class="muted">Current weight</p><p class="big" id="h-w">${n1(cur)}<span class="unit">kg</span></p></div>
            <span class="pill">${sign(cur - b.start)} kg since ${esc(ws[0].d)}</span>
          </div>
          ${C.line({ values: ws.map((x) => x.w), labels: ws.map((x) => x.d), active: ws.length - 1, unit: "kg", w: 680, h: 200, grid: false })}
          <div class="axis">${ws.map((x, i) => `<span class="${i === ws.length - 1 ? "on" : ""}">${esc(x.d)}</span>`).join("")}</div>
          <div class="hbar" style="margin-top:20px"><div class="hbar__row"><span>Goal ${n1(b.goal)} kg</span><b style="color:var(--red-700)">${Math.round(toGoal * 100)}% there</b></div>
            <div class="progress"><span style="width:${toGoal * 100}%"></span></div></div>
        </section>
        <div class="grid" style="gap:14px;align-content:start">
          <div class="comp glass"><span class="muted">BMI</span><b>${n1(b.bmi)}</b><em>Healthy range</em></div>
          <div class="comp glass"><span class="muted">Body fat</span><b>${n1(b.fat)}<span class="unit">%</span></b><em>${sign(b.fatChange)}% this quarter</em></div>
          <div class="comp glass"><span class="muted">Muscle mass</span><b>${n1(b.muscle)}<span class="unit">kg</span></b><em>${sign(b.muscleChange)} kg this quarter</em></div>
        </div>
      </div>
      <section class="card glass" aria-labelledby="h-m">
        <div class="card-head"><h2 id="h-m">Measurements</h2><span class="muted">Updated ${esc(S.updated)}</span></div>
        <div class="measure-list" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));column-gap:32px">${S.measures.map(measureRow).join("")}</div>
      </section>
      ${footer()}`;
  }

  function viewNutrition() {
    const n = D.nutrition, e = eaten(), ratio = e / 1450;
    const remaining = n.goal - e + n.burned;
    return `${head("Nutrition", "Sri Lankan meal plan · tap a meal to log it.", `<button class="btn btn--primary btn--sm" type="button" data-action="log-food">${ic("plus")}Log food</button>`)}
      <div class="grid grid--2-1">
        <section class="card glass" aria-labelledby="h-goal">
          <div class="card-head" style="align-items:flex-end">
            <div><p class="muted">Calorie goal</p><p class="big" id="h-goal">${n0(n.goal)}<span class="unit">kcal</span></p></div>
            <span class="muted" style="font-weight:700">${n0(e)} / ${n0(n.goal)}</span>
          </div>
          <div class="progress"><span style="width:${Math.min(100, (e / n.goal) * 100)}%"></span></div>
          <div class="cal-split" style="margin-top:16px"><div><b>${n0(e)} kcal</b><span>Eaten</span></div><div><b>${n0(n.burned)} kcal</b><span>Burned</span></div><div><b>${n0(remaining)} kcal</b><span>Remaining</span></div></div>
        </section>
        <section class="card glass" aria-labelledby="h-water">
          <div class="card-head"><h2 id="h-water">Water intake</h2><button class="check-btn" style="background:var(--red-500);color:#fff" type="button" data-action="water-add" aria-label="Add a glass">${ic("plus")}</button></div>
          <p class="muted" style="margin:-8px 0 14px">${S.water} of ${n.waterGoal} glasses · ${(S.water * 0.25).toFixed(2)} L</p>
          <div class="glasses" role="group" aria-label="Glasses of water">${Array.from({ length: n.waterGoal }, (_, i) => `<button type="button" class="${i < S.water ? "on" : ""}" data-action="water" data-i="${i}" aria-label="${i + 1} glasses"></button>`).join("")}</div>
        </section>
      </div>
      <div class="grid macros">
        ${n.macros.map((m, i) => { const g = Math.round(m.g * ratio); const p = g / m.goal; return `<div class="macro glass">
          ${C.ring({ pct: p, size: 66, stroke: 8, color: ["var(--charcoal-700)", "var(--red-500)", "var(--gray-500)"][i], label: Math.round(p * 100) + "%" })}
          <b>${g}g</b><span class="muted">${m.label}</span></div>`; }).join("")}
      </div>
      <section aria-labelledby="h-meals" style="display:flex;flex-direction:column;gap:12px">
        <div class="card-head" style="margin:0"><h2 id="h-meals">Today's meals</h2><span class="link" style="text-decoration:none">${n0(e)} kcal logged</span></div>
        <div class="rows" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px">${S.meals.map(mealRow).join("")}</div>
      </section>
      ${footer()}`;
  }

  /* ---------- Router ---------- */
  function route() {
    const h = location.hash.replace(/^#\/?/, "");
    const [page, id] = h.split("/");
    let html, active, title;
    switch (page) {
      case "workouts": html = viewWorkouts(); active = "workouts"; title = "Workouts"; break;
      case "workout": html = viewWorkout(id); active = "workouts"; title = (workout(id) || {}).title || "Workout"; break;
      case "library": html = viewLibrary(); active = "library"; title = "Exercise Library"; break;
      case "activity": html = viewActivity(); active = "activity"; title = "Activity"; break;
      case "body": html = viewBody(); active = "body"; title = "Body"; break;
      case "nutrition": html = viewNutrition(); active = "nutrition"; title = "Nutrition"; break;
      default: html = viewDashboard(); active = "dashboard"; title = "Dashboard";
    }
    const main = $("#main");
    main.innerHTML = html;
    main.classList.remove("fade-in"); void main.offsetWidth; main.classList.add("fade-in");
    C.bindLines(main);
    renderNav(active);
    document.title = `${title} · FitPulse`;
    return { page, id };
  }
  let last = null;
  function go() { const r = route(); if (!last || last.page !== r.page || last.id !== r.id) window.scrollTo({ top: 0 }); last = r; }
  const rerender = () => { const y = window.scrollY; route(); window.scrollTo({ top: y }); };

  /* ---------- Modal, toast ---------- */
  let lastFocus = null, timer = null;
  function openModal(html) {
    lastFocus = document.activeElement;
    const m = $("#modal");
    m.innerHTML = `<div class="dialog" role="dialog" aria-modal="true">${html}</div>`;
    m.hidden = false;
    const f = m.querySelector("input, select, [data-autofocus]") || m.querySelector("button");
    if (f) f.focus();
  }
  function closeModal() {
    const m = $("#modal"); m.hidden = true; m.innerHTML = "";
    if (timer) { clearInterval(timer.int); timer = null; }
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }
  let toastT;
  function toast(msg) {
    const t = $("#toast"); t.innerHTML = `${ic("check")}${esc(msg)}`; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2600);
  }
  const dlgHead = (t) => `<div class="dialog__head"><h2>${t}</h2><button class="icon-btn" style="box-shadow:none" type="button" data-action="close" aria-label="Close">${ic("x")}</button></div>`;

  function resetDialog() {
    openModal(`${dlgHead("Reset demo data?")}
      <p class="muted" style="font-size:14px">This puts meals, water, measurements, PRs, My Workout and workout history back to the original demo values. Your light/dark choice is kept.</p>
      <div class="timer__actions">
        <button class="btn btn--ghost" type="button" data-action="close">Cancel</button>
        <button class="btn btn--primary" type="button" data-action="reset-confirm" data-autofocus>${ic("reset")}Reset</button>
      </div>`);
  }
  function doReset() {
    S = defaults();
    store.del(KEY); save();
    ui.cat = "All"; ui.q = ""; ui.range = "week"; ui.libG = "all"; ui.libQ = "";
    closeModal(); rerender();
    toast("Demo data reset");
  }

  function measureDialog() {
    openModal(`${dlgHead("Log measurement")}
      <form id="measure-form" class="form-grid" novalidate>
        <div class="field" style="grid-column:1/-1"><label for="f-weight">Weight (kg)</label><input id="f-weight" name="weight" type="number" step="0.1" min="30" max="250" value="${n1(weight())}" required></div>
        ${S.measures.map((m) => `<div class="field"><label for="f-${m.key}">${m.label} (cm)</label><input id="f-${m.key}" name="${m.key}" type="number" step="0.1" min="10" max="250" value="${n1(m.value)}"></div>`).join("")}
        <button class="btn btn--primary btn--block" style="grid-column:1/-1" type="submit">${ic("check")}Save measurement</button>
      </form>`);
  }
  function prDialog() {
    openModal(`${dlgHead("New personal record")}
      <form id="pr-form" class="form-grid" novalidate>
        <div class="field" style="grid-column:1/-1"><label for="f-lift">Lift</label><select id="f-lift" name="lift">${S.prs.map((p, i) => `<option value="${i}">${esc(p.lift)} (current ${p.kg} kg)</option>`).join("")}</select></div>
        <div class="field"><label for="f-kg">Weight (kg)</label><input id="f-kg" name="kg" type="number" step="0.5" min="1" max="500" required></div>
        <div class="field"><label for="f-reps">Reps</label><input id="f-reps" name="reps" type="number" min="1" max="50" value="5" required></div>
        <button class="btn btn--primary btn--block" style="grid-column:1/-1" type="submit">${ic("check")}Save PR</button>
      </form>`);
  }
  function foodDialog() {
    openModal(`${dlgHead("Log food")}
      <p class="muted">Quick add a Sri Lankan favourite</p>
      <div class="quick">${D.nutrition.quickAdd.map((q, i) => `<button type="button" data-action="quick-food" data-i="${i}">${esc(q.dish)}<span>${q.kcal} kcal</span></button>`).join("")}</div>
      <hr class="divider">
      <p class="muted">Or add your own</p>
      <form id="food-form" class="form-grid">
        <div class="field" style="grid-column:1/-1"><label for="f-dish">Food</label><input id="f-dish" name="dish" required placeholder="e.g. Pol sambol &amp; bread"></div>
        <div class="field"><label for="f-kcal">Calories</label><input id="f-kcal" name="kcal" type="number" min="1" max="3000" required placeholder="kcal"></div>
        <div class="field"><label for="f-meal">Meal</label><select id="f-meal" name="meal"><option>Breakfast</option><option>Lunch</option><option>Evening tea</option><option>Dinner</option><option>Snack</option></select></div>
        <button class="btn btn--primary btn--block" style="grid-column:1/-1" type="submit">${ic("plus")}Add food</button>
      </form>`);
  }
  function addFood(dish, kcal, meal) {
    S.meals.push({ meal: meal || guessMeal(), dish, kcal: +kcal, img: null, logged: true });
    save(); closeModal(); rerender(); toast(`${dish} logged · ${kcal} kcal`);
  }
  const guessMeal = () => { const h = new Date().getHours(); return h < 11 ? "Breakfast" : h < 15 ? "Lunch" : h < 18 ? "Evening tea" : "Dinner"; };

  /* ---------- Gym player: set-by-set with rest countdown ---------- */
  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  function startWorkout(id) {
    const w = workout(id); if (!w) return;
    timer = { w, i: 0, set: 1, sec: 0, rest: 0, paused: false, kg: w.exercises.map((x) => x.kg), sets: 0 };
    openModal(`${dlgHead(esc(w.title))}<div class="timer" id="timer"></div>`);
    drawTimer();
    timer.int = setInterval(tick, 1000);
  }
  function tick() {
    if (!timer || timer.paused) return;
    timer.sec++;
    if (timer.rest > 0) { timer.rest--; if (timer.rest === 0) { beep(); drawTimer(); return; } }
    const el = $("#t-time"); if (el) el.textContent = timer.rest > 0 ? mmss(timer.rest) : mmss(timer.sec);
  }
  function beep() { try { const a = new (window.AudioContext || window.webkitAudioContext)(); const o = a.createOscillator(); o.frequency.value = 880; o.connect(a.destination); o.start(); setTimeout(() => { o.stop(); a.close(); }, 180); } catch (e) {} if (navigator.vibrate) navigator.vibrate(200); }
  function drawTimer() {
    if (!timer) return;
    const { w, i, set, rest, paused } = timer, x = w.exercises[i];
    const kg = timer.kg[i];
    const last = i === w.exercises.length - 1 && set > x.sets;
    const overall = timer.sets / totalSets(w);
    const resting = rest > 0;
    $("#timer").innerHTML = `<img class="timer__img" src="${x.img}" alt="">
      <span class="muted">Exercise ${i + 1} of ${w.exercises.length} · ${timer.sets}/${totalSets(w)} sets done</span>
      <p class="timer__ex">${esc(x.name)}</p>
      ${last ? `<p class="pill" style="font-size:13px">All sets complete 💪</p>` : `<div class="set-line">
        <span class="pill pill--neutral" style="font-size:13px">Set ${Math.min(set, x.sets)} of ${x.sets}</span>
        <span class="set-line__reps">${esc(x.reps)} reps</span>
        ${kg !== null ? `<span class="kg-adjust"><button type="button" data-action="kg" data-d="-2.5" aria-label="Decrease weight">−</button><b>${kg} kg</b><button type="button" data-action="kg" data-d="2.5" aria-label="Increase weight">+</button></span>` : `<span class="muted">bodyweight</span>`}
      </div>`}
      <p class="timer__label">${resting ? "Rest" : "Session time"}</p>
      <p class="timer__time ${resting ? "is-rest" : ""}" id="t-time">${resting ? mmss(rest) : mmss(timer.sec)}</p>
      <div class="progress progress--sm" style="width:100%"><span style="width:${overall * 100}%"></span></div>
      <div class="timer__actions">
        <button class="btn btn--ghost" type="button" data-action="t-pause">${ic(paused ? "play" : "pause")}${paused ? "Resume" : "Pause"}</button>
        ${last ? `<button class="btn btn--primary" type="button" data-action="t-finish">${ic("check")}Finish workout</button>`
          : resting ? `<button class="btn btn--primary" type="button" data-action="t-skip">Skip rest ${ic("chev")}</button>`
          : `<button class="btn btn--primary" type="button" data-action="t-set">${ic("check")}Set done</button>`}
      </div>`;
  }
  function setDone() {
    const t = timer, x = t.w.exercises[t.i];
    t.sets++;
    if (t.set < x.sets) { t.set++; t.rest = x.rest; }
    else {
      const arr = S.doneEx[t.w.id] || (S.doneEx[t.w.id] = []);
      if (!arr.includes(t.i)) arr.push(t.i);
      if (t.i < t.w.exercises.length - 1) { t.i++; t.set = 1; t.rest = x.rest; }
      else { t.set = x.sets + 1; t.rest = 0; }
    }
    drawTimer();
  }
  function finishWorkout() {
    const w = timer.w;
    S.doneEx[w.id] = w.exercises.map((_, k) => k);
    S.history.unshift({ date: shortDate(), workout: w.id, hr: 120 + Math.round(Math.random() * 30), status: "Completed" });
    S.extraKcal += w.kcal; S.completed += 1; save();
    closeModal(); location.hash = "#/"; rerender();
    toast(`${w.title} saved · +${w.kcal} kcal burned`);
  }

  /* ---------- Onboarding ---------- */
  function onboarding() {
    if (store.get("fp-onboarded") === "1") return;
    const o = $("#onboarding");
    o.innerHTML = `<div class="onb__media"><img src="assets/img/deadlift.jpg" alt="Athlete holding a loaded barbell"></div>
      <div class="onb__body">
        <div class="logo"><span class="logo__mark">${ic("zap")}</span><span class="logo__text">FitPulse</span></div>
        <span class="onb__badge">NEW · 100+ exercise library</span>
        <h1 class="onb__title">Lift heavier. <span>Track everything.</span></h1>
        <p class="onb__text">Your gym split, every set and rep, calories burned, body measurements and a Sri Lankan meal plan — all in one place.</p>
        <ul class="onb__features">
          <li>${ic("check")}Set-by-set gym player with rest timer</li>
          <li>${ic("check")}Personal records &amp; weekly volume</li>
          <li>${ic("check")}Weight, body measurements &amp; nutrition</li>
        </ul>
        <button class="btn btn--primary" type="button" data-action="onboard">Get Started ${ic("chev")}</button>
        <div class="onb__social"><span class="onb__avatars"><img src="assets/img/bench-press.jpg" alt=""><img src="assets/img/back-squat.jpg" alt=""><img src="assets/img/shoulder-press.jpg" alt=""></span>Join 2M+ members training daily</div>
      </div>`;
    o.hidden = false; document.body.style.overflow = "hidden";
    o.querySelector("button").focus();
  }

  /* ---------- Events ---------- */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-action]");
    if (!t) { if (e.target.id === "modal") closeModal(); return; }
    const a = t.dataset.action;
    switch (a) {
      case "theme": {
        const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        store.set("fp-theme", next);
        rerender(); const b = $('[data-action="theme"]'); if (b) b.focus(); break;
      }
      case "notify": { const tw = todayWorkout(); toast(tw ? `Today is ${tw.title} — let's go!` : "Rest day — stretch and recover"); break; }
      case "cat": ui.cat = t.dataset.cat; document.querySelectorAll('[data-action="cat"]').forEach((b) => b.setAttribute("aria-pressed", b === t)); $("#wk-grid").innerHTML = wkGrid(); break;
      case "range": ui.range = t.dataset.r; rerender(); break;
      case "meal": { const m = S.meals[+t.dataset.i]; m.logged = !m.logged; save(); rerender(); toast(m.logged ? `${m.dish} logged` : `${m.dish} removed`); break; }
      case "water": { const i = +t.dataset.i + 1; S.water = S.water === i ? i - 1 : i; save(); rerender(); break; }
      case "water-add": S.water = Math.min(D.nutrition.waterGoal, S.water + 1); save(); rerender(); toast(S.water >= D.nutrition.waterGoal ? "Hydration goal reached!" : "Glass of water added"); break;
      case "ex": { const id = t.dataset.id, i = +t.dataset.i; const arr = S.doneEx[id] || (S.doneEx[id] = []); const k = arr.indexOf(i); k > -1 ? arr.splice(k, 1) : arr.push(i); save(); rerender(); break; }
      case "start": startWorkout(t.dataset.id); break;
      case "t-pause": timer.paused = !timer.paused; drawTimer(); break;
      case "t-set": setDone(); break;
      case "t-skip": timer.rest = 0; drawTimer(); break;
      case "t-finish": finishWorkout(); break;
      case "kg": { const v = timer.kg[timer.i] + parseFloat(t.dataset.d); timer.kg[timer.i] = Math.max(0, Math.round(v * 2) / 2); drawTimer(); break; }
      case "log-measure": measureDialog(); break;
      case "log-pr": prDialog(); break;
      case "log-food": foodDialog(); break;
      case "quick-food": { const q = D.nutrition.quickAdd[+t.dataset.i]; addFood(q.dish, q.kcal); break; }
      case "close": closeModal(); break;
      case "onboard": store.set("fp-onboarded", "1"); $("#onboarding").hidden = true; document.body.style.overflow = ""; $("#main").focus(); break;
      case "lib-toggle": { const n = t.dataset.name; const k = S.custom.indexOf(n); k > -1 ? S.custom.splice(k, 1) : S.custom.push(n); delete S.doneEx.custom; save(); rerender(); toast(k > -1 ? `${n} removed` : `${n} added to My Workout`); break; }
      case "lib-clear": S.custom = []; delete S.doneEx.custom; save(); rerender(); toast("My Workout cleared"); break;
      case "lib-g": ui.libG = t.dataset.g; rerender(); break;
      case "reset-data": resetDialog(); break;
      case "reset-confirm": doReset(); break;
    }
  });

  document.addEventListener("input", (e) => {
    if (e.target.dataset.action === "search") { ui.q = e.target.value; $("#wk-grid").innerHTML = wkGrid(); }
    if (e.target.dataset.action === "lib-search") { ui.libQ = e.target.value; $("#lib-list").innerHTML = libList(); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#modal").hidden) closeModal();
    if (e.key === "Enter" && e.target.dataset.action === "global-search") { ui.q = e.target.value; ui.cat = "All"; location.hash = "#/workouts"; }
  });
  document.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target, fd = new FormData(f);
    if (f.id === "measure-form") {
      const w = parseFloat(fd.get("weight"));
      if (!(w >= 30 && w <= 250)) { f.weight.focus(); return toast("Enter a weight between 30 and 250 kg"); }
      const label = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      const lastW = S.weights[S.weights.length - 1];
      if (lastW.d === label) lastW.w = w; else S.weights.push({ d: label, w });
      if (S.weights.length > 8) S.weights.shift();
      S.measures.forEach((m) => { const v = parseFloat(fd.get(m.key)); if (v > 0 && v !== m.value) { m.prev = m.value; m.value = v; } });
      S.updated = label; save(); closeModal(); rerender(); toast("Measurement saved");
    }
    if (f.id === "pr-form") {
      const p = S.prs[+fd.get("lift")], kg = parseFloat(fd.get("kg")), reps = parseInt(fd.get("reps"), 10);
      if (!(kg > 0)) { f.kg.focus(); return toast("Enter the weight you lifted"); }
      const beat = kg > p.kg;
      p.kg = kg; p.reps = reps || 1; p.date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      save(); closeModal(); rerender(); toast(beat ? `New ${p.lift} PR: ${kg} kg 🔥` : `${p.lift} record updated`);
    }
    if (f.id === "food-form") {
      const dish = String(fd.get("dish") || "").trim(), kcal = parseInt(fd.get("kcal"), 10);
      if (!dish) { f.dish.focus(); return; }
      if (!(kcal > 0)) { f.kcal.focus(); return toast("Enter the calories"); }
      addFood(dish, kcal, fd.get("meal"));
    }
  });

  // If any photo is missing, swap in a default gym photo instead of a broken image
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (img.tagName === "IMG" && !img.dataset.fallback) { img.dataset.fallback = "1"; img.src = "assets/img/strength.jpg"; }
  }, true);

  window.addEventListener("hashchange", go);
  go();
  onboarding();
})();
