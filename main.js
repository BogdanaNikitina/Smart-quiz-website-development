// Данные опроса
const QUIZ_STEPS = [
    { id: 1, title: "Какое помещение вы планируете оформить?", type: "single", options: ["Квартира", "Частный дом", "Офис", "Коммерческое помещение", "Студия / апартаменты", "Другое"], required: true },
    { id: 2, title: "Какие зоны нужно включить в дизайн-проект?", type: "multiple", options: ["Кухня", "Гостиная", "Спальня", "Детская", "Санузел", "Прихожая", "Кабинет", "Гардеробная", "Балкон / лоджия", "Полностью всё помещение"], required: true },
    { id: 3, title: "Укажите примерную площадь помещения", type: "slider", min: 20, max: 300, step: 5, default: 60, unit: "м²", required: true },
    { id: 4, title: "Какой стиль интерьера вам ближе?", type: "single", options: ["Современный", "Минимализм", "Скандинавский", "Лофт", "Неоклассика", "Классика", "Пока не определился"], required: true },
    { id: 5, title: "Какой бюджет на реализацию интерьера вы рассматриваете?", type: "single", options: ["До 500 000 ₽", "500 000 – 1 000 000 ₽", "1 000 000 – 2 000 000 ₽", "От 2 000 000 ₽", "Пока не знаю"], required: true },
    { id: 6, title: "Оставьте контакты, и мы свяжемся с вами по вашему проекту", type: "form", required: true }
];

let userAnswers = { room_type: null, zones: [], area: 60, style: null, budget: null, name: "", phone: "", email: "", comment: "", consent: false };
let currentStep = 0;
let isSubmitting = false;

const stepsContainer = document.getElementById("stepsContainer");
const progressFill = document.getElementById("progressFill");
const stepCounterSpan = document.getElementById("stepCounter");

function updateProgress() {
    const percent = ((currentStep + 1) / QUIZ_STEPS.length) * 100;
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (stepCounterSpan) stepCounterSpan.innerText = `Шаг ${currentStep + 1} из ${QUIZ_STEPS.length}`;
}

function validateCurrentStep(stepIndex) {
    const step = QUIZ_STEPS[stepIndex];
    if (step.type === "single") {
        let value = stepIndex === 0 ? userAnswers.room_type : (stepIndex === 3 ? userAnswers.style : (stepIndex === 4 ? userAnswers.budget : null));
        if (!value) { alert("Пожалуйста, выберите один из вариантов."); return false; }
        return true;
    } else if (step.type === "multiple") {
        if (!userAnswers.zones.length) { alert("Выберите хотя бы одну зону."); return false; }
        return true;
    } else if (step.type === "slider") {
        if (!userAnswers.area) { alert("Укажите площадь."); return false; }
        return true;
    } else if (step.type === "form") {
        if (!userAnswers.phone.trim()) { alert("Введите номер телефона."); return false; }
        if (userAnswers.phone.replace(/\D/g, '').length < 10) { alert("Введите корректный номер телефона."); return false; }
        if (!userAnswers.consent) { alert("Необходимо согласие на обработку данных."); return false; }
        return true;
    }
    return true;
}

