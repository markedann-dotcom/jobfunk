"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "de" | "uk";

type Dict = Record<string, string>;

const de: Dict = {
  "brand.tag": "Jobs in Deutschland — kostenlos finden",
  "nav.home": "Start",
  "nav.search": "Jobs suchen",
  "nav.about": "Über uns",
  "nav.favorites": "Merkliste",
  "lang.label": "Sprache",

  "hero.kicker": "Kostenlose Jobsuche · Daten der Bundesagentur für Arbeit",
  "hero.title.1": "Finde deinen nächsten",
  "hero.title.2": "Job in Deutschland",
  "hero.sub":
    "Tausende offene Stellen, Ausbildungen und Minijobs — an einem Ort. Einfach, übersichtlich und komplett kostenlos.",

  "form.was.label": "Was suchst du?",
  "form.was.ph": "Beruf, Stichwort, Position …",
  "form.was.loading": "Vorschläge werden geladen …",
  "form.wo.label": "Wo?",
  "form.wo.ph": "Stadt oder Postleitzahl",
  "form.radius.label": "Umkreis",
  "form.type.label": "Art der Stelle",
  "form.radius.0": "Genauer Ort",
  "form.radius.unit": "km",
  "form.submit": "Jobs suchen",
  "form.searching": "Suche läuft …",

  "type.all": "Alle",
  "type.1": "Arbeit",
  "type.4": "Ausbildung / Praktikum",
  "type.34": "Minijob",
  "type.2": "Selbstständigkeit",

  "results.title": "Ergebnisse",
  "results.count": "Stellen gefunden",
  "results.empty.title": "Keine Stellen gefunden",
  "results.empty.sub":
    "Versuch es mit einem anderen Stichwort, einem größeren Umkreis oder einer anderen Stadt.",
  "results.error.title": "Etwas ist schiefgelaufen",
  "results.error.sub":
    "Die Jobbörse antwortet gerade nicht. Bitte versuch es in ein paar Minuten erneut.",
  "results.loading": "Stellen werden geladen …",
  "results.back": "Zurück zur Suche",

  "card.published": "Veröffentlicht",
  "card.details": "Details",
  "card.goto": "Zur Stelle",
  "card.new": "Neu",

  "page.prev": "Zurück",
  "page.next": "Weiter",
  "page.of": "von",

  "detail.back": "Zurück zu den Ergebnissen",
  "detail.company": "Arbeitgeber",
  "detail.location": "Standort",
  "detail.published": "Veröffentlicht am",
  "detail.start": "Eintrittsdatum",
  "detail.type": "Art der Stelle",
  "detail.description": "Stellenbeschreibung",
  "detail.nodesc": "Für diese Stelle liegt keine ausführliche Beschreibung vor.",
  "detail.apply": "Jetzt bewerben",
  "detail.goto": "Zur Stelle bei der Bundesagentur",
  "detail.loading": "Stelle wird geladen …",
  "detail.error": "Diese Stelle konnte nicht geladen werden.",
  "detail.contact": "Kontakt",
  "detail.salary": "Vergütung",
  "detail.worktime": "Arbeitszeit",

  "footer.disclaimer":
    "JobFunke ist ein kostenloser, unabhängiger Service und nutzt offene Daten der Bundesagentur für Arbeit. Wir sind nicht mit der Bundesagentur für Arbeit verbunden.",
  "footer.rights": "Alle Rechte vorbehalten.",
  "footer.data": "Datenquelle",

  "cta.title": "Bereit für den nächsten Schritt?",
  "cta.sub": "Starte jetzt deine kostenlose Suche.",
  "cta.btn": "Jobs entdecken",

  "feat.1.t": "100 % kostenlos",
  "feat.1.d": "Keine Anmeldung, keine versteckten Kosten. Einfach suchen und finden.",
  "feat.2.t": "Echte Stellen",
  "feat.2.d": "Direkt aus der offiziellen Jobbörse der Bundesagentur für Arbeit.",
  "feat.3.t": "Einfach & klar",
  "feat.3.d": "Übersichtlich gestaltet — auch wenn dein Deutsch noch nicht perfekt ist.",

  "featured.title": "Aktuelle Stellenangebote",
  "featured.sub": "Frisch aus der Jobbörse — täglich neue Stellen in ganz Deutschland.",
  "featured.all": "Alle Jobs ansehen",
  "featured.tab.new": "Neueste",
  "featured.tab.ausbildung": "Ausbildung",
  "featured.tab.minijob": "Minijob",

  "share.label": "Teilen",
  "share.copy": "Link kopieren",
  "share.copied": "Kopiert!",

  "fav.add": "Merken",
  "fav.added": "Gemerkt",
  "fav.title": "Deine Merkliste",
  "fav.sub": "Gespeicherte Stellen — nur auf diesem Gerät, ohne Konto.",
  "fav.empty.title": "Noch nichts gemerkt",
  "fav.empty.sub": "Tippe bei einer Stelle auf das Herz, um sie hier zu speichern.",
  "fav.empty.cta": "Jobs suchen",
  "fav.remove": "Entfernen",
  "fav.count": "gemerkte Stellen",

  "auto.hint": "Stadt oder PLZ",

  "legal.impressum": "Impressum",
  "legal.datenschutz": "Datenschutz",
  "legal.imprint.title": "Impressum",
  "legal.privacy.title": "Datenschutzerklärung",

  "theme.light": "Helles Design",
  "theme.dark": "Dunkles Design",

  "pwa.title": "JobFunke installieren",
  "pwa.sub": "Füge die App zum Startbildschirm hinzu — schneller Zugriff, auch offline.",
  "pwa.ios": "Tippe in Safari auf „Teilen“ (Symbol unten) und dann „Zum Home-Bildschirm“, um JobFunke zu installieren.",
  "pwa.android": "Öffne das Browser-Menü (⋮ oben rechts) und tippe auf „App installieren“ bzw. „Zum Startbildschirm hinzufügen“.",
  "pwa.desktop": "Klicke in der Adressleiste auf das Installations-Symbol (⊕) oder öffne das Browser-Menü und wähle „JobFunke installieren“.",
  "pwa.howto": "So installierst du die App:",
  "pwa.install": "Installieren",
  "pwa.later": "Später",

  "ad.label": "Anzeige",
  "ad.placeholder.title": "Hier könnte Ihre Anzeige stehen",
  "ad.placeholder.sub": "Werbefläche für Arbeitgeber, Personaldienstleister & Bildungsanbieter.",
  "ad.placeholder.cta": "Werben auf JobFunke",

  "pwa.installed": "App installiert",
  "pwa.footer.cta": "App installieren",
  "pwa.footer.hint": "Füge JobFunke zum Startbildschirm hinzu — schnell & offline nutzbar.",

  "cookie.title": "Wir respektieren deine Privatsphäre",
  "cookie.text":
    "JobFunke verwendet nur technisch notwendige Speicherung (Sprache, Merkliste, Einstellungen) — keine Tracking- oder Werbe-Cookies. In der Kartenansicht werden Kacheln von OpenStreetMap geladen. Mehr in unserer",
  "cookie.accept": "Verstanden",
  "cookie.essential": "Nur Notwendige",
  "cookie.note": "Es werden keinerlei Werbe- oder Tracking-Cookies gesetzt.",
  "cookie.settings": "Cookie-Einstellungen",

  "legal.disclaimer": "Haftungsausschluss",
  "legal.disclaimer.title": "Haftungsausschluss",

  "footer.independence":
    "Wichtiger Hinweis: JobFunke ist ein unabhängiges, privates Angebot und steht in keiner Verbindung zur Bundesagentur für Arbeit. Alle Stellenangebote stammen von Dritten; für deren Inhalt, Richtigkeit und Verfügbarkeit übernehmen wir keine Haftung. Siehe Haftungsausschluss.",

  "disc.jobs":
    "Die Stellenangebote stammen von Dritten (Bundesagentur für Arbeit / inserierende Unternehmen). JobFunke übernimmt keine Haftung für deren Inhalt, Richtigkeit oder Verfügbarkeit. Zahle niemals Geld, um eine Stelle zu erhalten.",

  // advanced filters
  "filt.toggle": "Weitere Filter",
  "filt.arbeitszeit": "Arbeitszeit",
  "filt.az.vz": "Vollzeit",
  "filt.az.tz": "Teilzeit",
  "filt.az.ho": "Homeoffice",
  "filt.az.snw": "Schicht / Nacht",
  "filt.az.mj": "Minijob",
  "filt.since": "Veröffentlicht seit",
  "filt.since.0": "Beliebig",
  "filt.since.1": "Letzte 24 Stunden",
  "filt.since.3": "Letzte 3 Tage",
  "filt.since.7": "Letzte 7 Tage",
  "filt.since.14": "Letzte 14 Tage",
  "filt.since.30": "Letzte 30 Tage",
  "filt.befristung": "Befristung",
  "filt.befr.all": "Alle",
  "filt.befr.1": "Befristet",
  "filt.befr.2": "Unbefristet",

  // sorting
  "sort.label": "Sortieren",
  "sort.relevance": "Relevanz",
  "sort.date": "Datum",
  "sort.distance": "Entfernung",

  // saved searches
  "saved.save": "Suche speichern",
  "saved.saved": "Gespeichert",
  "saved.title": "Gespeicherte Suchen",
  "saved.empty": "Du hast noch keine Suchen gespeichert.",
  "saved.run": "Öffnen",
  "saved.delete": "Löschen",

  // recently viewed
  "recent.title": "Zuletzt angesehen",
  "recent.clear": "Leeren",

  // similar jobs
  "similar.title": "Ähnliche Stellen",

  // map
  "map.list": "Liste",
  "map.map": "Karte",
  "map.pins": "Stellen auf der Karte",
  "map.open": "Stelle ansehen",
  "map.none": "Für diese Suche liegen keine Standortdaten vor.",
  "map.tolist": "Zur Liste ↓",

  // netto calculator
  "netto.title": "Brutto-Netto-Rechner",
  "netto.sub": "Schätze dein Nettogehalt (2026)",
  "netto.brutto": "Brutto / Monat",
  "netto.stkl": "Steuerklasse",
  "netto.stkl.n": "Klasse",
  "netto.kirche": "Kirchensteuer",
  "netto.kinderlos": "Kinderlos (23+)",
  "netto.result": "Netto ca.",
  "netto.permonth": "pro Monat",
  "netto.ofbrutto": "vom Brutto",
  "netto.lohnsteuer": "Lohnsteuer",
  "netto.sozial": "Sozialabgaben",
  "netto.kirchensteuer": "Kirchensteuer",
  "netto.disclaimer":
    "Unverbindliche Schätzung nach vereinfachten Werten 2026 — keine Steuer- oder Rechtsberatung. Tatsächliche Werte können abweichen.",
  "netto.page.title": "Brutto-Netto-Rechner",
  "netto.page.sub":
    "Berechne überschlägig, wie viel von deinem Bruttogehalt netto übrig bleibt — nach Steuern und Sozialabgaben (Stand 2026).",

  // categories
  "cat.title": "Beliebte Berufsfelder",
  "cat.sub": "Finde Jobs in deinem Bereich — mit einem Klick.",

  // related berufe
  "rel.title": "Ähnliche Berufe",

  // bewerbung tips
  "tips.title": "Bewerbungs-Checkliste",
  "tips.sub": "So überzeugst du in Deutschland",
  "tips.for": "Tipps für",
  "tips.s1": "Aktuellen, lückenlosen Lebenslauf (tabellarisch) vorbereiten",
  "tips.s2": "Kurzes, individuelles Anschreiben mit Bezug zur Stelle",
  "tips.s3": "Relevante Zeugnisse & Qualifikationen als PDF bereithalten",
  "tips.s4": "Bei Bedarf: Anerkennung ausländischer Abschlüsse prüfen",
  "tips.s5": "Sprachniveau (z. B. B1/B2) ehrlich angeben",
  "tips.s6": "Innerhalb weniger Tage bewerben — frühe Bewerber haben Vorteile",

  // search history
  "hist.title": "Zuletzt gesucht",
  "hist.clear": "Löschen",

  // faq
  "faq.title": "Häufige Fragen",
  "faq.sub": "Alles Wichtige zur Jobsuche mit JobFunke",
  "faq.q1.q": "Ist JobFunke kostenlos?",
  "faq.q1.a": "Ja, JobFunke ist komplett kostenlos. Du kannst ohne Anmeldung suchen, Stellen merken und Suchen speichern.",
  "faq.q2.q": "Woher kommen die Stellenangebote?",
  "faq.q2.a": "Die Stellen stammen aus der offiziellen Jobsuche-Schnittstelle der Bundesagentur für Arbeit. JobFunke ist ein unabhängiger Dienst und nicht mit der Bundesagentur verbunden.",
  "faq.q3.q": "Muss ich mich registrieren?",
  "faq.q3.a": "Nein. Merkliste, gespeicherte Suchen und Verlauf werden nur lokal in deinem Browser gespeichert — kein Konto nötig.",
  "faq.q4.q": "Wie bewerbe ich mich auf eine Stelle?",
  "faq.q4.a": "Auf der Detailseite findest du den Link „Zur Stelle“, der dich zur Originalanzeige bzw. zum Arbeitgeber führt. Die Bewerbung erfolgt dort direkt.",
  "faq.q5.q": "Stimmen die Gehaltsangaben?",
  "faq.q5.a": "Die Datenquelle liefert in der Regel keine Gehälter. Unser Brutto-Netto-Rechner ist eine unverbindliche Schätzung und ersetzt keine Steuerberatung.",

  // onboarding
  "onb.badge": "Willkommen",
  "onb.title": "Willkommen bei JobFunke",
  "onb.sub": "Deine kostenlose Jobsuche für Deutschland — in 3 Schritten.",
  "onb.s1.t": "Suchen & filtern",
  "onb.s1.d": "Beruf und Ort eingeben, mit Filtern verfeinern.",
  "onb.s2.t": "Merken",
  "onb.s2.d": "Interessante Stellen mit dem Herz speichern.",
  "onb.s3.t": "Suche speichern",
  "onb.s3.d": "Suchen sichern und jederzeit schnell wiederholen.",
  "onb.cta": "Los geht's",

  // mobile nav
  "mnav.home": "Start",
  "mnav.search": "Suchen",
  "mnav.fav": "Merkliste",
  "mnav.netto": "Rechner",
  "mnav.wiki": "Ratgeber",

  "nav.wiki": "Ratgeber",
  "legal.title": "Rechtliches",
  "wiki.title": "Ratgeber & Tipps",
  "wiki.kicker": "Wissen für deine Jobsuche",
  "wiki.sub":
    "Praktische Anleitungen rund um Bewerbung, Lebenslauf, Vorstellungsgespräch und den Start in den deutschen Arbeitsmarkt — kostenlos und verständlich.",
  "wiki.readmore": "Artikel lesen",
  "wiki.minutes": "Min. Lesezeit",
  "wiki.back": "Zurück zum Ratgeber",
  "wiki.more.title": "Weitere Artikel",
  "wiki.cta.title": "Bereit für den nächsten Schritt?",
  "wiki.cta.sub": "Finde jetzt passende Stellen in ganz Deutschland.",
  "wiki.cta.btn": "Jobs suchen",
  "wiki.note":
    "Allgemeine Informationen, keine Rechts- oder Steuerberatung.",
};

