const STORAGE_KEY = "sth-month-dashboard-data-v2";

const state = {
  view: "overview",
  monthId: null,
  compareMonthId: null,
  division: "all",
  projectId: "all",
  search: "",
  editing: false,
  data: null,
  norms: null,
  actions: [],
};

const views = [
  ["overview", "Главная таблица"],
  ["divisions", "Дивизионы"],
  ["projects", "Проекты"],
  ["project", "Карточка проекта"],
  ["dynamics", "Динамика"],
  ["funnel", "Воронка подбора"],
  ["marketing", "Маркетинг"],
  ["actions", "Проблемы и действия"],
  ["norms", "Нормативы"],
];

const metricLabels = {
  request: "Заявка от клиента",
  avgOutput: "Суточный выход",
  currentStaff: "Текущий штат",
  productivity: "Произ-сть средняя на сдельных должностях",
  penalties: "Штрафные санкции",
  penaltyShare: "% ШС от счета выручки с НДС",
  revenueVat: "Сумма выручки с НДС",
  requestCloseRate: "% закрытия заявки",
  secretCheck: "Показатель по тайной проверке",
  realizationPayroll: "ФОТ реализации бригадир+СУПР",
  realizationDrivers: "Что может помочь сделать результат лучше?",
  realizationBlockers: "Что мешает сделать результат лучше?",
  recruitingPayroll: "ФОТ подбора",
  invited: "Приглашенных",
  invitedToResponseRate: "%",
  registered: "Оформленных",
  registeredToInvitedRate: "%",
  warehouseReached: "Дошедшие до склада",
  warehouseToRegisteredRate: "%",
  firstShift: "Вышедшие на 1 смену",
  firstShiftToWarehouseRate: "%",
  tenShifts: "Вышедшие на 10 смен",
  tenShiftsToFirstShiftRate: "%",
  recruitingDrivers: "Что может помочь сделать результат лучше?",
  recruitingBlockers: "Что мешает сделать результат лучше?",
  responseToWarehouseRate: "конверсия из отклика в дошедшего",
  marketingProjectName: "Название проекта в медиаплане",
  marketingPayroll: "ФОТ Маркетинга на проект",
  marketingBudget: "Бюджет маркетинга на проект",
  responses: "Кол-во откликов",
  targetLeads: "Кол-во целевых",
  targetLeadRate: "% ЦЛ",
  marketingDrivers: "Что может помочь сделать результат лучше?",
  marketingBlockers: "Что мешает сделать результат лучше?",
  responseCost: "Стоимость отклика",
  targetLeadCost: "Стоимость целевого",
  agreements: "Итоговые договоренности, итоговые действия",
};

const sourceColumns = [
  { key: "division", label: "Дивизион", type: "text", fixed: true },
  { key: "name", label: "Проект", type: "text", fixed: true },
  { key: "request", group: "Реализация", type: "number" },
  { key: "avgOutput", group: "Реализация", type: "number" },
  { key: "currentStaff", group: "Реализация", type: "number" },
  { key: "productivity", group: "Реализация", type: "number" },
  { key: "penalties", group: "Реализация", type: "number" },
  { key: "penaltyShare", group: "Реализация", type: "formula" },
  { key: "revenueVat", group: "Реализация", type: "number" },
  { key: "requestCloseRate", group: "Реализация", type: "formula" },
  { key: "secretCheck", group: "Реализация", type: "number" },
  { key: "realizationPayroll", group: "Реализация", type: "number" },
  { key: "realizationDrivers", group: "Реализация", type: "textarea" },
  { key: "realizationBlockers", group: "Реализация", type: "textarea" },
  { key: "recruitingPayroll", group: "Группа подбора", type: "number" },
  { key: "invited", group: "Группа подбора", type: "number" },
  { key: "invitedToResponseRate", group: "Группа подбора", type: "formula" },
  { key: "registered", group: "Группа подбора", type: "number" },
  { key: "registeredToInvitedRate", group: "Группа подбора", type: "formula" },
  { key: "warehouseReached", group: "Группа подбора", type: "number" },
  { key: "warehouseToRegisteredRate", group: "Группа подбора", type: "formula" },
  { key: "firstShift", group: "Группа подбора", type: "number" },
  { key: "firstShiftToWarehouseRate", group: "Группа подбора", type: "formula" },
  { key: "tenShifts", group: "Группа подбора", type: "number" },
  { key: "tenShiftsToFirstShiftRate", group: "Группа подбора", type: "formula" },
  { key: "recruitingDrivers", group: "Группа подбора", type: "textarea" },
  { key: "recruitingBlockers", group: "Группа подбора", type: "textarea" },
  { key: "responseToWarehouseRate", group: "Группа подбора", type: "formula" },
  { key: "marketingProjectName", group: "Маркетинг", type: "text" },
  { key: "marketingPayroll", group: "Маркетинг", type: "number" },
  { key: "marketingBudget", group: "Маркетинг", type: "number" },
  { key: "responses", group: "Маркетинг", type: "number" },
  { key: "targetLeads", group: "Маркетинг", type: "number" },
  { key: "targetLeadRate", group: "Маркетинг", type: "formula" },
  { key: "marketingDrivers", group: "Маркетинг", type: "textarea" },
  { key: "marketingBlockers", group: "Маркетинг", type: "textarea" },
  { key: "responseCost", group: "Маркетинг", type: "formula" },
  { key: "targetLeadCost", group: "Маркетинг", type: "formula" },
  { key: "agreements", group: "Маркетинг", type: "textarea" },
];

