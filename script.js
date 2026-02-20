document.addEventListener('DOMContentLoaded', () => {
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
    const appointmentForm = document.getElementById('appointment-form');
    const qualificationResult = document.getElementById('qualification-result');

    const questions = [
        {
            question: "Estamos ubicados en Rayón # 25, San Juan del Río, Querétaro (dentro del Hospital Medical Center), ¿puedes asistir personalmente si confirmamos una cita?",
            options: ["Sí, puedo asistir", "No, me queda muy lejos"],
            key: "canAttend"
        },
        {
            question: "¿Cuántos dientes te faltan?",
            options: ["1-2 dientes", "3-5 dientes", "6-10 dientes", "Más de 10 dientes", "Todos o casi todos"],
            key: "missingTeeth"
        },
        {
            question: "¿Hace cuánto tiempo que te faltan dientes?",
            options: ["Menos de 6 meses", "Entre 6 meses y 1 año", "Entre 1 y 3 años", "Más de 3 años"],
            key: "timeSinceLoss"
        },
        {
            question: "¿Tienes diabetes?",
            options: ["No", "Sí, controlada", "Sí, no controlada"],
            key: "hasDiabetes"
        },
        {
            question: "¿Has visitado otra clínica para tener un presupuesto?",
            options: ["Sí", "No"],
            key: "previousConsultation"
        },
        {
            question: "¿Tienes radiografías recientes?",
            options: ["Sí", "No"],
            key: "hasXrays"
        },
        {
            question: "¿Usas dentaduras postizas?",
            options: ["Sí", "No"],
            key: "usesDentures"
        }
    ];

    let currentQuestionIndex = 0;
    const answers = {};

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
    }

    function selectOption(e) {
        const selectedOption = e.target;
        const questionElement = selectedOption.closest('.question');
        const options = questionElement.querySelectorAll('.option');

        options.forEach(option => option.classList.remove('selected'));
        selectedOption.classList.add('selected');

        const questionIndex = Array.from(questionContainer.children).indexOf(questionElement);
        const optionIndex = parseInt(selectedOption.dataset.index);
        answers[questions[questionIndex].key] = {
            value: questions[questionIndex].options[optionIndex],
            index: optionIndex
        };

        if (questions[questionIndex].key === 'canAttend' && optionIndex === 1) {
            questionContainer.style.display = 'none';
            document.querySelector('.buttons').style.display = 'none';
            locationError.style.display = 'flex';
            return;
        }

        nextButton.disabled = false;
    }

    function nextQuestion() {
        if (!answers[questions[currentQuestionIndex].key]) {
            nextButton.disabled = true;
            return;
        }

        if (currentQuestionIndex === questions.length - 1) {
            showResults();
            return;
        }

        document.querySelectorAll('.question')[currentQuestionIndex].classList.remove('active');
        currentQuestionIndex++;
        document.querySelectorAll('.question')[currentQuestionIndex].classList.add('active');

        updateButtons();
        updateProgressBar();
    }

    function prevQuestion() {
        if (currentQuestionIndex === 0) return;

        document.querySelectorAll('.question')[currentQuestionIndex].classList.remove('active');
        currentQuestionIndex--;
        document.querySelectorAll('.question')[currentQuestionIndex].classList.add('active');

        updateButtons();
        updateProgressBar();
    }

    function updateButtons() {
        prevButton.style.display = currentQuestionIndex === 0 ? 'none' : 'block';

        if (currentQuestionIndex === questions.length - 1) {
            nextButton.textContent = 'Ver Resultados';
        } else {
            nextButton.textContent = 'Siguiente';
        }

        nextButton.disabled = !answers[questions[currentQuestionIndex].key];
    }

    function updateProgressBar() {
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    function showResults() {
        quizContainer.style.opacity = '0';

        setTimeout(() => {
            quizContainer.style.display = 'none';
            resultsContainer.style.display = 'flex';

            setTimeout(() => {
                resultsContainer.style.opacity = '1';
                const qualified = determineQualification();
                if (qualified) {
                    qualificationResult.textContent = 'Eres candidato para implantes dentales';
                    qualificationResult.style.color = 'var(--primary-color)';
                    qualificationResult.classList.add('qualified');
                } else {
                    qualificationResult.textContent = 'En este momento no calificas para implantes';
                    qualificationResult.style.color = '#e67e22';
                }
            }, 50);
        }, 300);
    }

    function determineQualification() {
        if (!answers.canAttend || answers.canAttend.index !== 0) {
            return false;
        }
        if (answers.hasDiabetes && answers.hasDiabetes.index === 2) {
            return false;
        }
        if (!answers.missingTeeth) {
            return false;
        }
        if (answers.usesDentures && answers.usesDentures.index === 0) {
            return true;
        }
        if (answers.missingTeeth.index >= 1) {
            return true;
        }
        if (answers.missingTeeth.index === 0 && answers.timeSinceLoss && answers.timeSinceLoss.index >= 1) {
            return true;
        }
        return false;
    }

    startQuizButton.addEventListener('click', () => {
        landingContent.style.opacity = '0';
        setTimeout(() => {
            landingContent.style.display = 'none';
            quizContainer.style.display = 'flex';
            setTimeout(() => {
                quizContainer.style.opacity = '1';
                initQuiz();
            }, 50);
        }, 300);
    });

    nextButton.addEventListener('click', nextQuestion);
    prevButton.addEventListener('click', prevQuestion);

    restartQuizButton.addEventListener('click', () => {
        locationError.style.display = 'none';
        questionContainer.style.display = 'block';
        document.querySelector('.buttons').style.display = 'flex';
        quizContainer.style.opacity = '0';

        setTimeout(() => {
            quizContainer.style.display = 'none';
            landingContent.style.display = 'flex';
            Object.keys(answers).forEach(key => delete answers[key]);
            currentQuestionIndex = 0;
            questionContainer.innerHTML = '';
            setTimeout(() => {
                landingContent.style.opacity = '1';
            }, 50);
        }, 300);
    });

    appointmentButton.addEventListener('click', () => {
        resultsContainer.style.opacity = '0';
        setTimeout(() => {
            resultsContainer.style.display = 'none';
            formContainer.style.display = 'flex';
            setTimeout(() => {
                formContainer.style.opacity = '1';
            }, 50);
        }, 300);
    });

    const horariosHabiles = {
        1: ['17:00', '17:20', '17:40', '18:00', '18:20', '18:40', '19:00', '19:20', '19:40', '20:00'],
        3: ['17:00', '17:20', '17:40', '18:00', '18:20', '18:40', '19:00', '19:20', '19:40', '20:00'],
        4: ['17:00', '17:20', '17:40', '18:00', '18:20', '18:40', '19:00', '19:20', '19:40', '20:00']
    };

    function loadAvailableDates() {
        const dateSelect = document.getElementById('preferred-date');
        const today = new Date();
        let daysAdded = 0;
        let daysCount = 0;
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        while (daysCount < 14 && daysAdded < 60) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + daysAdded);
            daysAdded++;
            const dayOfWeek = currentDate.getDay();

            if (horariosHabiles[dayOfWeek]) {
                const dayName = dayNames[dayOfWeek];
                const day = currentDate.getDate();
                const month = monthNames[currentDate.getMonth()];
                const formattedDate = `${dayName} ${day} de ${month}`;
                const option = document.createElement('option');
                option.value = currentDate.toISOString().split('T')[0];
                option.textContent = formattedDate;
                dateSelect.appendChild(option);
                daysCount++;
            }
        }
    }

    function loadAvailableHours() {
        const timeSelect = document.getElementById('preferred-time');
        const dateSelect = document.getElementById('preferred-date');
        
        while (timeSelect.options.length > 1) {
            timeSelect.remove(1);
        }

        const selectedDate = new Date(dateSelect.value + 'T00:00:00');
        const dayOfWeek = selectedDate.getDay();
        const availableTimes = horariosHabiles[dayOfWeek];

        if (availableTimes) {
            availableTimes.forEach(time => {
                const option = document.createElement('option');
                option.value = time;
                option.textContent = time + 'hs';
                timeSelect.appendChild(option);
            });
        }
    }

    loadAvailableDates();
    loadAvailableHours();
    document.getElementById('preferred-date').addEventListener('change', loadAvailableHours);

    const whatsappInput = document.getElementById('whatsapp');
    const whatsappValidation = document.getElementById('whatsapp-validation');
    let whatsappValid = false;

    whatsappInput.addEventListener('blur', validateWhatsApp);
    whatsappInput.addEventListener('input', function() {
        whatsappValidation.textContent = '';
        whatsappValidation.className = 'validation-message';
    });

    function validateWhatsApp() {
        const whatsappNumber = whatsappInput.value.trim();

        if (!/^\d{10,15}$/.test(whatsappNumber)) {
            whatsappValidation.textContent = 'Ingresa un número válido (10-15 dígitos sin espacios ni guiones)';
            whatsappValidation.className = 'validation-message error';
            whatsappValid = false;
            return;
        }

        whatsappValidation.textContent = 'Verificando número...';
        whatsappValidation.className = 'validation-message';

        if (!/^\d{10,15}$/.test(whatsappNumber)) {
            whatsappValidation.textContent = 'Formato inválido. Ingresa solo números (10-15 dígitos)';
            whatsappValidation.className = 'validation-message error';
            whatsappValid = false;
            return;
        }

        fetch('https://sswebhookss.odontolab.co/webhook/02eb0643-1b9d-4866-87a7-f892d6a945ea', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ whatsapp_check: whatsappNumber })
        })
        .then(response => response.json())
        .then(data => {
            console.log('API Response:', data);
            if (data && typeof data.exists === 'boolean') {
                if (data.exists === true) {
                    whatsappValidation.textContent = 'Número de WhatsApp válido';
                    whatsappValidation.className = 'validation-message success';
                    whatsappValid = true;
                } else {
                    whatsappValidation.textContent = 'Este número no tiene WhatsApp activo';
                    whatsappValidation.className = 'validation-message error';
                    whatsappValid = false;
                }
            } else {
                whatsappValidation.textContent = 'No se pudo verificar el número';
                whatsappValidation.className = 'validation-message error';
                whatsappValid = false;
            }
        })
        .catch(error => {
            console.error('Error validando WhatsApp:', error);
            whatsappValidation.textContent = 'Error al verificar el número';
            whatsappValidation.className = 'validation-message error';
            whatsappValid = false;
        });
    }

    appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!document.getElementById('payment-agreement').checked) {
            alert('Debes aceptar el requisito de depósito para continuar.');
            return;
        }

        if (!whatsappValid) {
            alert('Por favor ingresa un número de WhatsApp válido.');
            whatsappInput.focus();
            return;
        }

        const fullname = document.getElementById('fullname').value;
        const whatsapp = whatsappInput.value;
        const preferredDate = document.getElementById('preferred-date').value;
        const preferredTime = document.getElementById('preferred-time').value;
        const dateOption = document.querySelector(`#preferred-date option[value="${preferredDate}"]`);
        const formattedDate = dateOption ? dateOption.textContent : preferredDate;

        let message = `Hola, soy ${fullname} y me interesa agendar una valoración para implantes dentales.\n\n`;
        message += `*DATOS DE CONTACTO*\n`;
        message += `- Nombre: ${fullname}\n`;
        message += `- WhatsApp: ${whatsapp}\n\n`;
        message += `*CITA SOLICITADA*\n`;
        message += `- Fecha: ${formattedDate}\n`;
        message += `- Hora: ${preferredTime}\n\n`;
        message += `*ENTIENDO QUE:*\n`;
        message += `- Se requiere un depósito de $400 para confirmar mi cita\n`;
        message += `- Este monto será deducido del costo total del tratamiento\n\n`;
        message += `*RESPUESTAS DEL CUESTIONARIO*\n`;

        questions.forEach(question => {
            if (answers[question.key]) {
                message += `- ${question.question.replace(/\?/g, '')}? ${answers[question.key].value}\n`;
            }
        });

        const encodedMessage = encodeURIComponent(message);
        alert('¡Gracias! Ahora serás redirigido a WhatsApp para completar tu solicitud de cita.');
        window.open(`https://wa.me/+5214271234567?text=${encodedMessage}`, '_blank');
    });
});```
