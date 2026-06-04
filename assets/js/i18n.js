(() => {
  const APP = window.APP = window.APP || {};
  APP.LS = APP.LS || {
    "LANG": "app_lang",
    "AUDIO_ON": "app_audio_on",
    "AUDIO_VOL": "app_audio_vol",
    "FONT": "app_font_px"
  };

  // ========= I18N DICTIONARY =========
// ========= I18N DICTIONARY =========
    APP.I18N = {
      es: {
        header_title: "Dr. Pedro Nicolas Dagnino | Consultorio de Psiquiatría y Medicina Aeronáutica",
        header_sub: "Sala de espera virtual",
        audio_off: "Activar sonidos",
        audio_on: "Sonidos activos 🔊",
        volume_label: "Volumen",

        settings_btn: "⚙️ Ajustes",
        settings_title: "Ajustes",
        close_btn: "Cerrar ✕",
        sheet_font_title: "🔠 Tamaño de letra",
        sheet_contrast_title: "🌓 Contraste",
        sheet_motion_title: "🪶 Reducir animaciones",
        sheet_line_title: "↕️ Interlineado",
        sheet_audio_title: "🔊 Sonidos",
        sheet_lang_title: "🌐 Idioma",
        sheet_note: "Tip: estos ajustes se guardan automáticamente para próximas visitas.",

        hero_pill: "Espacio virtual disponible",
        hero_title: "Bienvenidos a la SALA DE ESPERA VIRTUAL",
        hero_bridge: "Un espacio previo a la atención médica, con recursos psicológicos cuidadosamente diseñados.",
        hero_subline: "Consultorio de Psiquiatría – Dr. Pedro Nicolas Dagnino",
        hero_meta: "Médico especialista en Psiquiatría y Medicina Aeronáutica",

        quick_title: "Accesos rápidos",
        quick_desc: "Ingresá a los recursos principales o contactá a la Central de Turnos.",
        quick_games: "Juegos",
        quick_emotions: "Emociones",
        quick_turns: "Central de Turnos",

        welcome_title: "¿De qué se trata este espacio?",
        welcome_text: "Este sitio reúne recursos digitales pensados para acompañar la espera, orientar al paciente y ofrecer herramientas breves de psicoeducación, registro emocional, higiene del sueño y acceso a contenidos clínicos del consultorio. No reemplaza una consulta médica, pero puede ayudar a ordenar información, conocer recursos y acceder a materiales preparados para pacientes.",
        legal_btn: "Aviso legal / Privacidad",

        r1_games_title: "Juegos cognitivos",
        r1_games_desc: "Entrenamiento breve y amable.",
        r1_emotions_title: "Registro emocional",
        r1_emotions_desc: "Explorar y registrar estados emocionales.",
        r1_sleep_title: "Higiene del sueño",
        r1_sleep_desc: "Recomendaciones clínicas para dormir mejor.",
        r1_psycho_title: "Psicoeducación",
        r1_psycho_desc: "Comprender para cuidar la salud mental.",

        cta_enter: "Ingresar",
        cta_open: "Abrir",
        cta_learn: "Conocer",
        cta_how: "¿Cómo funciona?",
        cta_whatsapp: "Contactar por WhatsApp",
        cta_install: "Ver instrucciones",

        soon_psy_title: "Psicofármacos",
        soon_anx_title: "Hablemos de ansiedad",
        soon_ang_title: "Hablemos de angustia",
        soon_sub: "Contenido en desarrollo",
        soon_badge: "Próximamente",

        reels_title: "Recomendaciones en video",
        reels_desc: "Píldoras clínicas y psicoeducativas.",

        eps_title: "Dispositivo de Evaluación Psiquiátrica Situacional",
        eps_desc: "Una instancia de segunda opinión profesional y orientación clínica puntual, en modalidad virtual, destinada a comprender mejor tu situación actual, ordenar dudas y evaluar opciones junto a tu médico tratante.",
        eps_note: "Requiere coordinación previa por Central de Turnos.",

        team_title: "Equipo profesional asociado",
        team_desc: "Accesos por área: salud mental y otras especialidades.",
        team_mh: "Salud mental",
        team_other: "Otras especialidades",

        turnos_title: "Central de Turnos",
        turnos_desc: "Canal administrativo general para asesoramiento, dudas y coordinación de turnos.",
        turnos_note: "Este canal no está destinado a urgencias. Si se encuentra en una situación de emergencia, comuníquese con el sistema local de emergencias.",

        pwa_title: "Instalar como app",
        pwa_desc: "Acceso rápido desde tu teléfono, como una aplicación.",
        pwa_steps: "Tip: en Android, tocá “Instalar app”. En iPhone, tocá “Compartir” → “Agregar a pantalla de inicio”.",

        map_open: "Abrir en Maps",
        legal_link: "Aviso legal / Privacidad",
        footer_title: "Ubicación y contacto",
        footer_loc: "Barrio Norte – Recoleta<br>Ciudad Autónoma de Buenos Aires – Argentina",
        footer_email: "Email administrativo",
        footer_legal_1: "Copyright ©",
        footer_legal_2: "Todos los derechos reservados.",
        footer_legal_3: "Desarrollado por PETER-SOFT",
        footer_legal_4: "Año automático.",
        cookies_note: "Cookies/analíticas: podemos usar analíticas para mejorar la experiencia. No utilizamos cookies de seguimiento publicitario."
      },

      en: {
        header_title: "Dr. Pedro Nicolas Dagnino | Psychiatry & Aeromedical Medicine Clinic",
        header_sub: "Virtual waiting room",
        audio_off: "Enable sounds",
        audio_on: "Sounds on 🔊",
        volume_label: "Volume",

        settings_btn: "⚙️ Settings",
        settings_title: "Settings",
        close_btn: "Close ✕",
        sheet_font_title: "🔠 Text size",
        sheet_contrast_title: "🌓 Contrast",
        sheet_motion_title: "🪶 Reduce motion",
        sheet_line_title: "↕️ Line spacing",
        sheet_audio_title: "🔊 Sounds",
        sheet_lang_title: "🌐 Language",
        sheet_note: "Tip: these settings are saved automatically for future visits.",

        hero_pill: "Virtual space available",
        hero_title: "Welcome to the VIRTUAL WAITING ROOM",
        hero_bridge: "A pre-appointment space with carefully designed psychological resources.",
        hero_subline: "Psychiatry Clinic – Dr. Pedro Nicolas Dagnino",
        hero_meta: "Board-certified Psychiatrist & Aeromedical Medicine Specialist",

        quick_title: "Quick access",
        quick_desc: "Open the main resources or contact the Scheduling Desk.",
        quick_games: "Cognitive games",
        quick_emotions: "Emotions",
        quick_turns: "Scheduling Desk",

        welcome_title: "What is this space about?",
        welcome_text: "This site brings together digital resources designed to support the waiting period, guide patients, and offer brief tools in psychoeducation, emotional logging, sleep hygiene, and access to clinical content from the clinic. It does not replace a medical consultation, but it can help organize information, discover resources, and access materials prepared for patients.",
        legal_btn: "Legal / Privacy",

        r1_games_title: "Cognitive games",
        r1_games_desc: "Brief and friendly training.",
        r1_emotions_title: "Emotional log",
        r1_emotions_desc: "Explore and record emotional states.",
        r1_sleep_title: "Sleep hygiene",
        r1_sleep_desc: "Clinical recommendations to sleep better.",
        r1_psycho_title: "Psychoeducation",
        r1_psycho_desc: "Understand to take better care of mental health.",

        cta_enter: "Open",
        cta_open: "Open",
        cta_learn: "Learn more",
        cta_how: "How it works",
        cta_whatsapp: "WhatsApp contact",
        cta_install: "See instructions",

        soon_psy_title: "Psychopharmacology",
        soon_anx_title: "Let’s talk about anxiety",
        soon_ang_title: "Let’s talk about distress",
        soon_sub: "Content in development",
        soon_badge: "Coming soon",

        reels_title: "Video recommendations",
        reels_desc: "Clinical and psychoeducational snippets.",

        eps_title: "Situational Psychiatric Evaluation",
        eps_desc: "A virtual second-opinion and focused clinical guidance pathway to better understand your current situation, organize questions and explore options together with your treating physician.",
        eps_note: "Requires prior coordination through the Scheduling Desk.",

        team_title: "Associated professional team",
        team_desc: "Access by area: mental health and other specialties.",
        team_mh: "Mental health",
        team_other: "Other specialties",

        turnos_title: "Scheduling Desk",
        turnos_desc: "Administrative channel for guidance, questions and appointment coordination.",
        turnos_note: "This channel is not for emergencies. If you are in an emergency situation, contact your local emergency services.",

        pwa_title: "Install as an app",
        pwa_desc: "Quick access from your phone, like an app.",
        pwa_steps: "Tip: Android → “Install app”. iPhone → “Share” → “Add to Home Screen”.",

        map_open: "Open in Maps",
        legal_link: "Legal / Privacy",
        footer_title: "Location & contact",
        footer_loc: "Barrio Norte – Recoleta<br>Buenos Aires (CABA) – Argentina",
        footer_email: "Administrative email",
        footer_legal_1: "Copyright ©",
        footer_legal_2: "All rights reserved.",
        footer_legal_3: "Developed by PETER-SOFT",
        footer_legal_4: "Auto year.",
        cookies_note: "Cookies/analytics: we may use analytics to improve the experience. We do not use advertising tracking cookies."
      },

      pt: {
        header_title: "Dr. Pedro Nicolas Dagnino | Consultório de Psiquiatria e Medicina Aeronáutica",
        header_sub: "Sala de espera virtual",
        audio_off: "Ativar sons",
        audio_on: "Sons ativos 🔊",
        volume_label: "Volume",

        settings_btn: "⚙️ Ajustes",
        settings_title: "Ajustes",
        close_btn: "Fechar ✕",
        sheet_font_title: "🔠 Tamanho do texto",
        sheet_contrast_title: "🌓 Contraste",
        sheet_motion_title: "🪶 Reduzir animações",
        sheet_line_title: "↕️ Espaçamento entre linhas",
        sheet_audio_title: "🔊 Sons",
        sheet_lang_title: "🌐 Idioma",
        sheet_note: "Dica: estas configurações ficam salvas automaticamente para próximas visitas.",

        hero_pill: "Espaço virtual disponível",
        hero_title: "Bem-vindos à SALA DE ESPERA VIRTUAL",
        hero_bridge: "Um espaço pré-consulta com recursos psicológicos cuidadosamente elaborados.",
        hero_subline: "Consultório de Psiquiatria – Dr. Pedro Nicolas Dagnino",
        hero_meta: "Médico especialista em Psiquiatria e Medicina Aeronáutica",

        quick_title: "Acessos rápidos",
        quick_desc: "Acesse os principais recursos ou contate a Central de Agendamento.",
        quick_games: "Jogos",
        quick_emotions: "Emoções",
        quick_turns: "Central de Agendamento",

        welcome_title: "Do que se trata este espaço?",
        welcome_text: "Este site reúne recursos digitais pensados para acompanhar a espera, orientar o paciente e oferecer ferramentas breves de psicoeducação, registro emocional, higiene do sono e acesso a conteúdos clínicos do consultório. Não substitui uma consulta médica, mas pode ajudar a organizar informações, conhecer recursos e acessar materiais preparados para pacientes.",
        legal_btn: "Aviso legal / Privacidade",

        r1_games_title: "Jogos cognitivos",
        r1_games_desc: "Treino breve e acolhedor.",
        r1_emotions_title: "Registro emocional",
        r1_emotions_desc: "Explorar e registrar estados emocionais.",
        r1_sleep_title: "Higiene do sono",
        r1_sleep_desc: "Recomendações clínicas para dormir melhor.",
        r1_psycho_title: "Psicoeducação",
        r1_psycho_desc: "Compreender para cuidar da saúde mental.",

        cta_enter: "Acessar",
        cta_open: "Abrir",
        cta_learn: "Conhecer",
        cta_how: "Como funciona",
        cta_whatsapp: "Contato WhatsApp",
        cta_install: "Ver instruções",

        soon_psy_title: "Psicofármacos",
        soon_anx_title: "Vamos falar de ansiedade",
        soon_ang_title: "Vamos falar de angústia",
        soon_sub: "Conteúdo em desenvolvimento",
        soon_badge: "Em breve",

        reels_title: "Recomendações em vídeo",
        reels_desc: "Pílulas clínicas e psicoeducativas.",

        eps_title: "Avaliação Psiquiátrica Situacional",
        eps_desc: "Uma segunda opinião profissional e orientação clínica pontual, em modalidade virtual, para compreender melhor sua situação atual, organizar dúvidas e avaliar opções junto ao seu médico assistente.",
        eps_note: "Requer coordenação prévia pela Central de Agendamento.",

        team_title: "Equipe profissional associada",
        team_desc: "Acessos por área: saúde mental e outras especialidades.",
        team_mh: "Saúde mental",
        team_other: "Outras especialidades",

        turnos_title: "Central de Agendamento",
        turnos_desc: "Canal administrativo para orientação, dúvidas e coordenação de consultas.",
        turnos_note: "Este canal não é para urgências. Em caso de emergência, contate os serviços locais de emergência.",

        pwa_title: "Instalar como app",
        pwa_desc: "Acesso rápido pelo celular, como um aplicativo.",
        pwa_steps: "Dica: Android → “Instalar app”. iPhone → “Compartilhar” → “Adicionar à Tela de Início”.",

        map_open: "Abrir no Maps",
        legal_link: "Aviso legal / Privacidade",
        footer_title: "Localização e contato",
        footer_loc: "Barrio Norte – Recoleta<br>Buenos Aires (CABA) – Argentina",
        footer_email: "E-mail administrativo",
        footer_legal_1: "Copyright ©",
        footer_legal_2: "Todos os direitos reservados.",
        footer_legal_3: "Desenvolvido por PETER-SOFT",
        footer_legal_4: "Ano automático.",
        cookies_note: "Cookies/analíticas: podemos usar analíticas para melhorar a experiência. Não usamos cookies de rastreamento publicitário."
      }
    };
})();
