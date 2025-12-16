export type ArticleMode = "Sur site" | "À distance" | "Hybride";

export type Article = {
  id: string;
  name: string;
  type: string; // <-- devient dynamique (prestation.name)
  service: string;
  competencesRequired: string[];
  standardDuration: number;
  mode: ArticleMode;
  description: string;
};

export type Consultant = {
  id: string;
  name: string;
  competences: string[];
  location: string;
  service: string;
  availability: number; // %
  email: string;
  phone: string;
};
