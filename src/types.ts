export type ArticleMode = "Sur site" | "À distance" | "Hybride";

export type Article = {
  id: string;
  name: string;
  type: string;
  service: string;
  competencesRequired: string[];
  standardDuration: number;
  mode: ArticleMode;
  description: string;
};

export type WorkDays = {
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
  sun: boolean;
};

export type Consultant = {
  id: string;
  name: string;
  competences: string[];
  location: string;
  service: string;
  email?: string; // ✅ non obligatoire
  phone?: string;
  workDays: WorkDays; // ✅ jours travaillés
};

export type Competence = {
  id: string;
  name: string;
};
