module.exports = {
  async rewrites() {
    return [
      {
        source: "/birds",
        destination: "https://birds-tazyr.ondigitalocean.app/birds",
        basePath: false,
      },
    ];
  },
};
