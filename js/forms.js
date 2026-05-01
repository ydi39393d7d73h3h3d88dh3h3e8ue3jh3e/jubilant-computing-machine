const API_BASE_URL = "/api";
const METRIKA_COUNTER_ID = 107214723;
const METRICS_CURRENCY = "RUB";
const SERVICE_NAMES = {
    polishing: "Полировка кузова",
    chemdry: "Химчистка салона",
    restoration: "Реставрация кожи",
    ceramic: "Керамическое покрытие",
    washing: "Перетяжка руля",
    other: "Другая услуга",
};

function setButtonLoading(button, isLoading, defaultText) {
    if (!button) return;
    button.disabled = isLoading;
    button.dataset.defaultText = button.dataset.defaultText || defaultText || button.textContent;
    button.textContent = isLoading ? "Отправка..." : button.dataset.defaultText;
}

async function sendJson(url, data) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(payload.detail || "Ошибка при отправке формы");
    }

    return payload;
}

function getDataLayer() {
    window.dataLayer = window.dataLayer || [];
    return window.dataLayer;
}

function getPageType() {
    if (window.location.pathname.startsWith("/appointment")) {
        return "appointment";
    }

    return "main";
}

function pushTrackingEvent(goal, params = {}) {
    getDataLayer().push({
        event: goal,
        metrika: {
            goal,
            page: getPageType(),
            ...params,
        },
    });
}

function trackGoal(goal, params = {}) {
    pushTrackingEvent(goal, params);

    if (typeof window.ym === "function") {
        window.ym(METRIKA_COUNTER_ID, "reachGoal", goal, params);
    }
}

function trackFormSubmission(formType, payload = {}) {
    const product = {
        id: payload.service ? `lead_${formType}_${payload.service}` : `lead_${formType}`,
        name: payload.service ? `Заявка: ${SERVICE_NAMES[payload.service] || payload.service}` : "Заявка на обратный звонок",
        category: "Lead Form",
        brand: "LuxAutoSpa",
        quantity: 1,
    };

    const variant = [payload.date, payload.time].filter(Boolean).join(" ");
    if (variant) {
        product.variant = variant;
    }

    getDataLayer().push({
        ecommerce: {
            currencyCode: METRICS_CURRENCY,
            add: {
                products: [product],
            },
        },
    });
}

function trackServiceClickPurchase(serviceName) {
    if (!serviceName) return;

    getDataLayer().push({
        ecommerce: {
            currencyCode: METRICS_CURRENCY,
            purchase: {
                actionField: {
                    id: `service-click-${Date.now()}`,
                    revenue: 1,
                },
                products: [
                    {
                        id: `service_${serviceName.toLowerCase().replace(/\s+/g, "_")}`,
                        name: serviceName,
                        category: "Service Click",
                        brand: "LuxAutoSpa",
                        price: 1,
                        quantity: 1,
                        list: "Services",
                    },
                ],
            },
        },
    });
}

function getTrackingSource(element) {
    if (!element) return "unknown";
    if (element.classList.contains("header-phone")) return "header_phone";
    if (element.classList.contains("whatsapp-btn")) return "header_whatsapp";
    if (element.classList.contains("fab-call")) return "fab_call";
    if (element.classList.contains("service-order")) return "service_card";
    if (element.closest(".fab-options")) return "fab_menu";
    if (element.closest(".quick-actions")) return "quick_actions";
    if (element.closest("#callbackForm")) return "callback_form";
    if (element.closest("#appointmentForm")) return "appointment_form";
    if (element.closest(".footer-links")) return "footer";
    return "page";
}

function initGlobalClickTracking() {
    document.addEventListener("click", (event) => {
        const link = event.target.closest("a");
        if (!link) return;

        const href = link.getAttribute("href") || "";
        const source = getTrackingSource(link);

        if (href.startsWith("tel:")) {
            trackGoal("contact_phone_click", { source, page: getPageType() });
            return;
        }

        if (href.includes("wa.me")) {
            const serviceName = link.closest(".service-card")?.querySelector("h3")?.textContent?.trim();
            if (link.classList.contains("service-order") && serviceName) {
                trackServiceClickPurchase(serviceName);
            }
            trackGoal("contact_whatsapp_click", {
                source,
                page: getPageType(),
                ...(serviceName ? { service_name: serviceName } : {}),
            });
            return;
        }

        if (href.includes("t.me")) {
            trackGoal("contact_telegram_click", { source, page: getPageType() });
            return;
        }

        if (href.includes("yandex.ru/maps")) {
            trackGoal("contact_map_click", { source, page: getPageType() });
            return;
        }

        if (href.startsWith("#")) {
            trackGoal("section_navigation_click", {
                source,
                page: getPageType(),
                target_section: href.replace(/^#/, "") || "top",
            });
        }
    });
}

function initAppointmentFieldTracking() {
    const form = document.getElementById("appointmentForm");
    if (!form) return;

    let started = false;
    form.addEventListener("focusin", () => {
        if (started) return;
        started = true;
        trackGoal("appointment_form_start", { page: getPageType() });
    });

    const serviceField = form.querySelector("[name='service']");
    serviceField?.addEventListener("change", () => {
        const service = serviceField.value;
        if (!service) return;

        trackGoal("appointment_service_select", {
            page: getPageType(),
            service,
            service_name: SERVICE_NAMES[service] || service,
        });
    });

    const dateField = form.querySelector("[name='date']");
    dateField?.addEventListener("change", () => {
        if (!dateField.value) return;

        trackGoal("appointment_date_select", {
            page: getPageType(),
            selected_date: dateField.value,
        });
    });

    form.addEventListener("change", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLSelectElement) || target.name !== "time" || !target.value) {
            return;
        }

        trackGoal("appointment_time_select", {
            page: getPageType(),
            selected_time: target.value,
        });
    });
}

