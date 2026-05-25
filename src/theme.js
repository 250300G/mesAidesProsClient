// src/theme.js
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      primary: "#0F172A",   // Slate 900 (Bleu nuit ardoise, hautement professionnel) 
      secondary: "#334155",// Slate 700 (Tons secondaires pour le texte)
      accent: "#10B981",    
      bgLight: "#F8FAFC",  // Slate 50 (Fond reposant, anti-fatigue visuelle)
      cardBg: "#FFFFFF",    // Blanc pur chirurgical pour les conteneurs CRUD
      border: "#E2E8F0",     // Slate 200 (Bordures fines et élégantes)
    },
  },
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
styles: {
    global: {
      body: {
        bg: "brand.bgLight",
        color: "brand.primary",
      },
    },
  },

});

export default theme;