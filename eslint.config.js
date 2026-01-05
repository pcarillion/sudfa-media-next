const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");

module.exports = [
  ...nextCoreWebVitals,
  {
    ignores: ["src/payload-types.ts"],
  },
];