const groupClassMap = {
  "Реализация": "realization-zone",
  "Группа подбора": "recruiting-zone",
  "Маркетинг": "marketing-zone",
};

const moneyMetrics = new Set(["revenueVat", "penalties", "realizationPayroll", "recruitingPayroll", "marketingPayroll", "marketingBudget", "responseCost", "targetLeadCost"]);
const percentMetrics = new Set(["penaltyShare", "requestCloseRate", "invitedToResponseRate", "registeredToInvitedRate", "warehouseToRegisteredRate", "firstShiftToWarehouseRate", "tenShiftsToFirstShiftRate", "responseToWarehouseRate", "targetLeadRate"]);
const textMetrics = new Set(["realizationDrivers", "realizationBlockers", "recruitingDrivers", "recruitingBlockers", "marketingDrivers", "marketingBlockers", "agreements", "marketingProjectName"]);

async function boot() {
  const [sourceData, norms, actions] = await Promise.all([
    fetch("data/monthly-reports.json").then((r) => r.json()),
    fetch("data/norms.json").then((r) => r.json()),
    fetch("data/actions.json").then((r) => r.json()),
  ]);
  const saved = loadSavedData();
  state.data = saved || sourceData;
  state.norms = norms;
  state.actions = actions.actions || [];
  state.monthId = state.data.reports.at(-1).id;
  state.compareMonthId = state.data.reports[0].id;
  recalculateAll();
  render();
}

function loadSavedData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
}

