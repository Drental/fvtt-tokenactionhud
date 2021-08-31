import { terser } from "rollup-plugin-terser";

export default [
  {
    input: "scripts/init.js",
    output: {
      format: "umd",
      file: "scripts/bundle.min.js",
      name: "FVTT-TokenActionHud",
    },
    plugins: [terser()],
  },
];
