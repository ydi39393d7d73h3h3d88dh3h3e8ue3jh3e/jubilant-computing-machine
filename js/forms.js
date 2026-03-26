const API_BASE_URL = "/api";

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

        const [nameInput, phoneInput] = inputs;
        const data = {
            name: nameInput?.value?.trim(),
            phone: phoneInput?.value?.trim(),
        };

        try {
            setButtonLoading(button, true, "Отправить");
            await sendJson(`${API_BASE_URL}/callbacks`, data);
            form.reset();
            alert("Заявка отправлена. Мы свяжемся с вами.");
        } catch (error) {
            alert(error.message);
        } finally {
            setButtonLoading(button, false, "Отправить");
        }
    });
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
            successMessage.style.display = "block";
            form.reset();
            if (timeSelect) {
                timeSelect.innerHTML = `<option value="" selected disabled>Сначала выберите дату</option>`;
            }
        } catch (error) {
            alert(error.message);
            if (dateInput?.value) {
                await loadAvailableSlots(dateInput.value);
            }
        } finally {
            setButtonLoading(button, false, "Отправить заявку");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initCallbackForm();
    initAppointmentForm();
});