function clearSavedData() {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

function recalculateAll() {
  state.data.reports.forEach((report) => report.projects.forEach(recalculateProject));
}

function recalculateProject(project) {
  const m = project.metrics;
  m.penaltyShare = safeDiv(m.penalties, m.revenueVat);
  m.requestCloseRate = safeDiv(m.avgOutput, m.request);
  m.invitedToResponseRate = safeDiv(m.invited, m.responses);
  m.registeredToInvitedRate = safeDiv(m.registered, m.invited);
  m.warehouseToRegisteredRate = safeDiv(m.warehouseReached, m.registered);
  m.firstShiftToWarehouseRate = safeDiv(m.firstShift, m.warehouseReached);
  m.tenShiftsToFirstShiftRate = safeDiv(m.tenShifts, m.firstShift);
  m.responseToWarehouseRate = safeDiv(m.warehouseReached, m.responses);
  m.targetLeadRate = safeDiv(m.targetLeads, m.responses);
  m.responseCost = safeDiv((m.marketingPayroll || 0) + (m.marketingBudget || 0), m.responses);
  m.targetLeadCost = safeDiv((m.marketingPayroll || 0) + (m.marketingBudget || 0), m.targetLeads);
}

function safeDiv(a, b) {
  return b ? (Number(a) || 0) / b : 0;
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
  return norms.project?.[project?.id]?.[metric] || norms.division?.[project?.division]?.[metric] || norms.month?.[state.monthId]?.[metric] || norms.company?.[metric] || null;
}

function scoreMetric(value, norm) {
  if (!norm || norm.target === null || value === null || value === undefined || Number.isNaN(value)) return null;
  if (norm.direction === "lte") return value <= norm.target ? 100 : Math.max(0, Math.min(100, (norm.target / value) * 100));
  return value >= norm.target ? 100 : Math.max(0, Math.min(100, (value / norm.target) * 100));
}

function health(project) {
  const m = project.metrics;
  if (!m.request && !m.avgOutput && !m.revenueVat) return { score: null, status: "Нет активной потребности", tone: "neutral", details: [] };
  const evaluated = Object.keys(state.norms.company)
    .map((metric) => {
      const norm = normFor(metric, project);
      const raw = scoreMetric(m[metric], norm);
      return raw === null ? null : { metric, raw, weight: norm.weight || 5 };
    })
    .filter(Boolean);
  if (!m.marketingBudget && !m.responses && m.requestCloseRate < 0.95) evaluated.push({ metric: "marketingActivity", raw: 45, weight: 8 });
  if (!evaluated.length) return { score: null, status: "Недостаточно данных", tone: "neutral", details: [] };
  const totalWeight = evaluated.reduce((sum, item) => sum + item.weight, 0);
  const score = Math.round(evaluated.reduce((sum, item) => sum + item.raw * item.weight, 0) / totalWeight);
  if (score < 50) return { score, status: "Критично", tone: "bad", details: evaluated.sort((a, b) => a.raw - b.raw) };
  if (score < 70) return { score, status: "Зона внимания", tone: "warn", details: evaluated.sort((a, b) => a.raw - b.raw) };
  if (score < 85) return { score, status: "Нормально", tone: "neutral", details: evaluated.sort((a, b) => a.raw - b.raw) };
  return { score, status: "Отлично", tone: "good", details: evaluated.sort((a, b) => a.raw - b.raw) };
}

function aggregate(projects) {
  const keys = sourceColumns.filter((c) => !textMetrics.has(c.key) && c.key !== "division" && c.key !== "name").map((c) => c.key);
  const agg = {};
  keys.forEach((key) => (agg[key] = projects.reduce((acc, project) => acc + (Number(project.metrics[key]) || 0), 0)));
  agg.penaltyShare = safeDiv(agg.penalties, agg.revenueVat);
  agg.requestCloseRate = safeDiv(agg.avgOutput, agg.request);
  agg.invitedToResponseRate = safeDiv(agg.invited, agg.responses);
  agg.registeredToInvitedRate = safeDiv(agg.registered, agg.invited);
  agg.warehouseToRegisteredRate = safeDiv(agg.warehouseReached, agg.registered);
  agg.firstShiftToWarehouseRate = safeDiv(agg.firstShift, agg.warehouseReached);
  agg.tenShiftsToFirstShiftRate = safeDiv(agg.tenShifts, agg.firstShift);
  agg.responseToWarehouseRate = safeDiv(agg.warehouseReached, agg.responses);
  agg.targetLeadRate = safeDiv(agg.targetLeads, agg.responses);
  agg.responseCost = safeDiv((agg.marketingPayroll || 0) + (agg.marketingBudget || 0), agg.responses);
  agg.targetLeadCost = safeDiv((agg.marketingPayroll || 0) + (agg.marketingBudget || 0), agg.targetLeads);
  agg.secretCheck = average(projects, "secretCheck");
  agg.productivity = average(projects, "productivity");
  return agg;
}

function average(projects, metric) {
  const values = projects.map((p) => p.metrics[metric]).filter((v) => typeof v === "number" && Number.isFinite(v));
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function format(value, metric, raw = false) {
  if (value === null || value === undefined || Number.isNaN(value)) return raw ? "" : "—";
  if (raw) return String(value);
  if (percentMetrics.has(metric)) return `${(value * 100).toFixed(value < 0.1 ? 1 : 0)}%`;
  if (moneyMetrics.has(metric)) {
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} млн ₽`;
    return `${Math.round(value).toLocaleString("ru-RU")} ₽`;
  }
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} млн`;
  return Number(value).toLocaleString("ru-RU", { maximumFractionDigits: 1 });
}

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function render() {
  document.querySelector("#app").innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">${sthLogo()}<div><div class="brand-title">STH</div><div class="brand-subtitle">Month dashboard</div></div></div>
        <nav class="nav">${views.map(([id, label]) => `<button class="${state.view === id ? "active" : ""}" data-view="${id}">${label}</button>`).join("")}</nav>
        <p class="footer-note">Тестовая версия на GitHub Pages. Редактирование сохраняется локально в браузере.</p>
      </aside>
      <main class="main">${topbar()}<section id="screen">${screen()}</section></main>
    </div>`;
  bind();
}

function sthLogo() {
  return `<svg class="sth-mark" viewBox="0 0 64 64" aria-label="STH"><g fill="#E62250"><circle cx="14" cy="10" r="8"/><circle cx="40" cy="10" r="8"/><circle cx="56" cy="34" r="8"/><circle cx="14" cy="54" r="8"/><circle cx="40" cy="54" r="8"/><circle cx="56" cy="54" r="8"/><path d="M14 18c0 10 6 16 16 16 7 0 10 4 10 10v10c6 0 10-4 10-10 0-10-6-18-18-18-5 0-8-3-8-8v-8c-6 0-10 4-10 8Z"/></g></svg>`;
}

function topbar() {
  const title = views.find(([id]) => id === state.view)?.[1] || "Главная таблица";
  return `
    <div class="topbar">
      <div><h1 class="page-title">${title}</h1><p class="page-note">${pageNote()}</p></div>
      <div class="filters">
        ${selectControl("Месяц", "month", state.monthId, state.data.reports.map((r) => [r.id, r.label]))}
        ${selectControl("Сравнить с", "compare", state.compareMonthId, state.data.reports.map((r) => [r.id, r.label]))}
        ${selectControl("Дивизион", "division", state.division, [["all", "Все дивизионы"], ...divisions().map((d) => [d, d])])}
        ${selectControl("Проект", "project", state.projectId, [["all", "Все проекты"], ...projectOptions().map((p) => [p.id, p.name])])}
      </div>
    </div>`;
}

function pageNote() {
  if (state.view === "overview") return "Главная страница повторяет исходный отчет: большая таблица с реализацией, подбором, маркетингом, итогами и режимом редактирования.";
  return "Аналитические представления используют те же данные, что и главная таблица.";
}

function selectControl(label, name, value, options) {
  return `<label class="control"><span>${label}</span><select data-control="${name}">${options.map(([id, text]) => `<option value="${escapeHtml(id)}" ${id === value ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}</select></label>`;
}

function bind() {
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => { state.view = button.dataset.view; render(); }));
  document.querySelectorAll("[data-control]").forEach((control) => control.addEventListener("change", () => {
    if (control.dataset.control === "month") state.monthId = control.value;
    if (control.dataset.control === "compare") state.compareMonthId = control.value;
    if (control.dataset.control === "division") state.division = control.value;
    if (control.dataset.control === "project") state.projectId = control.value;
    render();
  }));
  document.querySelectorAll("[data-open-project]").forEach((button) => button.addEventListener("click", () => { state.projectId = button.dataset.openProject; state.view = "project"; render(); }));
  document.querySelectorAll("[data-edit-toggle]").forEach((button) => button.addEventListener("click", () => { state.editing = !state.editing; render(); }));
  document.querySelectorAll("[data-reset-local]").forEach((button) => button.addEventListener("click", clearSavedData));
  document.querySelectorAll("[data-cell]").forEach((input) => input.addEventListener("change", onCellChange));
  const search = document.querySelector("[data-search]");
  if (search) search.addEventListener("input", (event) => { state.search = event.target.value; document.querySelector("#screen").innerHTML = screen(); bind(); });
}

function onCellChange(event) {
  const input = event.target;
  const project = report(input.dataset.month).projects.find((p) => p.id === input.dataset.project);
  if (!project) return;
  const key = input.dataset.field;
  if (key === "division") project.division = input.value.trim() || project.division;
  else if (key === "name") project.name = input.value.trim() || project.name;
  else if (textMetrics.has(key)) project.metrics[key] = input.value.trim() || null;
  else project.metrics[key] = input.value === "" ? null : Number(input.value);
  recalculateProject(project);
  saveData();
  render();
}

function screen() {
  const screens = { overview: sourceTableScreen, divisions: divisionsScreen, projects: projectsScreen, project: projectScreen, dynamics: dynamicsScreen, funnel: funnelScreen, marketing: marketingScreen, actions: actionsScreen, norms: normsScreen };
  return screens[state.view]();
}

function sourceTableScreen() {
  const projects = selectedProjects();
  const rows = buildGroupedRows(projects);
  return `
    <div class="sheet-toolbar">
      <div>
        <strong>${report().label}</strong>
        <span class="muted"> · ${projects.length} проектов · изменения сохраняются только в этом браузере</span>
      </div>
      <div class="sheet-actions">
        <input data-search placeholder="Поиск по таблице" value="${escapeHtml(state.search)}">
        <button class="primary-btn" data-edit-toggle>${state.editing ? "Завершить редактирование" : "Редактировать"}</button>
        <button class="ghost-btn" data-reset-local>Сбросить изменения</button>
      </div>
    </div>
    <div class="source-table-wrap">
      <table class="source-table">
        ${sourceHeader()}
        <tbody>${rows.map(sourceRow).join("")}</tbody>
      </table>
    </div>`;
}

function sourceHeader() {
  const groups = [];
  let current = null;
  sourceColumns.forEach((col) => {
    const name = col.group || "";
    if (!current || current.name !== name) {
      current = { name, count: 0 };
      groups.push(current);
    }
    current.count += 1;
  });
  return `
    <thead>
      <tr class="group-head">${groups.map((g, index) => `<th colspan="${g.count}" class="${index === 0 ? "corner-head" : groupClass(g.name)}">${escapeHtml(g.name)}</th>`).join("")}</tr>
      <tr>${sourceColumns.map((col) => `<th class="${col.fixed ? "sticky-col head-fixed" : ""} ${groupClass(col.group)}">${escapeHtml(col.label || metricLabels[col.key] || col.key)}</th>`).join("")}</tr>
    </thead>`;
}

function groupClass(group) {
  return groupClassMap[group] || "";
}

function buildGroupedRows(projects) {
  const rows = [];
  let currentDivision = null;
  let buffer = [];
  projects.forEach((project) => {
    if (project.division !== currentDivision) {
      if (buffer.length) rows.push({ type: "total", division: currentDivision, projects: buffer });
      currentDivision = project.division;
      buffer = [];
    }
    buffer.push(project);
    rows.push({ type: "project", project });
  });
  if (buffer.length) rows.push({ type: "total", division: currentDivision, projects: buffer });
  rows.push({ type: "grand", projects });
  return rows;
}

function sourceRow(row) {
  if (row.type !== "project") return totalRow(row);
  const p = row.project;
  return `<tr>${sourceColumns.map((col) => sourceCell(p, col)).join("")}</tr>`;
}

function sourceCell(project, col) {
  const value = col.key === "division" ? project.division : col.key === "name" ? project.name : textMetrics.has(col.key) ? project.metrics[col.key] : project.metrics[col.key];
  const fixed = col.fixed ? "sticky-col" : "";
  const formula = col.type === "formula" ? "formula-cell" : "";
  const zone = groupClass(col.group);
  const norm = col.key !== "division" && col.key !== "name" ? normFor(col.key, project) : null;
  const status = normStatus(value, norm);
  if (!state.editing || col.type === "formula") {
    const label = col.type === "formula" || (!textMetrics.has(col.key) && col.key !== "name" && col.key !== "division") ? format(value, col.key) : escapeHtml(value || "");
    const action = col.key === "name" ? `<button class="linkish" data-open-project="${project.id}">${escapeHtml(value || "")}</button>` : label;
    return `<td class="${fixed} ${formula} ${zone} ${status} ${cellKind(col)}">${cellContent(action, norm, col.key, status)}</td>`;
  }
  const field = `data-cell data-month="${project.monthId}" data-project="${project.id}" data-field="${col.key}"`;
  if (col.type === "textarea") return `<td class="${fixed} ${zone} text-cell"><textarea ${field}>${escapeHtml(value || "")}</textarea></td>`;
  return `<td class="${fixed} ${zone} ${status} ${cellKind(col)}"><input ${field} type="${col.type === "number" ? "number" : "text"}" value="${escapeHtml(format(value, col.key, true))}">${normLine(norm, col.key, status)}</td>`;
}

function cellKind(col) {
  if (textMetrics.has(col.key) || col.key === "name" || col.key === "division") return "text-cell";
  return "number-cell";
}

function cellContent(content, norm, key, status) {
  return `<div class="cell-main">${content}</div>${normLine(norm, key, status)}`;
}

function normLine(norm, key, status) {
  if (!norm || norm.target === null || textMetrics.has(key)) return "";
  const sign = norm.direction === "lte" ? "≤" : "≥";
  const label = status === "norm-ok" ? "норма" : status === "norm-bad" ? "ниже нормы" : "норма";
  return `<div class="norm-line ${status}">${label}: ${sign} ${format(norm.target, key)}</div>`;
}

function normStatus(value, norm) {
  if (!norm || norm.target === null || value === null || value === undefined || Number.isNaN(value)) return "";
  if (norm.direction === "lte") return value <= norm.target ? "norm-ok" : "norm-bad";
  return value >= norm.target ? "norm-ok" : "norm-bad";
}

function totalRow(row) {
  const agg = aggregate(row.projects);
  const label = row.type === "grand" ? `Итоги ${report().label}` : "Итог по дивизиону";
  return `<tr class="total-row"><td class="sticky-col" colspan="2">${escapeHtml(label)}${row.division ? `<br><span>${escapeHtml(row.division)}</span>` : ""}</td>${sourceColumns.slice(2).map((col) => `<td class="${groupClass(col.group)} ${col.type === "textarea" || textMetrics.has(col.key) ? "text-cell" : "number-cell"}">${textMetrics.has(col.key) ? "" : format(agg[col.key], col.key)}</td>`).join("")}</tr>`;
}

function kpi(label, value, metric) {
  return `<div class="card kpi"><div class="kpi-label">${label}</div><div class="kpi-value">${format(value, metric)}</div></div>`;
}

function divisionsScreen() {
  const rows = divisions().map((division) => {
    const projects = report().projects.filter((p) => p.division === division);
    const a = aggregate(projects);
    const scores = projects.map(health).filter((h) => h.score !== null);
    const score = scores.length ? Math.round(scores.reduce((s, h) => s + h.score, 0) / scores.length) : null;
    return { division, leader: projects[0]?.divisionLeader || "", projects, a, score };
  });
  return `<div class="grid three-col">${rows.map((row) => `<div class="card"><h2 class="card-title">${escapeHtml(row.division)} ${badge(row.score ?? "н/д", row.score < 60 ? "bad" : row.score < 75 ? "warn" : "good")}</h2><p class="muted">${escapeHtml(row.leader || "Руководитель не указан")}</p><div class="metric-list">${metricLine("Проектов", row.projects.length)}${metricLine("Выручка", format(row.a.revenueVat, "revenueVat"))}${metricLine("Закрытие заявки", format(row.a.requestCloseRate, "requestCloseRate"))}${metricLine("Целевые", format(row.a.targetLeads, "targetLeads"))}${metricLine("Стоимость целевого", format(row.a.targetLeadCost, "targetLeadCost"))}</div></div>`).join("")}</div>`;
}

function projectsScreen() {
  const projects = selectedProjects().map((p) => ({ ...p, h: health(p) })).sort((a, b) => (a.h.score ?? 999) - (b.h.score ?? 999));
  return `<div class="card"><h2 class="card-title">Реестр проектов <input data-search placeholder="Поиск" value="${escapeHtml(state.search)}"></h2><div class="table-wrap"><table><thead><tr><th>Проект</th><th>Дивизион</th><th>Индекс</th><th>Заявка</th><th>Выход</th><th>Выручка</th><th>Закрытие</th><th>Целевые</th><th>Стоимость целевого</th></tr></thead><tbody>${projects.map((p) => `<tr><td><button class="linkish" data-open-project="${p.id}">${escapeHtml(p.name)}</button></td><td>${escapeHtml(p.division)}</td><td>${badge(p.h.score ?? "н/д", p.h.tone)}</td><td>${format(p.metrics.request, "request")}</td><td>${format(p.metrics.avgOutput, "avgOutput")}</td><td>${format(p.metrics.revenueVat, "revenueVat")}</td><td>${format(p.metrics.requestCloseRate, "requestCloseRate")}</td><td>${format(p.metrics.targetLeads, "targetLeads")}</td><td>${format(p.metrics.targetLeadCost, "targetLeadCost")}</td></tr>`).join("")}</tbody></table></div></div>`;
}

function projectScreen() {
  const project = report().projects.find((p) => p.id === state.projectId) || selectedProjects()[0] || report().projects[0];
  if (!project) return empty("Проект не найден");
  const h = health(project);
  return `<div class="card project-head"><div><h2 class="project-name">${escapeHtml(project.name)}</h2><p class="muted">${escapeHtml(project.division)}${project.divisionLeader ? `, ${escapeHtml(project.divisionLeader)}` : ""}</p></div><div>${ring(h.score)}${badge(h.status, h.tone)}</div></div><div class="grid three-col" style="margin-top:14px">${summaryCard("Реализация", project.metrics, ["request", "avgOutput", "currentStaff", "revenueVat", "penalties", "requestCloseRate"])}${summaryCard("Подбор", project.metrics, ["invited", "registered", "warehouseReached", "firstShift", "tenShifts", "tenShiftsToFirstShiftRate"])}${summaryCard("Маркетинг", project.metrics, ["marketingBudget", "responses", "targetLeads", "targetLeadRate", "responseCost", "targetLeadCost"])}</div>`;
}

function dynamicsScreen() {
  return `<div class="grid two-col">${["revenueVat", "requestCloseRate", "targetLeads", "targetLeadCost"].map((metric) => `<div class="card"><h2 class="card-title">${metricLabels[metric]}</h2>${lineChart(state.data.reports.map((r) => ({ label: r.label, value: aggregate(filteredReportProjects(r.id))[metric] || 0 })), metric)}</div>`).join("")}</div>`;
}

function filteredReportProjects(monthId) {
  let projects = report(monthId).projects;
  if (state.division !== "all") projects = projects.filter((p) => p.division === state.division);
  if (state.projectId !== "all") projects = projects.filter((p) => p.id === state.projectId);
  return projects;
}

function funnelScreen() {
  const a = aggregate(selectedProjects());
  const steps = [["Отклики", a.responses, 1], ["Приглашенные", a.invited, safeDiv(a.invited, a.responses)], ["Оформленные", a.registered, safeDiv(a.registered, a.invited)], ["Дошли до склада", a.warehouseReached, safeDiv(a.warehouseReached, a.registered)], ["1 смена", a.firstShift, safeDiv(a.firstShift, a.warehouseReached)], ["10 смен", a.tenShifts, safeDiv(a.tenShifts, a.firstShift)]];
  return `<div class="card"><h2 class="card-title">Воронка подбора</h2><div class="funnel">${steps.map(([label, value, rate]) => `<div class="funnel-step"><strong>${label}</strong><div class="bar-track"><div class="bar-fill" style="width:${Math.max(3, Math.min(100, rate * 100))}%"></div></div><span>${format(value, "number")} / ${format(rate, "requestCloseRate")}</span></div>`).join("")}</div></div>`;
}

function marketingScreen() {
  const projects = selectedProjects().filter((p) => p.metrics.responses || p.metrics.marketingBudget || p.metrics.targetLeads);
  const a = aggregate(projects);
  return `<div class="grid kpi-grid">${kpi("Бюджет", a.marketingBudget, "marketingBudget")}${kpi("Отклики", a.responses, "responses")}${kpi("Целевые", a.targetLeads, "targetLeads")}${kpi("Стоимость целевого", a.targetLeadCost, "targetLeadCost")}</div><div class="card" style="margin-top:14px"><h2 class="card-title">Маркетинг по проектам</h2><div class="table-wrap"><table><thead><tr><th>Проект</th><th>Бюджет</th><th>Отклики</th><th>Целевые</th><th>% ЦЛ</th><th>Стоимость целевого</th></tr></thead><tbody>${projects.map((p) => `<tr><td>${escapeHtml(p.name)}</td><td>${format(p.metrics.marketingBudget, "marketingBudget")}</td><td>${format(p.metrics.responses, "responses")}</td><td>${format(p.metrics.targetLeads, "targetLeads")}</td><td>${format(p.metrics.targetLeadRate, "targetLeadRate")}</td><td>${format(p.metrics.targetLeadCost, "targetLeadCost")}</td></tr>`).join("")}</tbody></table></div></div>`;
}

function actionsScreen() {
  let items = state.actions.filter((a) => a.monthId === state.monthId);
  if (state.division !== "all") items = items.filter((a) => a.division === state.division);
  if (state.projectId !== "all") items = items.filter((a) => a.projectId === state.projectId);
  return `<div class="card"><h2 class="card-title">Проблемы и действия</h2><div class="action-list">${items.map(actionCard).join("") || empty("Нет действий по выбранным фильтрам")}</div></div>`;
}

function normsScreen() {
  return `<div class="card"><h2 class="card-title">Нормативы</h2><div class="table-wrap"><table><thead><tr><th>Метрика</th><th>Цель</th><th>Логика</th><th>Вес</th></tr></thead><tbody>${Object.entries(state.norms.company).map(([metric, norm]) => `<tr><td>${metricLabels[metric] || metric}</td><td>${norm.target === null ? "задается отдельно" : format(norm.target, metric)}</td><td>${norm.direction === "lte" ? "меньше или равно" : "больше или равно"}</td><td>${norm.weight}</td></tr>`).join("")}</tbody></table></div></div>`;
}

function summaryCard(title, metrics, keys) {
  return `<div class="card"><h2 class="card-title">${title}</h2><div class="metric-list">${keys.map((key) => metricLine(metricLabels[key] || key, format(metrics[key], key))).join("")}</div></div>`;
}

function metricLine(label, value) {
  return `<div class="metric-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function actionCard(action) {
  return `<div class="action"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><strong>${escapeHtml(action.projectName)} · ${escapeHtml(action.department)}</strong>${badge(action.status, action.kind === "blocker" ? "bad" : action.kind === "driver" ? "good" : "neutral")}</div><div class="muted">${escapeHtml(action.title)} · ${escapeHtml(action.division)} · ${escapeHtml(report(action.monthId).label)}</div><div>${escapeHtml(action.text)}</div><div class="muted">Ответственный: ${escapeHtml(action.owner || "не указан")} · срок: ${escapeHtml(action.dueDate || "не задан")}</div></div>`;
}

function badge(text, tone = "neutral") {
  return `<span class="badge ${tone}">${escapeHtml(text)}</span>`;
}

function ring(score) {
  const safe = score ?? 0;
  return `<svg class="health-ring" viewBox="0 0 42 42"><circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#303030" stroke-width="4"></circle><circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#E62250" stroke-width="4" stroke-dasharray="${safe} ${100 - safe}" stroke-dashoffset="25" transform="rotate(-90 21 21)"></circle><text x="21" y="23.5" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">${score ?? "—"}</text></svg>`;
}

function lineChart(points, metric) {
  if (!points.length) return empty("Нет данных");
  const width = 640;
  const height = 230;
  const pad = 32;
  const values = points.map((p) => p.value || 0);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const x = (i) => (points.length === 1 ? width / 2 : pad + (i * (width - pad * 2)) / (points.length - 1));
  const y = (v) => height - pad - ((v - min) / (max - min || 1)) * (height - pad * 2);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.value || 0)}`).join(" ");
  return `<svg class="chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><path d="M ${pad} ${height - pad} H ${width - pad}" stroke="#343434" /><path d="${d}" fill="none" stroke="#E62250" stroke-width="4" vector-effect="non-scaling-stroke" />${points.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.value || 0)}" r="5" fill="#fff" />`).join("")}${points.map((p, i) => `<text x="${x(i)}" y="${height - 8}" text-anchor="middle" fill="#a8a8a8" font-size="13">${escapeHtml(p.label.replace(" 2026", ""))}</text>`).join("")}${points.map((p, i) => `<text x="${x(i)}" y="${Math.max(18, y(p.value || 0) - 12)}" text-anchor="middle" fill="#fff" font-size="13">${format(p.value || 0, metric)}</text>`).join("")}</svg>`;
}

function empty(text) {
  return `<div class="empty">${escapeHtml(text)}</div>`;
}

boot().catch((error) => {
  document.querySelector("#app").innerHTML = `<div class="boot">Ошибка загрузки: ${escapeHtml(error.message)}</div>`;
});
