// Wiki / Ratgeber articles. Bilingual de + uk.
// Each article body is an array of blocks rendered by the article page.
// Job descriptions stay German, but these guide articles are translated.

import type { Lang } from "@/lib/i18n";

export type Block =
  | { type: "p"; de: string; uk: string }
  | { type: "h2"; de: string; uk: string }
  | { type: "ul"; de: string[]; uk: string[] }
  | { type: "tip"; de: string; uk: string };

export interface Article {
  slug: string;
  icon: string; // resolved in ArticleIcon
  cover: string; // hero cover image in /public/cover
  color: "amber" | "coral" | "violet" | "blue" | "teal" | "green" | "gold" | "rose";
  minutes: number;
  title: { de: string; uk: string };
  excerpt: { de: string; uk: string };
  body: Block[];
}

export function pick<T>(v: { de: T; uk: T }, lang: Lang): T {
  return lang === "uk" ? v.uk : v.de;
}

export const ARTICLES: Article[] = [
  {
    slug: "lebenslauf-deutschland",
    icon: "doc",
    cover: "/cover/lebenslauf-deutschland.jpg",
    color: "amber",
    minutes: 6,
    title: {
      de: "Der perfekte Lebenslauf in Deutschland",
      uk: "Ідеальне резюме (Lebenslauf) у Німеччині",
    },
    excerpt: {
      de: "Aufbau, Foto, Lücken, Sprachniveau — so überzeugt dein tabellarischer Lebenslauf deutsche Personaler.",
      uk: "Структура, фото, прогалини, рівень мови — як скласти табличне резюме, що сподобається німецьким HR.",
    },
    body: [
      {
        type: "p",
        de: "In Deutschland zählt der „tabellarische Lebenslauf“. Er ist klar gegliedert, maximal zwei Seiten lang und führt deine Stationen rückwärts auf — die aktuellste zuerst (antichronologisch).",
        uk: "У Німеччині використовують «табличне резюме» (tabellarischer Lebenslauf). Воно чітко структуроване, не довше двох сторінок і перелічує етапи у зворотному порядку — найновіший досвід першим (антихронологічно).",
      },
      {
        type: "h2",
        de: "Welche Abschnitte gehören rein?",
        uk: "Які розділи мають бути?",
      },
      {
        type: "ul",
        de: [
          "Persönliche Daten: Name, Adresse, Telefon, E-Mail (Geburtsdatum & Foto sind freiwillig)",
          "Berufserfahrung: Zeitraum, Position, Arbeitgeber, Ort, wichtigste Aufgaben",
          "Ausbildung / Studium: Abschluss, Einrichtung, Zeitraum",
          "Kenntnisse: Sprachen mit Niveau (z. B. Deutsch B2), EDV, Führerschein",
          "Weiterbildungen & Zertifikate",
        ],
        uk: [
          "Особисті дані: ім'я, адреса, телефон, e-mail (дата народження та фото — за бажанням)",
          "Досвід роботи: період, посада, роботодавець, місто, ключові завдання",
          "Освіта / навчання: кваліфікація, заклад, період",
          "Навички: мови з рівнем (напр. Deutsch B2), комп'ютер, водійські права",
          "Курси підвищення кваліфікації та сертифікати",
        ],
      },
      {
        type: "h2",
        de: "Das Foto",
        uk: "Фото",
      },
      {
        type: "p",
        de: "Ein professionelles Bewerbungsfoto ist nicht Pflicht, in vielen Branchen aber üblich und gern gesehen. Wähle ein freundliches, gut ausgeleuchtetes Foto vom Profifotografen — kein Selfie und kein Urlaubsbild.",
        uk: "Професійне фото для резюме не обов'язкове, але в багатьох галузях прийняте й вітається. Обери привітне, добре освітлене фото від професійного фотографа — не селфі й не відпускне.",
      },
      {
        type: "h2",
        de: "Lücken im Lebenslauf",
        uk: "Прогалини в резюме",
      },
      {
        type: "p",
        de: "Kurze Lücken sind kein Problem. Längere Pausen (Umzug, Sprachkurs, Anerkennung des Abschlusses, Elternzeit) solltest du ehrlich und kurz benennen — das wirkt souverän statt versteckt.",
        uk: "Короткі прогалини — не проблема. Довші паузи (переїзд, мовний курс, визнання диплома, декретна відпустка) краще чесно й коротко зазначити — це виглядає впевнено, а не приховано.",
      },
      {
        type: "tip",
        de: "Speichere deinen Lebenslauf immer als PDF mit sprechendem Dateinamen, z. B. „Lebenslauf_Max_Mustermann.pdf“.",
        uk: "Завжди зберігай резюме у PDF з промовистою назвою файлу, напр. «Lebenslauf_Max_Mustermann.pdf».",
      },
    ],
  },
  {
    slug: "anschreiben-schreiben",
    icon: "pen",
    cover: "/cover/anschreiben-schreiben.jpg",
    color: "violet",
    minutes: 5,
    title: {
      de: "Das Anschreiben: Aufbau & Beispiele",
      uk: "Супровідний лист (Anschreiben): структура й приклади",
    },
    excerpt: {
      de: "Eine Seite, individuell auf die Stelle zugeschnitten — so schreibst du ein überzeugendes Anschreiben.",
      uk: "Одна сторінка, адаптована під вакансію — як написати переконливий супровідний лист.",
    },
    body: [
      {
        type: "p",
        de: "Das Anschreiben (Motivationsschreiben) beantwortet eine Frage: Warum passt genau du zu genau dieser Stelle? Es gehört nicht in den Lebenslauf, sondern ist ein eigenes Dokument auf einer Seite.",
        uk: "Супровідний лист відповідає на одне питання: чому саме ти підходиш саме на цю вакансію? Це окремий документ на одну сторінку, а не частина резюме.",
      },
      {
        type: "h2",
        de: "Aufbau in vier Teilen",
        uk: "Структура з чотирьох частин",
      },
      {
        type: "ul",
        de: [
          "Einstieg: Bezug zur Stelle, kein langweiliges „hiermit bewerbe ich mich“",
          "Hauptteil: 2–3 Stärken mit konkreten Beispielen, passend zur Anzeige",
          "Motivation: Warum dieses Unternehmen, warum jetzt",
          "Abschluss: Verfügbarkeit, Gehaltswunsch (falls gefordert), freundlicher Gruß",
        ],
        uk: [
          "Вступ: зв'язок із вакансією, без нудного «цим листом подаю заявку»",
          "Основна частина: 2–3 сильні сторони з конкретними прикладами під оголошення",
          "Мотивація: чому саме ця компанія і чому зараз",
          "Завершення: доступність, бажана зарплата (якщо просять), привітне прощання",
        ],
      },
      {
        type: "tip",
        de: "Sprich den Ansprechpartner mit Namen an („Sehr geehrte Frau Müller“). Findest du keinen, recherchiere kurz auf der Unternehmensseite oder rufe an.",
        uk: "Звертайся до контактної особи на ім'я («Sehr geehrte Frau Müller»). Якщо не знайшов — пошукай на сайті компанії або зателефонуй.",
      },
      {
        type: "h2",
        de: "Häufige Fehler",
        uk: "Типові помилки",
      },
      {
        type: "ul",
        de: [
          "Standardtext für alle Bewerbungen kopiert",
          "Rechtschreibfehler — immer Korrektur lesen lassen",
          "Nur Wiederholung des Lebenslaufs statt Mehrwert",
          "Zu lang: bleib bei einer Seite",
        ],
        uk: [
          "Один шаблонний текст для всіх заявок",
          "Орфографічні помилки — завжди давай комусь вичитати",
          "Просто переказ резюме замість додаткової цінності",
          "Занадто довго: тримайся однієї сторінки",
        ],
      },
    ],
  },
  {
    slug: "vorstellungsgespraech",
    icon: "chat",
    cover: "/cover/vorstellungsgespraech.jpg",
    color: "teal",
    minutes: 7,
    title: {
      de: "Vorstellungsgespräch souverän meistern",
      uk: "Як упевнено пройти співбесіду",
    },
    excerpt: {
      de: "Vorbereitung, typische Fragen, Körpersprache und die richtigen Rückfragen — so punktest du im Gespräch.",
      uk: "Підготовка, типові питання, мова тіла й правильні зустрічні питання — як справити враження на співбесіді.",
    },
    body: [
      {
        type: "p",
        de: "Ein gutes Vorstellungsgespräch beginnt mit Vorbereitung. Informiere dich über das Unternehmen, die Produkte und die Stelle — und überlege dir Antworten auf die häufigsten Fragen.",
        uk: "Гарна співбесіда починається з підготовки. Дізнайся про компанію, продукти й вакансію — і продумай відповіді на найпоширеніші питання.",
      },
      {
        type: "h2",
        de: "Typische Fragen",
        uk: "Типові питання",
      },
      {
        type: "ul",
        de: [
          "„Erzählen Sie etwas über sich.“ — 1–2 Minuten, beruflich relevant",
          "„Warum möchten Sie zu uns?“ — zeig, dass du das Unternehmen kennst",
          "„Was sind Ihre Stärken und Schwächen?“ — ehrlich, mit Beispiel",
          "„Wo sehen Sie sich in fünf Jahren?“ — realistische Perspektive",
        ],
        uk: [
          "«Розкажіть про себе.» — 1–2 хвилини, релевантно до роботи",
          "«Чому хочете до нас?» — покажи, що знаєш компанію",
          "«Ваші сильні та слабкі сторони?» — чесно, з прикладом",
          "«Де ви бачите себе за п'ять років?» — реалістична перспектива",
        ],
      },
      {
        type: "h2",
        de: "Körpersprache & Auftreten",
        uk: "Мова тіла й поведінка",
      },
      {
        type: "p",
        de: "Pünktlich erscheinen (10 Minuten früher), fester Händedruck, Blickkontakt, ruhige Stimme. Kleide dich eine Stufe formeller als der Berufsalltag der Stelle.",
        uk: "Прийди вчасно (на 10 хвилин раніше), упевнене рукостискання, зоровий контакт, спокійний голос. Одягнись на щабель формальніше, ніж буденний дрес-код посади.",
      },
      {
        type: "tip",
        de: "Bereite eigene Fragen vor — z. B. zu Einarbeitung, Team oder Entwicklungsmöglichkeiten. Wer fragt, zeigt echtes Interesse.",
        uk: "Підготуй власні питання — напр. про адаптацію, команду чи можливості розвитку. Хто запитує, той показує справжню зацікавленість.",
      },
    ],
  },
  {
    slug: "anerkennung-abschluss",
    icon: "badge",
    cover: "/cover/anerkennung-abschluss.jpg",
    color: "blue",
    minutes: 6,
    title: {
      de: "Ausländischen Abschluss anerkennen lassen",
      uk: "Визнання іноземного диплома в Німеччині",
    },
    excerpt: {
      de: "Wann du eine Anerkennung brauchst, wo du sie beantragst und welche Unterlagen nötig sind.",
      uk: "Коли потрібне визнання, де його подавати і які документи знадобляться.",
    },
    body: [
      {
        type: "p",
        de: "Für viele Berufe in Deutschland brauchst du eine Anerkennung deines im Ausland erworbenen Abschlusses — besonders bei reglementierten Berufen wie Pflege, Medizin, Erziehung oder Handwerk mit Meisterpflicht.",
        uk: "Для багатьох професій у Німеччині потрібне визнання здобутого за кордоном диплома — особливо для регламентованих професій: догляд, медицина, освіта чи ремесла з вимогою Meister.",
      },
      {
        type: "h2",
        de: "So gehst du vor",
        uk: "Як діяти",
      },
      {
        type: "ul",
        de: [
          "Beruf prüfen auf „anerkennung-in-deutschland.de“",
          "Zuständige Stelle finden (je nach Beruf und Bundesland unterschiedlich)",
          "Unterlagen zusammenstellen: Abschlusszeugnis, Fächer-/Notenübersicht, Übersetzungen",
          "Antrag stellen und Gebühren beachten",
          "Bei Teil-Anerkennung: Anpassungsqualifizierung oder Prüfung",
        ],
        uk: [
          "Перевір професію на «anerkennung-in-deutschland.de»",
          "Знайди відповідальну установу (залежить від професії та землі)",
          "Збери документи: диплом, додаток з предметами/оцінками, переклади",
          "Подай заяву й врахуй збори",
          "У разі часткового визнання: кваліфікаційний курс або іспит",
        ],
      },
      {
        type: "tip",
        de: "Die Beratung des „IQ Netzwerks“ ist kostenlos und hilft dir, die richtige Stelle und die nötigen Schritte zu finden.",
        uk: "Консультація «IQ Netzwerk» безкоштовна й допоможе знайти потрібну установу та кроки.",
      },
    ],
  },
  {
    slug: "deutsch-fuer-den-job",
    icon: "lang",
    cover: "/cover/deutsch-fuer-den-job.jpg",
    color: "rose",
    minutes: 5,
    title: {
      de: "Deutsch für den Job: welches Niveau brauchst du?",
      uk: "Німецька для роботи: який рівень потрібен?",
    },
    excerpt: {
      de: "B1, B2 oder C1? Welches Sprachniveau Arbeitgeber erwarten und wie du es schnell verbesserst.",
      uk: "B1, B2 чи C1? Який рівень мови очікують роботодавці й як його швидко покращити.",
    },
    body: [
      {
        type: "p",
        de: "Das nötige Sprachniveau hängt vom Beruf ab. Für einfache Tätigkeiten reicht oft A2–B1, im Kundenkontakt oder in der Pflege wird meist B2 verlangt, in akademischen Berufen häufig C1.",
        uk: "Потрібний рівень залежить від професії. Для простих робіт часто достатньо A2–B1, у роботі з клієнтами чи в догляді зазвичай вимагають B2, в академічних професіях — часто C1.",
      },
      {
        type: "h2",
        de: "Wie du schnell besser wirst",
        uk: "Як швидко покращити мову",
      },
      {
        type: "ul",
        de: [
          "Integrationskurs oder berufsbezogener Sprachkurs (BAMF, oft gefördert)",
          "Fachvokabular deiner Branche gezielt lernen",
          "Tandem-Partner oder Sprach-Apps für den Alltag",
          "Deutsches Radio/Podcasts hören, Untertitel nutzen",
        ],
        uk: [
          "Інтеграційний або фаховий мовний курс (BAMF, часто з фінансуванням)",
          "Цілеспрямовано вивчай фахову лексику своєї галузі",
          "Тандем-партнер або мовні застосунки для побуту",
          "Слухай німецьке радіо/подкасти, користуйся субтитрами",
        ],
      },
      {
        type: "tip",
        de: "Gib dein Sprachniveau im Lebenslauf ehrlich an. Übertreibung fällt spätestens im Gespräch auf.",
        uk: "Зазначай рівень мови в резюме чесно. Перебільшення виявиться щонайпізніше на співбесіді.",
      },
    ],
  },
  {
    slug: "ausbildung-vs-arbeit",
    icon: "compass",
    cover: "/cover/ausbildung-vs-arbeit.jpg",
    color: "green",
    minutes: 5,
    title: {
      de: "Ausbildung, Minijob oder Festanstellung?",
      uk: "Ausbildung, міні-джоб чи постійна робота?",
    },
    excerpt: {
      de: "Die Wege in den deutschen Arbeitsmarkt im Überblick — mit Vor- und Nachteilen für deinen Einstieg.",
      uk: "Огляд шляхів на німецький ринок праці — з плюсами й мінусами для старту.",
    },
    body: [
      {
        type: "p",
        de: "Der deutsche Arbeitsmarkt bietet mehrere Einstiegswege. Welcher passt, hängt von deiner Qualifikation, deinem Deutsch und deinen Zielen ab.",
        uk: "Німецький ринок праці пропонує кілька шляхів входу. Який підходить — залежить від кваліфікації, рівня німецької та цілей.",
      },
      {
        type: "h2",
        de: "Ausbildung",
        uk: "Ausbildung (професійне навчання)",
      },
      {
        type: "p",
        de: "Eine duale Ausbildung verbindet Arbeit im Betrieb mit Berufsschule. Du erhältst eine Vergütung und einen anerkannten Abschluss — ideal für einen langfristigen, sicheren Berufsweg.",
        uk: "Дуальна Ausbildung поєднує роботу на підприємстві з профшколою. Ти отримуєш зарплату й визнаний диплом — ідеально для надійного довгострокового шляху.",
      },
      {
        type: "h2",
        de: "Minijob",
        uk: "Міні-джоб",
      },
      {
        type: "p",
        de: "Ein Minijob (bis zur Geringfügigkeitsgrenze) ist flexibel und steuerlich begünstigt — gut als Einstieg, zum Sprachetraining oder als Nebenverdienst, aber meist nicht als Haupteinkommen.",
        uk: "Міні-джоб (до межі Geringfügigkeit) гнучкий і вигідний за податками — добрий для старту, мовної практики чи підробітку, але зазвичай не як основний дохід.",
      },
      {
        type: "h2",
        de: "Festanstellung",
        uk: "Постійна робота",
      },
      {
        type: "p",
        de: "Eine sozialversicherungspflichtige Festanstellung bietet das volle Paket: Kranken-, Renten- und Arbeitslosenversicherung, Urlaubsanspruch und Kündigungsschutz.",
        uk: "Постійна робота із соцстрахуванням дає повний пакет: медичне, пенсійне страхування й страхування на випадок безробіття, відпустку та захист від звільнення.",
      },
      {
        type: "tip",
        de: "Nutze die Filter in der Suche, um gezielt nach Ausbildung, Minijob oder Vollzeit zu suchen.",
        uk: "Користуйся фільтрами в пошуку, щоб шукати саме Ausbildung, міні-джоб чи повну зайнятість.",
      },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
