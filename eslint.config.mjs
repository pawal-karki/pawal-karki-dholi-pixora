import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  {
    rules: {
      // Allow underscore-prefixed unused variables (warn only)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Allow explicit any (warn only)
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow empty object types
      "@typescript-eslint/no-empty-object-type": "off",
      // Disable unescaped entities check
      "react/no-unescaped-entities": "off",
      // Warn on prefer-const
      "prefer-const": "warn",
      // Warn on require imports
      "@typescript-eslint/no-require-imports": "warn",
    },
  },
];

export default eslintConfig;
