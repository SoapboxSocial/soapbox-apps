module.exports = {
  purge: ["**/*.{js,jsx,ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        soapbox: "#8359fe",
        light: {
          systemGrey: "#8e8e93",
          systemGrey2: "#aeaeb2",
          systemGrey3: "#c7c7cc",
          systemGrey4: "#d1d1d6",
          systemGrey5: "#e5e5ea",
          systemGrey6: "#f2f2f7",
          systemRed: "#ff3b30",
        },
        dark: {
          systemGrey: "#8e8e93",
          systemGrey2: "#636366",
          systemGrey3: "#48484a",
          systemGrey4: "#3a3a3c",
          systemGrey5: "#2c2c2e",
          systemGrey6: "#1c1c1e",
          systemRed: "#ff453a",
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
