import manifest from "./package.json";
import commonjs from "rollup-plugin-commonjs";
import resolve  from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript";

export default {
    external: [
        'path',
        'util'
    ],

    input: "src/index.ts",

    output: [
        /* output for nodejs environments */
        { file: manifest.main, format: "cjs" },
        /* output for esnext environments */
        { file: manifest.module, format: "es" }
    ],

    plugins: [
        /* tells rollup howto find in node_modules */
        resolve({
            mainFields: [
                "module",
                "jsnext",
                "jsnext:main",
                "browser",
                "main"
            ]
        }),
        /* converts commonjs modules to es modules */
        commonjs({
            include: "node_modules/**",
            namedExports: {
                "react": [
                    "createElement",
                    "Fragment"
                ],
                "react-dom": [
                    "render"
                ]
            }
        }),
        /* transpiles ts files to plain javascript */
        typescript()
    ]
};