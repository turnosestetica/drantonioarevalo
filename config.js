/**
 * Archivo de configuración para las landing pages
 * Contiene configuraciones para múltiples clientes
 */

// Objeto que contiene todas las configuraciones de clientes
const CLIENTS_CONFIG = {
  // Configuración para Dr. Antonio Arévalo
  'index': {
    // Información de la clínica
    clinic: {
      name: "Dr. Antonio Arévalo",
      address: "Aguilar 2438 colegiales piso 7",
      whatsapp: "", // Dejar vacío si no se requiere, o rellenar si es necesario
      whatsappDisplay: "",
      depositAmount: 25000,
      consultationPrice: 50000,
    },

    // Configuración de la landing page
    landingPage: {
      mainTitle: "¿Eres candidato para cirugía plástica?",
      subtitle: "Responde unas breves preguntas y descubre si calificas para una consulta con el Dr. Antonio Arévalo, cirujano plástico.",
      startButtonText: "Evaluar Gratis Ahora",
      appointmentButtonText: "Ver disponibilidad",
      qualificationTitle: "¡Buenas noticias!",
      qualificationMessage: "Basado en tus respuestas, eres un buen candidato para una consulta con el Dr. Antonio Arévalo. Ten en cuenta que el Dr. opera en el Sanatorio Otamendi con los máximos protocolos de seguridad y mejor tecnología.",
      qualificationAction: "Agenda una consulta para recibir una evaluación personalizada.",
      priceNote: "Podrías ser candidato para un procedimiento de cirugía plástica. Para comprobarlo, solicita una cita de evaluación.",
      confirmationText: {
        saveAndRedirect: "Al dar clic en <strong>PAGAR CITA →</strong>, se generará tu link de pago seguro para abonar el anticipo ($25.000). Sólo confirmamos citas con pago anticipado.",
        depositInfo: "Recuerda que se requiere el pago anticipado de $25.000 (50% de la cita) para confirmar tu turno. El 50% restante ($25.000) se abona el día de la visita en la clínica."
      },
      whatsappMessage: {
        greeting: "Hola, soy {nombre} y me interesa agendar una consulta con el Dr. Antonio Arévalo.",
        contactInfo: "*DATOS DE CONTACTO*\n- Nombre: {nombre}\n- WhatsApp: {whatsapp}",
        appointmentInfo: "*CITA SOLICITADA*\n- Fecha: {fecha}\n- Hora: {hora}",
        depositInfo: "*ENTIENDO QUE:*\n- Se requiere el pago anticipado de $25.000 (50%) para confirmar mi reserva.\n- El 50% restante ($25.000) lo abonaré el día de la cita en la clínica.",
        questionnaireInfo: "*RESPUESTAS DEL CUESTIONARIO*\n{respuestas}",
        treatmentType: "cirugía plástica"
      }
    },

    // Colores (CSS variables) - Se pueden ajustar para mejorar estética
    colors: {
      primary: "#0d47a1",    // Azul principal fuerte
      secondary: "#e3f2fd",  // Azul claro
      accent: "#1976d2",     // Azul vibrante
      text: "#333333",       // Color de texto principal
      highlight: "#f5f9ff",  // Color de fondo para destacados
    },

    // Webhooks
    webhooks: {
      availability: "https://sswebhookss.odontolab.co/webhook/1f04b0ca-1003-4ba8-b592-00a0b7ffecb9",
      formSubmission: "https://sswebhookss.odontolab.co/webhook/1128bc3f-6675-4180-97f0-bc0adcdce76a",
      paymentLink: "https://sswebhookss.odontolab.co/webhook/913b049b-4c1a-4a3b-b1f0-129888a96abb"
    },

    // Preguntas del cuestionario
    questions: [
      {
        question: "¿Qué procedimiento te interesa?",
        options: ["Cirugía contorno corporal (Lipoescultura/Lipoabdominoplastia)", "Rinoplastía", "Otro procedimiento"],
        key: "procedure"
      },
      {
        question: "¿Puedes asistir a nuestra clínica en Aguilar 2438, Colegiales, Piso 7?",
        options: ["Sí, puedo asistir", "No, me queda muy lejos"],
        key: "location"
      },
      {
        question: "¿Has tenido alguna cirugía plástica anteriormente?",
        options: ["Sí", "No"],
        key: "previous_surgery"
      },
      {
        question: "¿Tienes alguna condición médica que debamos considerar?",
        options: ["No tengo condiciones médicas", "Sí, pero está controlada", "Sí, tengo condiciones médicas activas"],
        key: "medical_condition"
      },
      {
        question: "¿Cuándo te gustaría realizarte el procedimiento?",
        options: ["Lo antes posible", "En los próximos 3 meses", "En los próximos 6 meses", "Solo estoy explorando opciones"],
        key: "timeframe"
      },
      {
        question: "¿Cuál es tu peso aproximado?",
        options: [
          "Menos de 45 kg",
          "45-50 kg",
          "51-55 kg",
          "56-60 kg",
          "61-65 kg",
          "66-70 kg",
          "71-75 kg",
          "76-80 kg",
          "81-85 kg",
          "86-90 kg",
          "91-95 kg",
          "96-100 kg",
          "101-110 kg",
          "Más de 110 kg"
        ],
        key: "weight"
      },
      {
        question: "¿Cuál es tu altura aproximada?",
        options: [
          "Menos de 1.50 m",
          "1.50-1.55 m",
          "1.56-1.60 m",
          "1.61-1.65 m",
          "1.66-1.70 m",
          "1.71-1.75 m",
          "1.76-1.80 m",
          "1.81-1.85 m",
          "1.86-1.90 m",
          "Más de 1.90 m"
        ],
        key: "height"
      }
    ],

    // Tratamientos y precios (ACTUALIZADOS PARA AREVALO)
    treatments: [
      {
        name: "Consulta de Evaluación",
        initialPrice: 25000,
        regularPrice: 50000,
        monthlyFee: null,
        isOffer: true,
        highlightText: "$25.000 (Anticipo Obligatorio)",
        customNote: "El restante ($25.000) se abona el día de la consulta"
      },
      {
        name: "Cirugía contorno corporal (Lipoescultura)",
        initialPrice: 3800,
        currency: "USD",
        monthlyFee: null,
        priceFormat: "simple",
        customNote: "Precio de referencia en USD"
      },
      {
        name: "Cirugía contorno corporal (Lipoabdominoplastia)",
        initialPrice: 5000,
        currency: "USD",
        monthlyFee: null,
        priceFormat: "simple",
        customNote: "Precio de referencia en USD"
      },
      {
        name: "Rinoplastía",
        initialPrice: "2800-3000",
        currency: "USD",
        monthlyFee: null,
        priceFormat: "text",
        customNote: "Precio de referencia en USD"
      },
      {
        name: "Otro procedimiento",
        initialPrice: "A evaluar",
        monthlyFee: null,
        priceFormat: "text",
        customNote: "El presupuesto se define en la consulta"
      }
    ],

    // Configuración de Facebook Pixel (Dejar genérico o vacío si no se provee)
    facebookPixel: {
      id: "",
      enabledEvents: false
    }
  }
};
