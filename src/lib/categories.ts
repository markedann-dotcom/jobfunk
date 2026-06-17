// Job categories shown as tiles on the homepage. Each links to a /suche?was= query.
// icon = key resolved in the CategoryTiles component (no emoji — inline SVGs).

export type CatColor = "amber" | "coral" | "rose" | "violet" | "blue" | "teal" | "green" | "gold";

export interface Category {
  id: string;
  was: string; // search keyword sent to Bundesagentur
  de: string;
  uk: string;
  icon: string;
  color: CatColor;
  img: string; // background photo (in /public/cat/)
}

export const CATEGORIES: Category[] = [
  { id: "pflege", was: "Pflege", de: "Pflege & Gesundheit", uk: "Догляд і здоров'я", icon: "health", color: "coral", img: "/cat/pflege.jpg" },
  { id: "it", was: "IT", de: "IT & Software", uk: "IT та розробка", icon: "code", color: "violet", img: "/cat/it.jpg" },
  { id: "handwerk", was: "Handwerk", de: "Handwerk", uk: "Ремесла", icon: "tools", color: "amber", img: "/cat/handwerk.jpg" },
  { id: "gastro", was: "Gastronomie", de: "Gastronomie", uk: "Гастрономія", icon: "food", color: "rose", img: "/cat/gastro.jpg" },
  { id: "logistik", was: "Lager Logistik", de: "Lager & Logistik", uk: "Склад і логістика", icon: "box", color: "blue", img: "/cat/logistik.jpg" },
  { id: "verkauf", was: "Verkauf", de: "Verkauf & Handel", uk: "Продажі й торгівля", icon: "cart", color: "teal", img: "/cat/verkauf.jpg" },
  { id: "buero", was: "Büro Verwaltung", de: "Büro & Verwaltung", uk: "Офіс і адміністрація", icon: "desk", color: "blue", img: "/cat/buero.jpg" },
  { id: "bau", was: "Bau", de: "Bau & Ausbau", uk: "Будівництво", icon: "helmet", color: "gold", img: "/cat/bau.jpg" },
  { id: "reinigung", was: "Reinigung", de: "Reinigung", uk: "Прибирання", icon: "spray", color: "teal", img: "/cat/reinigung.jpg" },
  { id: "fahrer", was: "Fahrer", de: "Fahrer & Transport", uk: "Водії й транспорт", icon: "truck", color: "green", img: "/cat/fahrer.jpg" },
  { id: "produktion", was: "Produktion", de: "Produktion", uk: "Виробництво", icon: "gear", color: "violet", img: "/cat/produktion.jpg" },
  { id: "erziehung", was: "Erzieher", de: "Erziehung & Soziales", uk: "Освіта й соцсфера", icon: "people", color: "green", img: "/cat/erziehung.jpg" },
];
