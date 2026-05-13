const state = {
  view: "overview",
  monthId: null,
  compareMonthId: null,
  division: "all",
  projectId: "all",
  search: "",
  data: null,
  norms: null,
  actions: [],
};

const views = [
  ["overview", "Обзор"],
  ["divisions", "Дивизионы"],
  ["projects", "Проекты"],
  ["project", "Карточка проекта"],
  ["dynamics", "Динамика"],
  ["funnel", "Воронка подбора"],
  ["marketing", "Маркетинг"],
  ["actions", "Проблемы и действия"],
  ["norms", "Нормативы"],
];

const moneyMetrics = new Set([
  "revenueVat",
  "penalties",
  "realizationPayroll",
  "recruitingPayroll",
  "marketingPayroll",
  "marketingBudget",
  "responseCost",
  "targetLeadCost",
]);

const percentMetrics = new Set([
  "penaltyShare",
  "requestCloseRate",
  "invitedToResponseRate",
  "registeredToInvitedRate",
  "warehouseToRegisteredRate",
  "firstShiftToWarehouseRate",
  "tenShiftsToFirstShiftRate",
  "responseToWarehouseRate",
  "targetLeadRate",
]);

const metricGroups = {
  realization: ["request", "avgOutput", "currentStaff", "productivity", "penalties", "penaltyShare", "revenueVat", "requestCloseRate", "secretCheck", "realizationPayroll"],
  recruiting: ["recruitingPayroll", "invited", "registered", "warehouseReached", "firstShift", "tenShifts", "registeredToInvitedRate", "warehouseToRegisteredRate", "firstShiftToWarehouseRate", "tenShiftsToFirstShiftRate"],
  marketing: ["marketingPayroll", "marketingBudget", "responses", "targetLeads", "targetLeadRate", "responseCost", "targetLeadCost"],
};

const screenNotes = {
  overview: "Общая картина месяца: KPI, индекс здоровья, динамика, риски и точки роста.",
  divisions: "Сравнение дивизионов с руководителями, вкладом в результат и проблемными зонами.",
  projects: "Единый реестр проектов за выбранный месяц с нормами, отклонениями и индексом.",
  project: "Карточка проекта: история, метрики, воронка, маркетинг, блокеры и договоренности.",
  dynamics: "Месяц к месяцу по бизнесу, дивизионам и проектам. Структура уже готова к новым периодам.",
  funnel: "Воронка подбора: приглашенные, оформление, доходимость, первая и десятая смена.",
  marketing: "Маркетинговая эффективность: бюджеты, отклики, целевые лиды и стоимость результата.",
  actions: "Блокеры, драйверы и договоренности превращены в управленческие действия с историей.",
  norms: "Изменяемые нормативы: компания, дивизион, проект и месяц. Сейчас это JSON, позже БД.",
};

async function boot() {
  const [data, norms, actions] = await Promise.all([
    fetch("data/monthly-reports.json").then((r) => r.json()),
    fetch("data/norms.json").then((r) => r.json()),
    fetch("data/actions.json").then((r) => r.json()),
  ]);
  state.data = data;
  state.norms = norms;
  state.actions = actions.actions || [];
  state.monthId = data.reports.at(-1).id;
  state.compareMonthId = data.reports[0].id;
  render();
}

function $(selector) {
  return document.querySelector(selector);
}

function report(monthId = state.monthId) {
  return state.data.reports.find((item) => item.id === monthId) || state.data.reports[0];
}

function selectedProjects(monthId = state.monthId) {
  let projects = report(monthId).projects;
  if (state.division !== "all") projects = projects.filter((p) => p.division === state.division);
  if (state.projectId !== "all") projects = projects.filter((p) => p.id === state.projectId);
  if (state.search.trim()) {
    const query = state.search.toLowerCase().trim();
    projects = projects.filter((p) => `${p.name} ${p.division} ${p.metrics.marketingProjectName || ""}`.toLowerCase().includes(query));
  }
  return projects;
}

function divisions() {
  return [...new Set(state.data.reports.flatMap((r) => r.projects.map((p) => p.division)))].sort((a, b) => a.localeCompare(b, "ru"));
}