function syncCurrentStepToAnswers() {
    const step = QUIZ_STEPS[currentStep];
    if (step.type === "single") {
        const selected = document.querySelector(`input[name="step_${step.id}"]:checked`);
        if (selected) {
            if (step.id === 1) userAnswers.room_type = selected.value;
            if (step.id === 4) userAnswers.style = selected.value;
            if (step.id === 5) userAnswers.budget = selected.value;
        }
    } else if (step.type === "multiple") {
        const checks = document.querySelectorAll(`input[name="step_${step.id}"]:checked`);
        userAnswers.zones = Array.from(checks).map(cb => cb.value);
    } else if (step.type === "slider") {
        const slider = document.getElementById(`slider_step_3`);
        if (slider) userAnswers.area = parseInt(slider.value, 10);
    } else if (step.type === "form") {
        userAnswers.name = document.getElementById("form_name")?.value || "";
        userAnswers.phone = document.getElementById("form_phone")?.value || "";
        userAnswers.email = document.getElementById("form_email")?.value || "";
        userAnswers.comment = document.getElementById("form_comment")?.value || "";
        userAnswers.consent = document.getElementById("form_consent")?.checked || false;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

function renderStep() {
    if (!stepsContainer) return;
    const step = QUIZ_STEPS[currentStep];
    let html = `<div class="quiz-step"><div class="question-title">${escapeHtml(step.title)}</div>`;
    
    if (step.type === "single") {
        let curr = step.id === 1 ? userAnswers.room_type : (step.id === 4 ? userAnswers.style : userAnswers.budget);
        html += `<div class="options-group">`;
        step.options.forEach(opt => {
            html += `<div class="option-card"><input type="radio" name="step_${step.id}" value="${escapeHtml(opt)}" ${curr === opt ? 'checked' : ''}><label>${escapeHtml(opt)}</label></div>`;
        });
        html += `</div>`;
    } else if (step.type === "multiple") {
        html += `<div class="options-group">`;
        step.options.forEach(opt => {
            html += `<div class="option-card"><input type="checkbox" name="step_${step.id}" value="${escapeHtml(opt)}" ${userAnswers.zones.includes(opt) ? 'checked' : ''}><label>${escapeHtml(opt)}</label></div>`;
        });
        html += `</div>`;
    } else if (step.type === "slider") {
        html += `<div class="slider-container"><div class="slider-value" id="sliderValueDisplay">${userAnswers.area} ${step.unit}</div><input type="range" id="slider_step_3" min="${step.min}" max="${step.max}" step="${step.step}" value="${userAnswers.area}"><div class="range-labels"><span>${step.min} ${step.unit}</span><span>${step.max} ${step.unit}</span></div></div>`;
    } else if (step.type === "form") {
        html += `<div class="form-group"><label>Имя</label><input type="text" id="form_name" value="${escapeHtml(userAnswers.name)}" placeholder="Как к вам обращаться?"></div>
                 <div class="form-group"><label>Телефон *</label><input type="tel" id="form_phone" value="${escapeHtml(userAnswers.phone)}" placeholder="+7 (___) ___-__-__"></div>
                 <div class="form-group"><label>E-mail</label><input type="email" id="form_email" value="${escapeHtml(userAnswers.email)}" placeholder="example@mail.ru"></div>
                 <div class="form-group"><label>Комментарий</label><textarea id="form_comment" rows="3" placeholder="Дополнительные пожелания...">${escapeHtml(userAnswers.comment)}</textarea></div>
                 <div class="checkbox-field"><input type="checkbox" id="form_consent" ${userAnswers.consent ? 'checked' : ''}><label>Я соглашаюсь на обработку персональных данных</label></div>`;
    }
    
    html += `<div class="nav-buttons">${currentStep > 0 ? '<button type="button" class="btn-secondary-quiz" id="prevBtn">← Назад</button>' : '<div></div>'}<button type="button" id="nextBtn">${currentStep === QUIZ_STEPS.length - 1 ? 'Отправить заявку' : 'Далее →'}</button></div></div>`;
    stepsContainer.innerHTML = html;

    document.querySelectorAll('.option-card').forEach(card => {
        let inp = card.querySelector('input');
        if (inp) inp.addEventListener('change', () => syncCurrentStepToAnswers());
        card.addEventListener('click', (e) => { if (e.target.tagName !== 'INPUT') inp.click(); });
    });
    
    if (step.type === "slider") {
        let slider = document.getElementById("slider_step_3");
        let disp = document.getElementById("sliderValueDisplay");
        slider.addEventListener('input', () => { userAnswers.area = parseInt(slider.value, 10); disp.innerText = `${userAnswers.area} м²`; syncCurrentStepToAnswers(); });
    }
    
    if (step.type === "form") {
        ['form_name', 'form_phone', 'form_email', 'form_comment'].forEach(id => {
            let el = document.getElementById(id);
            if (el) el.addEventListener('input', () => syncCurrentStepToAnswers());
        });
        document.getElementById('form_consent')?.addEventListener('change', () => syncCurrentStepToAnswers());
    }
    
    document.getElementById("nextBtn")?.addEventListener("click", async () => {
        syncCurrentStepToAnswers();
        if (!validateCurrentStep(currentStep)) return;
        if (currentStep === QUIZ_STEPS.length - 1) await submitFinalForm();
        else { currentStep++; updateProgress(); renderStep(); }
    });
    
    document.getElementById("prevBtn")?.addEventListener("click", () => {
        syncCurrentStepToAnswers();
        if (currentStep > 0) { currentStep--; updateProgress(); renderStep(); }
    });
}

async function submitFinalForm() {
    if (isSubmitting) return;
    isSubmitting = true;
    const btn = document.getElementById("nextBtn");
    if (btn) { btn.disabled = true; btn.innerHTML = 'Отправка...'; }

    const payload = {
        room_type: userAnswers.room_type || "",
        zones: userAnswers.zones,
        area: userAnswers.area,
        style: userAnswers.style || "",
        budget: userAnswers.budget || "",
        name: userAnswers.name || "",
        phone: userAnswers.phone || "",
        email: userAnswers.email || "",
        comment: userAnswers.comment || "",
        page_url: window.location.href,
        utm_source: new URLSearchParams(location.search).get('utm_source') || "",
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch('save_quiz.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.success) {
            showSuccessScreen(payload);
        } else {
            throw new Error(result.message || 'Ошибка сервера');
        }
    } catch (error) {
        console.error(error);
        alert("Не удалось отправить заявку. Проверьте подключение к серверу.");
        if (btn) { btn.disabled = false; btn.innerHTML = 'Отправить заявку'; }
        isSubmitting = false;
    }
}

function showSuccessScreen(data) {
    if (!stepsContainer) return;
    const zonesText = data.zones && data.zones.length ? data.zones.join(', ') : '—';
    stepsContainer.innerHTML = `
        <div class="success-message">
            <h2>Спасибо!</h2>
            <p>Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.</p>
            <div class="data-card">
                <strong>Проверьте данные:</strong><br><br>
                <p><strong>Тип помещения:</strong> ${escapeHtml(data.room_type)}</p>
                <p><strong>Зоны:</strong> ${escapeHtml(zonesText)}</p>
                <p><strong>Площадь:</strong> ${data.area} м²</p>
                <p><strong>Стиль:</strong> ${escapeHtml(data.style)}</p>
                <p><strong>Бюджет:</strong> ${escapeHtml(data.budget)}</p>
                <hr>
                <p><strong>Имя:</strong> ${escapeHtml(data.name || '—')}</p>
                <p><strong>Телефон:</strong> ${escapeHtml(data.phone)}</p>
                <p><strong>E-mail:</strong> ${escapeHtml(data.email || '—')}</p>
                <p><strong>Комментарий:</strong> ${escapeHtml(data.comment || '—')}</p>
            </div>
            <button class="reset-btn" id="resetQuizBtn">Пройти квиз заново</button>
        </div>
    `;
    document.getElementById("resetQuizBtn")?.addEventListener("click", () => resetQuiz());
}

function resetQuiz() {
    userAnswers = { room_type: null, zones: [], area: 60, style: null, budget: null, name: "", phone: "", email: "", comment: "", consent: false };
    currentStep = 0;
    isSubmitting = false;
    updateProgress();
    renderStep();
}

function initQuiz() {
    if (stepsContainer) {
        updateProgress();
        renderStep();
    }
}

// Навигация
const homePage = document.getElementById('home-page');
const aboutPage = document.getElementById('about-page');
const quizPage = document.getElementById('quiz-page');
const navItems = document.querySelectorAll('.nav-item');
const footerNavLinks = document.querySelectorAll('.footer-nav-link');

function showPage(pageId) {
    homePage.classList.remove('active-section');
    aboutPage.classList.remove('active-section');
    quizPage.classList.remove('active-section');
    if (pageId === 'home') homePage.classList.add('active-section');
    else if (pageId === 'about') aboutPage.classList.add('active-section');
    else if (pageId === 'quiz') { quizPage.classList.add('active-section'); setTimeout(initQuiz, 50); }
    navItems.forEach(i => { if (i.getAttribute('data-page') === pageId) i.classList.add('active'); else i.classList.remove('active'); });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

navItems.forEach(i => i.addEventListener('click', (e) => {
    const p = i.getAttribute('data-page');
    e.preventDefault();
    if (p === 'home' || p === 'about' || p === 'quiz') showPage(p);
}));

footerNavLinks.forEach(l => l.addEventListener('click', (e) => {
    const p = l.getAttribute('data-page');
    e.preventDefault();
    if (p === 'home' || p === 'about' || p === 'quiz') showPage(p);
}));

document.getElementById('mainStartBtn')?.addEventListener('click', () => showPage('quiz'));
document.getElementById('startQuizBtn2')?.addEventListener('click', () => showPage('quiz'));

showPage('home');