module.exports = {
  purge: ["pages/**/*.tsx", "views/**/*.tsx", "components/**/*.tsx"],
  mode: "jit",
  darkMode: "media",
  theme: {
    borderRadius: {
      DEFAULT: "15px",
      large: "30px",
      full: "9999px",
    },
    extend: {
      fontFamily: {
        "mini-pixel": ["Mini Pixel", "monospace"],
      },
      colors: {
        soapbox: "#8359fe",
        accent: {
          pink: "#f990c3",
          green: "#49e6a4",
          cyan: "#66eae0",
        },
        systemGrey: "#8e8e93",
        systemGrey2: { light: "#aeaeb2", dark: "#636366" },
        systemGrey3: { light: "#c7c7cc", dark: "#48484a" },
        systemGrey4: { light: "#d1d1d6", dark: "#3a3a3c" },
        systemGrey5: { light: "#e5e5ea", dark: "#2c2c2e" },
        systemGrey6: { light: "#f2f2f7", dark: "#1c1c1e" },
        systemGreen: { light: "#34C759", dark: "#32D74B" },
        systemRed: { light: "#ff3b30", dark: "#ff453a" },
        label: { light: "#3c3c43", dark: "#ebebf5" },
      },
      textOpacity: {
        secondary: "0.6",
        tertiary: "0.3",
      },
    },
  },
  variants: {
    extend: {
      opacity: ["group-focus"],
    },
  },
  plugins: [require("@tailwindcss/aspect-ratio")],
};
