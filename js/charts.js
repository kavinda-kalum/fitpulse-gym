/* Tiny dependency-free SVG chart helpers for FitPulse */
(function () {
  const RED = "#E5383B";

  function ring({ pct, size = 120, stroke = 14, color = "var(--red-500)", track = "var(--track)", label = "", sub = "", cls = "" }) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const off = c * (1 - Math.max(0, Math.min(1, pct)));
    return `<div class="ring ${cls}" style="width:${size}px;height:${size}px" role="img" aria-label="${Math.round(pct * 100)}%${sub ? " " + sub : ""}">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${track}" stroke-width="${stroke}"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"
          stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}"/>
      </svg>
      ${label ? `<div class="ring__label"><b>${label}</b>${sub ? `<span>${sub}</span>` : ""}</div>` : ""}
    </div>`;
  }

  /* Three concentric activity rings */
  function activityRings(rings, size = 180, stroke = 16) {
    const items = [
      [rings.move[0] / rings.move[1], "var(--red-500)"],
      [rings.exercise[0] / rings.exercise[1], "var(--charcoal-700)"],
      [rings.stand[0] / rings.stand[1], "var(--gray-500)"]
    ];
    let circles = "";
    items.forEach(([p, col], i) => {
      const r = size / 2 - stroke / 2 - i * (stroke + 5);
      const c = 2 * Math.PI * r;
      circles += `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="var(--track)" stroke-width="${stroke}" fill="none"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${col}" stroke-width="${stroke}" fill="none" stroke-linecap="round"
          stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${(c * (1 - Math.min(1, p))).toFixed(2)}"/>`;
    });
    return `<div class="ring" style="width:${size}px;height:${size}px" role="img" aria-label="Activity rings">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${circles}</svg></div>`;
  }

  function smooth(pts) {
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d;
  }

  let uid = 0;
  /* Interactive smooth line chart. Returns HTML; call bindLine(el) after insert. */
  function line({ values, prev = null, labels, active = values.indexOf(Math.max(...values)), w = 680, h = 240, unit = "kcal", grid = true, fmt = (v) => v.toLocaleString() }) {
    const id = "g" + (++uid);
    const all = prev ? values.concat(prev) : values;
    const hi = Math.max(...all), lo = Math.min(...all);
    const max = hi, min = lo - (hi - lo || hi * 0.1) * 0.45;
    const pad = 10, top = 34;
    const xy = (arr) => arr.map((v, i) => [pad + (i * (w - pad * 2)) / (arr.length - 1), h - 8 - ((v - min) / (max - min || 1)) * (h - top - 8)]);
    const pts = xy(values);
    const d = smooth(pts);
    const area = `${d} L${pts[pts.length - 1][0]},${h} L${pts[0][0]},${h} Z`;
    let g = "";
    if (grid) for (let i = 0; i < 4; i++) { const y = top - 10 + (i * (h - top)) / 3; g += `<path d="M0 ${y.toFixed(1)}H${w}" stroke="var(--gray-500)" stroke-opacity=".22" stroke-dasharray="4 6"/>`; }
    const prevPath = prev ? `<path d="${smooth(xy(prev))}" fill="none" stroke="var(--gray-500)" stroke-width="2" stroke-dasharray="6 6" stroke-linecap="round"/>` : "";
    const step = (w - pad * 2) / (values.length - 1);
    const hits = pts.map((p, i) => `<rect class="hit" data-i="${i}" x="${(p[0] - step / 2).toFixed(1)}" y="0" width="${step.toFixed(1)}" height="${h}"/>`).join("");
    const p = pts[active];
    const data = encodeURIComponent(JSON.stringify({ pts, values, labels, unit, w, h }));
    return `<div class="chart" data-line="${data}">
      <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Line chart">
        <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${RED}" stop-opacity=".3"/><stop offset="1" stop-color="${RED}" stop-opacity="0"/></linearGradient></defs>
        ${g}${prevPath}
        <path d="${area}" fill="url(#${id})"/>
        <path d="${d}" fill="none" stroke="${RED}" stroke-width="3" stroke-linecap="round"/>
        <path class="marker-line" d="M${p[0]} ${p[1]}V${h}" stroke="${RED}" stroke-width="1.5" stroke-dasharray="3 4"/>
        <circle class="marker" cx="${p[0]}" cy="${p[1]}" r="6" fill="var(--card)" stroke="${RED}" stroke-width="3"/>
        ${hits}
      </svg>
      <div class="chart-tip" style="left:${((p[0] / w) * 100).toFixed(2)}%;top:${((p[1] / h) * 100).toFixed(2)}%">${labels[active]} · ${fmt(values[active])} ${unit}</div>
    </div>`;
  }

  function bindLines(root) {
    root.querySelectorAll(".chart[data-line]").forEach((el) => {
      const { pts, values, labels, unit, w, h } = JSON.parse(decodeURIComponent(el.dataset.line));
      const tip = el.querySelector(".chart-tip"), m = el.querySelector(".marker"), ml = el.querySelector(".marker-line");
      const axis = el.parentElement.querySelector(".axis");
      const show = (i) => {
        const p = pts[i];
        m.setAttribute("cx", p[0]); m.setAttribute("cy", p[1]);
        ml.setAttribute("d", `M${p[0]} ${p[1]}V${h}`);
        tip.style.left = ((p[0] / w) * 100).toFixed(2) + "%";
        tip.style.top = ((p[1] / h) * 100).toFixed(2) + "%";
        tip.textContent = `${labels[i]} · ${values[i].toLocaleString()} ${unit}`;
        if (axis) axis.querySelectorAll("span").forEach((s, k) => s.classList.toggle("on", k === i));
      };
      el.querySelectorAll(".hit").forEach((r) => {
        r.addEventListener("mouseenter", () => show(+r.dataset.i));
        r.addEventListener("click", () => show(+r.dataset.i));
      });
    });
  }

  function bars(values, labels, active) {
    const max = Math.max(...values);
    return `<div class="bars" role="img" aria-label="Bar chart">${values.map((v, i) => `
      <div class="bars__col ${i === active ? "on" : ""}" title="${labels[i]}: ${v.toLocaleString()}">
        <div class="bars__track"><div class="bars__fill" style="height:${((v / max) * 100).toFixed(1)}%"></div></div>
        <span>${labels[i]}</span>
      </div>`).join("")}</div>`;
  }

  window.FPCharts = { ring, activityRings, line, bindLines, bars };
})();