const uk: Dict = {
  "brand.tag": "Вакансії в Німеччині — безкоштовно",
  "nav.home": "Головна",
  "nav.search": "Пошук роботи",
  "nav.about": "Про нас",
  "nav.favorites": "Збережені",
  "lang.label": "Мова",

  "hero.kicker": "Безкоштовний пошук · Дані Bundesagentur für Arbeit",
  "hero.title.1": "Знайди свою наступну",
  "hero.title.2": "роботу в Німеччині",
  "hero.sub":
    "Тисячі вакансій, навчань (Ausbildung) і міні-джобів — в одному місці. Просто, зрозуміло й абсолютно безкоштовно.",

  "form.was.label": "Що шукаєте?",
  "form.was.ph": "Професія, ключове слово, посада …",
  "form.was.loading": "Завантаження підказок …",
  "form.wo.label": "Де?",
  "form.wo.ph": "Місто або поштовий індекс",
  "form.radius.label": "Радіус",
  "form.type.label": "Тип вакансії",
  "form.radius.0": "Точне місце",
  "form.radius.unit": "км",
  "form.submit": "Шукати роботу",
  "form.searching": "Шукаємо …",

  "type.all": "Усі",
  "type.1": "Робота",
  "type.4": "Навчання / Практика",
  "type.34": "Міні-джоб",
  "type.2": "Самозайнятість",

  "results.title": "Результати",
  "results.count": "вакансій знайдено",
  "results.empty.title": "Вакансій не знайдено",
  "results.empty.sub":
    "Спробуйте інше ключове слово, більший радіус або інше місто.",
  "results.error.title": "Щось пішло не так",
  "results.error.sub":
    "Біржа праці зараз не відповідає. Спробуйте, будь ласка, за кілька хвилин.",
  "results.loading": "Завантажуємо вакансії …",
  "results.back": "Назад до пошуку",

  "card.published": "Опубліковано",
  "card.details": "Детальніше",
  "card.goto": "До вакансії",
  "card.new": "Нове",

  "page.prev": "Назад",
  "page.next": "Далі",
  "page.of": "з",

  "detail.back": "Назад до результатів",
  "detail.company": "Роботодавець",
  "detail.location": "Місце",
  "detail.published": "Опубліковано",
  "detail.start": "Дата початку",
  "detail.type": "Тип вакансії",
  "detail.description": "Опис вакансії",
  "detail.nodesc": "Для цієї вакансії немає докладного опису.",
  "detail.apply": "Подати заявку",
  "detail.goto": "До вакансії на Bundesagentur",
  "detail.loading": "Завантажуємо вакансію …",
  "detail.error": "Не вдалося завантажити цю вакансію.",
  "detail.contact": "Контакт",
  "detail.salary": "Оплата",
  "detail.worktime": "Робочий час",

  "footer.disclaimer":
    "JobFunke — це безкоштовний незалежний сервіс, що використовує відкриті дані Bundesagentur für Arbeit. Ми не пов'язані з Bundesagentur für Arbeit.",
  "footer.rights": "Усі права захищені.",
  "footer.data": "Джерело даних",

  "cta.title": "Готові до наступного кроку?",
  "cta.sub": "Почніть безкоштовний пошук просто зараз.",
  "cta.btn": "Знайти вакансії",

  "feat.1.t": "100 % безкоштовно",
  "feat.1.d": "Без реєстрації та прихованих платежів. Просто шукайте й знаходьте.",
  "feat.2.t": "Реальні вакансії",
  "feat.2.d": "Безпосередньо з офіційної біржі праці Bundesagentur für Arbeit.",
  "feat.3.t": "Просто й зрозуміло",
  "feat.3.d": "Зручний інтерфейс — навіть якщо ваша німецька ще не ідеальна.",

  "featured.title": "Актуальні вакансії",
  "featured.sub": "Свіжі вакансії з біржі праці — щодня нові пропозиції по всій Німеччині.",
  "featured.all": "Усі вакансії",
  "featured.tab.new": "Найновіші",
  "featured.tab.ausbildung": "Навчання",
  "featured.tab.minijob": "Міні-джоб",

  "share.label": "Поділитися",
  "share.copy": "Скопіювати посилання",
  "share.copied": "Скопійовано!",

  "fav.add": "Зберегти",
  "fav.added": "Збережено",
  "fav.title": "Збережені вакансії",
  "fav.sub": "Збережені вакансії — лише на цьому пристрої, без акаунта.",
  "fav.empty.title": "Поки що порожньо",
  "fav.empty.sub": "Натисніть на сердечко біля вакансії, щоб зберегти її тут.",
  "fav.empty.cta": "Шукати роботу",
  "fav.remove": "Видалити",
  "fav.count": "збережених вакансій",

  "auto.hint": "Місто або індекс",

  "legal.impressum": "Вихідні дані (Impressum)",
  "legal.datenschutz": "Конфіденційність",
  "legal.imprint.title": "Impressum (Вихідні дані)",
  "legal.privacy.title": "Політика конфіденційності",

  "theme.light": "Світла тема",
  "theme.dark": "Темна тема",

  "pwa.title": "Встановити JobFunke",
  "pwa.sub": "Додайте застосунок на головний екран — швидкий доступ навіть офлайн.",
  "pwa.ios": "У Safari натисніть «Поділитися» (значок унизу), а потім «На початковий екран», щоб встановити JobFunke.",
  "pwa.android": "Відкрийте меню браузера (⋮ вгорі праворуч) і натисніть «Встановити застосунок» або «Додати на головний екран».",
  "pwa.desktop": "Натисніть значок встановлення (⊕) в адресному рядку або відкрийте меню браузера й виберіть «Встановити JobFunke».",
  "pwa.howto": "Як встановити застосунок:",
  "pwa.install": "Встановити",
  "pwa.later": "Пізніше",

  "ad.label": "Реклама",
  "ad.placeholder.title": "Тут може бути ваша реклама",
  "ad.placeholder.sub": "Рекламне місце для роботодавців, кадрових агенцій та навчальних центрів.",
  "ad.placeholder.cta": "Реклама на JobFunke",

  "pwa.installed": "Застосунок встановлено",
  "pwa.footer.cta": "Встановити застосунок",
  "pwa.footer.hint": "Додайте JobFunke на головний екран — швидко та офлайн.",

  "cookie.title": "Ми поважаємо вашу приватність",
  "cookie.text":
    "JobFunke використовує лише технічно необхідне локальне збереження (мова, збережені вакансії, налаштування) — жодних трекінгових чи рекламних cookie. У режимі карти завантажуються плитки OpenStreetMap. Докладніше в нашій",
  "cookie.accept": "Зрозуміло",
  "cookie.essential": "Лише необхідні",
  "cookie.note": "Рекламні та трекінгові cookie не встановлюються.",
  "cookie.settings": "Налаштування cookie",

  "legal.disclaimer": "Відмова від відповідальності",
  "legal.disclaimer.title": "Відмова від відповідальності (Haftungsausschluss)",

  "footer.independence":
    "Важливо: JobFunke — незалежний приватний сервіс, не пов'язаний з Bundesagentur für Arbeit. Усі вакансії надані третіми сторонами; ми не несемо відповідальності за їхній зміст, точність чи доступність. Див. Відмову від відповідальності.",

  "disc.jobs":
    "Вакансії надані третіми сторонами (Bundesagentur für Arbeit / роботодавці). JobFunke не несе відповідальності за їхній зміст, точність чи доступність. Ніколи не платіть гроші, щоб отримати роботу.",

  // advanced filters
  "filt.toggle": "Більше фільтрів",
  "filt.arbeitszeit": "Зайнятість",
  "filt.az.vz": "Повна",
  "filt.az.tz": "Часткова",
  "filt.az.ho": "Віддалено",
  "filt.az.snw": "Зміни / ніч",
  "filt.az.mj": "Міні-джоб",
  "filt.since": "Опубліковано",
  "filt.since.0": "Будь-коли",
  "filt.since.1": "За 24 години",
  "filt.since.3": "За 3 дні",
  "filt.since.7": "За 7 днів",
  "filt.since.14": "За 14 днів",
  "filt.since.30": "За 30 днів",
  "filt.befristung": "Термін",
  "filt.befr.all": "Усі",
  "filt.befr.1": "Тимчасова",
  "filt.befr.2": "Безстрокова",

  // sorting
  "sort.label": "Сортувати",
  "sort.relevance": "Релевантність",
  "sort.date": "Дата",
  "sort.distance": "Відстань",

  // saved searches
  "saved.save": "Зберегти пошук",
  "saved.saved": "Збережено",
  "saved.title": "Збережені пошуки",
  "saved.empty": "Ви ще не зберегли жодного пошуку.",
  "saved.run": "Відкрити",
  "saved.delete": "Видалити",

  // recently viewed
  "recent.title": "Нещодавно переглянуті",
  "recent.clear": "Очистити",

  // similar jobs
  "similar.title": "Схожі вакансії",

  // map
  "map.list": "Список",
  "map.map": "Карта",
  "map.pins": "Вакансії на карті",
  "map.open": "Переглянути вакансію",
  "map.none": "Для цього пошуку немає даних про місцезнаходження.",
  "map.tolist": "До списку ↓",

  // netto calculator
  "netto.title": "Калькулятор брутто-нетто",
  "netto.sub": "Оцініть свою зарплату на руки (2026)",
  "netto.brutto": "Брутто / місяць",
  "netto.stkl": "Податковий клас",
  "netto.stkl.n": "Клас",
  "netto.kirche": "Церковний податок",
  "netto.kinderlos": "Без дітей (23+)",
  "netto.result": "Нетто прибл.",
  "netto.permonth": "на місяць",
  "netto.ofbrutto": "від брутто",
  "netto.lohnsteuer": "Прибутковий податок",
  "netto.sozial": "Соціальні внески",
  "netto.kirchensteuer": "Церковний податок",
  "netto.disclaimer":
    "Орієнтовна оцінка за спрощеними значеннями 2026 — не є податковою чи юридичною консультацією. Реальні значення можуть відрізнятися.",
  "netto.page.title": "Калькулятор брутто-нетто",
  "netto.page.sub":
    "Розрахуйте приблизно, скільки від вашої зарплати-брутто залишиться на руки — після податків і соціальних внесків (станом на 2026).",

  // categories
  "cat.title": "Популярні сфери",
  "cat.sub": "Знайдіть роботу у своїй сфері — одним кліком.",

  // related berufe
  "rel.title": "Схожі професії",

  // bewerbung tips
  "tips.title": "Чек-лист для заявки",
  "tips.sub": "Як справити враження в Німеччині",
  "tips.for": "Поради для",
  "tips.s1": "Підготуйте актуальне резюме без пропусків (табличне, Lebenslauf)",
  "tips.s2": "Короткий індивідуальний супровідний лист (Anschreiben) під вакансію",
  "tips.s3": "Тримайте напоготові дипломи та сертифікати у форматі PDF",
  "tips.s4": "За потреби: перевірте визнання іноземних дипломів (Anerkennung)",
  "tips.s5": "Чесно вкажіть рівень мови (напр. B1/B2)",
  "tips.s6": "Подавайтеся протягом кількох днів — ранні кандидати мають перевагу",

  // search history
  "hist.title": "Останні пошуки",
  "hist.clear": "Очистити",

  // faq
  "faq.title": "Часті запитання",
  "faq.sub": "Усе важливе про пошук роботи з JobFunke",
  "faq.q1.q": "JobFunke безкоштовний?",
  "faq.q1.a": "Так, JobFunke повністю безкоштовний. Ви можете шукати без реєстрації, зберігати вакансії та пошуки.",
  "faq.q2.q": "Звідки беруться вакансії?",
  "faq.q2.a": "Вакансії надходять з офіційного інтерфейсу пошуку Bundesagentur für Arbeit. JobFunke — незалежний сервіс і не пов'язаний з Bundesagentur.",
  "faq.q3.q": "Чи потрібна реєстрація?",
  "faq.q3.a": "Ні. Збережені вакансії, пошуки та історія зберігаються лише локально у вашому браузері — обліковий запис не потрібен.",
  "faq.q4.q": "Як подати заявку на вакансію?",
  "faq.q4.a": "На сторінці вакансії є посилання «До вакансії», яке веде до оригінального оголошення або роботодавця. Подача заявки відбувається там безпосередньо.",
  "faq.q5.q": "Чи правильні дані про зарплату?",
  "faq.q5.a": "Джерело даних зазвичай не надає зарплат. Наш калькулятор брутто-нетто — це орієнтовна оцінка й не замінює податкової консультації.",

  // onboarding
  "onb.badge": "Ласкаво просимо",
  "onb.title": "Ласкаво просимо до JobFunke",
  "onb.sub": "Ваш безкоштовний пошук роботи в Німеччині — за 3 кроки.",
  "onb.s1.t": "Шукайте та фільтруйте",
  "onb.s1.d": "Введіть професію й місто, уточніть фільтрами.",
  "onb.s2.t": "Зберігайте",
  "onb.s2.d": "Зберігайте цікаві вакансії сердечком.",
  "onb.s3.t": "Зберігайте пошук",
  "onb.s3.d": "Зберігайте пошуки й швидко повторюйте їх будь-коли.",
  "onb.cta": "Почати",

  // mobile nav
  "mnav.home": "Головна",
  "mnav.search": "Пошук",
  "mnav.fav": "Збережені",
  "mnav.netto": "Калькулятор",
  "mnav.wiki": "Поради",

  "nav.wiki": "Поради",
  "legal.title": "Правова інформація",
  "wiki.title": "Поради та статті",
  "wiki.kicker": "Знання для пошуку роботи",
  "wiki.sub":
    "Практичні інструкції щодо заявки, резюме, співбесіди та старту на німецькому ринку праці — безкоштовно й зрозуміло.",
  "wiki.readmore": "Читати статтю",
  "wiki.minutes": "хв читання",
  "wiki.back": "Назад до порад",
  "wiki.more.title": "Інші статті",
  "wiki.cta.title": "Готовий до наступного кроку?",
  "wiki.cta.sub": "Знайди відповідні вакансії по всій Німеччині.",
  "wiki.cta.btn": "Шукати роботу",
  "wiki.note":
    "Загальна інформація, не є юридичною чи податковою консультацією.",
};

const dicts: Record<Lang, Dict> = { de, uk };

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("de");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("jf_lang") as Lang | null;
      if (saved === "de" || saved === "uk") setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("jf_lang", l);
    } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.lang = l === "uk" ? "uk" : "de";
    }
  };

  const t = (key: string) => dicts[lang][key] ?? dicts.de[key] ?? key;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used within I18nProvider");
  return ctx;
}
