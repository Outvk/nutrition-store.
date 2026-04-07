export const STORE_CONFIG = {
  // Branding
  name: "RIVER",
  nameSuffix: "NUTRITION",
  logoText: "RIVER",
  logoHighlight: "NUTRITION",
  description: "Suppléments sportifs authentiques. Livrés partout en Algérie avec soin.",
  copyright: "© 2026 RiverNutrition. Tous droits réservés.",
  deliveryPartner: "Noest-DZ",

  // Contact Information
  phone: "0555 123 456",
  email: "contact@river-nutrition.com",
  socials: {
    facebook: "https://facebook.com/river-nutrition",
    instagram: "https://instagram.com/river-nutrition",
    whatsapp: "https://wa.me/213555123456",
  },

  // Localization / Delivery
  currency: "DA",
  defaultDeliveryFee: 700,
  deliveryFees: {
    "Alger": 400,
    "Oran": 500,
    "Constantine": 500,
    "Annaba": 600,
    "Blida": 400,
    "Tizi Ouzou": 500,
    "Béjaïa": 550,
    "Sétif": 550,
  } as Record<string, number>,

  // Aesthetics (CSS Variables reference)
  colors: {
    accent: "#e8ff00",
    background: "#080808",
  }
};
