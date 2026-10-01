const endpoints = {
    clientes: "/clientes",
    imoveis: "/imoveis",
    locacoes: "/locacoes"
};

const state = {
    view: "inicio",
    records: { clientes: [], imoveis: [], locacoes: [] },
    search: "",
    filter: "todos",
    editing: null
};

const labels = { inicio: "Visão geral", clientes: "Clientes", imoveis: "Imóveis", locacoes: "Locações" };
const titles = {
    inicio: ["Seu negócio, <span>em boas mãos.</span>", "Acompanhe os imóveis, as pessoas e os contratos em um só lugar."],
    clientes: ["Pessoas que <span>fazem parte.</span>", "Mantenha os contatos da sua carteira organizados e sempre à mão."],
    imoveis: ["Cada imóvel, <span>no seu lugar.</span>", "Visualize sua carteira e mantenha os detalhes de cada espaço em dia."],
    locacoes: ["Contratos <span>sem complicação.</span>", "Acompanhe quem ocupa cada imóvel e o andamento das locações."]
};

const fields = {
    clientes: [
        { name: "nomeCliente", label: "Nome completo", required: true, maxLength: 255, placeholder: "Ex.: Marina Oliveira", full: true },
        { name: "cpf", label: "CPF", required: true, maxLength: 14, placeholder: "000.000.000-00" },
        { name: "telefone", label: "Telefone", required: true, maxLength: 32, placeholder: "(00) 00000-0000" },
        { name: "email", label: "E-mail", type: "email", required: true, maxLength: 100, placeholder: "nome@email.com", full: true },
        { name: "dtNascimento", label: "Data de nascimento", type: "date" }
    ],
    imoveis: [
        { name: "tipoImovel", label: "Tipo de imóvel", required: true, options: ["Apartamento", "Casa", "Casa em condomínio", "Sala comercial", "Terreno", "Kitnet", "Outro"] },
        { name: "valorAluguelSug", label: "Aluguel sugerido", type: "number", min: 0, step: "0.01", prefix: "R$" },
        { name: "endereco", label: "Endereço completo", required: true, maxLength: 255, placeholder: "Rua, número, bairro e cidade", full: true },
        { name: "cep", label: "CEP", required: true, maxLength: 20, placeholder: "00000-000" },
        { name: "metragem", label: "Área (m²)", type: "number", min: 0, step: 1 },
        { name: "dormitorios", label: "Quartos", type: "number", min: 0, step: 1 },
        { name: "banheiros", label: "Banheiros", type: "number", min: 0, step: 1 },
        { name: "suites", label: "Suítes", type: "number", min: 0, step: 1 },
        { name: "obs", label: "Observações", type: "textarea", maxLength: 3000, full: true }
    ],
    locacoes: [
        { name: "imovel", label: "Imóvel", type: "imovel", required: true, full: true },
        { name: "inquilino", label: "Inquilino", type: "cliente", required: true, full: true },
        { name: "dataInicio", label: "Início do contrato", type: "date", required: true },
        { name: "dataFim", label: "Término do contrato", type: "date" },
        { name: "valorAluguel", label: "Valor mensal", type: "number", min: 0, step: "0.01", prefix: "R$" },
        { name: "diaVencimento", label: "Vencimento", type: "number", min: 1, max: 31, step: 1, placeholder: "Dia do mês" },
        { name: "percentualTaxa", label: "Taxa de administração", type: "number", min: 0, step: "0.01", suffix: "%" },
        { name: "ativo", label: "Contrato ativo", type: "checkbox" },
        { name: "obs", label: "Observações", type: "textarea", full: true }
    ]
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const currency = value => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(Number(value) || 0);
const exactCurrency = value => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);
const displayDate = value => value ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`)) : "Não informado";
const fullName = client => client?.nomeCliente || "Cliente sem nome";
const propertyName = property => property?.endereco || "Imóvel sem endereço";
const initials = value => String(value || "?").trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toLocaleUpperCase("pt-BR");
const isActive = rental => rental.ativo === true;

async function request(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers }
    });
    if (!response.ok) {
        let message = `Não foi possível concluir a solicitação (${response.status}).`;
        try {
            const error = await response.json();
            message = [error.message, ...(error.details || [])].filter(Boolean).join(" ");
        } catch { /* Mantém a mensagem HTTP padrão quando o servidor não retorna JSON. */ }
        throw new Error(message);
    }
    if (response.status === 204) return null;
    return response.json();
}

async function loadData() {
    const refreshButton = $("#refresh-button");
    refreshButton?.classList.add("is-loading");
    try {
        const results = await Promise.all(Object.keys(endpoints).map(key => request(endpoints[key])));
        state.records = Object.fromEntries(Object.keys(endpoints).map((key, index) => [key, results[index]]));
        updateConnectionStatus(true);
        updateNavigationCounts();
        renderCurrentView();
        $("#last-updated").textContent = `Atualizado às ${new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date())}`;
    } catch (error) {
        updateConnectionStatus(false);
        showToast(error.message || "Não foi possível carregar os dados.", true);
    } finally {
        refreshButton?.classList.remove("is-loading");
    }
}

function updateConnectionStatus(connected) {
    const status = $("#connection-status");
    status.classList.toggle("is-error", !connected);
    $("#connection-label").textContent = connected ? "API conectada" : "API indisponível";
}

function updateNavigationCounts() {
    $("#nav-properties").textContent = state.records.imoveis.length;
    $("#nav-rentals").textContent = state.records.locacoes.length;
    $("#nav-clients").textContent = state.records.clientes.length;
}

function renderCurrentView() {
    const dashboard = state.view === "inicio";
    $("#dashboard-view").hidden = !dashboard;
    $("#collection-view").hidden = dashboard;
    $("#breadcrumb-current").textContent = labels[state.view];
    $("#page-title").innerHTML = titles[state.view][0];
    $("#page-description").textContent = titles[state.view][1];
    $("#create-label").textContent = dashboard ? "Novo cliente" : `Novo ${state.view === "imoveis" ? "imóvel" : state.view === "locacoes" ? "contrato" : "cliente"}`;
    $$(".nav-item").forEach(button => button.classList.toggle("is-active", button.dataset.view === state.view));
    if (dashboard) renderDashboard();
    else renderCollection();
    refreshIcons();
}

function renderDashboard() {
    const { clientes, imoveis, locacoes } = state.records;
    const activeRentals = locacoes.filter(isActive);
    const occupiedIds = new Set(activeRentals.map(rental => rental.imovel?.id));
    const occupied = imoveis.filter(property => occupiedIds.has(property.id)).length;
    const available = Math.max(0, imoveis.length - occupied);
    const occupancy = imoveis.length ? Math.round(occupied / imoveis.length * 100) : 0;
    const monthlyIncome = activeRentals.reduce((sum, rental) => sum + (Number(rental.valorAluguel) || 0), 0);

    $("#stat-properties").textContent = imoveis.length;
    $("#stat-rentals").textContent = activeRentals.length;
    $("#stat-clients").textContent = clientes.length;
    $("#stat-income").textContent = currency(monthlyIncome);
    $("#occupied-count").textContent = occupied;
    $("#available-count").textContent = available;
    $("#occupancy-rate").textContent = `${occupancy}%`;
    $("#occupancy-donut").style.background = `conic-gradient(var(--green) ${occupancy * 3.6}deg, #edf0e9 ${occupancy * 3.6}deg)`;
    $("#occupancy-note").textContent = imoveis.length ? `${occupied} de ${imoveis.length} imóveis estão ocupados.` : "Cadastre um imóvel para acompanhar a disponibilidade.";

    const recentRentals = [...locacoes].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 3);
    $("#recent-rentals").innerHTML = recentRentals.length ? recentRentals.map(rental => `
        <div class="recent-item">
            <span class="recent-symbol"><i data-lucide="key-round"></i></span>
            <span class="recent-main"><strong>${escapeHtml(fullName(rental.inquilino))}</strong><span>${escapeHtml(propertyName(rental.imovel))} · ${isActive(rental) ? "Ativa" : "Encerrada"}</span></span>
            <span class="recent-value">${currency(rental.valorAluguel)}</span>
        </div>`).join("") : `<div class="empty-state"><i data-lucide="clipboard-list"></i><strong>Nenhuma locação por aqui</strong><span>Quando houver contratos, eles aparecerão nesta lista.</span></div>`;
}

