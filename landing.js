// Variables globales - Definidas en el ámbito global para que sean accesibles desde el HTML
let availabilityDataLoaded = false;
// Variables globales - Definidas en el ámbito global para que sean accesibles desde el HTML

// Detectar qué configuración de cliente usar basado en el nombre del archivo HTML
function detectClientConfig() {
    // Obtener el nombre del archivo HTML actual (sin la extensión .html)
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1).replace('.html', '');

    console.log('Nombre de archivo detectado:', filename);

    // Buscar la configuración correspondiente en CLIENTS_CONFIG
    if (CLIENTS_CONFIG && CLIENTS_CONFIG[filename]) {
        console.log('Configuración de cliente encontrada para:', filename);
        return CLIENTS_CONFIG[filename];
    }

    // Si no se encuentra una configuración específica, usar la primera disponible como fallback
    if (CLIENTS_CONFIG) {
        const firstClient = Object.keys(CLIENTS_CONFIG)[0];
        console.log('Usando configuración de cliente por defecto:', firstClient);
        return CLIENTS_CONFIG[firstClient];
    }

    console.error('No se encontró ninguna configuración de cliente');
    return {};
}

// Obtener la configuración del cliente actual
const CONFIG = detectClientConfig();

// Depuración: Mostrar la configuración detectada
console.log('Configuración detectada:', CONFIG);
console.log('Configuración completa:', CLIENTS_CONFIG);

// Aplicar colores desde la configuración
if (CONFIG && CONFIG.colors) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', CONFIG.colors.primary);
    root.style.setProperty('--secondary-color', CONFIG.colors.secondary);
    root.style.setProperty('--accent-color', CONFIG.colors.accent);
    root.style.setProperty('--text-color', CONFIG.colors.text);
    root.style.setProperty('--highlight-color', CONFIG.colors.highlight);
}

window.answers = {}; // Para almacenar las respuestas del cuestionario

// Usar las preguntas desde la configuración si están disponibles
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
]; // Para almacenar las preguntas del cuestionario

// Función para volver al formulario desde la página de confirmación
window.goBackToForm = function () {
    console.log('goBackToForm called');

    const formStep1 = document.getElementById('form-step-1');
    const formStep2 = document.getElementById('form-step-2');

    if (!formStep1 || !formStep2) {
        console.error('No se encontraron los pasos del formulario:', { formStep1, formStep2 });
        return;
    }

    // Mostrar el paso 1 y ocultar el paso 2
    formStep2.style.display = 'none';
    formStep1.style.display = 'flex';

    console.log('Volviendo al paso 1 del formulario');
}

