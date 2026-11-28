(() => {
    if (window.__SAPIUS_QA_BOT_INITIALIZED__) {
        return;
    }
    window.__SAPIUS_QA_BOT_INITIALIZED__ = true;

    const MAX_ERRORS = 10;
    const POLL_INTERVAL_MS = 15000;
    const FAST_POLL_INTERVAL_MS = 4000;
    const ENDPOINT_BASE = '/admin/qa-bot/reports';

    // 1. Bridge for Inertia error modal iframe -> top window
    if (window !== window.top) {
        if (window.__SAPIUS_QA_EXCEPTION__) {
            try {
                const targetOrigin =
                    window.location.origin && window.location.origin !== 'null'
                        ? window.location.origin
                        : '*';
                window.parent.postMessage(
                    {
                        type: 'SAPIUS_QA_EXCEPTION',
                        payload: window.__SAPIUS_QA_EXCEPTION__,
                    },
                    targetOrigin
                );
            } catch {
                // Ignore cross-frame errors
            }
        }
        return;
    }

    const initialContext = window.__SAPIUS_QA_CONTEXT__ || null;

    const state = {
        isAdmin: false,
        reviewer: initialContext?.reviewer || null,
        activeAccount: initialContext?.activeAccount ?? initialContext?.active_account ?? null,
        viaPass: Boolean(initialContext?.viaPass ?? initialContext?.via_pass),
        isOpen: false,
        activeTab: 'new',
        currentUrl: window.location.href,
        currentComponent: null,
        consoleErrors: [],
        serverException: window.__SAPIUS_QA_EXCEPTION__ || null,
        hasUnreadError: Boolean(window.__SAPIUS_QA_EXCEPTION__),
        screenshotDataUrl: null,
        defectType: window.__SAPIUS_QA_EXCEPTION__ ? 'server_error' : 'broken_action',
        perspective: 'designer',
        grillMe: false,
        grillSelectedOption: {},
        grillCustomAnswer: {},
        message: '',
        submitting: false,
        submitFeedback: null,
        loadingReports: false,
        lastReportsSig: '',
        reports: [],
        counts: {
            pending: 0,
            in_progress: 0,
            resolved: 0,
            needs_review: 0,
            verified: 0,
            rejected: 0,
            total: 0,
        },
        newResolvedAlert: false,
        knownResolvedSignatures: new Set(),
        initializedReportsLoad: false,
        reopenTargetId: null,
        reopenNote: '',
        confirmDeleteId: null,
        busyReportId: null,
    };

    let hostEl = null;
    let shadowRoot = null;
    let pollTimer = null;
    let currentPollMs = POLL_INTERVAL_MS;
    let dialogObserver = null;

    function parseInitialInertiaPage() {
        try {
            const scriptEl = document.querySelector('script[data-page="app"]');
            if (scriptEl && scriptEl.textContent) {
                return JSON.parse(scriptEl.textContent);
            }
            const appEl = document.getElementById('app');
            if (appEl && appEl.dataset && appEl.dataset.page) {
                return JSON.parse(appEl.dataset.page);
            }
        } catch {
            return null;
        }
        return null;
    }

    function applyQaContext(ctx) {
        if (!ctx) {
            return;
        }
        if (ctx.enabled === true || ctx.reviewer) {
            state.isAdmin = true;
        }
        if (ctx.reviewer) {
            state.reviewer = ctx.reviewer;
        }
        state.activeAccount =
            ctx.activeAccount !== undefined ? ctx.activeAccount : (ctx.active_account ?? null);
        state.viaPass = Boolean(ctx.viaPass !== undefined ? ctx.viaPass : ctx.via_pass);
    }

    function detectInitialState() {
        const page = parseInitialInertiaPage();
        if (page) {
            state.currentComponent = page.component || null;
            if (page.props?.qaBot?.enabled) {
                applyQaContext(page.props.qaBot);
            } else if (page.props?.auth?.user?.role === 'admin') {
                state.isAdmin = true;
            }
        }

        if (window.__SAPIUS_QA_ADMIN__ === true) {
            state.isAdmin = true;
        }
        if (window.__SAPIUS_QA_CONTEXT__) {
            applyQaContext(window.__SAPIUS_QA_CONTEXT__);
        }
    }

    function pushConsoleError(entry) {
        const message = String(entry.message || 'Error desconocido').slice(0, 1000);
        const last = state.consoleErrors[state.consoleErrors.length - 1];
        if (last && last.message === message && last.source === entry.source) {
            return;
        }

        state.consoleErrors.push({
            type: entry.type || 'error',
            message,
            source: entry.source ? String(entry.source).slice(0, 300) : null,
            timestamp: new Date().toISOString(),
        });

        if (state.consoleErrors.length > MAX_ERRORS) {
            state.consoleErrors.shift();
        }

        state.hasUnreadError = true;
        render();
    }

    function getCookie(name) {
        const prefix = `${name}=`;
        const parts = document.cookie ? document.cookie.split(';') : [];
        for (const rawPart of parts) {
            const part = rawPart.trim();
            if (part.startsWith(prefix)) {
                try {
                    return decodeURIComponent(part.slice(prefix.length));
                } catch {
                    return part.slice(prefix.length);
                }
            }
        }
        return null;
    }

    function getCsrfHeaders() {
        const headers = {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        };

        const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const injectedToken = typeof window.__SAPIUS_QA_CSRF__ === 'string' ? window.__SAPIUS_QA_CSRF__ : null;
        const csrfToken = metaToken || injectedToken;

        if (csrfToken) {
            headers['X-CSRF-TOKEN'] = csrfToken;
        }

        const xsrfCookie = getCookie('XSRF-TOKEN');
        if (xsrfCookie) {
            headers['X-XSRF-TOKEN'] = xsrfCookie;
        }

        return headers;
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatTime(isoString) {
        if (!isoString) {
            return '';
        }
        try {
            const date = new Date(isoString);
            if (Number.isNaN(date.getTime())) {
                return '';
            }
            return date.toLocaleString('es-MX', {
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '';
        }
    }

    function formatShortUrl(rawUrl) {
        if (!rawUrl) {
            return '/';
        }
        try {
            const parsed = new URL(rawUrl, window.location.origin);
            return `${parsed.pathname}${parsed.search}`;
        } catch {
            return rawUrl;
        }
    }

    const DEFECT_TYPES = [
        { value: 'broken_action', label: '⚠️ Botón, enlace o formulario no funciona' },
        { value: 'server_error', label: '💥 Error 500 / Pantalla de error' },
        { value: 'legacy_parity', label: '🔄 Diferencia con Sapius original' },
        { value: 'visual_copy', label: '🎨 Error visual / Diseño o texto erróneo' },
    ];

    const PERSPECTIVES = [
        { value: 'designer', label: '🎨 Diseñador (UI/UX, visual, fuentes, espaciado)' },
        { value: 'student', label: '🎓 Alumno (Navegación, comodidad, claridad de estudio)' },
        { value: 'admin', label: '💼 Administrador (Gestión, cobros, control operativo)' },
        { value: 'engineering', label: '⚙️ Técnico / Estabilidad (Bugs, errores 500, paridad)' },
    ];

    function perspectiveMeta(value) {
        switch (value) {
            case 'student':
                return { label: 'Enfoque: Alumno', icon: '🎓', cls: 'chip-student' };
            case 'admin':
                return { label: 'Enfoque: Admin', icon: '💼', cls: 'chip-admin' };
            case 'engineering':
                return { label: 'Enfoque: Técnico', icon: '⚙️', cls: 'chip-engineering' };
            case 'designer':
            default:
                return { label: 'Enfoque: Diseñador', icon: '🎨', cls: 'chip-designer' };
        }
    }

    function defectTypeLabel(type) {
        const match = DEFECT_TYPES.find((item) => item.value === type);
        return match ? match.label : '⚠️ Fallo reportado';
    }

    function statusMeta(status) {
        switch (status) {
            case 'in_progress':
                return { label: 'Corrigiendo...', icon: '🛠️', cls: 'status-progress' };
            case 'resolved':
                return { label: 'Corregido', icon: '✅', cls: 'status-resolved' };
            case 'needs_review':
                return { label: 'En revisión', icon: '⏸️', cls: 'status-review' };
            case 'verified':
                return { label: 'Verificado', icon: '🎉', cls: 'status-verified' };
            case 'rejected':
                return { label: 'Rechazado (Solo correcciones)', icon: '🚫', cls: 'status-rejected' };
            case 'pending':
            default:
                return { label: 'En cola', icon: '⏳', cls: 'status-pending' };
        }
    }

    function ensureMounted() {
        if (!document.body) {
            return;
        }

        if (!state.isAdmin) {
            if (hostEl && hostEl.isConnected) {
                try {
                    if (hostEl.matches(':popover-open')) {
                        hostEl.hidePopover();
                    }
                } catch {
                    // Ignore popover errors
                }
                hostEl.remove();
            }
            stopPolling();
            return;
        }

        if (!hostEl) {
            hostEl = document.createElement('div');
            hostEl.id = 'sapius-qa-bot-host';
            hostEl.style.cssText =
                'position:fixed;bottom:20px;right:20px;z-index:2147483647;margin:0;padding:0;border:0;background:transparent;overflow:visible;inset:auto 20px 20px auto;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;';
            shadowRoot = hostEl.attachShadow({ mode: 'open' });
            attachShadowEvents();
        }

        if (!hostEl.isConnected) {
            document.body.appendChild(hostEl);
        }

        syncTopLayerWithInertiaDialog();
        startPolling();
        render();
    }

    function syncTopLayerWithInertiaDialog() {
        if (!hostEl || !state.isAdmin) {
            return;
        }

        const dialog = document.getElementById('inertia-error-dialog');
        if (dialog && dialog.open) {
            if (typeof hostEl.showPopover === 'function') {
                try {
                    hostEl.setAttribute('popover', 'manual');
                    if (hostEl.matches(':popover-open')) {
                        hostEl.hidePopover();
                    }
                    hostEl.showPopover();
                    return;
                } catch {
                    // Fallback below if popover fails
                }
            }
            if (hostEl.parentElement !== dialog) {
                dialog.appendChild(hostEl);
            }
            return;
        }

        if (typeof hostEl.hidePopover === 'function') {
            try {
                if (hostEl.matches(':popover-open')) {
                    hostEl.hidePopover();
                }
            } catch {
                // Ignore
            }
            hostEl.removeAttribute('popover');
        }

        if (document.body && hostEl.parentElement !== document.body) {
            document.body.appendChild(hostEl);
        }
    }

    function syncPollingSpeed() {
        const needsFastPoll = state.reports.some(
            (r) => r.grill_me && (r.status === 'pending' || r.status === 'in_progress')
        );
        const desiredMs = needsFastPoll ? FAST_POLL_INTERVAL_MS : POLL_INTERVAL_MS;
        if (desiredMs !== currentPollMs && pollTimer !== null) {
            currentPollMs = desiredMs;
            stopPolling();
            startPolling();
        }
    }

    function startPolling() {
        if (pollTimer !== null) {
            return;
        }
        fetchReports(true);
        pollTimer = window.setInterval(() => {
            if (!document.hidden && state.isAdmin) {
                fetchReports(true);
            }
        }, currentPollMs);
    }

    function stopPolling() {
        if (pollTimer !== null) {
            window.clearInterval(pollTimer);
            pollTimer = null;
        }
    }

    async function fetchReports(silent = false) {
        if (!state.isAdmin) {
            return;
        }

        if (!silent) {
            state.loadingReports = true;
            render();
        }

        let shouldRender = !silent;
        try {
            const response = await fetch(ENDPOINT_BASE, {
                method: 'GET',
                credentials: 'same-origin',
                headers: getCsrfHeaders(),
            });

            if (response.status === 401 || response.status === 403) {
                return;
            }

            if (!response.ok) {
                return;
            }

            const data = await response.json();
            const incoming = Array.isArray(data.reports) ? data.reports : [];
            const nextSig = JSON.stringify({ r: incoming, c: data.counts });
            if (silent && nextSig === state.lastReportsSig) {
                return;
            }
            state.lastReportsSig = nextSig;
            shouldRender = true;

            const nextResolved = new Set();

            for (const item of incoming) {
                if (item.status === 'resolved') {
                    const sig = `${item.id}:${item.resolved_at || item.updated_at || ''}`;
                    nextResolved.add(sig);
                    if (state.initializedReportsLoad && !state.knownResolvedSignatures.has(sig)) {
                        state.newResolvedAlert = true;
                    }
                }
            }

            state.knownResolvedSignatures = nextResolved;
            state.initializedReportsLoad = true;
            state.reports = incoming;
            if (data.counts && typeof data.counts === 'object') {
                state.counts = { ...state.counts, ...data.counts };
            }
            syncPollingSpeed();
        } catch {
            // Silently ignore transient network glitches during background polling
        } finally {
            state.loadingReports = false;
            if (shouldRender) {
                render();
            }
        }
    }

    async function handleImageFile(file) {
        if (!file || !file.type || !file.type.startsWith('image/')) {
            return;
        }

        const reader = new FileReader();
        reader.onload = async (ev) => {
            const rawDataUrl = ev.target?.result;
            if (typeof rawDataUrl !== 'string') {
                return;
            }

            // Compress slightly via canvas if image exceeds ~3.8 MB base64 so it never trips 5 MB server cap
            if (rawDataUrl.length > 3800000) {
                try {
                    const compressed = await compressDataUrl(rawDataUrl);
                    state.screenshotDataUrl = compressed;
                } catch {
                    state.screenshotDataUrl = rawDataUrl;
                }
            } else {
                state.screenshotDataUrl = rawDataUrl;
            }

            render();
        };
        reader.readAsDataURL(file);
    }

    function compressDataUrl(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const maxWidth = 1600;
                const scale = img.width > maxWidth ? maxWidth / img.width : 1;
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas unavailable'));
                    return;
                }
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.85));
            };
            img.onerror = reject;
            img.src = dataUrl;
        });
    }

    async function submitReport() {
        const trimmed = state.message.trim();
        if (!trimmed || state.submitting) {
            return;
        }

        state.submitting = true;
        state.submitFeedback = null;
        render();

        try {
            const payload = {
                message: trimmed,
                defect_type: state.defectType,
                perspective: state.perspective,
                grill_me: state.grillMe,
                url: state.currentUrl || window.location.href,
                component: state.currentComponent,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                user_agent: navigator.userAgent,
                console_errors: state.consoleErrors,
                server_exception: state.serverException,
                screenshot: state.screenshotDataUrl,
            };

            const response = await fetch(ENDPOINT_BASE, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    ...getCsrfHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                const errMsg =
                    data.message ||
                    (response.status === 419
                        ? 'Tu sesión/token expiró. Recarga la página e intenta de nuevo.'
                        : `Error HTTP ${response.status} al enviar reporte.`);
                state.submitFeedback = { type: 'error', text: errMsg };
                return;
            }

            const created = data.report || data;
            state.message = '';
            state.screenshotDataUrl = null;
            state.grillMe = false;
            state.hasUnreadError = false;
            state.submitFeedback = {
                type: 'success',
                text: `Reporte ${created.id || ''} enviado. Antigravity lo revisará en breve.`,
            };

            await fetchReports(true);
            state.activeTab = 'list';
        } catch {
            state.submitFeedback = {
                type: 'error',
                text: 'No se pudo conectar con el servidor para guardar el reporte.',
            };
        } finally {
            state.submitting = false;
            render();
        }
    }

    async function updateReport(id, payload) {
        if (!id || state.busyReportId) {
            return;
        }

        state.busyReportId = id;
        render();

        try {
            const response = await fetch(`${ENDPOINT_BASE}/${encodeURIComponent(id)}`, {
                method: 'PATCH',
                credentials: 'same-origin',
                headers: {
                    ...getCsrfHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                state.reopenTargetId = null;
                state.reopenNote = '';
                await fetchReports(true);
            }
        } catch {
            // Ignore
        } finally {
            state.busyReportId = null;
            render();
        }
    }

    async function deleteReport(id) {
        if (!id || state.busyReportId) {
            return;
        }

        state.busyReportId = id;
        render();

        try {
            const response = await fetch(`${ENDPOINT_BASE}/${encodeURIComponent(id)}`, {
                method: 'DELETE',
                credentials: 'same-origin',
                headers: getCsrfHeaders(),
            });

            if (response.ok) {
                state.confirmDeleteId = null;
                await fetchReports(true);
            }
        } catch {
            // Ignore
        } finally {
            state.busyReportId = null;
            render();
        }
    }

    async function revokePass() {
        try {
            await fetch('/admin/qa-bot/revoke-pass', {
                method: 'POST',
                credentials: 'same-origin',
                headers: getCsrfHeaders(),
            });
        } catch {
            // Ignore
        } finally {
            state.isAdmin = false;
            state.isOpen = false;
            state.viaPass = false;
            state.activeAccount = null;
            window.__SAPIUS_QA_ADMIN__ = false;
            window.__SAPIUS_QA_CONTEXT__ = null;
            ensureMounted();
        }
    }

    function attachShadowEvents() {
        if (!shadowRoot) {
            return;
        }

        shadowRoot.addEventListener('click', (event) => {
            const target = event.target instanceof Element ? event.target.closest('[data-qa-action]') : null;
            if (!target) {
                return;
            }

            const action = target.getAttribute('data-qa-action');
            const id = target.getAttribute('data-qa-id');

            switch (action) {
                case 'toggle-open':
                    state.isOpen = !state.isOpen;
                    if (state.isOpen) {
                        state.newResolvedAlert = false;
                        fetchReports(true);
                    }
                    render();
                    break;
                case 'close':
                    state.isOpen = false;
                    render();
                    break;
                case 'tab-new':
                    state.activeTab = 'new';
                    render();
                    break;
                case 'tab-list':
                    state.activeTab = 'list';
                    state.newResolvedAlert = false;
                    fetchReports(false);
                    render();
                    break;
                case 'clear-errors':
                    state.serverException = null;
                    state.consoleErrors = [];
                    state.hasUnreadError = false;
                    render();
                    break;
                case 'pick-screenshot':
                    shadowRoot.getElementById('qa-file-input')?.click();
                    break;
                case 'remove-screenshot':
                    state.screenshotDataUrl = null;
                    render();
                    break;
                case 'submit':
                    submitReport();
                    break;
                case 'refresh-reports':
                    fetchReports(false);
                    break;
                case 'reload-page':
                    window.location.reload();
                    break;
                case 'verify-report':
                    updateReport(id, { status: 'verified' });
                    break;
                case 'open-reopen':
                    state.reopenTargetId = state.reopenTargetId === id ? null : id;
                    state.reopenNote = '';
                    render();
                    break;
                case 'cancel-reopen':
                    state.reopenTargetId = null;
                    state.reopenNote = '';
                    render();
                    break;
                case 'submit-reopen':
                    if (state.reopenNote.trim()) {
                        updateReport(id, {
                            status: 'pending',
                            follow_up_message: state.reopenNote.trim(),
                        });
                    }
                    break;
                case 'ask-delete':
                    state.confirmDeleteId = id;
                    render();
                    break;
                case 'cancel-delete':
                    state.confirmDeleteId = null;
                    render();
                    break;
                case 'confirm-delete':
                    deleteReport(id);
                    break;
                case 'revoke-pass':
                    revokePass();
                    break;
                case 'set-mode-direct':
                    state.grillMe = false;
                    render();
                    break;
                case 'set-mode-grill':
                    state.grillMe = true;
                    render();
                    break;
                case 'select-grill-opt':
                    if (id) {
                        const chosen = target.getAttribute('data-qa-opt');
                        state.grillSelectedOption[id] = chosen;
                        render();
                        if (chosen === 'custom') {
                            const customEl = shadowRoot.getElementById(`qa-grill-custom-${id}`);
                            if (customEl instanceof HTMLTextAreaElement) {
                                customEl.focus({ preventScroll: true });
                            }
                        }
                    }
                    break;
                case 'submit-grill-answer':
                    if (id) {
                        const report = state.reports.find((r) => r.id === id);
                        const opts = Array.isArray(report?.grill_question?.options)
                            ? report.grill_question.options
                            : [];
                        const sel = state.grillSelectedOption[id];
                        let answerText = '';
                        if (sel === 'custom' || opts.length === 0) {
                            answerText = (state.grillCustomAnswer[id] || '').trim();
                        } else if (sel !== undefined && sel !== null && opts[Number(sel)] !== undefined) {
                            answerText = String(opts[Number(sel)]);
                        }
                        if (answerText) {
                            const finishNow = target.getAttribute('data-qa-finish') === '1';
                            delete state.grillSelectedOption[id];
                            delete state.grillCustomAnswer[id];
                            updateReport(id, {
                                grill_answer: answerText,
                                grill_finish: finishNow,
                            });
                        }
                    }
                    break;
                default:
                    break;
            }
        });

        shadowRoot.addEventListener('input', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement)) {
                return;
            }

            if (target.id === 'qa-message-input') {
                state.message = target.value;
                const btn = shadowRoot.getElementById('qa-submit-btn');
                if (btn instanceof HTMLButtonElement) {
                    btn.disabled = !state.message.trim() || state.submitting;
                }
            } else if (target.id === 'qa-reopen-input') {
                state.reopenNote = target.value;
            } else if (target.id && target.id.startsWith('qa-grill-custom-')) {
                const reportId = target.id.replace('qa-grill-custom-', '');
                state.grillCustomAnswer[reportId] = target.value;
                const submitBtns = shadowRoot.querySelectorAll(`[data-qa-action="submit-grill-answer"][data-qa-id="${reportId}"]`);
                submitBtns.forEach((btn) => {
                    if (btn instanceof HTMLButtonElement) {
                        btn.disabled = !target.value.trim() || state.busyReportId === reportId;
                    }
                });
            }
        });

        shadowRoot.addEventListener('keydown', (event) => {
            if (
                event.target instanceof HTMLTextAreaElement &&
                event.target.id === 'qa-message-input' &&
                (event.ctrlKey || event.metaKey) &&
                event.key === 'Enter'
            ) {
                event.preventDefault();
                submitReport();
            }
        });

        shadowRoot.addEventListener('change', (event) => {
            const target = event.target;
            if (target instanceof HTMLInputElement && target.id === 'qa-file-input' && target.files?.[0]) {
                handleImageFile(target.files[0]);
                target.value = '';
            } else if (target instanceof HTMLSelectElement && target.id === 'qa-perspective') {
                state.perspective = target.value;
                if (target.value === 'designer' && state.defectType === 'broken_action') {
                    state.defectType = 'visual_copy';
                    render();
                }
            } else if (target instanceof HTMLSelectElement && target.id === 'qa-defect-type') {
                state.defectType = target.value;
                if (target.value === 'visual_copy' && state.perspective !== 'designer') {
                    state.perspective = 'designer';
                    render();
                }
            }
        });

        shadowRoot.addEventListener('paste', (event) => {
            const items = event.clipboardData?.items;
            if (!items) {
                return;
            }
            for (const item of items) {
                if (item.type && item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    if (file) {
                        event.preventDefault();
                        handleImageFile(file);
                        break;
                    }
                }
            }
        });
    }

    function renderErrorPreview() {
        const exc = state.serverException;
        const jsErrors = state.consoleErrors;

        if (!exc && jsErrors.length === 0) {
            return '';
        }

        const lines = [];
        if (exc) {
            lines.push(
                `<div class="err-line"><strong>HTTP ${escapeHtml(exc.status || 500)}</strong> — ${escapeHtml(exc.exception || 'Exception')}</div>`
            );
            if (exc.message) {
                lines.push(`<div class="err-msg">${escapeHtml(exc.message)}</div>`);
            }
            if (exc.file) {
                lines.push(`<div class="err-meta">Archivo: ${escapeHtml(exc.file)}</div>`);
            }
        }

        if (jsErrors.length > 0) {
            const latest = jsErrors[jsErrors.length - 1];
            lines.push(
                `<div class="err-line"><strong>JS (${jsErrors.length})</strong> — ${escapeHtml(latest.message)}</div>`
            );
        }

        return `
            <div class="error-box">
                <div class="error-box-head">
                    <span>⚠️ Contexto de error capturado</span>
                    <button type="button" class="link-btn" data-qa-action="clear-errors">Limpiar</button>
                </div>
                ${lines.join('')}
            </div>
        `;
    }

    function renderNewTab() {
        const shortUrl = formatShortUrl(state.currentUrl);
        const componentBadge = state.currentComponent
            ? `<span class="chip chip-comp">${escapeHtml(state.currentComponent)}</span>`
            : '';
        const testedAsBadge =
            state.activeAccount && state.activeAccount.role !== 'admin'
                ? `<span class="chip chip-tested">🎓 Probando como: ${escapeHtml(state.activeAccount.name || state.activeAccount.email)} (${escapeHtml(state.activeAccount.role || 'alumno')})</span>`
                : '';

        const feedbackHtml = state.submitFeedback
            ? `<div class="alert ${state.submitFeedback.type === 'error' ? 'alert-error' : 'alert-success'}">${escapeHtml(state.submitFeedback.text)}</div>`
            : '';

        const previewHtml = state.screenshotDataUrl
            ? `
                <div class="shot-preview">
                    <img src="${state.screenshotDataUrl}" alt="Captura adjunta" />
                    <button type="button" class="shot-remove" data-qa-action="remove-screenshot">Quitar captura</button>
                </div>
            `
            : '';

        const defectOptionsHtml = DEFECT_TYPES.map(
            (opt) =>
                `<option value="${opt.value}" ${state.defectType === opt.value ? 'selected' : ''}>${escapeHtml(opt.label)}</option>`
        ).join('');

        const perspectiveOptionsHtml = PERSPECTIVES.map(
            (opt) =>
                `<option value="${opt.value}" ${state.perspective === opt.value ? 'selected' : ''}>${escapeHtml(opt.label)}</option>`
        ).join('');

        return `
            <div class="tab-body">
                <div class="scope-banner">
                    🔒 Solo correcciones de errores y paridad con Sapius original (no nuevas funciones ni cambios de BD).
                </div>
                <div class="context-bar">
                    <span class="chip chip-url" title="${escapeHtml(state.currentUrl)}">${escapeHtml(shortUrl)}</span>
                    ${componentBadge}
                    ${testedAsBadge}
                </div>
                ${renderErrorPreview()}
                ${feedbackHtml}
                <label class="field-label">Modo de atención del Bot</label>
                <div class="mode-grid">
                    <button
                        type="button"
                        class="mode-card ${!state.grillMe ? 'active' : ''}"
                        data-qa-action="set-mode-direct"
                    >
                        <div class="mode-title">⚡ Ejecución directa</div>
                        <div class="mode-sub">Aplicar el cambio o corrección directo</div>
                    </button>
                    <button
                        type="button"
                        class="mode-card ${state.grillMe ? 'active-grill' : ''}"
                        data-qa-action="set-mode-grill"
                    >
                        <div class="mode-title">🧠 Perfilar idea con preguntas</div>
                        <div class="mode-sub">El bot te hará preguntas aquí antes de programar</div>
                    </button>
                </div>
                <label class="field-label" for="qa-perspective">Enfoque / Perspectiva del reporte</label>
                <select id="qa-perspective">${perspectiveOptionsHtml}</select>
                <label class="field-label" for="qa-defect-type">Tipo de fallo</label>
                <select id="qa-defect-type">${defectOptionsHtml}</select>
                <label class="field-label" for="qa-message-input">${state.grillMe ? 'Describe tu idea o prompt a perfilar' : 'Describe el fallo a corregir'}</label>
                <textarea
                    id="qa-message-input"
                    rows="4"
                    placeholder="${state.grillMe ? 'Escribe tu idea completa. El bot analizará el código y te hará preguntas de opción múltiple para afinar cada detalle... (Ctrl+Enter para enviar)' : 'Describe qué falló, qué acción hiciste y qué debería ocurrir... (Ctrl+V para pegar captura, Ctrl+Enter para enviar)'}"
                >${escapeHtml(state.message)}</textarea>
                ${previewHtml}
                <input id="qa-file-input" type="file" accept="image/png,image/jpeg,image/webp" hidden />
                <div class="actions-row">
                    <button type="button" class="btn-secondary" data-qa-action="pick-screenshot">
                        📎 ${state.screenshotDataUrl ? 'Cambiar captura' : 'Adjuntar captura'}
                    </button>
                    <button
                        id="qa-submit-btn"
                        type="button"
                        class="btn-primary"
                        data-qa-action="submit"
                        ${!state.message.trim() || state.submitting ? 'disabled' : ''}
                    >
                        ${state.submitting ? 'Enviando...' : state.grillMe ? '🧠 Enviar y perfilar' : 'Enviar reporte'}
                    </button>
                </div>
            </div>
        `;
    }

    function renderReportCard(report) {
        const meta = statusMeta(report.status);
        const isBusy = state.busyReportId === report.id;
        const shortUrl = formatShortUrl(report.url);

        const shotHtml = report.screenshot_url
            ? `<a class="shot-link" href="${escapeHtml(report.screenshot_url)}" target="_blank" rel="noopener noreferrer">🖼️ Ver captura</a>`
            : '';

        const isRejected = report.status === 'rejected';
        const defectBadgeHtml = report.defect_type
            ? `<span class="defect-chip">${escapeHtml(defectTypeLabel(report.defect_type))}</span>`
            : '';

        const pMeta = perspectiveMeta(report.perspective || 'designer');
        const perspectiveBadgeHtml = `<span class="perspective-chip ${pMeta.cls}">${pMeta.icon} ${escapeHtml(pMeta.label)}</span>`;
        const grillBadgeHtml = report.grill_me
            ? '<span class="grill-chip">🧠 Modo Entrevista</span>'
            : '';

        const grillHistoryList = Array.isArray(report.grill_history) ? report.grill_history : [];
        const grillHistoryHtml =
            grillHistoryList.length > 0
                ? `
                    <div class="grill-history">
                        <div class="grill-history-title">💬 Preguntas respondidas (${grillHistoryList.length})</div>
                        ${grillHistoryList
                            .map(
                                (item, idx) => `
                                    <div class="grill-history-item">
                                        <div class="grill-hq"><strong>P${idx + 1}:</strong> ${escapeHtml(item.question)}</div>
                                        <div class="grill-ha">↳ ${escapeHtml(item.answer)}</div>
                                    </div>
                                `
                            )
                            .join('')}
                    </div>
                `
                : '';

        let grillBoxHtml = '';
        if (report.status === 'needs_review' && report.grill_question && report.grill_question.question) {
            const qObj = report.grill_question;
            const opts = Array.isArray(qObj.options) ? qObj.options : [];
            const selectedOpt = state.grillSelectedOption[report.id];
            const customVal = state.grillCustomAnswer[report.id] || '';
            const hasSelection =
                (selectedOpt !== undefined && selectedOpt !== null && selectedOpt !== 'custom') ||
                ((selectedOpt === 'custom' || opts.length === 0) && customVal.trim() !== '');

            const optsHtml = opts
                .map((opt, idx) => {
                    const isSelected = String(selectedOpt) === String(idx);
                    const isRec = String(opt).toLowerCase().includes('(recomendado)');
                    return `
                        <button
                            type="button"
                            class="grill-opt ${isSelected ? 'selected' : ''} ${isRec ? 'recommended' : ''}"
                            data-qa-action="select-grill-opt"
                            data-qa-id="${escapeHtml(report.id)}"
                            data-qa-opt="${idx}"
                        >
                            <span class="grill-radio">${isSelected ? '●' : '○'}</span>
                            <span>${escapeHtml(opt)}</span>
                        </button>
                    `;
                })
                .join('');

            const showCustomInput = selectedOpt === 'custom' || opts.length === 0;
            const customOptionBtn =
                opts.length > 0
                    ? `
                        <button
                            type="button"
                            class="grill-opt ${selectedOpt === 'custom' ? 'selected' : ''}"
                            data-qa-action="select-grill-opt"
                            data-qa-id="${escapeHtml(report.id)}"
                            data-qa-opt="custom"
                        >
                            <span class="grill-radio">${selectedOpt === 'custom' ? '●' : '○'}</span>
                            <span>✍️ Otra respuesta (especificar)...</span>
                        </button>
                    `
                    : '';

            const customInputHtml = showCustomInput
                ? `<textarea id="qa-grill-custom-${escapeHtml(report.id)}" rows="2" placeholder="Escribe tu respuesta personalizada...">${escapeHtml(customVal)}</textarea>`
                : '';

            grillBoxHtml = `
                <div class="grill-box">
                    <div class="grill-box-title">🧠 Pregunta del Bot para perfilar tu idea:</div>
                    <div class="grill-question-text">${escapeHtml(qObj.question)}</div>
                    <div class="grill-options-list">
                        ${optsHtml}
                        ${customOptionBtn}
                    </div>
                    ${customInputHtml}
                    <div class="grill-actions">
                        <button
                            type="button"
                            class="btn-xs btn-primary-sm"
                            data-qa-action="submit-grill-answer"
                            data-qa-id="${escapeHtml(report.id)}"
                            data-qa-finish="0"
                            ${!hasSelection || isBusy ? 'disabled' : ''}
                        >
                            Enviar respuesta
                        </button>
                        <button
                            type="button"
                            class="btn-xs btn-ok-grill"
                            data-qa-action="submit-grill-answer"
                            data-qa-id="${escapeHtml(report.id)}"
                            data-qa-finish="1"
                            ${!hasSelection || isBusy ? 'disabled' : ''}
                        >
                            🚀 Responder e implementar ya
                        </button>
                    </div>
                </div>
            `;
        }

        const replyHtml = report.agent_reply
            ? `
                <div class="agent-reply ${isRejected ? 'agent-reply-rejected' : ''}">
                    <div class="agent-reply-title">${isRejected ? '🚫 Fuera de alcance (Solo correcciones)' : '🤖 Respuesta técnica'}</div>
                    <div>${escapeHtml(report.agent_reply)}</div>
                </div>
            `
            : '';

        const reopenBox =
            state.reopenTargetId === report.id
                ? `
                    <div class="reopen-box">
                        <textarea id="qa-reopen-input" rows="2" placeholder="Describe qué falta o sigue fallando...">${escapeHtml(state.reopenNote)}</textarea>
                        <div class="reopen-actions">
                            <button type="button" class="btn-xs btn-ghost" data-qa-action="cancel-reopen">Cancelar</button>
                            <button type="button" class="btn-xs btn-primary-sm" data-qa-action="submit-reopen" data-qa-id="${escapeHtml(report.id)}" ${isBusy ? 'disabled' : ''}>Enviar nota</button>
                        </div>
                    </div>
                `
                : '';

        const deleteControl =
            state.confirmDeleteId === report.id
                ? `
                    <span class="confirm-delete">
                        ¿Borrar?
                        <button type="button" class="btn-xs btn-danger" data-qa-action="confirm-delete" data-qa-id="${escapeHtml(report.id)}" ${isBusy ? 'disabled' : ''}>Sí</button>
                        <button type="button" class="btn-xs btn-ghost" data-qa-action="cancel-delete">No</button>
                    </span>
                `
                : `<button type="button" class="btn-icon" title="Eliminar reporte" data-qa-action="ask-delete" data-qa-id="${escapeHtml(report.id)}">🗑️</button>`;

        const resolvedActions =
            report.status === 'resolved'
                ? `
                    <button type="button" class="btn-xs btn-reload" data-qa-action="reload-page">🔄 Recargar página para probar</button>
                    <button type="button" class="btn-xs btn-ok" data-qa-action="verify-report" data-qa-id="${escapeHtml(report.id)}" ${isBusy ? 'disabled' : ''}>✓ Confirmar</button>
                    <button type="button" class="btn-xs btn-ghost" data-qa-action="open-reopen" data-qa-id="${escapeHtml(report.id)}">Reabrir</button>
                `
                : report.status === 'needs_review'
                    ? `<button type="button" class="btn-xs btn-ghost" data-qa-action="open-reopen" data-qa-id="${escapeHtml(report.id)}">Responder / Reenviar</button>`
                    : '';

        const authorName = report.author?.name || 'Administrador';
        const isCurrentReviewer =
            !state.reviewer?.id ||
            !report.author?.id ||
            String(report.author.id) === String(state.reviewer.id);
        const authorDisplay = isCurrentReviewer ? 'Tú' : authorName;
        const authorHtml = `<div class="report-author">👤 <strong>Solicitó:</strong> ${escapeHtml(authorDisplay)}</div>`;

        const showTestedAs =
            report.tested_as &&
            (report.tested_as.role !== 'admin' ||
                (report.tested_as.id && report.tested_as.id !== report.author?.id));
        const testedAsHtml = showTestedAs
            ? `<div class="report-tested-as">🎓 <strong>Probando cuenta:</strong> ${escapeHtml(report.tested_as.name || report.tested_as.email || 'Alumno')} (${escapeHtml(report.tested_as.role || 'alumno')})</div>`
            : '';

        return `
            <div class="report-card">
                <div class="report-head">
                    <span class="report-id">${escapeHtml(report.id)}</span>
                    <span class="status-pill ${meta.cls}">${meta.icon} ${meta.label}</span>
                    <span class="report-time">${escapeHtml(formatTime(report.created_at))}</span>
                </div>
                ${authorHtml}
                ${testedAsHtml}
                <div class="badges-row">
                    ${perspectiveBadgeHtml}
                    ${grillBadgeHtml}
                    ${defectBadgeHtml}
                </div>
                ${grillBoxHtml}
                ${grillHistoryHtml}
                <div class="report-msg">${escapeHtml(report.message)}</div>
                <div class="report-meta">
                    <span title="${escapeHtml(report.url || '')}">${escapeHtml(shortUrl)}</span>
                    ${report.component ? `<span>· ${escapeHtml(report.component)}</span>` : ''}
                    ${shotHtml}
                </div>
                ${replyHtml}
                <div class="report-footer">
                    <div class="report-actions">${resolvedActions}</div>
                    ${deleteControl}
                </div>
                ${reopenBox}
            </div>
        `;
    }

    function renderListTab() {
        const itemsHtml =
            state.loadingReports && state.reports.length === 0
                ? '<div class="empty-state">Cargando reportes...</div>'
                : state.reports.length === 0
                    ? '<div class="empty-state">Aún no hay reportes registrados.</div>'
                    : state.reports.map(renderReportCard).join('');

        return `
            <div class="tab-body">
                <div class="list-toolbar">
                    <div class="counters">
                        <span>⏳ ${state.counts.pending || 0}</span>
                        <span>🛠️ ${state.counts.in_progress || 0}</span>
                        <span>✅ ${state.counts.resolved || 0}</span>
                        ${state.counts.rejected > 0 ? `<span>🚫 ${state.counts.rejected}</span>` : ''}
                    </div>
                    <button type="button" class="btn-xs btn-ghost" data-qa-action="refresh-reports">↻ Actualizar</button>
                </div>
                <div class="reports-scroll">
                    ${itemsHtml}
                </div>
            </div>
        `;
    }

    function render() {
        if (!shadowRoot || !state.isAdmin) {
            return;
        }

        // Preserve scroll positions, textarea focus & cursor during re-renders
        const prevReportsScroll = shadowRoot.querySelector('.reports-scroll')?.scrollTop ?? 0;
        const prevTabScroll = shadowRoot.querySelector('.tab-body')?.scrollTop ?? 0;
        const activeEl = shadowRoot.activeElement;
        const activeId = activeEl instanceof HTMLElement ? activeEl.id : null;
        const selStart = activeEl instanceof HTMLTextAreaElement ? activeEl.selectionStart : null;
        const selEnd = activeEl instanceof HTMLTextAreaElement ? activeEl.selectionEnd : null;

        const resolvedCount = Number(state.counts.resolved || 0);
        const activeCount = Number(state.counts.pending || 0) + Number(state.counts.in_progress || 0);
        const grillPendingCount = state.reports.filter(
            (r) => r.status === 'needs_review' && r.grill_question && r.grill_question.question
        ).length;
        const totalBadgeCount = Number(state.counts.total || state.reports.length || 0);

        let badgeHtml = '';
        if (state.hasUnreadError) {
            badgeHtml = '<span class="fab-badge fab-badge-err">⚠️ Error detectado</span>';
        } else if (grillPendingCount > 0) {
            badgeHtml = `<span class="fab-badge fab-badge-grill">🧠 ${grillPendingCount} pregunta${grillPendingCount === 1 ? '' : 's'}</span>`;
        } else if (state.newResolvedAlert || resolvedCount > 0) {
            badgeHtml = `<span class="fab-badge fab-badge-ok">✅ ${resolvedCount} listo${resolvedCount === 1 ? '' : 's'}</span>`;
        } else if (activeCount > 0) {
            badgeHtml = `<span class="fab-badge fab-badge-pending">${activeCount}</span>`;
        }

        const reviewerName = state.reviewer?.name || 'Administrador';
        const headerSub = state.viaPass
            ? `👤 Revisor: ${escapeHtml(reviewerName)} · Modo pase activo`
            : `👤 Revisor: ${escapeHtml(reviewerName)}`;
        const revokeBtnHtml = state.viaPass
            ? `<button type="button" class="revoke-btn" data-qa-action="revoke-pass" title="Desactivar pase QA en este navegador">🔒 Salir de modo QA</button>`
            : '';

        const panelHtml = state.isOpen
            ? `
                <div class="panel" role="dialog" aria-label="Bot de Revisión QA">
                    <div class="panel-header">
                        <div class="panel-title-wrap">
                            <div class="panel-title">🛠️ Bot QA Sapius</div>
                            <div class="panel-sub">${headerSub}</div>
                        </div>
                        <div class="header-actions">
                            ${revokeBtnHtml}
                            <button type="button" class="close-btn" data-qa-action="close" aria-label="Cerrar">✕</button>
                        </div>
                    </div>
                    <div class="tabs">
                        <button type="button" class="tab-btn ${state.activeTab === 'new' ? 'active' : ''}" data-qa-action="tab-new">
                            Nuevo Reporte
                        </button>
                        <button type="button" class="tab-btn ${state.activeTab === 'list' ? 'active' : ''}" data-qa-action="tab-list">
                            Mis Reportes ${totalBadgeCount > 0 ? `<span class="tab-count">${totalBadgeCount}</span>` : ''}
                        </button>
                    </div>
                    ${state.activeTab === 'new' ? renderNewTab() : renderListTab()}
                </div>
            `
            : '';

        shadowRoot.innerHTML = `
            <style>
                :host { all: initial; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
                * { box-sizing: border-box; }
                .wrap { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
                .fab {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 10px 16px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.16);
                    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                    color: #f8fafc; font-size: 13px; font-weight: 700; cursor: pointer;
                    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.38);
                    transition: transform 0.15s ease, box-shadow 0.15s ease;
                }
                .fab:hover { transform: translateY(-1px); box-shadow: 0 16px 32px rgba(15, 23, 42, 0.45); }
                .fab-badge {
                    padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; line-height: 1.3;
                }
                .fab-badge-err {
                    background: #ef4444; color: #fff; animation: qa-pulse 1.6s infinite;
                }
                .fab-badge-ok { background: #10b981; color: #fff; }
                .fab-badge-pending { background: #6366f1; color: #fff; }
                .fab-badge-grill { background: #ec4899; color: #fff; animation: qa-pulse 1.6s infinite; }
                .mode-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
                .mode-card {
                    text-align: left; padding: 8px 10px; border-radius: 10px; border: 1px solid #cbd5e1;
                    background: #f8fafc; cursor: pointer; transition: all 0.15s ease;
                }
                .mode-card:hover { border-color: #94a3b8; }
                .mode-card.active { border-color: #4f46e5; background: #eef2ff; box-shadow: 0 0 0 1px #4f46e5; }
                .mode-card.active-grill { border-color: #db2777; background: #fdf2f8; box-shadow: 0 0 0 1px #db2777; }
                .mode-title { font-size: 11px; font-weight: 700; color: #0f172a; }
                .mode-sub { font-size: 10px; color: #64748b; margin-top: 2px; line-height: 1.25; }
                .grill-chip {
                    display: inline-block; font-size: 10px; font-weight: 700; border-radius: 6px; padding: 2px 7px;
                    background: #fdf2f8; color: #be185d; border: 1px solid #fbcfe8;
                }
                .grill-history {
                    background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px;
                    display: flex; flex-direction: column; gap: 6px; max-height: 140px; overflow-y: auto;
                }
                .grill-history-title { font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; }
                .grill-history-item { font-size: 11px; border-left: 2px solid #cbd5e1; padding-left: 6px; }
                .grill-hq { color: #334155; }
                .grill-ha { color: #4f46e5; font-weight: 600; margin-top: 2px; }
                .grill-box {
                    background: #fdf2f8; border: 1px solid #f9a8d4; border-radius: 10px; padding: 10px;
                    display: flex; flex-direction: column; gap: 8px;
                }
                .grill-box-title { font-size: 11px; font-weight: 800; color: #be185d; }
                .grill-question-text { font-size: 12px; font-weight: 700; color: #0f172a; line-height: 1.35; }
                .grill-options-list { display: flex; flex-direction: column; gap: 5px; }
                .grill-opt {
                    display: flex; align-items: flex-start; gap: 6px; text-align: left; width: 100%;
                    padding: 7px 9px; border-radius: 8px; border: 1px solid #e2e8f0; background: #ffffff;
                    font-size: 11px; color: #1e293b; cursor: pointer; line-height: 1.3;
                }
                .grill-opt:hover { border-color: #db2777; }
                .grill-opt.recommended { border-color: #a5b4fc; background: #eef2ff; }
                .grill-opt.selected { border-color: #db2777; background: #fce7f3; font-weight: 700; color: #831843; }
                .grill-radio { font-size: 12px; color: #db2777; flex-shrink: 0; }
                .grill-actions { display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; }
                .btn-ok-grill { background: #059669; color: #fff; }
                @keyframes qa-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.85; transform: scale(1.04); }
                }
                .panel {
                    width: 400px; max-width: calc(100vw - 24px); max-height: calc(100vh - 96px);
                    display: flex; flex-direction: column;
                    background: #ffffff; color: #0f172a;
                    border: 1px solid #cbd5e1; border-radius: 16px;
                    box-shadow: 0 24px 48px rgba(15, 23, 42, 0.28);
                    overflow: hidden;
                }
                .panel-header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 12px 16px; background: #0f172a; color: #f8fafc;
                }
                .panel-title { font-size: 14px; font-weight: 700; }
                .panel-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }
                .header-actions { display: flex; align-items: center; gap: 6px; }
                .revoke-btn {
                    background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(248, 113, 113, 0.45);
                    color: #fecaca; border-radius: 8px; padding: 4px 8px; font-size: 10px; font-weight: 700; cursor: pointer;
                }
                .revoke-btn:hover { background: rgba(239, 68, 68, 0.35); color: #ffffff; }
                .close-btn {
                    background: rgba(255,255,255,0.1); border: none; color: #e2e8f0;
                    width: 28px; height: 28px; border-radius: 8px; cursor: pointer; font-size: 14px;
                }
                .close-btn:hover { background: rgba(255,255,255,0.2); }
                .tabs {
                    display: flex; border-bottom: 1px solid #e2e8f0; background: #f8fafc;
                }
                .tab-btn {
                    flex: 1; padding: 10px 12px; border: none; background: transparent;
                    font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer;
                    border-bottom: 2px solid transparent; display: inline-flex; justify-content: center; align-items: center; gap: 6px;
                }
                .tab-btn.active { color: #4f46e5; border-bottom-color: #4f46e5; background: #ffffff; }
                .tab-count {
                    background: #e0e7ff; color: #4338ca; padding: 1px 6px; border-radius: 9999px; font-size: 11px;
                }
                .tab-body { padding: 14px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
                .scope-banner {
                    background: #fffbeb; border: 1px solid #fde68a; color: #92400e;
                    border-radius: 8px; padding: 7px 10px; font-size: 11px; font-weight: 600; line-height: 1.35;
                }
                .context-bar { display: flex; flex-wrap: wrap; gap: 6px; }
                .chip {
                    font-size: 11px; padding: 3px 8px; border-radius: 6px; max-width: 100%;
                    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                }
                .chip-url { background: #f1f5f9; color: #334155; font-family: ui-monospace, monospace; }
                .chip-comp { background: #eef2ff; color: #4338ca; font-weight: 600; }
                .chip-tested { background: #ecfeff; color: #0e7490; font-weight: 600; border: 1px solid #a5f3fc; }
                .error-box {
                    background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 10px;
                    font-size: 11px; color: #991b1b; display: flex; flex-direction: column; gap: 4px;
                }
                .error-box-head { display: flex; justify-content: space-between; align-items: center; font-weight: 700; }
                .err-msg {
                    font-family: ui-monospace, monospace; font-size: 11px; background: rgba(255,255,255,0.7);
                    padding: 4px 6px; border-radius: 6px; word-break: break-word; max-height: 70px; overflow-y: auto;
                }
                .err-meta { color: #b91c1c; font-size: 10px; }
                .link-btn {
                    background: none; border: none; color: #b91c1c; font-size: 11px; text-decoration: underline; cursor: pointer; padding: 0;
                }
                .field-label { font-size: 12px; font-weight: 600; color: #1e293b; }
                select {
                    width: 100%; border: 1px solid #cbd5e1; border-radius: 10px; padding: 8px 10px;
                    font-family: inherit; font-size: 12px; color: #0f172a; background: #ffffff;
                }
                select:focus { outline: 2px solid #6366f1; border-color: #6366f1; }
                textarea {
                    width: 100%; border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px;
                    font-family: inherit; font-size: 13px; color: #0f172a; background: #ffffff; resize: vertical;
                }
                textarea:focus { outline: 2px solid #6366f1; border-color: #6366f1; }
                .shot-preview {
                    position: relative; border: 1px solid #cbd5e1; border-radius: 10px; padding: 6px; background: #f8fafc;
                    display: flex; align-items: center; justify-content: space-between; gap: 8px;
                }
                .shot-preview img { max-height: 64px; max-width: 140px; border-radius: 6px; object-fit: cover; }
                .shot-remove {
                    background: #fee2e2; color: #b91c1c; border: none; border-radius: 6px;
                    padding: 5px 8px; font-size: 11px; font-weight: 600; cursor: pointer;
                }
                .actions-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
                .btn-primary {
                    background: #4f46e5; color: #ffffff; border: none; border-radius: 10px;
                    padding: 9px 14px; font-size: 13px; font-weight: 600; cursor: pointer;
                }
                .btn-primary:hover:not(:disabled) { background: #4338ca; }
                .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
                .btn-secondary {
                    background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 10px;
                    padding: 8px 12px; font-size: 12px; font-weight: 600; cursor: pointer;
                }
                .btn-secondary:hover { background: #e2e8f0; }
                .alert { padding: 8px 10px; border-radius: 8px; font-size: 12px; font-weight: 500; }
                .alert-success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
                .alert-error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
                .list-toolbar { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #475569; }
                .counters { display: flex; gap: 10px; font-weight: 600; }
                .reports-scroll { display: flex; flex-direction: column; gap: 10px; max-height: 360px; overflow-y: auto; padding-right: 2px; }
                .report-card {
                    border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 12px; background: #f8fafc;
                    display: flex; flex-direction: column; gap: 6px;
                }
                .report-head { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
                .report-id { font-family: ui-monospace, monospace; font-size: 11px; font-weight: 700; color: #334155; }
                .status-pill { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; }
                .status-pending { background: #fef3c7; color: #92400e; }
                .status-progress { background: #dbeafe; color: #1e40af; }
                .status-resolved { background: #d1fae5; color: #065f46; }
                .status-review { background: #ffedd5; color: #9a3412; }
                .status-verified { background: #e0e7ff; color: #3730a3; }
                .status-rejected { background: #fee2e2; color: #991b1b; }
                .badges-row { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
                .defect-chip {
                    display: inline-block; font-size: 10px; font-weight: 600; color: #475569;
                    background: #e2e8f0; border-radius: 6px; padding: 2px 7px;
                }
                .perspective-chip {
                    display: inline-block; font-size: 10px; font-weight: 700; border-radius: 6px; padding: 2px 7px;
                }
                .chip-designer { background: #fdf2f8; color: #be185d; border: 1px solid #fbcfe8; }
                .chip-student { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
                .chip-admin { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
                .chip-engineering { background: #faf5ff; color: #7e22ce; border: 1px solid #e9d5ff; }
                .report-author { font-size: 11px; color: #1e293b; }
                .report-author .author-email { color: #64748b; font-size: 10px; }
                .report-tested-as {
                    font-size: 11px; color: #0e7490; background: #ecfeff;
                    border: 1px solid #cffafe; border-radius: 6px; padding: 3px 7px;
                }
                .report-time { margin-left: auto; font-size: 10px; color: #64748b; }
                .report-msg { font-size: 12px; color: #0f172a; white-space: pre-wrap; word-break: break-word; }
                .report-meta { display: flex; flex-wrap: wrap; gap: 6px; font-size: 10px; color: #64748b; align-items: center; }
                .shot-link { color: #4f46e5; text-decoration: none; font-weight: 600; }
                .agent-reply {
                    background: #eef2ff; border-left: 3px solid #4f46e5; padding: 7px 9px;
                    border-radius: 6px; font-size: 12px; color: #1e1b4b; white-space: pre-wrap;
                }
                .agent-reply-title { font-size: 11px; font-weight: 700; margin-bottom: 2px; color: #4338ca; }
                .agent-reply-rejected { background: #fef2f2; border-left-color: #dc2626; color: #7f1d1d; }
                .agent-reply-rejected .agent-reply-title { color: #b91c1c; }
                .report-footer { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-top: 2px; }
                .report-actions { display: flex; flex-wrap: wrap; gap: 5px; }
                .btn-xs {
                    border: none; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 600; cursor: pointer;
                }
                .btn-reload { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
                .btn-ok { background: #4f46e5; color: #fff; }
                .btn-ghost { background: #e2e8f0; color: #334155; }
                .btn-primary-sm { background: #4f46e5; color: #fff; }
                .btn-danger { background: #dc2626; color: #fff; }
                .btn-icon { background: none; border: none; cursor: pointer; font-size: 13px; padding: 2px 4px; opacity: 0.7; }
                .btn-icon:hover { opacity: 1; }
                .confirm-delete { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: #b91c1c; font-weight: 600; }
                .reopen-box { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
                .reopen-actions { display: flex; justify-content: flex-end; gap: 6px; }
                .empty-state { text-align: center; padding: 24px 12px; font-size: 12px; color: #64748b; }
            </style>
            <div class="wrap">
                ${panelHtml}
                <button type="button" class="fab" data-qa-action="toggle-open">
                    <span>🛠️ Bot QA</span>
                    ${badgeHtml}
                </button>
            </div>
        `;

        const nextReportsScroll = shadowRoot.querySelector('.reports-scroll');
        if (nextReportsScroll && prevReportsScroll > 0) {
            nextReportsScroll.scrollTop = prevReportsScroll;
        }
        const nextTabScroll = shadowRoot.querySelector('.tab-body');
        if (nextTabScroll && prevTabScroll > 0) {
            nextTabScroll.scrollTop = prevTabScroll;
        }

        if (activeId) {
            const restored = shadowRoot.getElementById(activeId);
            if (restored instanceof HTMLElement) {
                restored.focus({ preventScroll: true });
                if (restored instanceof HTMLTextAreaElement && selStart !== null && selEnd !== null) {
                    restored.setSelectionRange(selStart, selEnd);
                }
            }
        }
    }

    // Global error & Inertia listeners
    window.addEventListener('error', (event) => {
        pushConsoleError({
            type: 'window.error',
            message: event.message || String(event.error || 'Error JavaScript'),
            source: event.filename ? `${event.filename}:${event.lineno}` : null,
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        const msg =
            reason && typeof reason === 'object' && 'message' in reason
                ? reason.message
                : String(reason || 'Unhandled Promise rejection');
        pushConsoleError({
            type: 'unhandledrejection',
            message: msg,
        });
    });

    window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin && event.origin !== 'null') {
            return;
        }
        if (event.data && event.data.type === 'SAPIUS_QA_EXCEPTION' && event.data.payload) {
            state.serverException = event.data.payload;
            state.defectType = 'server_error';
            state.hasUnreadError = true;
            ensureMounted();
            render();
        }
    });

    function handleInertiaPageEvent(event) {
        const page = event?.detail?.page;
        state.currentUrl = window.location.href;
        if (page) {
            if (page.component) {
                state.currentComponent = page.component;
            }
            if (page.props && Object.prototype.hasOwnProperty.call(page.props, 'qaBot')) {
                if (page.props.qaBot && page.props.qaBot.enabled) {
                    applyQaContext(page.props.qaBot);
                } else {
                    state.isAdmin = page.props.auth?.user?.role === 'admin';
                    state.activeAccount = null;
                    state.viaPass = false;
                }
                window.__SAPIUS_QA_ADMIN__ = state.isAdmin;
            } else if (page.props && Object.prototype.hasOwnProperty.call(page.props, 'auth')) {
                state.isAdmin = page.props.auth?.user?.role === 'admin';
                window.__SAPIUS_QA_ADMIN__ = state.isAdmin;
            }
        }
        ensureMounted();
    }

    document.addEventListener('inertia:navigate', handleInertiaPageEvent);
    document.addEventListener('inertia:success', handleInertiaPageEvent);

    document.addEventListener('inertia:exception', (event) => {
        const exc = event?.detail?.exception;
        pushConsoleError({
            type: 'inertia:exception',
            message: exc?.message || 'Excepción de red o navegación en Inertia',
        });
    });

    document.addEventListener('inertia:invalid', (event) => {
        const resp = event?.detail?.response;
        const status = resp?.status || 500;
        if (!state.serverException) {
            state.serverException = {
                status,
                exception: 'InertiaInvalidResponse',
                message: `El servidor devolvió una respuesta HTML inesperada (HTTP ${status}).`,
                url: window.location.href,
                timestamp: new Date().toISOString(),
            };
        }
        state.defectType = 'server_error';
        state.hasUnreadError = true;
        ensureMounted();
        window.setTimeout(syncTopLayerWithInertiaDialog, 50);
    });

    function boot() {
        detectInitialState();
        ensureMounted();

        if (!dialogObserver && document.body) {
            dialogObserver = new MutationObserver(() => {
                syncTopLayerWithInertiaDialog();
            });
            dialogObserver.observe(document.body, { childList: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