function renderCollection() {
    const schema = collectionSchema(state.view);
    const records = state.records[state.view];
    const filtered = filterRecords(records, state.view);
    $("#table-head").innerHTML = `<tr>${schema.columns.map(column => `<th scope="col">${column.label}</th>`).join("")}<th scope="col"><span class="sr-only">Ações</span></th></tr>`;
    $("#table-body").innerHTML = filtered.length ? filtered.map(record => `<tr>${schema.render(record)}<td><div class="action-group"><button class="action-button" type="button" data-action="edit" data-id="${record.id}" aria-label="Editar registro ${record.id}" title="Editar"><i data-lucide="pencil"></i></button><button class="action-button delete" type="button" data-action="delete" data-id="${record.id}" aria-label="Excluir registro ${record.id}" title="Excluir"><i data-lucide="trash-2"></i></button></div></td></tr>`).join("") : `<tr><td class="table-empty" colspan="${schema.columns.length + 1}"><div class="empty-state"><i data-lucide="search-x"></i><strong>${records.length ? "Nenhum resultado encontrado" : "Sua lista ainda está vazia"}</strong><span>${records.length ? "Tente ajustar a busca ou o filtro." : "Adicione seu primeiro registro para começar."}</span></div></td></tr>`;
    $("#result-count").textContent = `${filtered.length} ${filtered.length === 1 ? "registro" : "registros"}`;
    $("#result-context").textContent = state.search || state.filter !== "todos" ? "Resultados conforme seus filtros" : "Mostrando todos os registros";
    updateFilterOptions(records, state.view);
    refreshIcons();
}

