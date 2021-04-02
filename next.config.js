module.exports = {
  async redirects() {
    return [
      {
        source: "/birds",
        destination: "https://birds-tazyr.ondigitalocean.app/birds",
        permanent: false,
      },
    ];
  },
};
