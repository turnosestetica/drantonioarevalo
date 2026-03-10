let availabilityDataLoaded = false;

function detectClientConfig() {
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1).replace('.html', '');

    console.log('Nombre de archivo detectado:', filename);

    if (CLIENTS_CONFIG && CLIENTS_CONFIG[filename]) {
        console.log('Configuración de cliente encontrada para:', filename);
        return CLIENTS_CONFIG[filename];
    }

    if (CLIENTS_CONFIG) {
        const firstClient = Object.keys(CLIENTS_CONFIG)[0];
        console.log('Usando configuración de cliente por defecto:', firstClient);
        return CLIENTS_CONFIG[firstClient];
    }

    console.error('No se encontró ninguna configuración de cliente');
    return {};
}

const CONFIG = detectClientConfig();

console.log('Configuración detectada:', CONFIG);
console.log('Configuración completa:', CLIENTS_CONFIG);

if (CONFIG && CONFIG.colors) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', CONFIG.colors.primary);
    root.style.setProperty('--secondary-color', CONFIG.colors.secondary);
    root.style.setProperty('--accent-color', CONFIG.colors.accent);
    root.style.setProperty('--text-color', CONFIG.colors.text);
    root.style.setProperty('--highlight-color', CONFIG.colors.highlight);
}

window.answers = {};

window.questions = CONFIG && CONFIG.questions ? CONFIG.questions : [
    {
        question: "¿Puedes asistir a nuestra clínica en Amado Nervo 615-INT 6, Col del Valle, San Luis Potosí?",
        options: ["Sí, puedo asistir", "No, me queda muy lejos"],
        key: "location"
    },
    {
        question: "¿Tienes dientes chuecos o desalineados que quieras corregir?",
        options: ["Sí, bastante notables", "Sí, pero son leves", "No, mis dientes están bien alineados", "No estoy seguro"],
        key: "alignment"
    },
    {
        question: "¿Tienes problemas de mordida (sobremordida, submordida o mordida cruzada)?",
        options: ["Sí, tengo problemas al masticar", "Sí, pero no me causa molestias", "No tengo problemas de mordida", "No estoy seguro"],
        key: "bite"
    },
    {
        question: "¿Qué tipo de tratamiento de ortodoncia prefieres?",
        options: ["Brackets metálicos (más económicos)", "Brackets estéticos (menos visibles)", "Alineadores transparentes (removibles)", "No tengo preferencia, necesito asesoría"],
        key: "treatment_type"
    },
    {
        question: "¿Cuál es tu principal motivación para buscar tratamiento de ortodoncia?",
        options: ["Mejorar mi sonrisa y estética", "Corregir problemas funcionales al masticar", "Prevenir problemas dentales futuros", "Recomendación de otro dentista"],
        key: "motivation"
    }
];

window.goBackToForm = function () {
    console.log('goBackToForm called');

    const formStep1 = document.getElementById('form-step-1');
    const formStep2 = document.getElementById('form-step-2');

    if (!formStep1 || !formStep2) {
        console.error('No se encontraron los pasos del formulario:', { formStep1, formStep2 });
        return;
    }

    formStep2.style.display = 'none';
    formStep1.style.display = 'flex';

    console.log('Volviendo al paso 1 del formulario');
}