function collectionSchema(view) {
    if (view === "clientes") return {
        columns: [{ label: "CLIENTE" }, { label: "CPF" }, { label: "CONTATO" }, { label: "NASCIMENTO" }],
        render: client => `<td><span class="person-cell"><span class="person-initial">${escapeHtml(initials(fullName(client)))}</span><span class="person-meta"><strong>${escapeHtml(fullName(client))}</strong><span>${escapeHtml(client.email)}</span></span></span></td><td class="cell-primary">${escapeHtml(client.cpf)}</td><td>${escapeHtml(client.telefone)}</td><td>${client.dtNascimento ? displayDate(client.dtNascimento) : "—"}</td>`
    };
    if (view === "imoveis") return {
        columns: [{ label: "IMÓVEL" }, { label: "TIPO" }, { label: "DETALHES" }, { label: "ALUGUEL SUGERIDO" }],
        render: property => `<td><span class="person-cell"><span class="person-initial"><i data-lucide="house"></i></span><span class="person-meta"><strong>${escapeHtml(property.endereco)}</strong><span>CEP ${escapeHtml(property.cep)}</span></span></span></td><td><span class="status-pill">${escapeHtml(property.tipoImovel)}</span></td><td>${property.dormitorios ?? 0} quartos <span class="cell-secondary">${property.metragem ?? "—"} m² · ${property.banheiros ?? 0} banheiros</span></td><td class="cell-primary">${property.valorAluguelSug != null ? exactCurrency(property.valorAluguelSug) : "—"}</td>`
    };
    return {
        columns: [{ label: "INQUILINO" }, { label: "IMÓVEL" }, { label: "PERÍODO" }, { label: "ALUGUEL" }, { label: "STATUS" }],
        render: rental => `<td><span class="person-cell"><span class="person-initial">${escapeHtml(initials(fullName(rental.inquilino)))}</span><span class="person-meta"><strong>${escapeHtml(fullName(rental.inquilino))}</strong><span>Cliente #${rental.inquilino?.id ?? "—"}</span></span></span></td><td><span class="person-meta"><strong>${escapeHtml(propertyName(rental.imovel))}</strong><span>${escapeHtml(rental.imovel?.tipoImovel || "Imóvel")}</span></span></td><td>${displayDate(rental.dataInicio)}<span class="cell-secondary">até ${rental.dataFim ? displayDate(rental.dataFim) : "prazo indeterminado"}</span></td><td class="cell-primary">${exactCurrency(rental.valorAluguel)}</td><td><span class="status-pill ${isActive(rental) ? "" : "is-inactive"}">${isActive(rental) ? "Ativa" : "Encerrada"}</span></td>`
    };
}

function filterRecords(records, view) {
    const query = state.search.trim().toLocaleLowerCase("pt-BR");
    return records.filter(record => {
        if (state.filter !== "todos") {
            if (view === "locacoes" && String(isActive(record)) !== state.filter) return false;
            if (view === "imoveis" && record.tipoImovel !== state.filter) return false;
        }
        if (!query) return true;
        const searchable = view === "clientes"
            ? [record.nomeCliente, record.cpf, record.telefone, record.email]
            : view === "imoveis"
                ? [record.endereco, record.tipoImovel, record.cep]
                : [fullName(record.inquilino), propertyName(record.imovel), record.valorAluguel, record.ativo ? "ativa" : "encerrada"];
        return searchable.some(value => String(value ?? "").toLocaleLowerCase("pt-BR").includes(query));
    });
}

