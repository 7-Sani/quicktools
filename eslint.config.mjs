import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Configure rules directly on the plugins that define them
const patchedVitals = nextVitals.map((conf) => {
  if (conf.plugins && conf.plugins["react-hooks"]) {
    return {
      ...conf,
      rules: {
        ...conf.rules,
        "react-hooks/set-state-in-effect": "warn",
        "react-hooks/exhaustive-deps": "warn",
      },
    };
  }
  return conf;
});

const eslintConfig = defineConfig([
  ...patchedVitals,
  ...nextTs,
  globalIgnores([
    "node_modules/**",
    ".next/**",
    ".netlify/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "tests/**",
  ]),
]);

export default eslintConfig;