function projectOptions() {
  return [...state.data.projects].sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

function normFor(metric, project) {
  const norms = state.norms;
  const monthNorm = norms.month?.[state.monthId]?.[metric];
  const projectNorm = norms.project?.[project?.id]?.[metric];
  const divisionNorm = norms.division?.[project?.division]?.[metric];
  return projectNorm || divisionNorm || monthNorm || norms.company?.[metric] || null;
}

function scoreMetric(value, norm) {
  if (!norm || norm.target === null || value === null || value === undefined || Number.isNaN(value)) return null;
  if (norm.direction === "lte") {
    if (value <= norm.target) return 100;
    if (norm.target === 0) return value === 0 ? 100 : 0;
    return Math.max(0, Math.min(100, (norm.target / value) * 100));
  }
  if (value >= norm.target) return 100;
  if (norm.target === 0) return value > 0 ? 100 : 0;
  return Math.max(0, Math.min(100, (value / norm.target) * 100));
}

function health(project) {
  const m = project.metrics;
  if (!m.request && !m.avgOutput && !m.revenueVat) {
    return { score: null, status: "Нет активной потребности", tone: "neutral", details: [] };
  }

  const evaluated = Object.keys(state.norms.company)
    .map((metric) => {
      const norm = normFor(metric, project);
      const raw = scoreMetric(m[metric], norm);
      if (raw === null) return null;
      return { metric, raw, weight: norm.weight || 5, value: m[metric], norm };
    })
    .filter(Boolean);

  if (!m.marketingBudget && !m.responses && m.requestCloseRate < 0.95) {
    evaluated.push({ metric: "marketingActivity", raw: 45, weight: 8, value: 0, norm: { target: 1, direction: "gte" } });
  }

  if (!evaluated.length) return { score: null, status: "Недостаточно данных", tone: "neutral", details: [] };
  const totalWeight = evaluated.reduce((sum, item) => sum + item.weight, 0);
  const score = Math.round(evaluated.reduce((sum, item) => sum + item.raw * item.weight, 0) / totalWeight);
  let status = "Отлично";
  let tone = "good";
  if (score < 50) {
    status = "Критично";
    tone = "bad";
  } else if (score < 70) {
    status = "Зона внимания";
    tone = "warn";
  } else if (score < 85) {
    status = "Нормально";
    tone = "neutral";
  }
  return { score, status, tone, details: evaluated.sort((a, b) => a.raw - b.raw) };
}

function sum(projects, metric) {
  return projects.reduce((acc, project) => acc + (Number(project.metrics[metric]) || 0), 0);
}

function average(projects, metric) {
  const values = projects.map((p) => p.metrics[metric]).filter((v) => typeof v === "number" && Number.isFinite(v));
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function aggregate(projects) {
  const agg = {};
  Object.values(metricGroups).flat().forEach((metric) => {
    agg[metric] = sum(projects, metric);
  });
  agg.penaltyShare = agg.revenueVat ? agg.penalties / agg.revenueVat : 0;
  agg.requestCloseRate = agg.request ? agg.avgOutput / agg.request : 0;
  agg.registeredToInvitedRate = agg.invited ? agg.registered / agg.invited : 0;
  agg.warehouseToRegisteredRate = agg.registered ? agg.warehouseReached / agg.registered : 0;
  agg.firstShiftToWarehouseRate = agg.warehouseReached ? agg.firstShift / agg.warehouseReached : 0;
  agg.tenShiftsToFirstShiftRate = agg.firstShift ? agg.tenShifts / agg.firstShift : 0;
  agg.targetLeadRate = agg.responses ? agg.targetLeads / agg.responses : 0;
  agg.responseCost = agg.responses ? (agg.marketingBudget + agg.marketingPayroll) / agg.responses : 0;
  agg.targetLeadCost = agg.targetLeads ? (agg.marketingBudget + agg.marketingPayroll) / agg.targetLeads : 0;
  agg.secretCheck = average(projects, "secretCheck");
  agg.productivity = average(projects, "productivity");
  return agg;
}

function format(value, metric) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  if (percentMetrics.has(metric)) return `${(value * 100).toFixed(value < 0.1 ? 1 : 0)}%`;
  if (moneyMetrics.has(metric)) {
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} млн ₽`;
    return `${Math.round(value).toLocaleString("ru-RU")} ₽`;
  }
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} млн`;
  return Number(value).toLocaleString("ru-RU", { maximumFractionDigits: 1 });
}

function delta(current, previous, metric) {
  if (!previous && previous !== 0) return `<span class="kpi-delta">нет сравнения</span>`;
  const diff = current - previous;
  const cls = diff >= 0 ? "delta-up" : "delta-down";
  const sign = diff >= 0 ? "+" : "";
  return `<span class="kpi-delta ${cls}">${sign}${format(diff, metric)} к сравнению</span>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function render() {
  const app = $("#app");
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          ${sthLogo()}
          <div>
            <div class="brand-title">STH</div>
            <div class="brand-subtitle">Month dashboard</div>
          </div>
        </div>
        <nav class="nav">
          ${views.map(([id, label]) => `<button class="${state.view === id ? "active" : ""}" data-view="${id}">${label}</button>`).join("")}
        </nav>
        <p class="footer-note">Публичная read-only версия. Данные сейчас из JSON, позже источник можно заменить на API/БД.</p>
      </aside>
      <main class="main">
        ${topbar()}
        <section id="screen">${screen()}</section>
      </main>
    </div>
  `;
  bind();
}

function sthLogo() {
  return `
    <svg class="sth-mark" viewBox="0 0 64 64" aria-label="STH">
      <g fill="#E62250">
        <circle cx="14" cy="10" r="8"/><circle cx="40" cy="10" r="8"/><circle cx="56" cy="34" r="8"/>
        <circle cx="14" cy="54" r="8"/><circle cx="40" cy="54" r="8"/><circle cx="56" cy="54" r="8"/>
        <path d="M14 18c0 10 6 16 16 16 7 0 10 4 10 10v10c6 0 10-4 10-10 0-10-6-18-18-18-5 0-8-3-8-8v-8c-6 0-10 4-10 8Z"/>
      </g>
    </svg>
  `;
}

function topbar() {
  const title = views.find(([id]) => id === state.view)?.[1] || "Обзор";
  return `
    <div class="topbar">
      <div>
        <h1 class="page-title">${title}</h1>
        <p class="page-note">${screenNotes[state.view]}</p>
      </div>
      <div class="filters">
        ${selectControl("Месяц", "month", state.monthId, state.data.reports.map((r) => [r.id, r.label]))}
        ${selectControl("Сравнить с", "compare", state.compareMonthId, state.data.reports.map((r) => [r.id, r.label]))}
        ${selectControl("Дивизион", "division", state.division, [["all", "Все дивизионы"], ...divisions().map((d) => [d, d])])}
        ${selectControl("Проект", "project", state.projectId, [["all", "Все проекты"], ...projectOptions().map((p) => [p.id, p.name])])}
      </div>
    </div>
  `;
}

function selectControl(label, name, value, options) {
  return `
    <label class="control">
      <span>${label}</span>
      <select data-control="${name}">
        ${options.map(([id, text]) => `<option value="${escapeHtml(id)}" ${id === value ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
      </select>
    </label>
  `;
}

function bind() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      render();
    });
  });
  document.querySelectorAll("[data-control]").forEach((control) => {
    control.addEventListener("change", () => {
      const key = control.dataset.control;
      if (key === "month") state.monthId = control.value;
      if (key === "compare") state.compareMonthId = control.value;
      if (key === "division") state.division = control.value;
      if (key === "project") state.projectId = control.value;
      render();
    });
  });
  document.querySelectorAll("[data-open-project]").forEach((button) => {
    button.addEventListener("click", () => {
      state.projectId = button.dataset.openProject;
      state.view = "project";
      render();
    });
  });
  const search = $("[data-search]");
  if (search) {
    search.addEventListener("input", (event) => {
      state.search = event.target.value;
      $("#screen").innerHTML = screen();
      bind();
    });
  }
}

function screen() {
  const screens = {
    overview: overviewScreen,
    divisions: divisionsScreen,
    projects: projectsScreen,
    project: projectScreen,
    dynamics: dynamicsScreen,
    funnel: funnelScreen,
    marketing: marketingScreen,
    actions: actionsScreen,
    norms: normsScreen,
  };
  return screens[state.view]();
}

function kpi(label, value, metric, previous) {
  return `
    <div class="card kpi">
      <div class="kpi-label">${label}</div>
      <div>
        <div class="kpi-value">${format(value, metric)}</div>
        ${previous === undefined ? "" : delta(value, previous, metric)}
      </div>
    </div>
  `;
}

function overviewScreen() {
  const projects = selectedProjects();
  const current = aggregate(projects);
  const previous = aggregate(selectedProjects(state.compareMonthId));
  const healthItems = projects.map((p) => ({ project: p, health: health(p) })).filter((x) => x.health.score !== null);
  const avgHealth = healthItems.length ? Math.round(healthItems.reduce((s, x) => s + x.health.score, 0) / healthItems.length) : null;
  const risky = healthItems.sort((a, b) => a.health.score - b.health.score).slice(0, 7);
  return `
    <div class="grid kpi-grid">
      ${kpi("Индекс здоровья", avgHealth, "number")}
      ${kpi("Выручка с НДС", current.revenueVat, "revenueVat", previous.revenueVat)}
      ${kpi("Закрытие заявки", current.requestCloseRate, "requestCloseRate", previous.requestCloseRate)}
      ${kpi("Штрафы / выручка", current.penaltyShare, "penaltyShare", previous.penaltyShare)}
    </div>
    <div class="grid two-col" style="margin-top:14px">
      <div class="card">
        <h2 class="card-title">Динамика ключевых показателей</h2>
        ${lineChart(state.data.reports.map((r) => ({ label: r.label, value: aggregate(filteredReportProjects(r.id)).revenueVat })), "revenueVat")}
      </div>
      <div class="card">
        <h2 class="card-title">Проекты в зоне внимания</h2>
        <div class="risk-list">
          ${risky.map(({ project, health: h }) => riskRow(project, h)).join("") || empty("Нет проектов для отображения")}
        </div>
      </div>
    </div>
    <div class="grid three-col" style="margin-top:14px">
      ${summaryCard("Реализация", current, ["request", "avgOutput", "currentStaff", "revenueVat", "penalties", "secretCheck"])}
      ${summaryCard("Подбор", current, ["invited", "registered", "warehouseReached", "firstShift", "tenShifts", "tenShiftsToFirstShiftRate"])}
      ${summaryCard("Маркетинг", current, ["marketingBudget", "responses", "targetLeads", "targetLeadRate", "responseCost", "targetLeadCost"])}
    </div>
  `;
}

function filteredReportProjects(monthId) {
  const r = report(monthId);
  let projects = r.projects;
  if (state.division !== "all") projects = projects.filter((p) => p.division === state.division);
  if (state.projectId !== "all") projects = projects.filter((p) => p.id === state.projectId);
  return projects;
}

function summaryCard(title, metrics, keys) {
  return `
    <div class="card">
      <h2 class="card-title">${title}</h2>
      <div class="metric-list">
        ${keys.map((key) => `
          <div class="metric-row">
            <span>${state.data.metricLabels[key] || key}</span>
            <strong>${format(metrics[key], key)}</strong>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function riskRow(project, h) {
  const weak = h.details.slice(0, 2).map((d) => state.data.metricLabels[d.metric] || d.metric).join(", ");
  return `
    <div class="risk">
      <div style="display:flex;justify-content:space-between;gap:10px">
        <button class="linkish" data-open-project="${project.id}">${escapeHtml(project.name)}</button>
        ${badge(h.status, h.tone)}
      </div>
      <div class="muted">${escapeHtml(project.division)}${project.divisionLeader ? `, ${escapeHtml(project.divisionLeader)}` : ""}</div>
      <div>Индекс: <strong>${h.score}</strong>. Слабые места: ${escapeHtml(weak || "нет")}</div>
    </div>
  `;
}

function badge(text, tone = "neutral") {
  return `<span class="badge ${tone}">${escapeHtml(text)}</span>`;
}

function divisionsScreen() {
  const rows = divisions().map((division) => {
    const projects = report().projects.filter((p) => p.division === division);
    const a = aggregate(projects);
    const healthItems = projects.map(health).filter((h) => h.score !== null);
    const score = healthItems.length ? Math.round(healthItems.reduce((s, h) => s + h.score, 0) / healthItems.length) : null;
    return { division, leader: projects[0]?.divisionLeader || "", projects, a, score };
  });
  return `
    <div class="grid three-col">
      ${rows.map((row) => `
        <div class="card">
          <h2 class="card-title">${escapeHtml(row.division)} ${badge(row.score ?? "н/д", row.score < 60 ? "bad" : row.score < 75 ? "warn" : "good")}</h2>
          <p class="muted">${escapeHtml(row.leader || "Руководитель не указан")}</p>
          <div class="metric-list">
            <div class="metric-row"><span>Проектов</span><strong>${row.projects.length}</strong></div>
            <div class="metric-row"><span>Выручка</span><strong>${format(row.a.revenueVat, "revenueVat")}</strong></div>
            <div class="metric-row"><span>Закрытие заявки</span><strong>${format(row.a.requestCloseRate, "requestCloseRate")}</strong></div>
            <div class="metric-row"><span>Целевые лиды</span><strong>${format(row.a.targetLeads, "targetLeads")}</strong></div>
            <div class="metric-row"><span>Стоимость целевого</span><strong>${format(row.a.targetLeadCost, "targetLeadCost")}</strong></div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function projectsScreen() {
  const projects = selectedProjects().map((p) => ({ ...p, h: health(p) })).sort((a, b) => (a.h.score ?? 999) - (b.h.score ?? 999));
  return `
    <div class="card">
      <h2 class="card-title">Реестр проектов <input data-search placeholder="Поиск по проекту, дивизиону, медиаплану" value="${escapeHtml(state.search)}"></h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Проект</th><th>Дивизион</th><th>Индекс</th><th>Заявка</th><th>Выход</th><th>Выручка</th><th>Закрытие</th><th>Штрафы</th><th>Целевые</th><th>Стоимость целевого</th></tr></thead>
          <tbody>
            ${projects.map(projectRow).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function projectRow(project) {
  const m = project.metrics;
  return `
    <tr>
      <td><button class="linkish" data-open-project="${project.id}">${escapeHtml(project.name)}</button></td>
      <td>${escapeHtml(project.division)}<br><span class="muted">${escapeHtml(project.divisionLeader || "")}</span></td>
      <td>${badge(project.h.score ?? "н/д", project.h.tone)}</td>
      <td>${format(m.request, "request")}</td>
      <td>${format(m.avgOutput, "avgOutput")}</td>
      <td>${format(m.revenueVat, "revenueVat")}</td>
      <td>${format(m.requestCloseRate, "requestCloseRate")}</td>
      <td>${format(m.penaltyShare, "penaltyShare")}</td>
      <td>${format(m.targetLeads, "targetLeads")}</td>
      <td>${format(m.targetLeadCost, "targetLeadCost")}</td>
    </tr>
  `;
}

function projectScreen() {
  const project = selectedProjects()[0] || report().projects.find((p) => p.id === state.projectId) || report().projects[0];
  if (!project) return empty("Проект не найден");
  const h = health(project);
  const history = state.data.reports.map((r) => r.projects.find((p) => p.id === project.id)).filter(Boolean);
  const projectActions = state.actions.filter((a) => a.projectId === project.id);
  return `
    <div class="card project-head">
      <div>
        <h2 class="project-name">${escapeHtml(project.name)}</h2>
        <p class="muted">${escapeHtml(project.division)}${project.divisionLeader ? `, ${escapeHtml(project.divisionLeader)}` : ""}</p>
      </div>
      <div>${ring(h.score)}${badge(h.status, h.tone)}</div>
    </div>
    <div class="small-grid" style="margin-top:14px">
      ${["request", "avgOutput", "currentStaff", "revenueVat", "requestCloseRate", "targetLeadCost"].map((key) => miniMetric(key, project.metrics[key])).join("")}
    </div>
    <div class="grid two-col" style="margin-top:14px">
      <div class="card">
        <h2 class="card-title">История проекта</h2>
        ${lineChart(history.map((p) => ({ label: report(p.monthId).label, value: p.metrics.revenueVat || 0 })), "revenueVat")}
      </div>
      <div class="card">
        <h2 class="card-title">Слабые места индекса</h2>
        <div class="metric-list">
          ${(h.details || []).slice(0, 8).map((d) => `<div class="metric-row"><span>${state.data.metricLabels[d.metric] || d.metric}</span><strong>${Math.round(d.raw)} / 100</strong></div>`).join("") || empty("Нет расчетных отклонений")}
        </div>
      </div>
    </div>
    <div class="grid three-col" style="margin-top:14px">
      ${summaryCard("Реализация", project.metrics, metricGroups.realization)}
      ${summaryCard("Подбор", project.metrics, metricGroups.recruiting)}
      ${summaryCard("Маркетинг", project.metrics, metricGroups.marketing)}
    </div>
    <div class="card" style="margin-top:14px">
      <h2 class="card-title">История действий</h2>
      <div class="action-list">${projectActions.map(actionCard).join("") || empty("Действий по проекту пока нет")}</div>
    </div>
  `;
}

function miniMetric(key, value) {
  return `<div class="mini"><span>${state.data.metricLabels[key] || key}</span><strong>${format(value, key)}</strong></div>`;
}

function dynamicsScreen() {
  const series = [
    ["Выручка", "revenueVat"],
    ["Закрытие заявки", "requestCloseRate"],
    ["Целевые лиды", "targetLeads"],
    ["Стоимость целевого", "targetLeadCost"],
  ];
  return `
    <div class="grid two-col">
      ${series.map(([title, metric]) => `
        <div class="card">
          <h2 class="card-title">${title}</h2>
          ${lineChart(state.data.reports.map((r) => ({ label: r.label, value: aggregate(filteredReportProjects(r.id))[metric] || 0 })), metric)}
        </div>
      `).join("")}
    </div>
  `;
}

function funnelScreen() {
  const a = aggregate(selectedProjects());
  const steps = [
    ["Отклики", a.responses, 1],
    ["Приглашенные", a.invited, a.responses ? a.invited / a.responses : 0],
    ["Оформленные", a.registered, a.invited ? a.registered / a.invited : 0],
    ["Дошли до склада", a.warehouseReached, a.registered ? a.warehouseReached / a.registered : 0],
    ["1 смена", a.firstShift, a.warehouseReached ? a.firstShift / a.warehouseReached : 0],
    ["10 смен", a.tenShifts, a.firstShift ? a.tenShifts / a.firstShift : 0],
  ];
  return `
    <div class="grid two-col">
      <div class="card">
        <h2 class="card-title">Воронка подбора</h2>
        <div class="funnel">
          ${steps.map(([label, value, rate]) => `
            <div class="funnel-step">
              <strong>${label}</strong>
              <div class="bar-track"><div class="bar-fill" style="width:${Math.max(3, Math.min(100, rate * 100))}%"></div></div>
              <span>${format(value, "number")} / ${format(rate, "requestCloseRate")}</span>
            </div>
          `).join("")}
        </div>
      </div>
      ${summaryCard("Конверсии", a, ["registeredToInvitedRate", "warehouseToRegisteredRate", "firstShiftToWarehouseRate", "tenShiftsToFirstShiftRate", "responseToWarehouseRate"])}
    </div>
  `;
}

function marketingScreen() {
  const projects = selectedProjects().filter((p) => p.metrics.responses || p.metrics.marketingBudget || p.metrics.targetLeads);
  const a = aggregate(projects);
  const maxCost = Math.max(...projects.map((p) => p.metrics.targetLeadCost || 0), 1);
  return `
    <div class="grid kpi-grid">
      ${kpi("Бюджет маркетинга", a.marketingBudget, "marketingBudget")}
      ${kpi("Отклики", a.responses, "responses")}
      ${kpi("Целевые лиды", a.targetLeads, "targetLeads")}
      ${kpi("Стоимость целевого", a.targetLeadCost, "targetLeadCost")}
    </div>
    <div class="card" style="margin-top:14px">
      <h2 class="card-title">Стоимость целевого по проектам</h2>
      ${projects.sort((a, b) => (b.metrics.targetLeadCost || 0) - (a.metrics.targetLeadCost || 0)).slice(0, 18).map((p) => `
        <div class="bar">
          <button class="linkish" data-open-project="${p.id}">${escapeHtml(p.name)}</button>
          <div class="bar-track"><div class="bar-fill" style="width:${Math.max(2, ((p.metrics.targetLeadCost || 0) / maxCost) * 100)}%"></div></div>
          <strong>${format(p.metrics.targetLeadCost, "targetLeadCost")}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function actionsScreen() {
  let items = state.actions.filter((a) => a.monthId === state.monthId);
  if (state.division !== "all") items = items.filter((a) => a.division === state.division);
  if (state.projectId !== "all") items = items.filter((a) => a.projectId === state.projectId);
  const blockerCount = items.filter((a) => a.kind === "blocker").length;
  return `
    <div class="grid kpi-grid">
      ${kpi("Всего действий", items.length, "number")}
      ${kpi("Блокеры", blockerCount, "number")}
      ${kpi("Драйверы", items.filter((a) => a.kind === "driver").length, "number")}
      ${kpi("Договоренности", items.filter((a) => a.kind === "agreement").length, "number")}
    </div>
    <div class="card" style="margin-top:14px">
      <h2 class="card-title">История проблем и действий</h2>
      <div class="action-list">${items.map(actionCard).join("") || empty("Нет действий по выбранным фильтрам")}</div>
    </div>
  `;
}

function actionCard(action) {
  return `
    <div class="action">
      <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap">
        <strong>${escapeHtml(action.projectName)} · ${escapeHtml(action.department)}</strong>
        <span>${badge(action.status, action.kind === "blocker" ? "bad" : action.kind === "driver" ? "good" : "neutral")} ${badge(action.category)}</span>
      </div>
      <div class="muted">${escapeHtml(action.title)} · ${escapeHtml(action.division)} · ${escapeHtml(report(action.monthId).label)}</div>
      <div>${escapeHtml(action.text)}</div>
      <div class="muted">Ответственный: ${escapeHtml(action.owner || "не указан")} · срок: ${escapeHtml(action.dueDate || "не задан")}</div>
    </div>
  `;
}

function normsScreen() {
  const rows = Object.entries(state.norms.company);
  return `
    <div class="card">
      <h2 class="card-title">Нормативы компании</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Метрика</th><th>Цель</th><th>Логика</th><th>Вес в индексе</th><th>Уровни переопределения</th></tr></thead>
          <tbody>
            ${rows.map(([metric, norm]) => `
              <tr>
                <td>${state.data.metricLabels[metric] || metric}</td>
                <td>${norm.target === null ? "задается на месяц/проект" : format(norm.target, metric)}</td>
                <td>${norm.direction === "lte" ? "меньше или равно" : "больше или равно"}</td>
                <td>${norm.weight}</td>
                <td>проект → дивизион → месяц → компания</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
    <div class="card" style="margin-top:14px">
      <h2 class="card-title">Как это будет редактироваться дальше</h2>
      <p class="muted">Сейчас нормативы лежат в <strong>data/norms.json</strong>. В серверной версии этот же объект станет таблицей в БД: период, область действия, метрика, цель, направление, вес.</p>
    </div>
  `;
}

function ring(score) {
  const safe = score ?? 0;
  const dash = `${safe} ${100 - safe}`;
  return `
    <svg class="health-ring" viewBox="0 0 42 42">
      <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#303030" stroke-width="4"></circle>
      <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#E62250" stroke-width="4" stroke-dasharray="${dash}" stroke-dashoffset="25" transform="rotate(-90 21 21)"></circle>
      <text x="21" y="23.5" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">${score ?? "—"}</text>
    </svg>
  `;
}

function lineChart(points, metric) {
  if (!points.length) return empty("Нет данных");
  const width = 640;
  const height = 230;
  const pad = 32;
  const values = points.map((p) => p.value || 0);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const x = (i) => points.length === 1 ? width / 2 : pad + (i * (width - pad * 2)) / (points.length - 1);
  const y = (v) => height - pad - ((v - min) / (max - min || 1)) * (height - pad * 2);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.value || 0)}`).join(" ");
  return `
    <svg class="chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <path d="M ${pad} ${height - pad} H ${width - pad}" stroke="#343434" />
      <path d="${d}" fill="none" stroke="#E62250" stroke-width="4" vector-effect="non-scaling-stroke" />
      ${points.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.value || 0)}" r="5" fill="#fff" />`).join("")}
      ${points.map((p, i) => `<text x="${x(i)}" y="${height - 8}" text-anchor="middle" fill="#a8a8a8" font-size="13">${escapeHtml(p.label.replace(" 2026", ""))}</text>`).join("")}
      ${points.map((p, i) => `<text x="${x(i)}" y="${Math.max(18, y(p.value || 0) - 12)}" text-anchor="middle" fill="#fff" font-size="13">${format(p.value || 0, metric)}</text>`).join("")}
    </svg>
  `;
}

function empty(text) {
  return `<div class="empty">${escapeHtml(text)}</div>`;
}

boot().catch((error) => {
  $("#app").innerHTML = `<div class="boot">Ошибка загрузки: ${escapeHtml(error.message)}</div>`;
});
