module.exports = {
  async redirects() {
    return [
      {
        source: "/birds",
        destination: "https://birds-ufb5n.ondigitalocean.app/birds",
        permanent: false,
      },
    ];
  },
};