function initCallbackFieldTracking() {
    const form = document.getElementById("callbackForm");
    if (!form) return;

    let started = false;
    form.addEventListener("focusin", () => {
        if (started) return;
        started = true;
        trackGoal("callback_form_start", { page: getPageType() });
    });
}

function ensureTimeSelect() {
    const form = document.getElementById("appointmentForm");
    if (!form || document.getElementById("time")) {
        return document.getElementById("time");
    }

    const wrapper = document.createElement("div");
    wrapper.className = "form-row";
    wrapper.innerHTML = `
        <label for="time"><i class="fas fa-clock"></i> Желаемое время</label>
        <select id="time" name="time" class="form-select" required>
            <option value="" selected disabled>Сначала выберите дату</option>
        </select>
    `;

    const dateRow = document.getElementById("date")?.closest(".form-row");
    if (dateRow) {
        dateRow.insertAdjacentElement("afterend", wrapper);
    } else {
        form.appendChild(wrapper);
    }

    return document.getElementById("time");
}

async function loadAvailableSlots(dateValue) {
    const timeSelect = ensureTimeSelect();
    if (!timeSelect) return;

    timeSelect.innerHTML = `<option value="" selected disabled>Загрузка...</option>`;

    if (!dateValue) {
        timeSelect.innerHTML = `<option value="" selected disabled>Сначала выберите дату</option>`;
        return;
    }

    const response = await fetch(`${API_BASE_URL}/appointments/available-slots?date=${dateValue}`);
    const payload = await response.json();

    if (!response.ok) {
        timeSelect.innerHTML = `<option value="" selected disabled>Не удалось загрузить время</option>`;
        return;
    }

    if (!payload.available_slots.length) {
        timeSelect.innerHTML = `<option value="" selected disabled>На эту дату всё занято</option>`;
        return;
    }

    const options = payload.available_slots
        .map((slot) => `<option value="${slot}">${slot}</option>`)
        .join("");

    timeSelect.innerHTML = `<option value="" selected disabled>Выберите время</option>${options}`;
}

function initCallbackForm() {
    const form = document.getElementById("callbackForm");
    if (!form) return;

    const button = form.querySelector("button[type='submit']");
    const inputs = form.querySelectorAll("input");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        const [nameInput, phoneInput] = inputs;
        const data = {
            name: nameInput?.value?.trim(),
            phone: phoneInput?.value?.trim(),
        };

        try {
            setButtonLoading(button, true, "Отправить");
            await sendJson(`${API_BASE_URL}/callbacks`, data);
            trackGoal("callback_form_submit", { page: getPageType() });
            trackFormSubmission("callback");
            form.reset();
            alert("Заявка отправлена. Мы свяжемся с вами.");
        } catch (error) {
            trackGoal("callback_form_error", { page: getPageType() });
            alert(error.message);
        } finally {
            setButtonLoading(button, false, "Отправить");
        }
    }, true);
}

function initAppointmentForm() {
    const form = document.getElementById("appointmentForm");
    if (!form) return;

    const dateInput = document.getElementById("date");
    const timeSelect = ensureTimeSelect();
    const button = document.getElementById("submitBtn");
    const successMessage = document.getElementById("successMessage");

    dateInput?.addEventListener("change", () => loadAvailableSlots(dateInput.value));

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        const formData = new FormData(form);
        const data = {
            name: formData.get("name")?.toString().trim(),
            phone: formData.get("phone")?.toString().trim(),
            car: formData.get("car")?.toString().trim() || null,
            service: formData.get("service")?.toString().trim(),
            date: formData.get("date")?.toString(),
            time: timeSelect?.value,
            comment: formData.get("comment")?.toString().trim() || null,
        };

        try {
            setButtonLoading(button, true, "Отправить заявку");
            await sendJson(`${API_BASE_URL}/appointments`, data);
            trackGoal("appointment_form_submit", {
                page: getPageType(),
                service: data.service || "unknown",
                ...(data.date ? { selected_date: data.date } : {}),
                ...(data.time ? { selected_time: data.time } : {}),
            });
            trackFormSubmission("appointment", data);
            successMessage.style.display = "block";
            form.reset();
            if (timeSelect) {
                timeSelect.innerHTML = `<option value="" selected disabled>Сначала выберите дату</option>`;
            }
        } catch (error) {
            trackGoal("appointment_form_error", {
                page: getPageType(),
                service: data.service || "unknown",
            });
            alert(error.message);
            if (dateInput?.value) {
                await loadAvailableSlots(dateInput.value);
            }
        } finally {
            setButtonLoading(button, false, "Отправить заявку");
        }
    }, true);
}

document.addEventListener("DOMContentLoaded", () => {
    initGlobalClickTracking();
    initCallbackFieldTracking();
    initCallbackForm();
    initAppointmentFieldTracking();
    initAppointmentForm();
});