// Función para enviar el formulario
window.submitForm = function () {
    console.log('submitForm called');
    console.log('submitForm() called');

    // Deshabilitar el botón para evitar envíos duplicados
    const confirmButton = document.getElementById('confirm-button');
    if (confirmButton) {
        confirmButton.disabled = true;
        confirmButton.innerHTML = 'Enviando...';
    }

    // Mostrar el contenedor de estado
    const submissionStatus = document.getElementById('submission-status');
    if (submissionStatus) {
        submissionStatus.style.display = 'block';
    }

    // Obtener los valores del formulario
    const fullname = document.getElementById('fullname').value;
    const whatsapp = document.getElementById('whatsapp').value;
    const preferredDate = document.getElementById('preferred-date').value;
    const preferredTime = document.getElementById('preferred-time').value;

    // Obtener el texto visible de la fecha seleccionada
    const dateOption = document.querySelector(`#preferred-date option[value="${preferredDate}"]`);
    const formattedDate = dateOption ? dateOption.textContent : preferredDate;

    // Crear mensaje para WhatsApp
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

    // Agregar respuestas del cuestionario al mensaje
    if (questions && questions.length > 0) {
        questions.forEach(question => {
            if (answers[question.key]) {
                message += `- ${question.question.replace(/\?/g, '')}? ${answers[question.key].value}\n`;
            }
        });
    }

    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);

    // Recopilar respuestas del cuestionario en formato legible
    let respuestasFormateadas = '';

    console.log('Preguntas disponibles:', window.questions);
    console.log('Respuestas disponibles:', window.answers);

    // Mostrar las respuestas en la página de confirmación
    const summaryAnswers = document.getElementById('summary-answers');
    if (summaryAnswers) {
        summaryAnswers.innerHTML = '';
        summaryAnswers.parentElement.classList.remove('hidden');
    }

    if (window.questions && window.questions.length > 0) {
        window.questions.forEach(question => {
            if (window.answers[question.key]) {
                // Añadir al texto formateado para el webhook
                respuestasFormateadas += `${question.question}: ${window.answers[question.key].value}\n`;
                console.log(`Añadiendo respuesta: ${question.question}: ${window.answers[question.key].value}`);

                // Mostrar en la página de confirmación
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

    // Enviar datos al endpoint
    const formData = {
        fullname: fullname,
        whatsapp: whatsapp,
        tratamiento_interes: window.answers && window.answers.procedure ? window.answers.procedure.value : 'Consulta de Evaluación',
        fecha_cita: `${formattedDate} ${preferredTime}`,
        respuestas: respuestasFormateadas,  // Campo oculto con todas las respuestas
        landingUrl: window.location.href,
        estado: "NUEVO"
    };

    // Asegurarnos de que el campo respuestas no esté vacío
    if (!respuestasFormateadas || respuestasFormateadas.trim() === '') {
        formData.respuestas = 'No se registraron respuestas al cuestionario.';
    }

    // Asegurarnos de que el campo respuestas se envíe correctamente
    console.log('Campo respuestas:', formData.respuestas);

    console.log('Enviando datos al webhook:', formData);

    // Convertir formData a URLSearchParams para enviar como form-urlencoded
    const params = new URLSearchParams();
    for (const key in formData) {
        params.append(key, formData[key]);
    }

    // Verificar que el campo respuestas está incluido
    console.log('Parámetros enviados:', params.toString());

    // Disparar eventos personalizados de Facebook Pixel
    if (typeof fbq !== 'undefined') {
        // Evento de envío de formulario
        // El número de paso para este evento es questions.length + 4 porque:
        // Paso 1 es el inicio del quiz
        // Pasos 2 a questions.length+1 son las preguntas
        // Paso questions.length+2 es la finalización del cuestionario
        // Paso questions.length+3 es el inicio del formulario
        // El siguiente paso es el envío del formulario
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

        // Evento de conversión principal (mantener para compatibilidad)
        console.log('Disparando evento CitaFiltro en Facebook Pixel');
        fbq('trackCustom', 'CitaFiltro', {
            fullname: formData.fullname,
            whatsapp: formData.whatsapp,
            fecha_cita: formData.fecha_cita
        });

        // Evento estándar de Facebook para completar formulario
        fbq('track', 'Lead', {
            content_name: 'Formulario de cita para cirugía plástica',
            content_category: 'Cirugía Plástica',
            value: 1,
            currency: 'ARS'
        });
    } else {
        console.warn('Facebook Pixel no está disponible');
    }

    // Enviar datos al webhook usando fetch
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

            // Mostrar mensaje de error
            const errorMessage = document.getElementById('error-message');
            const successMessage = document.getElementById('success-message');

            if (errorMessage) errorMessage.style.display = 'flex';
            if (successMessage) successMessage.style.display = 'none';

            // Habilitar el botón nuevamente
            confirmButton.disabled = false;
            confirmButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ffffff"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.72.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/></svg> Confirmar y contactar por WhatsApp';

            // Esperar 3 segundos y luego redirigir a WhatsApp de todos modos
            setTimeout(function () {
                window.open(`https://wa.me/+${CONFIG && CONFIG.clinic ? CONFIG.clinic.whatsapp : '5493812093646'}?text=${encodedMessage}`, '_blank');
            }, 3000);
        });
}

// Función para mostrar la página de confirmación - DESACTIVADA (reemplazada por la nueva implementación)
// Esta función ha sido reemplazada por la nueva implementación que usa pasos

document.addEventListener('DOMContentLoaded', () => {
    // Actualizar el título de la página
    if (CONFIG && CONFIG.clinic && CONFIG.clinic.name) {
        document.title = `${CONFIG.clinic.name} - Evaluación de Tratamiento`;
    }

    // Actualizar el contenido de la pantalla de inicio
    if (CONFIG && CONFIG.landingPage) {
        // Actualizar el título principal
        const mainTitle = document.querySelector('.landing-content .compact-title');
        if (mainTitle && CONFIG.landingPage.mainTitle) {
            mainTitle.textContent = CONFIG.landingPage.mainTitle;
        }

        // Actualizar el subtítulo
        const subtitle = document.querySelector('.landing-content .simple-intro');
        if (subtitle && CONFIG.landingPage.subtitle) {
            subtitle.textContent = CONFIG.landingPage.subtitle;
        }

        // Actualizar el texto del botón
        const startButton = document.getElementById('start-quiz');
        if (startButton && CONFIG.landingPage.startButtonText) {
            startButton.textContent = CONFIG.landingPage.startButtonText;
        }

        // Actualizar el precio de valoración
        if (CONFIG.treatments && CONFIG.treatments.length > 0) {
            // Buscar el tratamiento de valoración
            const valoracionTreatment = CONFIG.treatments.find(t => t.name.toLowerCase().includes('valoración') || t.name.toLowerCase().includes('valoracion'));
            if (valoracionTreatment) {
                // Actualizar el precio de valoración
                const valoracionPrice = document.querySelector('.valoracion-row .price-value');
                if (valoracionPrice) {
                    valoracionPrice.textContent = `$${valoracionTreatment.initialPrice}`;
                }

                // Actualizar el precio de anticipo
                const anticipoPrice = document.querySelector('.valoracion-detail .price-value');
                if (anticipoPrice && CONFIG.clinic && CONFIG.clinic.depositAmount) {
                    anticipoPrice.textContent = `$${CONFIG.clinic.depositAmount}`;
                }

                // Actualizar el texto del pago anticipado
                const paymentNote = document.querySelector('.payment-note p:first-child strong');
                if (paymentNote && CONFIG.clinic && CONFIG.clinic.depositAmount) {
                    const paymentText = document.querySelector('.payment-note p:first-child');
                    if (paymentText) {
                        paymentText.innerHTML = `Para confirmar tu cita es <strong>obligatorio</strong> realizar un pago anticipado de $${CONFIG.clinic.depositAmount} (50%).`;
                    }

                    // Actualizar el texto del descuento
                    const discountText = document.querySelector('.payment-note p:last-child');
                    if (discountText && valoracionTreatment.initialPrice) {
                        discountText.innerHTML = `El 50% restante ($${CONFIG.clinic.depositAmount}) se abona el día de la visita en la clínica.`;
                    }

                    // Actualizar cualquier otra referencia al precio de valoración que pueda existir
                    document.querySelectorAll('.price-value, p').forEach(el => {
                        if (el.textContent.includes('$800')) {
                            el.textContent = el.textContent.replace('$800', `$${valoracionTreatment.initialPrice}`);
                        }
                    });
                }

                // Actualizar el mensaje de valoración en la parte superior
                if (CONFIG.landingPage && CONFIG.landingPage.priceNote) {
                    const priceNote = document.querySelector('.results-container .price-note');
                    if (priceNote) {
                        priceNote.textContent = CONFIG.landingPage.priceNote;
                    }
                }

                // Actualizar el texto en la sección de recordatorio de pago
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

    // Actualizar la dirección en el mensaje de error de ubicación
    if (CONFIG && CONFIG.clinic && CONFIG.clinic.address) {
        const locationErrorAddress = document.querySelector('#location-error p:nth-child(3)');
        if (locationErrorAddress) {
            locationErrorAddress.textContent = `Nuestros tratamientos requieren atención presencial en nuestra clínica ubicada en ${CONFIG.clinic.address}.`;
        }
    }

    // Actualizar los textos de confirmación
    if (CONFIG && CONFIG.landingPage && CONFIG.landingPage.confirmationText) {
        const saveRedirectText = document.getElementById('save-redirect-text');
        const depositInfoText = document.getElementById('deposit-info-text');

        if (saveRedirectText && CONFIG.landingPage.confirmationText.saveAndRedirect) {
            let saveRedirectContent = CONFIG.landingPage.confirmationText.saveAndRedirect;

            // Reemplazar el nombre de la clínica si está disponible
            if (CONFIG.clinic && CONFIG.clinic.name) {
                saveRedirectContent = saveRedirectContent.replace(/María Guillén Ortodoncia|Implant Center/g, CONFIG.clinic.name);
            }

            saveRedirectText.innerHTML = saveRedirectContent;
        }

        if (depositInfoText && CONFIG.landingPage.confirmationText.depositInfo) {
            let depositInfoContent = CONFIG.landingPage.confirmationText.depositInfo;

            // Reemplazar el monto del depósito si está disponible
            if (CONFIG.clinic && CONFIG.clinic.depositAmount) {
                depositInfoContent = depositInfoContent.replace(/\$400|\$[0-9]+/g, '$' + CONFIG.clinic.depositAmount);
            }

            depositInfoText.innerHTML = depositInfoContent;
        }
    }

    // El mensaje de nota de precios ahora se muestra en el resultado de calificación
    // Generar dinámicamente el HTML de los precios si hay tratamientos en la configuración
    if (CONFIG && CONFIG.treatments && CONFIG.treatments.length > 0) {
        const priceList = document.querySelector('.price-list');
        if (priceList) {
            // Limpiar la lista de precios
            priceList.innerHTML = '';

            // Verificar qué procedimiento seleccionó el usuario
            const selectedProcedure = window.answers.procedure ? window.answers.procedure.value : '';
            console.log('Procedimiento seleccionado:', selectedProcedure);

            // Normalizar el nombre del procedimiento para comparaciones más precisas
            const normalizedProcedure = selectedProcedure.trim();

            // Determinar si debemos mostrar todos los tratamientos o solo el seleccionado
            const showAllTreatments =
                !normalizedProcedure ||
                normalizedProcedure.includes('Otro procedimiento') ||
                normalizedProcedure.includes('no quirúrgicos') ||
                normalizedProcedure.includes('estéticos');

            console.log('Mostrar todos los tratamientos:', showAllTreatments);

            // Limpiar el título de la sección de precios
            const pricingTitle = document.querySelector('.pricing-info h3');
            if (pricingTitle) {
                // Siempre usar el mismo título, independientemente del procedimiento seleccionado
                pricingTitle.textContent = 'Precio de Referencia';
            }

            // Generar el HTML para cada tratamiento (excepto la valoración)
            CONFIG.treatments.forEach(treatment => {
                // Omitir la valoración ya que se muestra arriba de la lista
                if (treatment.name.toLowerCase().includes('valoración') || treatment.name.toLowerCase().includes('valoracion')) {
                    return; // Saltar este tratamiento
                }

                // Si no estamos mostrando todos los tratamientos, solo mostrar el seleccionado
                if (!showAllTreatments) {
                    // Comparación más precisa para el nombre del tratamiento
                    const treatmentNameLower = treatment.name.toLowerCase().trim();
                    const procedureLower = normalizedProcedure.toLowerCase().trim();

                    console.log(`Comparando: "${treatmentNameLower}" con "${procedureLower}"`);

                    // Caso especial para Lipoescultura
                    if (procedureLower === "lipoescultura" && treatmentNameLower.includes("lipo")) {
                        console.log(`✅ Caso especial para Lipoescultura: ${treatment.name}`);
                    }
                    // Verificar coincidencia exacta
                    else if (treatmentNameLower === procedureLower) {
                        console.log(`✅ Coincidencia exacta: ${treatment.name}`);
                    }
                    // Luego verificar si el tratamiento comienza con el procedimiento
                    else if (treatmentNameLower.startsWith(procedureLower)) {
                        console.log(`✅ El tratamiento comienza con el procedimiento: ${treatment.name}`);
                    }
                    // Luego verificar si el procedimiento comienza con el tratamiento
                    else if (procedureLower.startsWith(treatmentNameLower)) {
                        console.log(`✅ El procedimiento comienza con el tratamiento: ${treatment.name}`);
                    }
                    // Si ninguna de las condiciones anteriores se cumple, omitir este tratamiento
                    else {
                        console.log(`❌ Omitiendo tratamiento ${treatment.name} porque no coincide con ${normalizedProcedure}`);
                        return; // Saltar este tratamiento si no coincide con el seleccionado
                    }
                }
                const treatmentGroup = document.createElement('div');
                treatmentGroup.className = 'treatment-group';

                // Crear la fila principal del tratamiento
                const mainRow = document.createElement('div');
                mainRow.className = treatment.isOffer ? 'price-row highlight' : 'price-row';

                const nameSpan = document.createElement('span');
                nameSpan.className = 'price-label';
                nameSpan.textContent = treatment.name + ':';

                const priceSpan = document.createElement('span');
                priceSpan.className = 'price-value';

                if (treatment.highlightText) {
                    // Usar el texto destacado personalizado si está disponible
                    priceSpan.textContent = treatment.highlightText;
                } else if (treatment.initialPrice) {
                    // Determinar el formato de precio a usar
                    if (treatment.priceFormat === 'simple') {
                        // Formato simple: solo el precio sin "Inicio:"
                        priceSpan.textContent = treatment.isOffer ?
                            `$${treatment.initialPrice.toLocaleString()} (Oferta!)` :
                            `$${treatment.initialPrice.toLocaleString()}`;
                    } else {
                        // Formato estándar con "Inicio:" (para ortodoncia)
                        priceSpan.textContent = treatment.isOffer ?
                            `Inicio: $${treatment.initialPrice.toLocaleString()} (Oferta!)` :
                            `Inicio: $${treatment.initialPrice.toLocaleString()}`;
                    }
                } else {
                    // Usar nota personalizada o texto por defecto
                    priceSpan.textContent = treatment.customNote || 'Precio personalizado';
                }

                mainRow.appendChild(nameSpan);
                mainRow.appendChild(priceSpan);
                treatmentGroup.appendChild(mainRow);

                // Agregar precio regular si existe
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

                // Agregar mensualidad si existe
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

                // Agregar nota personalizada si no hay precio inicial pero sí hay nota
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

    // DOM Elements
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
    // Eliminamos la referencia no utilizada a appointmentForm
    const qualificationResult = document.getElementById('qualification-result');

    // Quiz questions - Ya definidas al inicio del archivo

    // Quiz state
    let currentQuestionIndex = 0;
    // Usamos la variable global window.answers en lugar de crear una local
    // para que las respuestas estén disponibles en submitForm

    // Initialize quiz
    function initQuiz() {
        // Create question elements
        questions.forEach((question, index) => {
            const questionElement = document.createElement('div');
            questionElement.classList.add('question');
            if (index === 0) questionElement.classList.add('active');

            // Crear el contenedor de opciones
            questionElement.innerHTML = `
                <h3>${question.question}</h3>
                <div class="options">
                    ${question.options.map((option, optionIndex) => `
                        <div class="option" data-index="${optionIndex}">${option}</div>
                    `).join('')}
                </div>
            `;

            // El contenedor de opciones ya está creado en el HTML anterior

            questionContainer.appendChild(questionElement);
        });

        // Add event listeners to options
        document.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', selectOption);
        });

        updateButtons();
        updateProgressBar();

        // Aplicar formato de grid a las opciones si es necesario
        setupOptionsGrid();
    }

    // Select option
    function selectOption(e) {
        const selectedOption = e.target;
        const questionElement = selectedOption.closest('.question');
        const options = questionElement.querySelectorAll('.option');

        // Remove selected class from all options
        options.forEach(option => option.classList.remove('selected'));

        // Add selected class to clicked option
        selectedOption.classList.add('selected');

        // Save answer
        const questionIndex = Array.from(questionContainer.children).indexOf(questionElement);
        const optionIndex = parseInt(selectedOption.dataset.index);
        window.answers[questions[questionIndex].key] = {
            value: questions[questionIndex].options[optionIndex],
            index: optionIndex
        };

        console.log('Guardando respuesta:', questions[questionIndex].key, window.answers[questions[questionIndex].key]);

        // Check if this is the location question and they can't attend
        // Nota: La clave puede ser 'location' o 'canAttend' dependiendo del cliente
        if ((questions[questionIndex].key === 'location' || questions[questionIndex].key === 'canAttend') && optionIndex === 1) {
            // Hide the question container and buttons
            questionContainer.style.display = 'none';
            document.querySelector('.buttons').style.display = 'none';

            // Show the location error message
            locationError.style.display = 'flex';
            return;
        }

        // Enable next button if it was disabled
        nextButton.disabled = false;

        // Hide validation message if it exists
        const validationMsg = questionElement.querySelector('.validation-message');
        if (validationMsg) {
            validationMsg.style.display = 'none';
        }

        // Remove any highlight from options
        options.forEach(option => {
            option.style.boxShadow = '';
        });
    }

    // Navigate to next question
    function nextQuestion() {
        // If current question has no answer, show validation message
        if (!window.answers[questions[currentQuestionIndex].key]) {
            // Check if validation message already exists
            const currentQuestion = document.querySelectorAll('.question')[currentQuestionIndex];
            let validationMsg = currentQuestion.querySelector('.validation-message');

            // If no validation message exists, create one
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

                // Add shake animation
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                        20%, 40%, 60%, 80% { transform: translateX(5px); }
                    }
                `;
                document.head.appendChild(style);

                // Add to question
                currentQuestion.appendChild(validationMsg);
            } else {
                // If validation message exists, make it visible and animate it again
                validationMsg.style.display = 'block';
                validationMsg.style.animation = 'none';
                void validationMsg.offsetWidth; // Trigger reflow
                validationMsg.style.animation = 'shake 0.5s';
            }

            // Highlight options to draw attention
            const options = currentQuestion.querySelectorAll('.option');
            options.forEach(option => {
                option.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.5)';
                setTimeout(() => {
                    option.style.boxShadow = '';
                }, 1000);
            });

            return;
        }

        // If last question, show results
        if (currentQuestionIndex === questions.length - 1) {
            showResults();
            return;
        }

        // Hide current question and show next
        document.querySelectorAll('.question')[currentQuestionIndex].classList.remove('active');
        currentQuestionIndex++;
        document.querySelectorAll('.question')[currentQuestionIndex].classList.add('active');

        // Tracking: Paso del cuestionario (Paso 2 en adelante)
        if (typeof fbq !== 'undefined') {
            const currentQuestion = questions[currentQuestionIndex];
            // El número de paso para el evento es currentQuestionIndex + 2 porque:
            // Paso 1 es el inicio del quiz
            // Paso 2 es la primera pregunta, etc.
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

        // Aplicar formato de grid a las opciones si es necesario
        setTimeout(setupOptionsGrid, 100);
    }

    // Navigate to previous question
    function prevQuestion() {
        if (currentQuestionIndex === 0) return;

        document.querySelectorAll('.question')[currentQuestionIndex].classList.remove('active');
        currentQuestionIndex--;
        document.querySelectorAll('.question')[currentQuestionIndex].classList.add('active');

        updateButtons();
        updateProgressBar();

        // Aplicar formato de grid a las opciones si es necesario
        setTimeout(setupOptionsGrid, 100);
    }

    // Update navigation buttons
    function updateButtons() {
        const buttonsContainer = document.querySelector('.buttons');

        // Mostrar u ocultar el botón anterior
        if (currentQuestionIndex === 0) {
            prevButton.style.display = 'none';
            // Quitar la clase two-buttons para centrar el botón siguiente
            buttonsContainer.classList.remove('two-buttons');
        } else {
            prevButton.style.display = 'block';
            // Añadir la clase two-buttons para distribuir los botones
            buttonsContainer.classList.add('two-buttons');
        }

        // Actualizar el texto del botón siguiente
        if (currentQuestionIndex === questions.length - 1) {
            nextButton.textContent = 'FINALIZAR →';
        } else {
            nextButton.textContent = 'Continuar →';
        }

        // No longer disable the next button - we'll show validation message instead
        // nextButton.disabled = !window.answers[questions[currentQuestionIndex].key];
        nextButton.disabled = false; // Always enable the button so we can show validation message
    }

    // Update progress bar
    function updateProgressBar() {
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    // Cargar dinámicamente los precios según el procedimiento seleccionado
    function loadPrices() {
        console.log('Cargando precios dinámicamente...');

        // Verificar si tenemos configuración de tratamientos
        if (!CONFIG || !CONFIG.treatments || CONFIG.treatments.length === 0) {
            console.log('No hay tratamientos configurados');
            return;
        }

        // Obtener el contenedor de precios
        const priceGrid = document.getElementById('price-grid');
        if (!priceGrid) {
            console.log('No se encontró el contenedor de precios');
            return;
        }

        // Limpiar el contenedor de precios
        priceGrid.innerHTML = '';

        // Verificar qué procedimiento seleccionó el usuario
        const selectedProcedure = window.answers.procedure ? window.answers.procedure.value : '';
        console.log('Procedimiento seleccionado:', selectedProcedure);

        // Normalizar el nombre del procedimiento para comparaciones más precisas
        const normalizedProcedure = selectedProcedure.trim();

        // Determinar si debemos mostrar todos los tratamientos o solo el seleccionado
        const showAllTreatments =
            !normalizedProcedure ||
            normalizedProcedure.includes('Otro procedimiento') ||
            normalizedProcedure.includes('no quirúrgicos') ||
            normalizedProcedure.includes('estéticos');

        console.log('Mostrar todos los tratamientos:', showAllTreatments);

        // Actualizar el título de la sección de precios
        const pricingTitle = document.querySelector('.pricing-info h3');
        if (pricingTitle) {
            // Siempre usar el mismo título, independientemente del procedimiento seleccionado
            pricingTitle.textContent = 'Precio de Referencia';
        }

        // Siempre mostrar la consulta de evaluación
        const evaluationCard = document.createElement('div');
        evaluationCard.className = 'price-card';
        evaluationCard.innerHTML = `
            <div class="price-title">Consulta de Evaluación</div>
            <div class="price-amount">$50.000</div>
            <div class="price-note">Pago anticipado obligatorio de $25.000 para confirmar</div>
        `;
        priceGrid.appendChild(evaluationCard);

        // Filtrar los tratamientos según la selección del usuario
        let treatmentsToShow = [];

        if (showAllTreatments) {
            // Mostrar todos los tratamientos excepto la consulta de evaluación
            treatmentsToShow = CONFIG.treatments.filter(treatment =>
                !treatment.name.toLowerCase().includes('evaluación') &&
                !treatment.name.toLowerCase().includes('evaluacion') &&
                !treatment.name.toLowerCase().includes('valoración') &&
                !treatment.name.toLowerCase().includes('valoracion'));
        } else {
            // Mostrar solo el tratamiento seleccionado
            const procedureLower = normalizedProcedure.toLowerCase().trim();

            if (procedureLower.includes('lipoescultura') || procedureLower.includes('lipoabdominoplastia') || procedureLower.includes('contorno corporal')) {
                // If they picked the general surgery option, show all related to it
                treatmentsToShow = CONFIG.treatments.filter(treatment =>
                    (treatment.name.toLowerCase().includes('lipo') || treatment.name.toLowerCase().includes('contorno')) &&
                    !treatment.name.toLowerCase().includes('evaluación') &&
                    !treatment.name.toLowerCase().includes('evaluacion') &&
                    !treatment.name.toLowerCase().includes('valoración') &&
                    !treatment.name.toLowerCase().includes('valoracion'));
            } else if (procedureLower.includes('rinoplastia') || procedureLower.includes('rinoplastía')) {
                // If they picked rhinoplasty
                treatmentsToShow = CONFIG.treatments.filter(treatment =>
                    (treatment.name.toLowerCase().includes('rino')) &&
                    !treatment.name.toLowerCase().includes('evaluación') &&
                    !treatment.name.toLowerCase().includes('evaluacion') &&
                    !treatment.name.toLowerCase().includes('valoración') &&
                    !treatment.name.toLowerCase().includes('valoracion'));
            } else {
                // Para otros procedimientos, buscar coincidencias parciales
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

        // Crear tarjetas de precio para cada tratamiento
        treatmentsToShow.forEach(treatment => {
            const priceCard = document.createElement('div');
            priceCard.className = 'price-card';

            const priceTitle = document.createElement('div');
            priceTitle.className = 'price-title';
            priceTitle.textContent = treatment.name;

            const priceAmount = document.createElement('div');
            priceAmount.className = 'price-amount';

            // Determinar el texto del precio
            if (treatment.priceFormat === 'text' && treatment.initialPrice) {
                // If the price is meant to be a text string (e.g. ranges, or "A evaluar")
                let textPrice = treatment.initialPrice;
                if (treatment.currency) {
                    textPrice = treatment.currency + " " + textPrice;
                }
                priceAmount.textContent = textPrice;
            } else if (treatment.initialPrice) {
                // If it's a number
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

    // Función para modificar la visualización de opciones en dos columnas
    function setupOptionsGrid() {
        // Buscar preguntas específicas que necesitan mostrar opciones en dos columnas
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

        // Aplicar el estilo de grid a las opciones de peso y altura
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

        // Aplicar el estilo de grid a las opciones de precio
        if (priceQuestion) {
            const optionsContainer = priceQuestion.querySelector('.options');
            if (optionsContainer) {
                optionsContainer.classList.add('options-grid');
                console.log('Aplicando grid a opciones de precio');
            }
        }
    }

    // Show results
    function showResults() {
        // Fade out quiz container
        quizContainer.style.opacity = '0';

        // Tracking: Finalización del cuestionario
        if (typeof fbq !== 'undefined') {
            // El número de paso para este evento es questions.length + 2 porque:
            // Paso 1 es el inicio del quiz
            // Pasos 2 a questions.length+1 son las preguntas
            // El siguiente paso es la finalización
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

            // Llamar a la función showResultsAndLoadData para mostrar los resultados y precargar los datos de disponibilidad
            showResultsAndLoadData();

            // Cargar los precios dinámicamente según el procedimiento seleccionado
            loadPrices();

            // Determine qualification
            const qualified = determineQualification();

            if (qualified) {
                // Usar el mensaje de la configuración si está disponible
                if (CONFIG && CONFIG.landingPage && CONFIG.landingPage.priceNote) {
                    qualificationResult.textContent = 'Podrías ser candidato. Para comprobarlo, solicita una cita de evaluación.';
                } else {
                    // Fallback por si no hay configuración
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

    // Mostrar resultados y precargar datos de disponibilidad
    function showResultsAndLoadData() {
        console.log('%c=== MOSTRANDO RESULTADOS Y PRECARGANDO DATOS ===', 'background: #2ecc71; color: white; padding: 5px; border-radius: 5px;');

        // Mostrar el contenedor de resultados
        resultsContainer.style.display = 'flex';
        resultsContainer.style.opacity = '1';

        // La personalización del título de la sección de precios ahora se maneja en la generación de precios

        // Precargar los datos de disponibilidad en segundo plano
        console.log('Precargando datos de disponibilidad en segundo plano...');

        // Mostrar un indicador de carga sutil (opcional)
        const appointmentBtn = document.getElementById('appointment-button');
        if (appointmentBtn) {
            const originalText = appointmentBtn.textContent || 'Ver disponibilidad';
            appointmentBtn.innerHTML = `${originalText} <span class="preloading-indicator" style="font-size: 8px; margin-left: 5px;">⟳</span>`;

            // Agregar animación de rotación al indicador
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

        // Cargar los datos de disponibilidad sin mostrar alertas (false) solo si no se han cargado previamente
        if (!availabilityDataLoaded) {
            loadAvailabilityData(false)
                .then(success => {
                    console.log('Precarga de datos de disponibilidad completada:', success ? 'exitosa' : 'fallida');

                    // Actualizar el estado de carga
                    availabilityDataLoaded = success;

                    // Quitar el indicador de carga
                    if (appointmentBtn) {
                        const preloadingIndicator = appointmentBtn.querySelector('.preloading-indicator');
                        if (preloadingIndicator) {
                            preloadingIndicator.remove();
                        }
                    }
                })
                .catch(error => {
                    console.error('Error en la precarga de datos de disponibilidad:', error);
                    // No mostrar alerta al usuario ya que es una carga en segundo plano

                    // Quitar el indicador de carga
                    if (appointmentBtn) {
                        const preloadingIndicator = appointmentBtn.querySelector('.preloading-indicator');
                        if (preloadingIndicator) {
                            preloadingIndicator.remove();
                        }
                    }
                });
        } else {
            console.log('Datos de disponibilidad ya precargados.');
            // Quitar el indicador de carga si ya estaba presente (aunque no debería estarlo si ya cargó)
            if (appointmentBtn) {
                const preloadingIndicator = appointmentBtn.querySelector('.preloading-indicator');
                if (preloadingIndicator) {
                    preloadingIndicator.remove();
                }
            }
        }
    }

    // Determine if user qualifies
    function determineQualification() {
        // Must be able to attend the clinic - this is a disqualification criteria
        // Nota: La clave puede ser 'location' o 'canAttend' dependiendo del cliente
        const locationKey = answers.location ? 'location' : 'canAttend';
        if (!answers[locationKey] || answers[locationKey].index !== 0) {
            return false;
        }

        // Si el usuario no tiene dientes desalineados ni problemas de mordida, y sus dientes están bien alineados,
        // probablemente no necesite ortodoncia
        if (answers.alignment && answers.alignment.index === 2 &&
            answers.bite && answers.bite.index === 2) {
            // Pero aún así, califica para una consulta de valoración
            // ya que podría haber otros factores que el ortodoncista necesite evaluar
            return true;
        }

        // Todos los demás usuarios califican para una consulta
        return true;
    }

    // Event listeners
    startQuizButton.addEventListener('click', () => {
        // Fade out landing content
        landingContent.style.opacity = '0';

        // Tracking: Inicio del cuestionario (Paso 1)
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

            // Fade in quiz container
            setTimeout(() => {
                quizContainer.style.opacity = '1';
                initQuiz();
            }, 50);
        }, 300);
    });

    // Inicializar el cuestionario automáticamente al cargar la página
    // ya que estamos saltando la pantalla inicial
    initQuiz();
    updateButtons();
    updateProgressBar();

    // Configurar las opciones en formato de grid para peso y altura
    setTimeout(setupOptionsGrid, 500); // Esperar a que el DOM esté completamente cargado

    // Inicializar el mensaje de estado del botón
    const buttonStatusMessage = document.getElementById('button-status-message');
    if (buttonStatusMessage) {
        buttonStatusMessage.textContent = 'Verifica tu número de WhatsApp para continuar';
        buttonStatusMessage.className = 'button-status-message';
    }

    // Deshabilitar el botón de confirmación por defecto
    const confirmButton = document.getElementById('confirm-button');
    if (confirmButton) {
        confirmButton.disabled = true;
    }

    // Tracking: Inicio del cuestionario (Paso 1)
    if (typeof fbq !== 'undefined') {
        console.log('Tracking: Paso1_InicioQuiz');
        fbq('trackCustom', 'Paso1_InicioQuiz', {
            event_category: 'Quiz',
            event_label: 'Inicio del cuestionario'
        });
    }

    nextButton.addEventListener('click', nextQuestion);
    prevButton.addEventListener('click', prevQuestion);

    // Handle restart button click
    restartQuizButton.addEventListener('click', () => {
        // Reset the quiz
        locationError.style.display = 'none';
        questionContainer.style.display = 'block';
        document.querySelector('.buttons').style.display = 'flex';

        // Reset answers and current question
        Object.keys(answers).forEach(key => delete answers[key]);

        // Volver a la primera pregunta (selección de procedimiento)
        document.querySelectorAll('.question').forEach((question, index) => {
            if (index === 0) {
                question.classList.add('active');
            } else {
                question.classList.remove('active');
            }
        });

        currentQuestionIndex = 0;

        // Actualizar botones y barra de progreso
        updateButtons();
        updateProgressBar();
    });

    // Handle appointment button click
    appointmentButton.addEventListener('click', () => {
        // Fade out results container
        resultsContainer.style.opacity = '0';

        // Tracking: Inicio del formulario de cita
        if (typeof fbq !== 'undefined') {
            // El número de paso para este evento es questions.length + 3 porque:
            // Paso 1 es el inicio del quiz
            // Pasos 2 a questions.length+1 son las preguntas
            // Paso questions.length+2 es la finalización del cuestionario
            // El siguiente paso es el inicio del formulario
            const pasoNum = questions.length + 3;
            const eventName = `Paso${pasoNum}_InicioFormulario`;

            console.log(`Tracking: ${eventName}`);
            fbq('trackCustom', eventName, {
                event_category: 'Form',
                event_label: 'Inicio del formulario de cita',
                qualified: determineQualification()
            });
        }

        // Mostrar un indicador de carga mientras se obtienen las fechas disponibles
        appointmentButton.disabled = true;
        appointmentButton.innerHTML = '<span class="loading-spinner"></span> Consultando agenda de la Dra. Bossi...';

        // Primero ocultar el contenedor de resultados
        resultsContainer.style.opacity = '0';

        setTimeout(() => {
            // Ocultar completamente el contenedor de resultados
            resultsContainer.style.display = 'none';

            // Mostrar el formulario inmediatamente
            formContainer.style.display = 'flex';
            formContainer.style.opacity = '1';

            // Mostrar los mensajes de carga en las secciones de fechas y horas
            const dateGrid = document.getElementById('date-grid');
            const timeGrid = document.getElementById('time-grid');
            const loadingDates = document.getElementById('loading-dates');
            const loadingTimes = document.getElementById('loading-times');

            if (dateGrid) dateGrid.style.display = 'none';
            if (timeGrid) timeGrid.style.display = 'none';
            if (loadingDates) loadingDates.style.display = 'flex';
            if (loadingTimes) loadingTimes.style.display = 'flex';

            // Cargar las fechas disponibles desde el webhook solo si no se han cargado previamente
            // Pasar true para mostrar alertas cuando el usuario hace clic en "Ver disponibilidad"
            if (!availabilityDataLoaded) {
                loadAvailabilityData(true).then(success => {
                    // Restaurar el botón a su estado original
                    appointmentButton.disabled = false;
                    appointmentButton.innerHTML = 'Ver disponibilidad';

                    if (!success) {
                        // Si hubo un error al cargar las fechas, mostrar un mensaje
                        alert('Hubo un problema al cargar las fechas disponibles. Por favor, intenta nuevamente.');
                        // Volver a la pantalla anterior
                        formContainer.style.opacity = '0';
                        setTimeout(() => {
                            formContainer.style.display = 'none';
                            resultsContainer.style.display = 'flex';
                            setTimeout(() => {
                                resultsContainer.style.opacity = '1';
                            }, 50);
                        }, 300);
                    } else {
                        // Actualizar el estado de carga
                        availabilityDataLoaded = true;
                        // Load dates and times into the form
                        loadAvailableDates();
                    }
                });
            } else {
                console.log('Datos de disponibilidad ya precargados. Mostrando formulario.');
                // If data was already loaded, just show the grids and hide the loaders
                if (dateGrid) dateGrid.style.display = 'grid';
                if (timeGrid) timeGrid.style.display = 'grid';
                if (loadingDates) loadingDates.style.display = 'none';
                if (loadingTimes) loadingTimes.style.display = 'none';

                // Restore the button to its original state
                appointmentButton.disabled = false;
                appointmentButton.innerHTML = 'Ver disponibilidad';

                // Load dates and times into the form
                loadAvailableDates();
            }
        }, 300);
    });

    // Variables globales para almacenar los datos de disponibilidad y rastrear si ya se han cargado
    let availabilityData = null;
    let availabilityDataLoaded = false;

    // URL del webhook para obtener fechas y horarios disponibles
    const availabilityWebhookUrl = CONFIG && CONFIG.webhooks ? CONFIG.webhooks.availability : 'https://sswebhookss.odontolab.co/webhook/f424d581-8261-4141-bcd6-4b021cf61d39';

    // Cargar fechas y horarios disponibles desde el webhook
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

            // Procesar la respuesta según su formato
            if (Array.isArray(responseData)) {
                console.log('La respuesta es un array.');
                if (responseData.length > 0) {
                    console.log('Extrayendo datos del array...');

                    // Formato nuevo: turnos array
                    if (responseData[0].turnos && Array.isArray(responseData[0].turnos)) {
                        console.log('Formato detectado: array con propiedad turnos');
                        availabilityData = {};
                        responseData[0].turnos.forEach(turno => {
                            if (!availabilityData[turno.fecha]) {
                                availabilityData[turno.fecha] = [];
                            }
                            // Insertar la hora_inicio
                            availabilityData[turno.fecha].push(turno.hora_inicio);
                        });
                    }
                    // Verificar si cada elemento tiene fecha y horas
                    else if (responseData[0].fecha && Array.isArray(responseData[0].horas)) {
                        console.log('Formato detectado: array de objetos con fecha y horas');
                        // Convertir el array de objetos a un objeto con fechas como claves
                        availabilityData = {};
                        responseData.forEach(item => {
                            if (item.fecha && Array.isArray(item.horas)) {
                                availabilityData[item.fecha] = item.horas;
                            }
                        });
                    } else {
                        // Si el primer elemento es un objeto pero no tiene el formato esperado
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

            // Cargar las fechas disponibles en el selector
            loadAvailableDates();

            // Limpiar el grid de horas (se cargará cuando se seleccione una fecha)
            const timeGrid = document.getElementById('time-grid');
            if (timeGrid) {
                timeGrid.innerHTML = '';
            }

            // Resetear el input de hora
            const timeInput = document.getElementById('preferred-time');
            if (timeInput) {
                timeInput.value = '';
            }

            // Resetear el texto de resumen
            const timeDisplay = document.getElementById('selected-time-display');
            if (timeDisplay) {
                timeDisplay.textContent = 'Selecciona una hora';
            }

            return true;
        } catch (error) {
            console.error('Error al cargar datos de disponibilidad:', error);
            // Solo mostrar alerta si se solicita explícitamente (no en carga en segundo plano)
            if (showAlerts) {
                alert('Hubo un problema al cargar las fechas disponibles. Por favor, intenta nuevamente.');
            }
            return false;
            console.log('loadAvailableDates() called');
        }
    }

    // Cargar fechas disponibles en el selector
    function loadAvailableDates() {
        console.log('%c=== CARGANDO FECHAS DISPONIBLES ===', 'background: #e74c3c; color: white; padding: 5px; border-radius: 5px;');
        console.log('loadAvailableDates() called');
        const dateInput = document.getElementById('preferred-date');
        const dateGrid = document.getElementById('date-grid');
        const loadingDates = document.getElementById('loading-dates');
        console.log('Input de fechas encontrado:', dateInput ? 'Sí' : 'No');
        console.log('Grid de fechas encontrado:', dateGrid ? 'Sí' : 'No');

        // Limpiar el grid de fechas
        console.log('Limpiando grid de fechas...');
        dateGrid.innerHTML = '';

        if (!availabilityData) {
            console.error('No hay datos de disponibilidad para cargar fechas');
            return;
        }

        console.log('Datos de disponibilidad para fechas:', availabilityData);
        console.log('Tipo de datos:', typeof availabilityData);

        // Obtener las fechas disponibles (claves del objeto)
        const availableDates = Object.keys(availabilityData);
        console.log('Fechas disponibles:', availableDates);
        console.log('Número de fechas:', availableDates.length);
        console.log('Fechas disponibles:', availableDates);

        // Ordenar las fechas (opcional, dependiendo de cómo venga el JSON)
        // Hacemos la ordenación más robusta para manejar diferentes formatos
        try {
            availableDates.sort((a, b) => {
                try {
                    // Intentar extraer el día del mes de cada fecha
                    const dayMatchA = a.match(/\d+/);
                    const dayMatchB = b.match(/\d+/);

                    if (!dayMatchA || !dayMatchB) {
                        // Si no podemos extraer los días, devolver 0 (sin cambios en el orden)
                        console.log('No se pudieron extraer los días de las fechas:', a, b);
                        return 0;
                    }

                    const dayA = parseInt(dayMatchA[0]);
                    const dayB = parseInt(dayMatchB[0]);

                    // Intentar extraer el mes de cada fecha
                    const partsA = a.split(' de ');
                    const partsB = b.split(' de ');

                    if (partsA.length < 2 || partsB.length < 2) {
                        // Si no podemos extraer los meses, comparar solo por día
                        console.log('No se pudieron extraer los meses de las fechas:', a, b);
                        return dayA - dayB;
                    }

                    const monthA = partsA[1];
                    const monthB = partsB[1];

                    // Mapeo de nombres de meses a números
                    const monthMap = {
                        'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4, 'Mayo': 5, 'Junio': 6,
                        'Julio': 7, 'Agosto': 8, 'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12
                    };

                    // Comparar primero por mes, luego por día
                    if (monthMap[monthA] !== undefined && monthMap[monthB] !== undefined && monthMap[monthA] !== monthMap[monthB]) {
                        return monthMap[monthA] - monthMap[monthB];
                    }
                    return dayA - dayB;
                } catch (err) {
                    console.error('Error al comparar fechas:', err, a, b);
                    return 0; // En caso de error, no cambiar el orden
                }
            });
        } catch (err) {
            console.error('Error al ordenar fechas:', err);
            // Continuar sin ordenar
        }

        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

        // Añadir cada fecha al grid
        availableDates.forEach(date => {
            // Verificar que la fecha tenga horarios disponibles
            if (availabilityData[date] && availabilityData[date].length > 0) {
                // Formatear la fecha a estilo "Lunes 24/2/2026"
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
                dateOption.dataset.value = date; // Guardar el valor en un atributo data
                dateOption.dataset.formatted = formattedDate; // Guardar versión formateada
                dateOption.textContent = formattedDate;

                // Agregar evento click para seleccionar la fecha
                dateOption.addEventListener('click', function () {
                    // Quitar la clase selected de todas las fechas
                    document.querySelectorAll('.date-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });

                    // Agregar la clase selected a la fecha seleccionada
                    this.classList.add('selected');

                    // Actualizar el input hidden con el valor seleccionado
                    dateInput.value = this.dataset.value;

                    // Actualizar el texto de resumen
                    document.getElementById('selected-date-display').textContent = this.dataset.formatted;

                    // Cargar las horas disponibles para esta fecha
                    loadAvailableHours();

                    // Hacer scroll hacia la sección de horas y el botón de continuar
                    setTimeout(() => {
                        // Obtener la sección de horas
                        const timeSection = document.querySelector('.selector-section:nth-child(2)');
                        if (timeSection) {
                            console.log('Haciendo scroll a la sección de horas');
                            // Scroll suave hacia la sección de horas
                            timeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        } else {
                            // Si no se encuentra la sección de horas, intentar con el botón de continuar
                            const continueButton = document.getElementById('next-step-button');
                            if (continueButton) {
                                console.log('Haciendo scroll al botón de continuar');
                                // Scroll suave hacia el botón de continuar
                                continueButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }
                    }, 300); // Pequeño retraso para asegurar que las horas se hayan cargado
                });

                dateGrid.appendChild(dateOption);
            }
        });

        // Ocultar el mensaje de carga y mostrar las fechas
        if (loadingDates) loadingDates.style.display = 'none';
        if (dateGrid) dateGrid.style.display = 'grid';

        console.log('Fechas cargadas en el grid');
    }

    // Cargar horas disponibles para la fecha seleccionada
    function loadAvailableHours() {
        console.log('%c=== CARGANDO HORAS DISPONIBLES ===', 'background: #9b59b6; color: white; padding: 5px; border-radius: 5px;');
        const dateInput = document.getElementById('preferred-date');
        const timeInput = document.getElementById('preferred-time');
        const timeGrid = document.getElementById('time-grid');
        const loadingTimes = document.getElementById('loading-times');
        console.log('Input de fechas encontrado:', dateInput ? 'Sí' : 'No');
        console.log('Input de horas encontrado:', timeInput ? 'Sí' : 'No');
        console.log('Grid de horas encontrado:', timeGrid ? 'Sí' : 'No');

        // Mostrar el mensaje de carga y ocultar el grid de horas
        if (loadingTimes) loadingTimes.style.display = 'flex';
        if (timeGrid) timeGrid.style.display = 'none';

        // Limpiar el grid de horas
        console.log('Limpiando grid de horas...');
        timeGrid.innerHTML = '';

        // Resetear el input de hora y el texto de resumen
        timeInput.value = '';
        document.getElementById('selected-time-display').textContent = 'Selecciona una hora';

        // Obtener la fecha seleccionada
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

        // Obtener los horarios disponibles para la fecha seleccionada
        let availableTimes = availabilityData[selectedDate];
        console.log('%cHorarios disponibles para', 'color: #f39c12; font-weight: bold;', selectedDate, ':', availableTimes);
        console.log('Tipo de datos de horarios:', typeof availableTimes);
        console.log('¿Es un array?', Array.isArray(availableTimes));
        console.log('Longitud/tamaño:', Array.isArray(availableTimes) ? availableTimes.length : 'N/A');

        // Asegurarse de que availableTimes sea un array
        if (!Array.isArray(availableTimes)) {
            console.error('Los horarios disponibles no son un array:', availableTimes);
            console.log('Intentando convertir a array...');
            // Intentar convertir a array si es posible
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

        // Ordenar los horarios si es un array
        if (Array.isArray(availableTimes) && availableTimes.length > 0) {
            try {
                availableTimes.sort((a, b) => {
                    try {
                        // Verificar si los horarios tienen el formato esperado (HH:MM)
                        const timeRegex = /^\d{1,2}:\d{2}(\s*(hs|hrs|am|pm))?$/i;

                        // Si alguno de los horarios no tiene el formato esperado, no cambiar el orden
                        if (!timeRegex.test(a) || !timeRegex.test(b)) {
                            console.log('Formato de hora no reconocido:', a, b);
                            return 0;
                        }

                        // Extraer horas y minutos
                        const getMinutes = (timeStr) => {
                            // Eliminar cualquier texto adicional (hs, hrs, etc.)
                            const cleanTime = timeStr.replace(/\s*(hs|hrs|h)\b/i, '');

                            // Verificar si es formato 12h (am/pm)
                            if (/am|pm/i.test(cleanTime)) {
                                const isPM = /pm/i.test(cleanTime);
                                const timePart = cleanTime.replace(/\s*(am|pm)\b/i, '');
                                let [hours, minutes] = timePart.split(':').map(Number);

                                // Convertir a formato 24h
                                if (isPM && hours < 12) hours += 12;
                                if (!isPM && hours === 12) hours = 0;

                                return hours * 60 + minutes;
                            } else {
                                // Formato 24h
                                const [hours, minutes] = cleanTime.split(':').map(Number);
                                return hours * 60 + minutes;
                            }
                        };

                        return getMinutes(a) - getMinutes(b);
                    } catch (err) {
                        console.error('Error al comparar horarios:', err, a, b);
                        return 0; // En caso de error, no cambiar el orden
                    }
                });
            } catch (err) {
                console.error('Error al ordenar horarios:', err);
                // Continuar sin ordenar
            }
        }

        // Añadir cada horario al grid
        if (Array.isArray(availableTimes)) {
            availableTimes.forEach(time => {
                // Formatear la hora para mostrar
                let formattedTime = time;

                try {
                    // Verificar si ya tiene formato (hs, hrs, am, pm)
                    if (/\s*(hs|hrs|h|am|pm)\b/i.test(time)) {
                        // Ya tiene un formato, usarlo directamente
                        formattedTime = time;
                    } else {
                        // Intentar convertir de 24h a 12h con AM/PM
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
                    // Usar el valor original en caso de error
                    formattedTime = time;
                }

                const timeOption = document.createElement('div');
                timeOption.className = 'time-option';
                timeOption.dataset.value = time; // Guardar el valor en formato 24h
                timeOption.textContent = formattedTime; // Mostrar en formato 12h

                // Agregar evento click para seleccionar la hora
                timeOption.addEventListener('click', function () {
                    // Quitar la clase selected de todas las horas
                    document.querySelectorAll('.time-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });

                    // Agregar la clase selected a la hora seleccionada
                    this.classList.add('selected');

                    // Actualizar el input hidden con el valor seleccionado
                    timeInput.value = this.dataset.value;

                    // Actualizar el texto de resumen
                    document.getElementById('selected-time-display').textContent = this.textContent;

                    // Hacer scroll hacia el botón de continuar
                    setTimeout(() => {
                        // Intentar encontrar el botón de continuar
                        const continueButton = document.getElementById('next-step-button');
                        if (continueButton) {
                            console.log('Haciendo scroll al botón de continuar después de seleccionar hora');
                            // Scroll suave hacia el botón de continuar
                            continueButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        } else {
                            // Si no se encuentra el botón, intentar con la sección de resumen
                            const summarySection = document.querySelector('.selection-summary');
                            if (summarySection) {
                                console.log('Haciendo scroll a la sección de resumen');
                                summarySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }
                    }, 100); // Retraso corto para asegurar que todo se ha renderizado correctamente
                });

                timeGrid.appendChild(timeOption);
            });

            // Ocultar el mensaje de carga y mostrar las horas
            if (loadingTimes) loadingTimes.style.display = 'none';
            if (timeGrid) timeGrid.style.display = 'grid';

            console.log('Horarios cargados en el grid');

            // Hacer scroll hacia el botón de continuar
            setTimeout(() => {
                // Intentar encontrar el botón de continuar
                const continueButton = document.getElementById('next-step-button');
                if (continueButton) {
                    console.log('Haciendo scroll al botón de continuar después de cargar horas');
                    // Scroll suave hacia el botón de continuar
                    continueButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    // Si no se encuentra el botón, intentar con la sección de resumen
                    const summarySection = document.querySelector('.selection-summary');
                    if (summarySection) {
                        console.log('Haciendo scroll a la sección de resumen');
                        summarySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }, 500); // Retraso para asegurar que todo se ha renderizado correctamente
        } else {
            console.error('No se pudieron cargar los horarios porque no es un array');

            // Mostrar un mensaje de error en lugar del spinner
            if (loadingTimes) {
                loadingTimes.innerHTML = '<p>No hay horarios disponibles para esta fecha. Por favor, selecciona otra fecha.</p>';
            }
        }
    }

    // Iniciar la carga de datos de disponibilidad cuando se muestra el paso de precios de referencia
    function showResultsAndLoadData() {
        // Mostrar el contenedor de resultados primero
        resultsContainer.style.display = 'flex';
        setTimeout(() => {
            resultsContainer.style.opacity = '1';

            // Iniciar la carga de datos de disponibilidad en segundo plano DESPUÉS de mostrar la página
            // Usamos un timeout para asegurar que la UI se ha renderizado completamente
            setTimeout(() => {
                if (!availabilityDataLoaded) {
                    console.log('Precargando datos de disponibilidad en segundo plano...');
                    // Pasar false para no mostrar alertas en la carga en segundo plano
                    loadAvailabilityData(false).then(success => {
                        availabilityDataLoaded = true;
                    });
                }
            }, 500); // Esperar 500ms para asegurar que la UI se ha renderizado
        }, 50);
    }

    // Ya no cargamos las fechas al iniciar, sino cuando el usuario hace clic en "Ver disponibilidad" o cuando se muestra el paso de precios

    // Obtener referencia al campo de WhatsApp
    const whatsappField = document.getElementById('whatsapp');

    // Precargar el campo con "521" pero permitir que el usuario lo borre si lo desea
    if (whatsappField.value === '') {
        whatsappField.value = '521';
    }

    // WhatsApp validation
    const whatsappInput = whatsappField; // Usar la misma referencia
    const whatsappValidation = document.getElementById('whatsapp-validation');

    // Validar el número de WhatsApp en tiempo real
    whatsappInput.addEventListener('input', function () {
        // Limpiar el mensaje de validación cuando el usuario escribe
        whatsappValidation.textContent = '';
        whatsappValidation.className = 'validation-message';

        // Deshabilitar el botón de finalizar mientras se está escribiendo
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

    // Validar el número de WhatsApp cuando el usuario termina de escribir
    whatsappInput.addEventListener('blur', function () {
        const whatsappNumber = this.value.trim();

        // Si el campo está vacío, no validar
        if (!whatsappNumber) {
            return;
        }

        // Eliminar todos los caracteres no numéricos para la validación
        const digitsOnly = whatsappNumber.replace(/\D/g, '');

        // Validación básica de formato
        if (digitsOnly.length < 10 || digitsOnly.length > 15) {
            whatsappValidation.textContent = 'Ingresa un número válido (al menos 10 dígitos)';
            whatsappValidation.className = 'validation-message error';
            return;
        }

        // Mostrar mensaje de verificación
        whatsappValidation.textContent = 'Verificando número...';
        whatsappValidation.className = 'validation-message';

        // Recopilar respuestas del cuestionario en formato legible
        let respuestasFormateadas = '';
        let respuestasDetalladas = {};

        if (window.questions && window.questions.length > 0) {
            window.questions.forEach(question => {
                if (window.answers[question.key]) {
                    // Añadir al texto formateado para el webhook
                    respuestasFormateadas += `${question.question}: ${window.answers[question.key].value}\n`;
                    // Guardar respuesta detallada
                    respuestasDetalladas[question.key] = window.answers[question.key].value;
                }
            });
        }

        // Llamada al webhook para validar el número de WhatsApp
        const validationData = {
            whatsapp_check: digitsOnly,
            action: 'validate_whatsapp',
            origen: "Landing Dra. Constanza Bossi",
            landingUrl: window.location.href,
            respuestas: respuestasFormateadas,
            respuestas_detalladas: respuestasDetalladas
        };

        // Realizar la petición HTTP para validar el número
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
                        // El número existe en WhatsApp
                        whatsappValidation.textContent = 'Número de WhatsApp válido';
                        whatsappValidation.className = 'validation-message success';

                        // Actualizar el estado del botón y el mensaje
                        const finishButton = document.getElementById('finish-button');
                        const buttonStatusMessage = document.getElementById('button-status-message');
                        const paymentConfirmationCheckbox = document.getElementById('payment-confirmation-checkbox');
                        const checkboxChecked = paymentConfirmationCheckbox && paymentConfirmationCheckbox.checked;

                        if (finishButton) {
                            // Habilitar el botón solo si el WhatsApp es válido Y el checkbox está marcado
                            finishButton.disabled = !checkboxChecked;

                            if (!checkboxChecked) {
                                // Si el checkbox no está marcado, mostrar mensaje apropiado
                                if (buttonStatusMessage) {
                                    buttonStatusMessage.textContent = 'Debes confirmar que entiendes la política de pago';
                                    buttonStatusMessage.className = 'button-status-message';
                                }
                            } else {
                                // Si el checkbox está marcado y el WhatsApp es válido
                                if (buttonStatusMessage) {
                                    buttonStatusMessage.textContent = 'Todo listo para continuar';
                                    buttonStatusMessage.className = 'button-status-message success';
                                }
                            }
                        } else {
                            // Si no hay botón de finalizar, actualizar solo el mensaje de validación
                            if (buttonStatusMessage) {
                                buttonStatusMessage.textContent = 'Número de WhatsApp válido';
                                buttonStatusMessage.className = 'button-status-message success';
                            }
                        }
                    } else {
                        // El número no existe en WhatsApp
                        whatsappValidation.textContent = 'Este número no tiene WhatsApp activo';
                        whatsappValidation.className = 'validation-message error';

                        // Deshabilitar el botón y actualizar el mensaje
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
                    // Respuesta inesperada de la API
                    whatsappValidation.textContent = 'No se pudo verificar el número';
                    whatsappValidation.className = 'validation-message error';

                    // Deshabilitar el botón y actualizar el mensaje
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

                // Deshabilitar el botón y actualizar el mensaje
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

    // Handle review button click
    // Nota: Ya no necesitamos estas referencias porque usamos funciones globales
    console.log('DOM Elements cargados');

    // Función para mostrar la confirmación
    window.showConfirmation = function () {
        console.log('showConfirmation called');

        // Ya no es necesario validar el checkbox de pago anticipado porque se ha eliminado
        // El usuario ya está informado sobre el requisito de depósito a través del texto informativo

        // Validate WhatsApp number format (basic validation)
        const whatsappInput = document.getElementById('whatsapp');
        const whatsappNumber = whatsappInput.value.trim();
        if (!/^\d{10,15}$/.test(whatsappNumber)) {
            alert('Por favor ingresa un número de WhatsApp válido (10-15 dígitos sin espacios ni guiones, incluyendo el 52).');
            whatsappInput.focus();
            return;
        }

        // Ya no verificamos que el número comience con 521 para permitir números internacionales
        // No bloqueamos por la validación online de WhatsApp para evitar problemas

        // Get form values
        const fullname = document.getElementById('fullname').value;
        const whatsapp = whatsappInput.value;
        const preferredDate = document.getElementById('preferred-date').value;
        const preferredTime = document.getElementById('preferred-time').value;

        // Validate all fields are filled
        if (!fullname || !whatsapp || !preferredDate || !preferredTime) {
            alert('Por favor completa todos los campos del formulario.');
            return;
        }

        // Obtener el texto visible de la fecha seleccionada
        const dateOption = document.querySelector(`#preferred-date option[value="${preferredDate}"]`);
        const formattedDate = dateOption ? dateOption.textContent : preferredDate;

        // Fill summary data
        document.getElementById('summary-name').textContent = fullname;
        document.getElementById('summary-whatsapp').textContent = whatsapp;
        document.getElementById('summary-date').textContent = formattedDate;
        document.getElementById('summary-time').textContent = preferredTime;

        // Fill quiz answers
        const summaryAnswers = document.getElementById('summary-answers');
        if (summaryAnswers) {
            summaryAnswers.innerHTML = '';

            // Ocultar la sección de respuestas si no hay respuestas
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

        // Simplificamos la transición para evitar problemas
        console.log('Starting transition to confirmation step');

        // Ocultar paso 1 y mostrar paso 2 directamente
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

    // Manejar el clic en el botón de siguiente paso
    document.getElementById('next-step-button').addEventListener('click', () => {
        console.log('Next step button clicked');

        // Validar que se hayan seleccionado fecha y hora
        const preferredDate = document.getElementById('preferred-date').value;
        const preferredTime = document.getElementById('preferred-time').value;

        if (!preferredDate || !preferredTime) {
            alert('Por favor selecciona una fecha y hora disponible.');
            return;
        }

        // Tracking: Selección de fecha y hora
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

        // Actualizar el texto del checkbox de confirmación de pago con la fecha y hora seleccionadas
        const paymentDateTimeElement = document.getElementById('payment-date-time');
        if (paymentDateTimeElement) {
            // Obtener el texto visible de la fecha seleccionada
            const selectedDateDisplay = document.getElementById('selected-date-display').textContent;
            const selectedTimeDisplay = document.getElementById('selected-time-display').textContent;
            paymentDateTimeElement.textContent = `${selectedDateDisplay} a las ${selectedTimeDisplay}`;
        }

        // Mostrar el paso 2 (datos personales)
        document.getElementById('form-step-1').style.display = 'none';
        document.getElementById('form-step-2').style.display = 'block';

        // Hacer scroll hacia arriba para que el usuario vea el inicio del formulario
        // Función mejorada para asegurar que el scroll funcione en todos los dispositivos
        const scrollToTop = () => {
            console.log('Ejecutando scrollToTop en next-step-button');
            // Scroll inmediato a la parte superior absoluta
            window.scrollTo(0, 0);
            document.body.scrollTop = 0; // Para Safari
            document.documentElement.scrollTop = 0; // Para Chrome, Firefox, IE y Opera

            // Forzar el scroll a la parte superior con un enfoque en el primer elemento visible
            const header = document.querySelector('header');
            if (header) {
                console.log('Enfocando header');
                header.scrollIntoView({ behavior: 'auto', block: 'start' });
            }

            // Enfocar el título del formulario (que está en la parte superior)
            const formTitle = document.querySelector('.form-container h2');
            if (formTitle) {
                console.log('Enfocando título del formulario');
                formTitle.scrollIntoView({ behavior: 'auto', block: 'start' });
            }

            // También intentar enfocar el mensaje de pago anticipado
            const paymentReminder = document.querySelector('.payment-reminder');
            if (paymentReminder) {
                console.log('Enfocando recordatorio de pago');
                paymentReminder.scrollIntoView({ behavior: 'auto', block: 'start' });
            }

            // Enfocar el contenedor del formulario desde el inicio
            const formContainer = document.querySelector('.form-container');
            if (formContainer) {
                console.log('Enfocando contenedor del formulario');
                formContainer.scrollIntoView({ behavior: 'auto', block: 'start' });
                // Establecer el scroll a 0 dentro del contenedor
                formContainer.scrollTop = 0;
            }

            // Enfocar el campo de WhatsApp solo después de asegurar que la página está arriba
            const whatsappInput = document.getElementById('whatsapp');
            if (whatsappInput) {
                console.log('Enfocando campo de WhatsApp');
                whatsappInput.focus();

                // Posicionar el cursor al final del valor precargado
                const valorPrecargado = whatsappInput.value;
                if (valorPrecargado) {
                    // Usar setTimeout para asegurar que el foco ya está establecido
                    setTimeout(() => {
                        // Mover el cursor al final del texto
                        whatsappInput.selectionStart = whatsappInput.selectionEnd = valorPrecargado.length;
                    }, 50);
                }
            }
        };

        // Ejecutar inmediatamente
        scrollToTop();

        // Y también con retraso para asegurar que funcione después de que el DOM se actualice
        setTimeout(scrollToTop, 100);
        setTimeout(scrollToTop, 500);
        setTimeout(scrollToTop, 1000);
    });

    // Manejar el clic en el botón de regresar al paso 1
    document.getElementById('prev-step-button').addEventListener('click', () => {
        console.log('Previous step button clicked');

        // Mostrar el paso 1 (fecha y hora) y ocultar el paso 2 (datos personales)
        document.getElementById('form-step-2').style.display = 'none';
        document.getElementById('form-step-1').style.display = 'block';
    });

    // Ya no necesitamos el manejador para el botón 'back-to-form-button' porque hemos eliminado el paso 3 (confirmación)
    // Redirigir el clic en el botón de confirmación al botón de finalizar (si existe)
    const confirmButtonElement = document.getElementById('confirm-button');
    if (confirmButtonElement) {
        confirmButtonElement.addEventListener('click', () => {
            console.log('Confirm button clicked, redirecting to finish button');
            // Simular un clic en el botón de finalizar
            const finishButton = document.getElementById('finish-button');
            if (finishButton) {
                finishButton.click();
            }
        });
    }

    // Manejar el checkbox de confirmación de pago
    const paymentConfirmationCheckbox = document.getElementById('payment-confirmation-checkbox');
    if (paymentConfirmationCheckbox) {
        paymentConfirmationCheckbox.addEventListener('change', function () {
            // Obtener el botón de finalizar
            const finishButton = document.getElementById('finish-button');
            const buttonStatusMessage = document.getElementById('button-status-message');

            if (finishButton) {
                // Verificar si el WhatsApp ha sido validado
                const whatsappValidation = document.getElementById('whatsapp-validation');
                const whatsappIsValid = whatsappValidation && whatsappValidation.classList.contains('success');

                // Habilitar el botón solo si el checkbox está marcado Y el WhatsApp es válido
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

    // Manejar el botón de finalizar
    const finishButtonElement = document.getElementById('finish-button');
    if (finishButtonElement) {
        // Deshabilitar el botón de finalizar por defecto hasta que el WhatsApp sea validado y el checkbox marcado
        finishButtonElement.disabled = true;

        finishButtonElement.addEventListener('click', () => {
            console.log('Finish button clicked');

            // Tracking: Finalización del proceso
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

            // Obtener los datos para el mensaje de WhatsApp y para enviar al endpoint
            const fullname = document.getElementById('fullname').value;
            const whatsapp = document.getElementById('whatsapp').value;
            let preferredDate = document.getElementById('preferred-date').value;
            let preferredTime = document.getElementById('preferred-time').value;
            const mainDoubt = document.getElementById('main_doubt').value || '';

            // Recopilar respuestas del cuestionario para el landingUrl
            const questionnaire = {};
            for (const key in answers) {
                if (answers.hasOwnProperty(key)) {
                    questionnaire[key] = answers[key].value;
                }
            }

            // Preparar las respuestas en el formato correcto
            let respuestasTexto = '';
            questions.forEach(question => {
                if (answers[question.key]) {
                    respuestasTexto += `${question.question}: ${answers[question.key].value}\n`;
                }
            });

            // Agregar la duda principal a las respuestas si existe
            if (mainDoubt && mainDoubt.trim() !== '') {
                respuestasTexto += `¿Cuál es tu principal duda sobre el procedimiento?: ${mainDoubt}\n`;
            }

            // Preparar datos completos para el webhook
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

            // Agregar todas las respuestas individuales
            questions.forEach(question => {
                if (answers[question.key]) {
                    formData.respuestas_detalladas[question.key] = answers[question.key].value;
                }
            });

            // Validar que los campos de nombre y WhatsApp estén completos
            if (!fullname || !whatsapp) {
                alert('Por favor completa tu nombre y número de WhatsApp.');
                return;
            }

            // Asignar valores predeterminados a fecha y hora si están vacíos
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

            // Validar que el número de WhatsApp tenga al menos 10 dígitos
            const whatsappDigits = whatsapp.replace(/\D/g, '');
            if (whatsappDigits.length < 10 || whatsappDigits.length > 15) {
                alert('Por favor ingresa un número de WhatsApp válido (al menos 10 dígitos).');
                document.getElementById('whatsapp').focus();
                return;
            }

            // Crear y mostrar el overlay de carga
            const overlay = document.createElement('div');
            overlay.className = 'mercadopago-overlay';
            overlay.innerHTML = `
            <div class="mercadopago-spinner"></div>
            <p>Generando link de pago personalizado...</p>
            <p>Por favor espera, serás redirigido a Mercado Pago en unos segundos.</p>
        `;
            document.body.appendChild(overlay);

            // Deshabilitar el botón para evitar múltiples envíos
            const finishButton = document.getElementById('finish-button');
            finishButton.disabled = true;
            finishButton.innerHTML = '<span class="loading-spinner"></span> Procesando...';

            // Primero, obtener el link de pago de Mercado Pago
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

                    // Extraer el link de Mercado Pago de la respuesta (maneja diferentes formatos)
                    let mercadoPagoLink = null;

                    // Si la respuesta es un array, buscar en el primer elemento
                    if (Array.isArray(data) && data.length > 0 && data[0].mercadopago_linkpersonalizado_creado) {
                        mercadoPagoLink = data[0].mercadopago_linkpersonalizado_creado;
                    }
                    // Si la respuesta es un objeto directo, buscar la propiedad directamente
                    else if (data && data.mercadopago_linkpersonalizado_creado) {
                        mercadoPagoLink = data.mercadopago_linkpersonalizado_creado;
                    }

                    // Verificar si se encontró el link de Mercado Pago
                    if (mercadoPagoLink) {

                        // Agregar el link de Mercado Pago a los datos del formulario
                        formData.mercadopago_link = mercadoPagoLink;

                        // Enviar datos al endpoint usando jQuery AJAX
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

                                // Disparar evento CitaFiltro explícitamente
                                if (typeof fbq !== 'undefined') {
                                    console.log('Disparando evento CitaFiltro en Facebook Pixel ANTES de redireccionar');
                                    fbq('trackCustom', 'CitaFiltro', {
                                        fullname: fullname,
                                        whatsapp: whatsapp,
                                        fecha_cita: `${preferredDate} ${preferredTime}`,
                                        tratamiento: 'Cirugía plástica'
                                    });
                                }

                                // Redirigir al usuario al link de Mercado Pago
                                window.location.href = mercadoPagoLink;
                            })
                            .fail(function (error) {
                                console.error('Error al enviar los datos:', error);

                                // Remover el overlay
                                if (overlay && overlay.parentNode) {
                                    overlay.parentNode.removeChild(overlay);
                                }

                                // Restaurar el botón
                                finishButton.disabled = false;
                                finishButton.innerHTML = 'Finalizar →';

                                alert('Hubo un error al guardar los datos. Por favor, inténtalo de nuevo.');
                            });
                    } else {
                        console.error('No se recibió un link de Mercado Pago válido:', data);
                        console.log('Formato de respuesta no reconocido o falta la propiedad mercadopago_linkpersonalizado_creado');

                        // Remover el overlay
                        if (overlay && overlay.parentNode) {
                            overlay.parentNode.removeChild(overlay);
                        }

                        // Restaurar el botón
                        finishButton.disabled = false;
                        finishButton.innerHTML = 'Finalizar →';

                        alert('Hubo un error al generar el link de pago. Por favor, inténtalo de nuevo.');
                    }
                })
                .catch(error => {
                    console.error('Error al obtener el link de Mercado Pago:', error);

                    // Remover el overlay
                    if (overlay && overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }

                    // Restaurar el botón
                    finishButton.disabled = false;
                    finishButton.innerHTML = 'Finalizar →';

                    alert('Hubo un error al conectar con el servidor de pagos. Por favor, inténtalo de nuevo.');
                });
        });
    }
});
