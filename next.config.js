module.exports = {
  async redirects() {
    return [
      {
        source: "/birds",
        destination: "https://mini-birds-epqxk.ondigitalocean.app",
        permanent: false,
      },
      {
        source: "/tanx",
        destination: "https://tanx.io",
        permanent: false,
      },
    ];
  },
};
