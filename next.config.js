module.exports = {
  async redirects() {
    return [
      {
        source: "/birds",
        destination: "https://mini-birds-epqxk.ondigitalocean.app",
        permanent: false,
      },
    ];
  },
  future: {
    webpack5: true,
  },
};
