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
};