function updateFilterOptions(records, view) {
    const filter = $("#filter-select");
    if (view === "locacoes") filter.innerHTML = `<option value="todos">Todos os registros</option><option value="true">Ativas</option><option value="false">Encerradas</option>`;
    else if (view === "imoveis") {
        const types = [...new Set(records.map(record => record.tipoImovel).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
        filter.innerHTML = `<option value="todos">Todos os tipos</option>${types.map(type => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("")}`;
    } else filter.innerHTML = `<option value="todos">Todos os registros</option>`;
    filter.value = [...filter.options].some(option => option.value === state.filter) ? state.filter : "todos";
    state.filter = filter.value;
}

function openForm(view, record = null) {
    state.editing = record ? { view, id: record.id } : null;
    const schema = fields[view];
    const dialog = $("#record-dialog");
    $("#dialog-kicker").textContent = record ? "EDITAR CADASTRO" : `NOVO ${view === "imoveis" ? "IMÓVEL" : view === "locacoes" ? "CONTRATO" : "CLIENTE"}`;
    $("#dialog-title").textContent = record ? `Editar ${view === "locacoes" ? "locação" : view === "imoveis" ? "imóvel" : "cliente"}` : `Adicionar ${view === "locacoes" ? "locação" : view === "imoveis" ? "imóvel" : "cliente"}`;
    $("#dialog-description").textContent = record ? "Atualize os dados do registro abaixo." : "Preencha os dados para incluir na sua carteira.";
    $("#save-button").querySelector("span").textContent = record ? "Salvar alterações" : "Salvar cadastro";
    $("#form-error").hidden = true;
    $("#form-fields").innerHTML = schema.map(field => renderField(field, record)).join("");
    dialog.showModal();
    refreshIcons();
    $("#form-fields input, #form-fields select, #form-fields textarea")?.focus({ preventScroll: true });
}

function renderField(field, record) {
    const value = record?.[field.name];
    const required = field.required ? "required" : "";
    const requiredLabel = field.required ? ' <span aria-hidden="true">*</span>' : "";
    const wrapper = `class="field${field.full ? " full-width" : ""}"`;
    let control;
    if (field.type === "checkbox") {
        control = `<label class="checkbox-field"><input name="${field.name}" type="checkbox" ${value === true || (!record && field.name === "ativo") ? "checked" : ""}><span>${field.label}</span></label>`;
        return `<div ${wrapper}><span class="sr-only">${field.label}</span>${control}</div>`;
    }
    if (field.type === "textarea") control = `<textarea id="field-${field.name}" name="${field.name}" ${field.maxLength ? `maxlength="${field.maxLength}"` : ""} placeholder="Escreva detalhes importantes...">${escapeHtml(value)}</textarea>`;
    else if (field.type === "imovel" || field.type === "cliente") {
        const source = field.type === "imovel" ? state.records.imoveis : state.records.clientes;
        const selectedId = value?.id;
        control = `<select id="field-${field.name}" name="${field.name}" ${required}><option value="">Selecione ${field.type === "imovel" ? "um imóvel" : "um cliente"}</option>${source.map(item => `<option value="${item.id}" ${String(selectedId ?? "") === String(item.id) ? "selected" : ""}>${escapeHtml(field.type === "imovel" ? `${item.endereco} · ${item.tipoImovel}` : fullName(item))}</option>`).join("")}</select>${source.length ? "" : `<span class="field-hint">Cadastre primeiro ${field.type === "imovel" ? "um imóvel" : "um cliente"} para vincular à locação.</span>`}`;
    } else if (field.options) {
        control = `<select id="field-${field.name}" name="${field.name}" ${required}><option value="">Selecione uma opção</option>${field.options.map(option => `<option value="${escapeHtml(option)}" ${value === option ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select>`;
    } else {
        const type = field.type || "text";
        control = `<input id="field-${field.name}" name="${field.name}" type="${type}" value="${escapeHtml(value)}" ${required} ${field.maxLength ? `maxlength="${field.maxLength}"` : ""} ${field.min != null ? `min="${field.min}"` : ""} ${field.max != null ? `max="${field.max}"` : ""} ${field.step ? `step="${field.step}"` : ""} placeholder="${escapeHtml(field.placeholder || "")}">`;
    }
    return `<div ${wrapper}><label for="field-${field.name}">${field.label}${requiredLabel}</label>${control}</div>`;
}

function serializeForm(view, formData) {
    const result = {};
    for (const field of fields[view]) {
        const raw = formData.get(field.name);
        if (field.type === "checkbox") result[field.name] = formData.has(field.name);
        else if (field.type === "imovel" || field.type === "cliente") result[field.name] = raw ? { id: Number(raw) } : null;
        else if (field.type === "number") result[field.name] = raw === "" ? null : Number(raw);
        else result[field.name] = raw === "" ? null : raw;
    }
    return result;
}

async function saveRecord(event) {
    event.preventDefault();
    const view = state.editing?.view || (state.view === "inicio" ? "clientes" : state.view);
    const data = serializeForm(view, new FormData(event.currentTarget));
    const id = state.editing?.id;
    const saveButton = $("#save-button");
    saveButton.disabled = true;
    saveButton.querySelector("span").textContent = "Salvando...";
    try {
        await request(`${endpoints[view]}${id ? `/${id}` : ""}`, { method: id ? "PUT" : "POST", body: JSON.stringify(data) });
        $("#record-dialog").close();
        showToast(id ? "Alterações salvas com sucesso." : "Cadastro criado com sucesso.");
        await loadData();
    } catch (error) {
        $("#form-error").textContent = error.message;
        $("#form-error").hidden = false;
    } finally {
        saveButton.disabled = false;
        saveButton.querySelector("span").textContent = state.editing ? "Salvar alterações" : "Salvar cadastro";
    }
}

async function deleteRecord(view, id) {
    const record = state.records[view].find(item => String(item.id) === String(id));
    const label = view === "clientes" ? fullName(record) : view === "imoveis" ? propertyName(record) : `locação #${id}`;
    if (!window.confirm(`Excluir ${label}? Esta ação não pode ser desfeita.`)) return;
    try {
        await request(`${endpoints[view]}/${id}`, { method: "DELETE" });
        showToast("Registro excluído.");
        await loadData();
    } catch (error) {
        showToast(error.message, true);
    }
}

function showToast(message, isError = false) {
    const toast = document.createElement("div");
    toast.className = `toast${isError ? " is-error" : ""}`;
    toast.innerHTML = `<i data-lucide="${isError ? "circle-alert" : "circle-check"}"></i><span>${escapeHtml(message)}</span>`;
    $("#toast-region").append(toast);
    refreshIcons();
    window.setTimeout(() => toast.remove(), 4200);
}

function refreshIcons() {
    if (window.lucide?.createIcons) window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
}

function setView(view) {
    if (!labels[view]) return;
    state.view = view;
    state.search = "";
    state.filter = "todos";
    $("#search-input").value = "";
    closeMobileMenu();
    renderCurrentView();
}

function closeMobileMenu() {
    $("#sidebar").classList.remove("is-open");
    $("#mobile-scrim").classList.remove("is-visible");
    $("#menu-button").setAttribute("aria-expanded", "false");
}

document.addEventListener("click", event => {
    const viewButton = event.target.closest("[data-view]");
    if (viewButton) {
        event.preventDefault();
        setView(viewButton.dataset.view);
        return;
    }
    const actionButton = event.target.closest("[data-action]");
    if (actionButton) {
        const record = state.records[state.view].find(item => String(item.id) === actionButton.dataset.id);
        if (actionButton.dataset.action === "edit" && record) openForm(state.view, record);
        if (actionButton.dataset.action === "delete") deleteRecord(state.view, actionButton.dataset.id);
    }
});

$("#create-button").addEventListener("click", () => {
    const view = state.view === "inicio" ? "clientes" : state.view;
    openForm(view);
});
$("#refresh-button").addEventListener("click", loadData);
$("#search-input").addEventListener("input", event => { state.search = event.target.value; renderCollection(); });
$("#filter-select").addEventListener("change", event => { state.filter = event.target.value; renderCollection(); });
$("#record-form").addEventListener("submit", saveRecord);
$("#close-dialog").addEventListener("click", () => $("#record-dialog").close());
$("#cancel-dialog").addEventListener("click", () => $("#record-dialog").close());
$("#record-dialog").addEventListener("click", event => { if (event.target === event.currentTarget) event.currentTarget.close(); });
$("#menu-button").addEventListener("click", () => {
    const open = $("#sidebar").classList.toggle("is-open");
    $("#mobile-scrim").classList.toggle("is-visible", open);
    $("#menu-button").setAttribute("aria-expanded", String(open));
});
$("#mobile-scrim").addEventListener("click", closeMobileMenu);
document.addEventListener("keydown", event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (state.view === "inicio") setView("imoveis");
        $("#search-input").focus();
    }
    if (event.key === "Escape") closeMobileMenu();
});

const dateLabel = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
$("#heading-eyebrow").textContent = dateLabel.toLocaleUpperCase("pt-BR");
refreshIcons();
loadData();