window.submitForm = function () {
    console.log('submitForm called');
    console.log('submitForm() called');

    const confirmButton = document.getElementById('confirm-button');
    if (confirmButton) {
        confirmButton.disabled = true;
        confirmButton.innerHTML = 'Enviando...';
    }

    const submissionStatus = document.getElementById('submission-status');
    if (submissionStatus) {
        submissionStatus.style.display = 'block';
    }

    const fullname = document.getElementById('fullname').value;
    const whatsapp = document.getElementById('whatsapp').value;
    const preferredDate = document.getElementById('preferred-date').value;
    const preferredTime = document.getElementById('preferred-time').value;

    const dateOption = document.querySelector(`#preferred-date option[value="${preferredDate}"]`);
    const formattedDate = dateOption ? dateOption.textContent : preferredDate;

    let message = '';
    if (CONFIG && CONFIG.landingPage && CONFIG.landingPage.whatsappMessage) {
        const tmpl = CONFIG.landingPage.whatsappMessage;
        message += tmpl.greeting.replace('{nombre}', fullname) + '\n\n';
        message += tmpl.contactInfo.replace('{nombre}', fullname).replace('{whatsapp}', whatsapp) + '\n\n';
        message += tmpl.appointmentInfo.replace('{fecha}', formattedDate).replace('{hora}', preferredTime) + '\n\n';
        if (tmpl.depositInfo) {
            message += tmpl.depositInfo + '\n\n';
        }
        message += `*RESPUESTAS DEL CUESTIONARIO*\n`;
    } else {
        message = `Hola, soy ${fullname} y me interesa agendar una consulta.\n\n`;
        message += `*DATOS DE CONTACTO*\n`;
        message += `- Nombre: ${fullname}\n`;
        message += `- WhatsApp: ${whatsapp}\n\n`;
        message += `*CITA SOLICITADA*\n`;
        message += `- Fecha: ${formattedDate}\n`;
        message += `- Hora: ${preferredTime}\n\n`;
        message += `*ENTIENDO QUE:*\n`;
        message += `- Se requiere un pago anticipado para confirmar mi cita\n\n`;
        message += `*RESPUESTAS DEL CUESTIONARIO*\n`;
    }

    if (questions && questions.length > 0) {
        questions.forEach(question => {
            if (answers[question.key]) {
                message += `- ${question.question.replace(/\?/g, '')}? ${answers[question.key].value}\n`;
            }
        });
    }

    const encodedMessage = encodeURIComponent(message);

    let respuestasFormateadas = '';

    console.log('Preguntas disponibles:', window.questions);
    console.log('Respuestas disponibles:', window.answers);

    const summaryAnswers = document.getElementById('summary-answers');
    if (summaryAnswers) {
        summaryAnswers.innerHTML = '';
        summaryAnswers.parentElement.classList.remove('hidden');
    }

    if (window.questions && window.questions.length > 0) {
        window.questions.forEach(question => {
            if (window.answers[question.key]) {
                respuestasFormateadas += `${question.question}: ${window.answers[question.key].value}\n`;
                console.log(`Añadiendo respuesta: ${question.question}: ${window.answers[question.key].value}`);

                if (summaryAnswers) {
                    const answerItem = document.createElement('div');
                    answerItem.classList.add('info-row');
                    answerItem.innerHTML = `
                        <div class="info-label">${question.question}:</div>
                        <div class="info-value">${window.answers[question.key].value}</div>
                    `;
                    summaryAnswers.appendChild(answerItem);
                }
            }
        });
    }

    console.log('Respuestas formateadas:', respuestasFormateadas);

    const formData = {
        fullname: fullname,
        whatsapp: whatsapp,
        tratamiento_interes: window.answers && window.answers.procedure ? window.answers.procedure.value : 'Consulta de Evaluación',
        fecha_cita: `${formattedDate} ${preferredTime}`,
        respuestas: respuestasFormateadas,
        landingUrl: window.location.href,
        estado: "NUEVO"
    };

    if (!respuestasFormateadas || respuestasFormateadas.trim() === '') {
        formData.respuestas = 'No se registraron respuestas al cuestionario.';
    }

    console.log('Campo respuestas:', formData.respuestas);
    console.log('Enviando datos al webhook:', formData);

    const params = new URLSearchParams();
    for (const key in formData) {
        params.append(key, formData[key]);
    }

    console.log('Parámetros enviados:', params.toString());

    if (typeof fbq !== 'undefined') {
        const pasoNum = window.questions.length + 4;
        const eventName = `Paso${pasoNum}_EnvioFormulario`;

        console.log(`Tracking: ${eventName}`);
        fbq('trackCustom', eventName, {
            event_category: 'Form',
            event_label: 'Envío del formulario',
            fullname: formData.fullname,
            whatsapp: formData.whatsapp,
            fecha_cita: formData.fecha_cita
        });

        console.log('Disparando evento CitaFiltro en Facebook Pixel');
        fbq('trackCustom', 'CitaFiltro', {
            fullname: formData.fullname,
            whatsapp: formData.whatsapp,
            fecha_cita: formData.fecha_cita
        });

        fbq('track', 'Lead', {
            content_name: 'Formulario de cita para cirugía plástica',
            content_category: 'Cirugía Plástica',
            value: 1,
            currency: 'ARS'
        });
    } else {
        console.warn('Facebook Pixel no está disponible');
    }

    const webhookData = {
        fullname: formData.fullname,
        whatsapp: formData.whatsapp,
        tratamiento_interes: formData.tratamiento_interes || 'Cirugía plástica',
        fecha_cita: formData.fecha_cita,
        fecha: formData.fecha || '',
        hora: formData.hora || '',
        landingUrl: window.location.href,
        respuestas: formData.respuestas || '',
        respuestas_detalladas: formData.respuestas_detalladas || {},
        videollamada_previa: formData.videollamada_previa || 'No',
        peso: formData.peso || '',
        altura: formData.altura || '',
        duda_principal: formData.duda_principal || '',
        estado: "NUEVO",
        origen: `Landing ${CONFIG && CONFIG.clinic ? CONFIG.clinic.name : 'Web'}`
    };

    const submissionUrl = (CONFIG && CONFIG.webhooks && CONFIG.webhooks.formSubmission) ? CONFIG.webhooks.formSubmission : 'https://sswebhookss.odontolab.co/webhook/1128bc3f-6675-4180-97f0-bc0adcdce76a';
    fetch(submissionUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
    })
        .then(response => {
            console.log("Respuesta del servidor:", response);

            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.text();
        })
        .then(() => {
            if (CONFIG && CONFIG.webhooks && CONFIG.webhooks.paymentLink) {
                console.log("Solicitando link de pago...");
                const paymentPayload = {
                    nombre: formData.fullname,
                    telefono: formData.whatsapp
                };
                return fetch(CONFIG.webhooks.paymentLink, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(paymentPayload)
                }).then(res => res.redirected ? res.url : res.text());
            }
            return Promise.resolve(null);
        })
        .then(paymentLinkData => {
            console.log("Datos de pago recibidos:", paymentLinkData);

            const successMessage = document.getElementById('success-message');
            const errorMessage = document.getElementById('error-message');

            if (successMessage) successMessage.style.display = 'flex';
            if (errorMessage) errorMessage.style.display = 'none';

            let redirectUrl = `https://wa.me/${CONFIG && CONFIG.clinic && CONFIG.clinic.whatsapp ? CONFIG.clinic.whatsapp : '5493812093646'}?text=${encodedMessage}`;

            if (paymentLinkData) {
                try {
                    const parsed = JSON.parse(paymentLinkData);
                    if (typeof parsed === 'string' && parsed.startsWith('http')) {
                        redirectUrl = parsed;
                    } else if (parsed && parsed.url) {
                        redirectUrl = parsed.url;
                    } else if (Array.isArray(parsed) && parsed[0] && parsed[0].url) {
                        redirectUrl = parsed[0].url;
                    } else if (typeof paymentLinkData === 'string' && paymentLinkData.startsWith('http')) {
                        redirectUrl = paymentLinkData;
                    }
                } catch (e) {
                    if (typeof paymentLinkData === 'string' && paymentLinkData.startsWith('http')) {
                        redirectUrl = paymentLinkData;
                    }
                }
            }

            setTimeout(function () {
                window.location.href = redirectUrl;
            }, 2000);
        })
        .catch(error => {
            console.error('Error al enviar los datos:', error);

            const errorMessage = document.getElementById('error-message');
            const successMessage = document.getElementById('success-message');

            if (errorMessage) errorMessage.style.display = 'flex';
            if (successMessage) successMessage.style.display = 'none';

            confirmButton.disabled = false;
            confirmButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ffffff"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.72.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/></svg> Confirmar y contactar por WhatsApp';

            setTimeout(function () {
                window.open(`https://wa.me/+${CONFIG && CONFIG.clinic ? CONFIG.clinic.whatsapp : '5493812093646'}?text=${encodedMessage}`, '_blank');
            }, 3000);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    if (CONFIG && CONFIG.clinic && CONFIG.clinic.name) {
        document.title = `${CONFIG.clinic.name} - Evaluación de Tratamiento`;
    }

    if (CONFIG && CONFIG.landingPage) {
        const mainTitle = document.querySelector('.landing-content .compact-title');
        if (mainTitle && CONFIG.landingPage.mainTitle) {
            mainTitle.textContent = CONFIG.landingPage.mainTitle;
        }

        const subtitle = document.querySelector('.landing-content .simple-intro');
        if (subtitle && CONFIG.landingPage.subtitle) {
            subtitle.textContent = CONFIG.landingPage.subtitle;
        }

        const startButton = document.getElementById('start-quiz');
        if (startButton && CONFIG.landingPage.startButtonText) {
            startButton.textContent = CONFIG.landingPage.startButtonText;
        }

        if (CONFIG.treatments && CONFIG.treatments.length > 0) {
            const valoracionTreatment = CONFIG.treatments.find(t => t.name.toLowerCase().includes('valoración') || t.name.toLowerCase().includes('valoracion'));
            if (valoracionTreatment) {
                const valoracionPrice = document.querySelector('.valoracion-row .price-value');
                if (valoracionPrice) {
                    valoracionPrice.textContent = `$${valoracionTreatment.initialPrice}`;
                }

                const anticipoPrice = document.querySelector('.valoracion-detail .price-value');
                if (anticipoPrice && CONFIG.clinic && CONFIG.clinic.depositAmount) {
                    anticipoPrice.textContent = `$${CONFIG.clinic.depositAmount}`;
                }

                const paymentNote = document.querySelector('.payment-note p:first-child strong');
                if (paymentNote && CONFIG.clinic && CONFIG.clinic.depositAmount) {
                    const paymentText = document.querySelector('.payment-note p:first-child');
                    if (paymentText) {
                        paymentText.innerHTML = `Para confirmar tu cita es <strong>obligatorio</strong> realizar un pago anticipado de $${CONFIG.clinic.depositAmount} (50%).`;
                    }

                    const discountText = document.querySelector('.payment-note p:last-child');
                    if (discountText && valoracionTreatment.initialPrice) {
                        discountText.innerHTML = `El 50% restante ($${CONFIG.clinic.depositAmount}) se abona el día de la visita en la clínica.`;
                    }

                    document.querySelectorAll('.price-value, p').forEach(el => {
                        if (el.textContent.includes('$800')) {
                            el.textContent = el.textContent.replace('$800', `$${valoracionTreatment.initialPrice}`);
                        }
                    });
                }

                if (CONFIG.landingPage && CONFIG.landingPage.priceNote) {
                    const priceNote = document.querySelector('.results-container .price-note');
                    if (priceNote) {
                        priceNote.textContent = CONFIG.landingPage.priceNote;
                    }
                }

                if (CONFIG.clinic && CONFIG.clinic.depositAmount) {
                    const paymentReminder = document.querySelector('.payment-reminder p:first-child strong');
                    if (paymentReminder) {
                        const reminderText = document.querySelector('.payment-reminder p:first-child');
                        if (reminderText) {
                            reminderText.innerHTML = `<strong>IMPORTANTE:</strong> Se requiere un depósito de $${CONFIG.clinic.depositAmount} MXN para asegurar tu asistencia y confirmar tu cita de valoración.`;
                        }
                    }
                }
            }
        }
    }

    if (CONFIG && CONFIG.clinic && CONFIG.clinic.address) {
        const locationErrorAddress = document.querySelector('#location-error p:nth-child(3)');
        if (locationErrorAddress) {
            locationErrorAddress.textContent = `Nuestros tratamientos requieren atención presencial en nuestra clínica ubicada en ${CONFIG.clinic.address}.`;
        }
    }

    if (CONFIG && CONFIG.landingPage && CONFIG.landingPage.confirmationText) {
        const saveRedirectText = document.getElementById('save-redirect-text');
        const depositInfoText = document.getElementById('deposit-info-text');

        if (saveRedirectText && CONFIG.landingPage.confirmationText.saveAndRedirect) {
            let saveRedirectContent = CONFIG.landingPage.confirmationText.saveAndRedirect;

            if (CONFIG.clinic && CONFIG.clinic.name) {
                saveRedirectContent = saveRedirectContent.replace(/María Guillén Ortodoncia|Implant Center/g, CONFIG.clinic.name);
            }

            saveRedirectText.innerHTML = saveRedirectContent;
        }

        if (depositInfoText && CONFIG.landingPage.confirmationText.depositInfo) {
            let depositInfoContent = CONFIG.landingPage.confirmationText.depositInfo;

            if (CONFIG.clinic && CONFIG.clinic.depositAmount) {
                depositInfoContent = depositInfoContent.replace(/\$400|\$[0-9]+/g, '$' + CONFIG.clinic.depositAmount);
            }

            depositInfoText.innerHTML = depositInfoContent;
        }
    }

    if (CONFIG && CONFIG.treatments && CONFIG.treatments.length > 0) {
        const priceList = document.querySelector('.price-list');
        if (priceList) {
            priceList.innerHTML = '';

            const selectedProcedure = window.answers.procedure ? window.answers.procedure.value : '';
            console.log('Procedimiento seleccionado:', selectedProcedure);

            const normalizedProcedure = selectedProcedure.trim();

            const showAllTreatments =
                !normalizedProcedure ||
                normalizedProcedure.includes('Otro procedimiento') ||
                normalizedProcedure.includes('no quirúrgicos') ||
                normalizedProcedure.includes('estéticos');

            console.log('Mostrar todos los tratamientos:', showAllTreatments);

            const pricingTitle = document.querySelector('.pricing-info h3');
            if (pricingTitle) {
                pricingTitle.textContent = 'Precio de Referencia';
            }

            CONFIG.treatments.forEach(treatment => {
                if (treatment.name.toLowerCase().includes('valoración') || treatment.name.toLowerCase().includes('valoracion')) {
                    return;
                }

                if (!showAllTreatments) {
                    const treatmentNameLower = treatment.name.toLowerCase().trim();
                    const procedureLower = normalizedProcedure.toLowerCase().trim();

                    console.log(`Comparando: "${treatmentNameLower}" con "${procedureLower}"`);

                    if (procedureLower === "lipoescultura" && treatmentNameLower.includes("lipo")) {
                        console.log(`✅ Caso especial para Lipoescultura: ${treatment.name}`);
                    }
                    else if (treatmentNameLower === procedureLower) {
                        console.log(`✅ Coincidencia exacta: ${treatment.name}`);
                    }
                    else if (treatmentNameLower.startsWith(procedureLower)) {
                        console.log(`✅ El tratamiento comienza con el procedimiento: ${treatment.name}`);
                    }
                    else if (procedureLower.startsWith(treatmentNameLower)) {
                        console.log(`✅ El procedimiento comienza con el tratamiento: ${treatment.name}`);
                    }
                    else {
                        console.log(`❌ Omitiendo tratamiento ${treatment.name} porque no coincide con ${normalizedProcedure}`);
                        return;
                    }
                }
                const treatmentGroup = document.createElement('div');
                treatmentGroup.className = 'treatment-group';

                const mainRow = document.createElement('div');
                mainRow.className = treatment.isOffer ? 'price-row highlight' : 'price-row';

                const nameSpan = document.createElement('span');
                nameSpan.className = 'price-label';
                nameSpan.textContent = treatment.name + ':';

                const priceSpan = document.createElement('span');
                priceSpan.className = 'price-value';

                if (treatment.highlightText) {
                    priceSpan.textContent = treatment.highlightText;
                } else if (treatment.initialPrice) {
                    if (treatment.priceFormat === 'simple') {
                        priceSpan.textContent = treatment.isOffer ?
                            `$${treatment.initialPrice.toLocaleString()} (Oferta!)` :
                            `$${treatment.initialPrice.toLocaleString()}`;
                    } else {
                        priceSpan.textContent = treatment.isOffer ?
                            `Inicio: $${treatment.initialPrice.toLocaleString()} (Oferta!)` :
                            `Inicio: $${treatment.initialPrice.toLocaleString()}`;
                    }
                } else {
                    priceSpan.textContent = treatment.customNote || 'Precio personalizado';
                }

                mainRow.appendChild(nameSpan);
                mainRow.appendChild(priceSpan);
                treatmentGroup.appendChild(mainRow);

                if (treatment.regularPrice) {
                    const regularRow = document.createElement('div');
                    regularRow.className = 'price-row price-detail';

                    const regularLabel = document.createElement('span');
                    regularLabel.className = 'price-label';
                    regularLabel.textContent = 'Precio regular:';

                    const regularValue = document.createElement('span');
                    regularValue.className = 'price-value';
                    regularValue.textContent = `$${treatment.regularPrice.toLocaleString()}`;

                    regularRow.appendChild(regularLabel);
                    regularRow.appendChild(regularValue);
                    treatmentGroup.appendChild(regularRow);
                }

                if (treatment.monthlyFee) {
                    const monthlyRow = document.createElement('div');
                    monthlyRow.className = 'price-row price-detail';

                    const monthlyLabel = document.createElement('span');
                    monthlyLabel.className = 'price-label';
                    monthlyLabel.textContent = 'Mensualidad:';

                    const monthlyValue = document.createElement('span');
                    monthlyValue.className = 'price-value';
                    monthlyValue.textContent = `$${treatment.monthlyFee.toLocaleString()}`;

                    monthlyRow.appendChild(monthlyLabel);
                    monthlyRow.appendChild(monthlyValue);
                    treatmentGroup.appendChild(monthlyRow);
                }

                if (!treatment.initialPrice && treatment.customNote) {
                    const noteRow = document.createElement('div');
                    noteRow.className = 'price-row price-detail';

                    const noteLabel = document.createElement('span');
                    noteLabel.className = 'price-label';
                    noteLabel.textContent = 'Se define tras consulta';

                    const noteValue = document.createElement('span');
                    noteValue.className = 'price-value';
                    noteValue.textContent = '';

                    noteRow.appendChild(noteLabel);
                    noteRow.appendChild(noteValue);
                    treatmentGroup.appendChild(noteRow);
                }

                priceList.appendChild(treatmentGroup);
            });
        }
    }

    const landingContent = document.getElementById('landing-content');
    const quizContainer = document.getElementById('quiz-container');
    const resultsContainer = document.getElementById('results-container');
    const formContainer = document.getElementById('form-container');
    const questionContainer = document.getElementById('question-container');
    const locationError = document.getElementById('location-error');
    const progressBar = document.getElementById('progress');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const startQuizButton = document.getElementById('start-quiz');
    const restartQuizButton = document.getElementById('restart-quiz');
    const appointmentButton = document.getElementById('appointment-button');
    const qualificationResult = document.getElementById('qualification-result');

    let currentQuestionIndex = 0;

    function initQuiz() {
        questions.forEach((question, index) => {
            const questionElement = document.createElement('div');
            questionElement.classList.add('question');
            if (index === 0) questionElement.classList.add('active');

            questionElement.innerHTML = `
                <h3>${question.question}</h3>
                <div class="options">
                    ${question.options.map((option, optionIndex) => `
                        <div class="option" data-index="${optionIndex}">${option}</div>
                    `).join('')}
                </div>
            `;

            questionContainer.appendChild(questionElement);
        });

        document.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', selectOption);
        });

        updateButtons();
        updateProgressBar();

        setupOptionsGrid();
    }

    function selectOption(e) {
        const selectedOption = e.target;
        const questionElement = selectedOption.closest('.question');
        const options = questionElement.querySelectorAll('.option');

        options.forEach(option => option.classList.remove('selected'));

        selectedOption.classList.add('selected');

        const questionIndex = Array.from(questionContainer.children).indexOf(questionElement);
        const optionIndex = parseInt(selectedOption.dataset.index);
        window.answers[questions[questionIndex].key] = {
            value: questions[questionIndex].options[optionIndex],
            index: optionIndex
        };

        console.log('Guardando respuesta:', questions[questionIndex].key, window.answers[questions[questionIndex].key]);

        if ((questions[questionIndex].key === 'location' || questions[questionIndex].key === 'canAttend') && optionIndex === 1) {
            questionContainer.style.display = 'none';
            document.querySelector('.buttons').style.display = 'none';
            locationError.style.display = 'flex';
            return;
        }

        nextButton.disabled = false;

        const validationMsg = questionElement.querySelector('.validation-message');
        if (validationMsg) {
            validationMsg.style.display = 'none';
        }

        options.forEach(option => {
            option.style.boxShadow = '';
        });
    }

    function nextQuestion() {
        if (!window.answers[questions[currentQuestionIndex].key]) {
            const currentQuestion = document.querySelectorAll('.question')[currentQuestionIndex];
            let validationMsg = currentQuestion.querySelector('.validation-message');

            if (!validationMsg) {
                validationMsg = document.createElement('div');
                validationMsg.className = 'validation-message';
                validationMsg.textContent = 'Por favor selecciona una opción para continuar';
                validationMsg.style.color = '#F44336';
                validationMsg.style.marginTop = '1rem';
                validationMsg.style.fontSize = '1rem';
                validationMsg.style.textAlign = 'center';
                validationMsg.style.fontWeight = 'bold';
                validationMsg.style.animation = 'shake 0.5s';
                validationMsg.style.padding = '10px';
                validationMsg.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
                validationMsg.style.borderRadius = '5px';
                validationMsg.style.border = '1px solid #F44336';

                const style = document.createElement('style');
                style.textContent = `
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                        20%, 40%, 60%, 80% { transform: translateX(5px); }
                    }
                `;
                document.head.appendChild(style);

                currentQuestion.appendChild(validationMsg);
            } else {
                validationMsg.style.display = 'block';
                validationMsg.style.animation = 'none';
                void validationMsg.offsetWidth;
                validationMsg.style.animation = 'shake 0.5s';
            }

            const options = currentQuestion.querySelectorAll('.option');
            options.forEach(option => {
                option.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.5)';
                setTimeout(() => {
                    option.style.boxShadow = '';
                }, 1000);
            });

            return;
        }

        if (currentQuestionIndex === questions.length - 1) {
            showResults();
            return;
        }

        if (currentQuestionIndex === 0 && !availabilityDataLoaded) {
            console.log('Primer paso completado. Precargando fechas en segundo plano...');
            loadAvailabilityData(false).then(success => {
                if (success) {
                    availabilityDataLoaded = true;
                    console.log('Precarga de fechas exitosa.');
                }
            }).catch(e => console.log('Error en precarga:', e));
        }

        document.querySelectorAll('.question')[currentQuestionIndex].classList.remove('active');
        currentQuestionIndex++;
        document.querySelectorAll('.question')[currentQuestionIndex].classList.add('active');

        if (typeof fbq !== 'undefined') {
            const currentQuestion = questions[currentQuestionIndex];
            const pasoNum = currentQuestionIndex + 2;
            const eventName = `Paso${pasoNum}_Pregunta${currentQuestionIndex + 1}`;

            console.log(`Tracking: ${eventName} - ${currentQuestion.question}`);
            fbq('trackCustom', eventName, {
                event_category: 'Quiz',
                event_label: `Pregunta ${currentQuestionIndex + 1}`,
                event_value: currentQuestionIndex + 1,
                question: currentQuestion.question
            });
        }

        updateButtons();
        updateProgressBar();

        setTimeout(setupOptionsGrid, 100);
    }

    function prevQuestion() {
        if (currentQuestionIndex === 0) return;

        document.querySelectorAll('.question')[currentQuestionIndex].classList.remove('active');
        currentQuestionIndex--;
        document.querySelectorAll('.question')[currentQuestionIndex].classList.add('active');

        updateButtons();
        updateProgressBar();

        setTimeout(setupOptionsGrid, 100);
    }

    function updateButtons() {
        const buttonsContainer = document.querySelector('.buttons');

        if (currentQuestionIndex === 0) {
            prevButton.style.display = 'none';
            buttonsContainer.classList.remove('two-buttons');
        } else {
            prevButton.style.display = 'block';
            buttonsContainer.classList.add('two-buttons');
        }

        if (currentQuestionIndex === questions.length - 1) {
            nextButton.textContent = 'FINALIZAR →';
        } else {
            nextButton.textContent = 'Continuar →';
        }

        nextButton.disabled = false;
    }

    function updateProgressBar() {
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    function loadPrices() {
        console.log('Cargando precios dinámicamente...');

        if (!CONFIG || !CONFIG.treatments || CONFIG.treatments.length === 0) {
            console.log('No hay tratamientos configurados');
            return;
        }

        const priceGrid = document.getElementById('price-grid');
        if (!priceGrid) {
            console.log('No se encontró el contenedor de precios');
            return;
        }

        priceGrid.innerHTML = '';

        const selectedProcedure = window.answers.procedure ? window.answers.procedure.value : '';
        console.log('Procedimiento seleccionado:', selectedProcedure);

        const normalizedProcedure = selectedProcedure.trim();

        const showAllTreatments =
            !normalizedProcedure ||
            normalizedProcedure.includes('Otro procedimiento') ||
            normalizedProcedure.includes('no quirúrgicos') ||
            normalizedProcedure.includes('estéticos');

        console.log('Mostrar todos los tratamientos:', showAllTreatments);

        const pricingTitle = document.querySelector('.pricing-info h3');
        if (pricingTitle) {
            pricingTitle.textContent = 'Precio de Referencia';
        }

        const evaluationCard = document.createElement('div');
        evaluationCard.className = 'price-card';
        evaluationCard.innerHTML = `
            <div class="price-title">Consulta de Evaluación</div>
            <div class="price-amount">$50.000</div>
            <div class="price-note">Pago anticipado obligatorio de $25.000 para confirmar</div>
        `;
        priceGrid.appendChild(evaluationCard);

        let treatmentsToShow = [];

        if (showAllTreatments) {
            treatmentsToShow = CONFIG.treatments.filter(treatment =>
                !treatment.name.toLowerCase().includes('evaluación') &&
                !treatment.name.toLowerCase().includes('evaluacion') &&
                !treatment.name.toLowerCase().includes('valoración') &&
                !treatment.name.toLowerCase().includes('valoracion'));
        } else {
            const procedureLower = normalizedProcedure.toLowerCase().trim();

            if (procedureLower.includes('lipoescultura') || procedureLower.includes('lipoabdominoplastia') || procedureLower.includes('contorno corporal')) {
                treatmentsToShow = CONFIG.treatments.filter(treatment =>
                    (treatment.name.toLowerCase().includes('lipo') || treatment.name.toLowerCase().includes('contorno')) &&
                    !treatment.name.toLowerCase().includes('evaluación') &&
                    !treatment.name.toLowerCase().includes('evaluacion') &&
                    !treatment.name.toLowerCase().includes('valoración') &&
                    !treatment.name.toLowerCase().includes('valoracion'));
            } else if (procedureLower.includes('rinoplastia') || procedureLower.includes('rinoplastía')) {
                treatmentsToShow = CONFIG.treatments.filter(treatment =>
                    (treatment.name.toLowerCase().includes('rino')) &&
                    !treatment.name.toLowerCase().includes('evaluación') &&
                    !treatment.name.toLowerCase().includes('evaluacion') &&
                    !treatment.name.toLowerCase().includes('valoración') &&
                    !treatment.name.toLowerCase().includes('valoracion'));
            } else {
                treatmentsToShow = CONFIG.treatments.filter(treatment => {
                    const treatmentNameLower = treatment.name.toLowerCase().trim();

                    return (
                        !treatment.name.toLowerCase().includes('evaluación') &&
                        !treatment.name.toLowerCase().includes('evaluacion') &&
                        !treatment.name.toLowerCase().includes('valoración') &&
                        !treatment.name.toLowerCase().includes('valoracion') &&
                        (
                            treatmentNameLower === procedureLower ||
                            treatmentNameLower.includes(procedureLower) ||
                            procedureLower.includes(treatmentNameLower)
                        )
                    );
                });
            }
        }

        console.log('Tratamientos a mostrar:', treatmentsToShow);

        treatmentsToShow.forEach(treatment => {
            const priceCard = document.createElement('div');
            priceCard.className = 'price-card';

            const priceTitle = document.createElement('div');
            priceTitle.className = 'price-title';
            priceTitle.textContent = treatment.name;

            const priceAmount = document.createElement('div');
            priceAmount.className = 'price-amount';

            if (treatment.priceFormat === 'text' && treatment.initialPrice) {
                let textPrice = treatment.initialPrice;
                if (treatment.currency) {
                    textPrice = treatment.currency + " " + textPrice;
                }
                priceAmount.textContent = textPrice;
            } else if (treatment.initialPrice) {
                let formattedPrice = typeof treatment.initialPrice === 'number'
                    ? treatment.initialPrice.toLocaleString()
                    : treatment.initialPrice;

                if (treatment.currency === 'USD') {
                    priceAmount.textContent = `USD ${formattedPrice}`;
                } else {
                    priceAmount.textContent = `$${formattedPrice}`;
                }

                if (treatment.isOffer) {
                    priceAmount.textContent += ' (Oferta!)';
                }
            } else {
                priceAmount.textContent = treatment.customNote || 'Precio personalizado';
            }

            const priceNote = document.createElement('div');
            priceNote.className = 'price-note';
            priceNote.textContent = 'Precio desde';

            priceCard.appendChild(priceTitle);
            priceCard.appendChild(priceAmount);
            priceCard.appendChild(priceNote);

            priceGrid.appendChild(priceCard);
        });
    }

    function setupOptionsGrid() {
        const weightQuestion = Array.from(document.querySelectorAll('.question')).find(q =>
            q.querySelector('h3') && q.querySelector('h3').textContent.toLowerCase().includes('peso'));

        const heightQuestion = Array.from(document.querySelectorAll('.question')).find(q =>
            q.querySelector('h3') && q.querySelector('h3').textContent.toLowerCase().includes('altura'));

        const priceQuestion = Array.from(document.querySelectorAll('.question')).find(q =>
            q.querySelector('h3') && (
                q.querySelector('h3').textContent.toLowerCase().includes('precio') ||
                q.querySelector('h3').textContent.toLowerCase().includes('presupuesto') ||
                q.querySelector('h3').textContent.toLowerCase().includes('invertir')
            ));

        if (weightQuestion) {
            const optionsContainer = weightQuestion.querySelector('.options');
            if (optionsContainer) {
                optionsContainer.classList.add('options-grid');
                console.log('Aplicando grid a opciones de peso');
            }
        }

        if (heightQuestion) {
            const optionsContainer = heightQuestion.querySelector('.options');
            if (optionsContainer) {
                optionsContainer.classList.add('options-grid');
                console.log('Aplicando grid a opciones de altura');
            }
        }

        if (priceQuestion) {
            const optionsContainer = priceQuestion.querySelector('.options');
            if (optionsContainer) {
                optionsContainer.classList.add('options-grid');
                console.log('Aplicando grid a opciones de precio');
            }
        }
    }

    function showResults() {
        quizContainer.style.opacity = '0';

        if (typeof fbq !== 'undefined') {
            const pasoNum = questions.length + 2;
            const eventName = `Paso${pasoNum}_FinCuestionario`;

            console.log(`Tracking: ${eventName}`);
            fbq('trackCustom', eventName, {
                event_category: 'Quiz',
                event_label: 'Finalización del cuestionario',
                total_questions: questions.length,
                total_answers: Object.keys(answers).length
            });
        }

        setTimeout(() => {
            quizContainer.style.display = 'none';

            showResultsAndLoadData();

            loadPrices();

            const qualified = determineQualification();

            if (qualified) {
                if (CONFIG && CONFIG.landingPage && CONFIG.landingPage.priceNote) {
                    qualificationResult.textContent = 'Podrías ser candidato. Para comprobarlo, solicita una cita de evaluación.';
                } else {
                    qualificationResult.textContent = 'Podrías ser candidato. Para comprobarlo, solicita una cita de evaluación.';
                }
                qualificationResult.style.color = 'var(--primary-color)';
                qualificationResult.classList.add('qualified');
            } else {
                qualificationResult.textContent = 'Lamentablemente, no podemos avanzar con tu cita si no puedes visitarnos en nuestra ubicación';
                qualificationResult.style.color = '#e67e22';
            }
        }, 300);
    }

    function showResultsAndLoadData() {
        console.log('%c=== MOSTRANDO RESULTADOS Y PRECARGANDO DATOS ===', 'background: #2ecc71; color: white; padding: 5px; border-radius: 5px;');

        resultsContainer.style.display = 'flex';
        resultsContainer.style.opacity = '1';

        console.log('Precargando datos de disponibilidad en segundo plano...');

        const appointmentBtn = document.getElementById('appointment-button');
        if (appointmentBtn) {
            const originalText = appointmentBtn.textContent || 'Ver disponibilidad';
            appointmentBtn.innerHTML = `${originalText} <span class="preloading-indicator" style="font-size: 8px; margin-left: 5px;">⟳</span>`;

            const style = document.createElement('style');
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .preloading-indicator {
                    display: inline-block;
                    animation: spin 1s linear infinite;
                }
            `;
            document.head.appendChild(style);
        }

        if (!availabilityDataLoaded) {
            loadAvailabilityData(false)
                .then(success => {
                    console.log('Precarga de datos de disponibilidad completada:', success ? 'exitosa' : 'fallida');

                    availabilityDataLoaded = success;

                    if (appointmentBtn) {
                        const preloadingIndicator = appointmentBtn.querySelector('.preloading-indicator');
                        if (preloadingIndicator) {
                            preloadingIndicator.remove();
                        }
                    }
                })
                .catch(error => {
                    console.error('Error en la precarga de datos de disponibilidad:', error);

                    if (appointmentBtn) {
                        const preloadingIndicator = appointmentBtn.querySelector('.preloading-indicator');
                        if (preloadingIndicator) {
                            preloadingIndicator.remove();
                        }
                    }
                });
        } else {
            console.log('Datos de disponibilidad ya precargados.');
            if (appointmentBtn) {
                const preloadingIndicator = appointmentBtn.querySelector('.preloading-indicator');
                if (preloadingIndicator) {
                    preloadingIndicator.remove();
                }
            }
        }
    }

    function determineQualification() {
        const locationKey = answers.location ? 'location' : 'canAttend';
        if (!answers[locationKey] || answers[locationKey].index !== 0) {
            return false;
        }

        if (answers.alignment && answers.alignment.index === 2 &&
            answers.bite && answers.bite.index === 2) {
            return true;
        }

        return true;
    }

    startQuizButton.addEventListener('click', () => {
        landingContent.style.opacity = '0';

        if (typeof fbq !== 'undefined') {
            console.log('Tracking: Paso1_InicioQuiz');
            fbq('trackCustom', 'Paso1_InicioQuiz', {
                event_category: 'Quiz',
                event_label: 'Inicio del cuestionario'
            });
        }

        setTimeout(() => {
            landingContent.style.display = 'none';
            quizContainer.style.display = 'flex';

            setTimeout(() => {
                quizContainer.style.opacity = '1';
                initQuiz();
            }, 50);
        }, 300);
    });

    initQuiz();
    updateButtons();
    updateProgressBar();

    setTimeout(setupOptionsGrid, 500);

    const buttonStatusMessage = document.getElementById('button-status-message');
    if (buttonStatusMessage) {
        buttonStatusMessage.textContent = 'Verifica tu número de WhatsApp para continuar';
        buttonStatusMessage.className = 'button-status-message';
    }

    const confirmButton = document.getElementById('confirm-button');
    if (confirmButton) {
        confirmButton.disabled = true;
    }

    if (typeof fbq !== 'undefined') {
        console.log('Tracking: Paso1_InicioQuiz');
        fbq('trackCustom', 'Paso1_InicioQuiz', {
            event_category: 'Quiz',
            event_label: 'Inicio del cuestionario'
        });
    }

    nextButton.addEventListener('click', nextQuestion);
    prevButton.addEventListener('click', prevQuestion);

    restartQuizButton.addEventListener('click', () => {
        locationError.style.display = 'none';
        questionContainer.style.display = 'block';
        document.querySelector('.buttons').style.display = 'flex';

        Object.keys(answers).forEach(key => delete answers[key]);

        document.querySelectorAll('.question').forEach((question, index) => {
            if (index === 0) {
                question.classList.add('active');
            } else {
                question.classList.remove('active');
            }
        });

        currentQuestionIndex = 0;

        updateButtons();
        updateProgressBar();
    });

    appointmentButton.addEventListener('click', () => {
        resultsContainer.style.opacity = '0';

        if (typeof fbq !== 'undefined') {
            const pasoNum = questions.length + 3;
            const eventName = `Paso${pasoNum}_InicioFormulario`;

            console.log(`Tracking: ${eventName}`);
            fbq('trackCustom', eventName, {
                event_category: 'Form',
                event_label: 'Inicio del formulario de cita',
                qualified: determineQualification()
            });
        }

        appointmentButton.disabled = true;
        appointmentButton.innerHTML = '<span class="loading-spinner"></span> Consultando agenda de la Dra. Bossi...';

        resultsContainer.style.opacity = '0';

        setTimeout(() => {
            resultsContainer.style.display = 'none';

            formContainer.style.display = 'flex';
            formContainer.style.opacity = '1';

            const dateGrid = document.getElementById('date-grid');
            const timeGrid = document.getElementById('time-grid');
            const loadingDates = document.getElementById('loading-dates');
            const loadingTimes = document.getElementById('loading-times');

            if (dateGrid) dateGrid.style.display = 'none';
            if (timeGrid) timeGrid.style.display = 'none';
            if (loadingDates) loadingDates.style.display = 'flex';
            if (loadingTimes) loadingTimes.style.display = 'flex';

            if (!availabilityDataLoaded) {
                loadAvailabilityData(true).then(success => {
                    appointmentButton.disabled = false;
                    appointmentButton.innerHTML = 'Ver disponibilidad';

                    if (!success) {
                        alert('Hubo un problema al cargar las fechas disponibles. Por favor, intenta nuevamente.');
                        formContainer.style.opacity = '0';
                        setTimeout(() => {
                            formContainer.style.display = 'none';
                            resultsContainer.style.display = 'flex';
                            setTimeout(() => {
                                resultsContainer.style.opacity = '1';
                            }, 50);
                        }, 300);
                    } else {
                        availabilityDataLoaded = true;
                        loadAvailableDates();
                    }
                });
            } else {
                console.log('Datos de disponibilidad ya precargados. Mostrando formulario.');
                if (dateGrid) dateGrid.style.display = 'grid';
                if (timeGrid) timeGrid.style.display = 'grid';
                if (loadingDates) loadingDates.style.display = 'none';
                if (loadingTimes) loadingTimes.style.display = 'none';

                appointmentButton.disabled = false;
                appointmentButton.innerHTML = 'Ver disponibilidad';

                loadAvailableDates();
            }
        }, 300);
    });

    let availabilityData = null;
    availabilityDataLoaded = false;

    const availabilityWebhookUrl = CONFIG && CONFIG.webhooks ? CONFIG.webhooks.availability : 'https://sswebhookss.odontolab.co/webhook/f424d581-8261-4141-bcd6-4b021cf61d39';

    async function loadAvailabilityData(showAlerts = false) {
        console.log('%c=== INICIO CARGA DE DISPONIBILIDAD ===', 'background: #3498db; color: white; padding: 5px; border-radius: 5px;');
        console.log('Cargando datos de disponibilidad desde el webhook...');
        try {
            console.log('URL del webhook:', availabilityWebhookUrl);
            console.log('Realizando petición al webhook...');
            const response = await fetch(availabilityWebhookUrl);
            console.log('Respuesta recibida. Status:', response.status);

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            console.log('Parseando respuesta JSON...');
            const responseData = await response.json();
            console.log('%cRespuesta del webhook (raw):', 'color: #2ecc71; font-weight: bold;');
            console.log(responseData);
            console.log('Tipo de datos de la respuesta:', typeof responseData);
            console.log('¿Es un array?', Array.isArray(responseData));

            if (Array.isArray(responseData)) {
                console.log('La respuesta es un array.');
                if (responseData.length > 0) {
                    console.log('Extrayendo datos del array...');

                    if (responseData[0].turnos && Array.isArray(responseData[0].turnos)) {
                        console.log('Formato detectado: array con propiedad turnos');
                        availabilityData = {};
                        responseData[0].turnos.forEach(turno => {
                            if (!availabilityData[turno.fecha]) {
                                availabilityData[turno.fecha] = [];
                            }
                            availabilityData[turno.fecha].push(turno.hora_inicio);
                        });
                    }
                    else if (responseData[0].fecha && Array.isArray(responseData[0].horas)) {
                        console.log('Formato detectado: array de objetos con fecha y horas');
                        availabilityData = {};
                        responseData.forEach(item => {
                            if (item.fecha && Array.isArray(item.horas)) {
                                availabilityData[item.fecha] = item.horas;
                            }
                        });
                    } else {
                        console.log('Usando el primer elemento del array como datos de disponibilidad');
                        availabilityData = responseData[0];
                    }
                } else {
                    console.log('El array está vacío. Creando objeto vacío.');
                    availabilityData = {};
                }
            } else if (typeof responseData === 'object') {
                console.log('La respuesta es un objeto. Verificando formato...');
                if (responseData.turnos && Array.isArray(responseData.turnos)) {
                    console.log('Formato detectado: objeto con propiedad turnos (array)');
                    availabilityData = {};
                    responseData.turnos.forEach(turno => {
                        if (turno.fecha && turno.hora_inicio) {
                            if (!availabilityData[turno.fecha]) {
                                availabilityData[turno.fecha] = [];
                            }
                            availabilityData[turno.fecha].push(turno.hora_inicio);
                        }
                    });
                } else {
                    console.log('La respuesta es un objeto. Usando directamente...');
                    availabilityData = responseData;
                }
            } else {
                console.log('Formato de respuesta no reconocido. Creando objeto vacío.');
                availabilityData = {};
            }

            console.log('%cDatos de disponibilidad procesados:', 'color: #2ecc71; font-weight: bold;');
            console.log(availabilityData);
            console.log('Tipo de datos procesados:', typeof availabilityData);
            console.log('Claves disponibles:', Object.keys(availabilityData));

            loadAvailableDates();

            const timeGrid = document.getElementById('time-grid');
            if (timeGrid) {
                timeGrid.innerHTML = '';
            }

            const timeInput = document.getElementById('preferred-time');
            if (timeInput) {
                timeInput.value = '';
            }

            const timeDisplay = document.getElementById('selected-time-display');
            if (timeDisplay) {
                timeDisplay.textContent = 'Selecciona una hora';
            }

            return true;
        } catch (error) {
            console.error('Error al cargar datos de disponibilidad:', error);
            if (showAlerts) {
                alert('Hubo un problema al cargar las fechas disponibles. Por favor, intenta nuevamente.');
            }
            return false;
            console.log('loadAvailableDates() called');
        }
    }

    function loadAvailableDates() {
        console.log('%c=== CARGANDO FECHAS DISPONIBLES ===', 'background: #e74c3c; color: white; padding: 5px; border-radius: 5px;');
        console.log('loadAvailableDates() called');
        const dateInput = document.getElementById('preferred-date');
        const dateGrid = document.getElementById('date-grid');
        const loadingDates = document.getElementById('loading-dates');
        console.log('Input de fechas encontrado:', dateInput ? 'Sí' : 'No');
        console.log('Grid de fechas encontrado:', dateGrid ? 'Sí' : 'No');

        console.log('Limpiando grid de fechas...');
        dateGrid.innerHTML = '';

        if (!availabilityData) {
            console.error('No hay datos de disponibilidad para cargar fechas');
            return;
        }

        console.log('Datos de disponibilidad para fechas:', availabilityData);
        console.log('Tipo de datos:', typeof availabilityData);

        const availableDates = Object.keys(availabilityData);
        console.log('Fechas disponibles:', availableDates);
        console.log('Número de fechas:', availableDates.length);
        console.log('Fechas disponibles:', availableDates);

        try {
            availableDates.sort((a, b) => {
                try {
                    const dayMatchA = a.match(/\d+/);
                    const dayMatchB = b.match(/\d+/);

                    if (!dayMatchA || !dayMatchB) {
                        console.log('No se pudieron extraer los días de las fechas:', a, b);
                        return 0;
                    }

                    const dayA = parseInt(dayMatchA[0]);
                    const dayB = parseInt(dayMatchB[0]);

                    const partsA = a.split(' de ');
                    const partsB = b.split(' de ');

                    if (partsA.length < 2 || partsB.length < 2) {
                        console.log('No se pudieron extraer los meses de las fechas:', a, b);
                        return dayA - dayB;
                    }

                    const monthA = partsA[1];
                    const monthB = partsB[1];

                    const monthMap = {
                        'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4, 'Mayo': 5, 'Junio': 6,
                        'Julio': 7, 'Agosto': 8, 'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12
                    };

                    if (monthMap[monthA] !== undefined && monthMap[monthB] !== undefined && monthMap[monthA] !== monthMap[monthB]) {
                        return monthMap[monthA] - monthMap[monthB];
                    }
                    return dayA - dayB;
                } catch (err) {
                    console.error('Error al comparar fechas:', err, a, b);
                    return 0;
                }
            });
        } catch (err) {
            console.error('Error al ordenar fechas:', err);
        }

        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

        availableDates.forEach(date => {
            if (availabilityData[date] && availabilityData[date].length > 0) {
                let formattedDate = date;
                try {
                    const parts = date.split('-');
                    if (parts.length === 3) {
                        const year = parseInt(parts[0], 10);
                        const month = parseInt(parts[1], 10);
                        const day = parseInt(parts[2], 10);
                        const dateObj = new Date(year, month - 1, day);
                        const dayName = diasSemana[dateObj.getDay()];
                        formattedDate = `${dayName} ${day}/${month}/${year}`;
                    }
                } catch (e) {
                    console.error('Error formateando fecha', e);
                }

                const dateOption = document.createElement('div');
                dateOption.className = 'date-option';
                dateOption.dataset.value = date;
                dateOption.dataset.formatted = formattedDate;
                dateOption.textContent = formattedDate;

                dateOption.addEventListener('click', function () {
                    document.querySelectorAll('.date-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });

                    this.classList.add('selected');

                    dateInput.value = this.dataset.value;

                    document.getElementById('selected-date-display').textContent = this.dataset.formatted;

                    loadAvailableHours();

                    setTimeout(() => {
                        const timeSection = document.querySelector('.selector-section:nth-child(2)');
                        if (timeSection) {
                            console.log('Haciendo scroll a la sección de horas');
                            timeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        } else {
                            const continueButton = document.getElementById('next-step-button');
                            if (continueButton) {
                                console.log('Haciendo scroll al botón de continuar');
                                continueButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }
                    }, 300);
                });

                dateGrid.appendChild(dateOption);
            }
        });

        if (loadingDates) loadingDates.style.display = 'none';
        if (dateGrid) dateGrid.style.display = 'grid';

        console.log('Fechas cargadas en el grid');
    }

    function loadAvailableHours() {
        console.log('%c=== CARGANDO HORAS DISPONIBLES ===', 'background: #9b59b6; color: white; padding: 5px; border-radius: 5px;');
        const dateInput = document.getElementById('preferred-date');
        const timeInput = document.getElementById('preferred-time');
        const timeGrid = document.getElementById('time-grid');
        const loadingTimes = document.getElementById('loading-times');
        console.log('Input de fechas encontrado:', dateInput ? 'Sí' : 'No');
        console.log('Input de horas encontrado:', timeInput ? 'Sí' : 'No');
        console.log('Grid de horas encontrado:', timeGrid ? 'Sí' : 'No');

        if (loadingTimes) loadingTimes.style.display = 'flex';
        if (timeGrid) timeGrid.style.display = 'none';

        console.log('Limpiando grid de horas...');
        timeGrid.innerHTML = '';

        timeInput.value = '';
        document.getElementById('selected-time-display').textContent = 'Selecciona una hora';

        const selectedDate = dateInput.value;
        console.log('Fecha seleccionada:', selectedDate);

        if (!selectedDate || selectedDate === '') {
            console.log('No hay fecha seleccionada');
            return;
        }

        console.log('Verificando disponibilidad para la fecha:', selectedDate);
        console.log('Datos de disponibilidad:', availabilityData);
        console.log('Existe la fecha en los datos?', availabilityData && availabilityData[selectedDate] ? 'Sí' : 'No');

        if (!availabilityData || !availabilityData[selectedDate]) {
            console.error('No hay datos de disponibilidad para la fecha seleccionada');
            return;
        }

        let availableTimes = availabilityData[selectedDate];
        console.log('%cHorarios disponibles para', 'color: #f39c12; font-weight: bold;', selectedDate, ':', availableTimes);
        console.log('Tipo de datos de horarios:', typeof availableTimes);
        console.log('¿Es un array?', Array.isArray(availableTimes));
        console.log('Longitud/tamaño:', Array.isArray(availableTimes) ? availableTimes.length : 'N/A');

        if (!Array.isArray(availableTimes)) {
            console.error('Los horarios disponibles no son un array:', availableTimes);
            console.log('Intentando convertir a array...');
            if (availableTimes && typeof availableTimes === 'object') {
                availableTimes = Object.values(availableTimes);
                console.log('Convertido usando Object.values():', availableTimes);
            } else {
                availableTimes = [];
                console.log('No se pudo convertir, usando array vacío');
            }
            console.log('Horarios convertidos a array:', availableTimes);
            console.log('¿Es un array ahora?', Array.isArray(availableTimes));
            console.log('Longitud del array convertido:', availableTimes.length);
        }

        if (Array.isArray(availableTimes) && availableTimes.length > 0) {
            try {
                availableTimes.sort((a, b) => {
                    try {
                        const timeRegex = /^\d{1,2}:\d{2}(\s*(hs|hrs|am|pm))?$/i;

                        if (!timeRegex.test(a) || !timeRegex.test(b)) {
                            console.log('Formato de hora no reconocido:', a, b);
                            return 0;
                        }

                        const getMinutes = (timeStr) => {
                            const cleanTime = timeStr.replace(/\s*(hs|hrs|h)\b/i, '');

                            if (/am|pm/i.test(cleanTime)) {
                                const isPM = /pm/i.test(cleanTime);
                                const timePart = cleanTime.replace(/\s*(am|pm)\b/i, '');
                                let [hours, minutes] = timePart.split(':').map(Number);

                                if (isPM && hours < 12) hours += 12;
                                if (!isPM && hours === 12) hours = 0;

                                return hours * 60 + minutes;
                            } else {
                                const [hours, minutes] = cleanTime.split(':').map(Number);
                                return hours * 60 + minutes;
                            }
                        };

                        return getMinutes(a) - getMinutes(b);
                    } catch (err) {
                        console.error('Error al comparar horarios:', err, a, b);
                        return 0;
                    }
                });
            } catch (err) {
                console.error('Error al ordenar horarios:', err);
            }
        }

        if (Array.isArray(availableTimes)) {
            availableTimes.forEach(time => {
                let formattedTime = time;

                try {
                    if (/\s*(hs|hrs|h|am|pm)\b/i.test(time)) {
                        formattedTime = time;
                    } else {
                        const timeMatch = time.match(/^(\d{1,2}):(\d{2})$/);
                        if (timeMatch) {
                            const hours = parseInt(timeMatch[1]);
                            const minutes = timeMatch[2];
                            const period = hours >= 12 ? 'PM' : 'AM';
                            let displayHours = hours % 12;
                            if (displayHours === 0) displayHours = 12;
                            formattedTime = `${displayHours}:${minutes} ${period}`;
                        }
                    }
                } catch (err) {
                    console.error('Error al formatear hora:', err, time);
                    formattedTime = time;
                }

                const timeOption = document.createElement('div');
                timeOption.className = 'time-option';
                timeOption.dataset.value = time;
                timeOption.textContent = formattedTime;

                timeOption.addEventListener('click', function () {
                    document.querySelectorAll('.time-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });

                    this.classList.add('selected');

                    timeInput.value = this.dataset.value;

                    document.getElementById('selected-time-display').textContent = this.textContent;

                    setTimeout(() => {
                        const continueButton = document.getElementById('next-step-button');
                        if (continueButton) {
                            console.log('Haciendo scroll al botón de continuar después de seleccionar hora');
                            continueButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        } else {
                            const summarySection = document.querySelector('.selection-summary');
                            if (summarySection) {
                                console.log('Haciendo scroll a la sección de resumen');
                                summarySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }
                    }, 100);
                });

                timeGrid.appendChild(timeOption);
            });

            if (loadingTimes) loadingTimes.style.display = 'none';
            if (timeGrid) timeGrid.style.display = 'grid';

            console.log('Horarios cargados en el grid');

            setTimeout(() => {
                const continueButton = document.getElementById('next-step-button');
                if (continueButton) {
                    console.log('Haciendo scroll al botón de continuar después de cargar horas');
                    continueButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    const summarySection = document.querySelector('.selection-summary');
                    if (summarySection) {
                        console.log('Haciendo scroll a la sección de resumen');
                        summarySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }, 500);
        } else {
            console.error('No se pudieron cargar los horarios porque no es un array');

            if (loadingTimes) {
                loadingTimes.innerHTML = '<p>No hay horarios disponibles para esta fecha. Por favor, selecciona otra fecha.</p>';
            }
        }
    }

    const whatsappField = document.getElementById('whatsapp');

    if (whatsappField.value === '') {
        whatsappField.value = '521';
    }

    const whatsappInput = whatsappField;
    const whatsappValidation = document.getElementById('whatsapp-validation');

    whatsappInput.addEventListener('input', function () {
        whatsappValidation.textContent = '';
        whatsappValidation.className = 'validation-message';

        const finishButton = document.getElementById('finish-button');
        const buttonStatusMessage = document.getElementById('button-status-message');
        if (finishButton) {
            finishButton.disabled = true;
        }
        if (buttonStatusMessage) {
            buttonStatusMessage.textContent = 'Verifica tu número de WhatsApp para continuar';
            buttonStatusMessage.className = 'button-status-message';
        }
    });

    whatsappInput.addEventListener('blur', function () {
        const whatsappNumber = this.value.trim();

        if (!whatsappNumber) {
            return;
        }

        const digitsOnly = whatsappNumber.replace(/\D/g, '');

        if (digitsOnly.length < 10 || digitsOnly.length > 15) {
            whatsappValidation.textContent = 'Ingresa un número válido (al menos 10 dígitos)';
            whatsappValidation.className = 'validation-message error';
            return;
        }

        whatsappValidation.textContent = 'Verificando número...';
        whatsappValidation.className = 'validation-message';

        let respuestasFormateadas = '';
        let respuestasDetalladas = {};

        if (window.questions && window.questions.length > 0) {
            window.questions.forEach(question => {
                if (window.answers[question.key]) {
                    respuestasFormateadas += `${question.question}: ${window.answers[question.key].value}\n`;
                    respuestasDetalladas[question.key] = window.answers[question.key].value;
                }
            });
        }

        const validationData = {
            whatsapp_check: digitsOnly,
            action: 'validate_whatsapp',
            origen: "Landing Dra. Constanza Bossi",
            landingUrl: window.location.href,
            respuestas: respuestasFormateadas,
            respuestas_detalladas: respuestasDetalladas
        };

        fetch('https://sswebhookss.odontolab.co/webhook/02eb0643-1b9d-4866-87a7-f892d6a945ea', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(validationData)
        })
            .then(response => response.json())
            .then(data => {
                console.log('API Response:', data);

                if (data && typeof data.exists === 'boolean') {
                    if (data.exists === true) {
                        whatsappValidation.textContent = 'Número de WhatsApp válido';
                        whatsappValidation.className = 'validation-message success';

                        const finishButton = document.getElementById('finish-button');
                        const buttonStatusMessage = document.getElementById('button-status-message');
                        const paymentConfirmationCheckbox = document.getElementById('payment-confirmation-checkbox');
                        const checkboxChecked = paymentConfirmationCheckbox && paymentConfirmationCheckbox.checked;

                        if (finishButton) {
                            finishButton.disabled = !checkboxChecked;

                            if (!checkboxChecked) {
                                if (buttonStatusMessage) {
                                    buttonStatusMessage.textContent = 'Debes confirmar que entiendes la política de pago';
                                    buttonStatusMessage.className = 'button-status-message';
                                }
                            } else {
                                if (buttonStatusMessage) {
                                    buttonStatusMessage.textContent = 'Todo listo para continuar';
                                    buttonStatusMessage.className = 'button-status-message success';
                                }
                            }
                        } else {
                            if (buttonStatusMessage) {
                                buttonStatusMessage.textContent = 'Número de WhatsApp válido';
                                buttonStatusMessage.className = 'button-status-message success';
                            }
                        }
                    } else {
                        whatsappValidation.textContent = 'Este número no tiene WhatsApp activo';
                        whatsappValidation.className = 'validation-message error';

                        const finishButton = document.getElementById('finish-button');
                        const buttonStatusMessage = document.getElementById('button-status-message');

                        if (finishButton) {
                            finishButton.disabled = true;
                        }

                        if (buttonStatusMessage) {
                            buttonStatusMessage.textContent = 'Número de WhatsApp inválido';
                            buttonStatusMessage.className = 'button-status-message error';
                        }
                    }
                } else {
                    whatsappValidation.textContent = 'No se pudo verificar el número';
                    whatsappValidation.className = 'validation-message error';

                    const finishButton = document.getElementById('finish-button');
                    const buttonStatusMessage = document.getElementById('button-status-message');

                    if (finishButton) {
                        finishButton.disabled = true;
                    }

                    if (buttonStatusMessage) {
                        buttonStatusMessage.textContent = 'No se pudo verificar el número de WhatsApp';
                        buttonStatusMessage.className = 'button-status-message error';
                    }
                }
            })
            .catch(error => {
                console.error('Error validando WhatsApp:', error);
                whatsappValidation.textContent = 'Error al verificar el número';
                whatsappValidation.className = 'validation-message error';

                const finishButton = document.getElementById('finish-button');
                const buttonStatusMessage = document.getElementById('button-status-message');

                if (finishButton) {
                    finishButton.disabled = true;
                }

                if (buttonStatusMessage) {
                    buttonStatusMessage.textContent = 'Error al verificar el número de WhatsApp';
                    buttonStatusMessage.className = 'button-status-message error';
                }
            });
    });

    console.log('DOM Elements cargados');

    window.showConfirmation = function () {
        console.log('showConfirmation called');

        const whatsappInput = document.getElementById('whatsapp');
        const whatsappNumber = whatsappInput.value.trim();
        if (!/^\d{10,15}$/.test(whatsappNumber)) {
            alert('Por favor ingresa un número de WhatsApp válido (10-15 dígitos sin espacios ni guiones, incluyendo el 52).');
            whatsappInput.focus();
            return;
        }

        const fullname = document.getElementById('fullname').value;
        const whatsapp = whatsappInput.value;
        const preferredDate = document.getElementById('preferred-date').value;
        const preferredTime = document.getElementById('preferred-time').value;

        if (!fullname || !whatsapp || !preferredDate || !preferredTime) {
            alert('Por favor completa todos los campos del formulario.');
            return;
        }

        const dateOption = document.querySelector(`#preferred-date option[value="${preferredDate}"]`);
        const formattedDate = dateOption ? dateOption.textContent : preferredDate;

        document.getElementById('summary-name').textContent = fullname;
        document.getElementById('summary-whatsapp').textContent = whatsapp;
        document.getElementById('summary-date').textContent = formattedDate;
        document.getElementById('summary-time').textContent = preferredTime;

        const summaryAnswers = document.getElementById('summary-answers');
        if (summaryAnswers) {
            summaryAnswers.innerHTML = '';

            const hasAnswers = window.questions && window.questions.some(q => window.answers[q.key]);
            const answersSection = summaryAnswers.parentElement;

            if (answersSection) {
                if (hasAnswers) {
                    answersSection.classList.remove('hidden');

                    window.questions.forEach(question => {
                        if (window.answers[question.key]) {
                            const answerItem = document.createElement('div');
                            answerItem.classList.add('info-row');
                            answerItem.innerHTML = `
                                <div class="info-label">${question.question}:</div>
                                <div class="info-value">${window.answers[question.key].value}</div>
                            `;
                            summaryAnswers.appendChild(answerItem);
                        }
                    });
                } else {
                    answersSection.classList.add('hidden');
                }
            }
        }

        console.log('Starting transition to confirmation step');

        const formStep1 = document.getElementById('form-step-1');
        const formStep2 = document.getElementById('form-step-2');

        if (!formStep1 || !formStep2) {
            console.error('No se encontraron los pasos del formulario:', { formStep1, formStep2 });
            return;
        }

        formStep1.style.display = 'none';
        formStep2.style.display = 'flex';

        console.log('Transition completed');
        console.log('Form step 1:', {
            display: formStep1.style.display
        });
        console.log('Form step 2:', {
            display: formStep2.style.display
        });
    };

    document.getElementById('next-step-button').addEventListener('click', () => {
        console.log('Next step button clicked');

        const preferredDate = document.getElementById('preferred-date').value;
        const preferredTime = document.getElementById('preferred-time').value;

        if (!preferredDate || !preferredTime) {
            alert('Por favor selecciona una fecha y hora disponible.');
            return;
        }

        if (typeof fbq !== 'undefined') {
            const pasoNum = questions.length + 3;
            const eventName = `Paso${pasoNum}_SeleccionFechaHora`;
            console.log(`Tracking: ${eventName}`);
            fbq('trackCustom', eventName, {
                event_category: 'Form',
                event_label: 'Selección de fecha y hora',
                qualified: determineQualification()
            });
        }

        const paymentDateTimeElement = document.getElementById('payment-date-time');
        if (paymentDateTimeElement) {
            const selectedDateDisplay = document.getElementById('selected-date-display').textContent;
            const selectedTimeDisplay = document.getElementById('selected-time-display').textContent;
            paymentDateTimeElement.textContent = `${selectedDateDisplay} a las ${selectedTimeDisplay}`;
        }

        document.getElementById('form-step-1').style.display = 'none';
        document.getElementById('form-step-2').style.display = 'block';

        const scrollToTop = () => {
            console.log('Ejecutando scrollToTop en next-step-button');
            window.scrollTo(0, 0);
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;

            const header = document.querySelector('header');
            if (header) {
                console.log('Enfocando header');
                header.scrollIntoView({ behavior: 'auto', block: 'start' });
            }

            const formTitle = document.querySelector('.form-container h2');
            if (formTitle) {
                console.log('Enfocando título del formulario');
                formTitle.scrollIntoView({ behavior: 'auto', block: 'start' });
            }

            const paymentReminder = document.querySelector('.payment-reminder');
            if (paymentReminder) {
                console.log('Enfocando recordatorio de pago');
                paymentReminder.scrollIntoView({ behavior: 'auto', block: 'start' });
            }

            const formContainer = document.querySelector('.form-container');
            if (formContainer) {
                console.log('Enfocando contenedor del formulario');
                formContainer.scrollIntoView({ behavior: 'auto', block: 'start' });
                formContainer.scrollTop = 0;
            }

            const whatsappInput = document.getElementById('whatsapp');
            if (whatsappInput) {
                console.log('Enfocando campo de WhatsApp');
                whatsappInput.focus();

                const valorPrecargado = whatsappInput.value;
                if (valorPrecargado) {
                    setTimeout(() => {
                        whatsappInput.selectionStart = whatsappInput.selectionEnd = valorPrecargado.length;
                    }, 50);
                }
            }
        };

        scrollToTop();

        setTimeout(scrollToTop, 100);
        setTimeout(scrollToTop, 500);
        setTimeout(scrollToTop, 1000);
    });

    document.getElementById('prev-step-button').addEventListener('click', () => {
        console.log('Previous step button clicked');

        document.getElementById('form-step-2').style.display = 'none';
        document.getElementById('form-step-1').style.display = 'block';
    });

    const confirmButtonElement = document.getElementById('confirm-button');
    if (confirmButtonElement) {
        confirmButtonElement.addEventListener('click', () => {
            console.log('Confirm button clicked, redirecting to finish button');
            const finishButton = document.getElementById('finish-button');
            if (finishButton) {
                finishButton.click();
            }
        });
    }

    const paymentConfirmationCheckbox = document.getElementById('payment-confirmation-checkbox');
    if (paymentConfirmationCheckbox) {
        paymentConfirmationCheckbox.addEventListener('change', function () {
            const finishButton = document.getElementById('finish-button');
            const buttonStatusMessage = document.getElementById('button-status-message');

            if (finishButton) {
                const whatsappValidation = document.getElementById('whatsapp-validation');
                const whatsappIsValid = whatsappValidation && whatsappValidation.classList.contains('success');

                if (this.checked && whatsappIsValid) {
                    finishButton.disabled = false;
                    if (buttonStatusMessage) {
                        buttonStatusMessage.textContent = 'Todo listo para continuar';
                        buttonStatusMessage.className = 'button-status-message success';
                    }
                } else if (!this.checked) {
                    finishButton.disabled = true;
                    if (buttonStatusMessage) {
                        buttonStatusMessage.textContent = 'Debes confirmar que entiendes la política de pago';
                        buttonStatusMessage.className = 'button-status-message';
                    }
                } else if (!whatsappIsValid) {
                    finishButton.disabled = true;
                    if (buttonStatusMessage) {
                        buttonStatusMessage.textContent = 'Verifica tu número de WhatsApp para continuar';
                        buttonStatusMessage.className = 'button-status-message';
                    }
                }
            }
        });
    }

    const finishButtonElement = document.getElementById('finish-button');
    if (finishButtonElement) {
        finishButtonElement.disabled = true;

        finishButtonElement.addEventListener('click', () => {
            console.log('Finish button clicked');

            if (typeof fbq !== 'undefined') {
                const pasoNum = questions.length + 5;
                const eventName = `Paso${pasoNum}_Finalizacion`;
                console.log(`Tracking: ${eventName}`);
                fbq('trackCustom', eventName, {
                    event_category: 'Form',
                    event_label: 'Finalización del proceso',
                    qualified: determineQualification()
                });
            }

            const fullname = document.getElementById('fullname').value;
            const whatsapp = document.getElementById('whatsapp').value;
            let preferredDate = document.getElementById('preferred-date').value;
            let preferredTime = document.getElementById('preferred-time').value;
            const mainDoubt = document.getElementById('main_doubt').value || '';

            const questionnaire = {};
            for (const key in answers) {
                if (answers.hasOwnProperty(key)) {
                    questionnaire[key] = answers[key].value;
                }
            }

            let respuestasTexto = '';
            questions.forEach(question => {
                if (answers[question.key]) {
                    respuestasTexto += `${question.question}: ${answers[question.key].value}\n`;
                }
            });

            if (mainDoubt && mainDoubt.trim() !== '') {
                respuestasTexto += `¿Cuál es tu principal duda sobre el procedimiento?: ${mainDoubt}\n`;
            }

            const formData = {
                fullname: fullname,
                whatsapp: whatsapp,
                tratamiento_interes: answers.procedure ? answers.procedure.value : 'Cirugía plástica',
                fecha_cita: `${preferredDate} ${preferredTime}`,
                fecha: preferredDate,
                hora: preferredTime,
                landingUrl: window.location.href,
                respuestas: respuestasTexto,
                respuestas_detalladas: {},
                videollamada_previa: answers.videocall ? (answers.videocall.value.includes('Sí') ? 'Sí' : 'No') : 'No',
                peso: answers.weight ? answers.weight.value : '',
                altura: answers.height ? answers.height.value : '',
                duda_principal: mainDoubt,
                estado: "NUEVO",
                origen: "Landing Dra. Constanza Bossi"
            };

            questions.forEach(question => {
                if (answers[question.key]) {
                    formData.respuestas_detalladas[question.key] = answers[question.key].value;
                }
            });

            if (!fullname || !whatsapp) {
                alert('Por favor completa tu nombre y número de WhatsApp.');
                return;
            }

            const defaultDate = "Próxima disponible";
            const defaultTime = "A coordinar";

            if (!preferredDate) {
                console.log('Fecha no seleccionada, usando valor predeterminado');
                preferredDate = defaultDate;
            }

            if (!preferredTime) {
                console.log('Hora no seleccionada, usando valor predeterminado');
                preferredTime = defaultTime;
            }

            const whatsappDigits = whatsapp.replace(/\D/g, '');
            if (whatsappDigits.length < 10 || whatsappDigits.length > 15) {
                alert('Por favor ingresa un número de WhatsApp válido (al menos 10 dígitos).');
                document.getElementById('whatsapp').focus();
                return;
            }

            const overlay = document.createElement('div');
            overlay.className = 'mercadopago-overlay';
            overlay.innerHTML = `
            <div class="mercadopago-spinner"></div>
            <p>Generando link de pago personalizado...</p>
            <p>Por favor espera, serás redirigido a Mercado Pago en unos segundos.</p>
        `;
            document.body.appendChild(overlay);

            const finishButton = document.getElementById('finish-button');
            finishButton.disabled = true;
            finishButton.innerHTML = '<span class="loading-spinner"></span> Procesando...';

            const paymentWebhookUrl = CONFIG && CONFIG.webhooks && CONFIG.webhooks.paymentLink ? CONFIG.webhooks.paymentLink : 'https://sswebhookss.odontolab.co/webhook/913b049b-4c1a-4a3b-b1f0-129888a96abb';
            fetch(paymentWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "nombre": fullname,
                    "telefono": whatsapp.replace(/\D/g, '')
                })
            })
                .then(response => response.json())
                .then(data => {
                    console.log("Respuesta del servidor de Mercado Pago:", data);

                    let mercadoPagoLink = null;

                    if (Array.isArray(data) && data.length > 0 && data[0].mercadopago_linkpersonalizado_creado) {
                        mercadoPagoLink = data[0].mercadopago_linkpersonalizado_creado;
                    }
                    else if (data && data.mercadopago_linkpersonalizado_creado) {
                        mercadoPagoLink = data.mercadopago_linkpersonalizado_creado;
                    }

                    if (mercadoPagoLink) {

                        formData.mercadopago_link = mercadoPagoLink;

                        const targetUrl = CONFIG && CONFIG.webhooks ? CONFIG.webhooks.formSubmission : "https://sswebhookss.odontolab.co/webhook/1128bc3f-6675-4180-97f0-bc0adcdce76a";

                        jQuery.ajax({
                            url: targetUrl,
                            data: JSON.stringify(formData),
                            type: "POST",
                            contentType: "application/json",
                            dataType: "json"
                        })
                            .done(function (response) {
                                console.log("Respuesta del servidor de guardado de datos:", response);

                                if (typeof fbq !== 'undefined') {
                                    console.log('Disparando evento CitaFiltro en Facebook Pixel ANTES de redireccionar');
                                    fbq('trackCustom', 'CitaFiltro', {
                                        fullname: fullname,
                                        whatsapp: whatsapp,
                                        fecha_cita: `${preferredDate} ${preferredTime}`,
                                        tratamiento: 'Cirugía plástica'
                                    });
                                }

                                window.location.href = mercadoPagoLink;
                            })
                            .fail(function (error) {
                                console.error('Error al enviar los datos:', error);

                                if (overlay && overlay.parentNode) {
                                    overlay.parentNode.removeChild(overlay);
                                }

                                finishButton.disabled = false;
                                finishButton.innerHTML = 'Finalizar →';

                                alert('Hubo un error al guardar los datos. Por favor, inténtalo de nuevo.');
                            });
                    } else {
                        console.error('No se recibió un link de Mercado Pago válido:', data);
                        console.log('Formato de respuesta no reconocido o falta la propiedad mercadopago_linkpersonalizado_creado');

                        if (overlay && overlay.parentNode) {
                            overlay.parentNode.removeChild(overlay);
                        }

                        finishButton.disabled = false;
                        finishButton.innerHTML = 'Finalizar →';

                        alert('Hubo un error al generar el link de pago. Por favor, inténtalo de nuevo.');
                    }
                })
                .catch(error => {
                    console.error('Error al obtener el link de Mercado Pago:', error);

                    if (overlay && overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }

                    finishButton.disabled = false;
                    finishButton.innerHTML = 'Finalizar →';

                    alert('Hubo un error al conectar con el servidor de pagos. Por favor, inténtalo de nuevo.');
                });
        });
    }
});
