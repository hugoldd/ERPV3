export const ORGANIZATION_ID = import.meta.env.VITE_ORGANIZATION_ID as string;

if (!ORGANIZATION_ID) {
  throw new Error("VITE_ORGANIZATION_ID manquant : ajoutez-le dans .env");
}
