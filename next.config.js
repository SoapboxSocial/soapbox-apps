module.exports = {
  async redirects() {
    return [
      {
        source: "/birds",
        destination: "https://birds-k74q3.ondigitalocean.app/birds",
        permanent: false,
      },
    ];
  },
};
