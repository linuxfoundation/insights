// @ts-check
import path from "path";
import {fileURLToPath} from "url";
import {FlatCompat} from "@eslint/eslintrc";
import withNuxt from "./.nuxt/eslint.config.mjs";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const compat = new FlatCompat({
    baseDirectory: dirname
});

export default withNuxt({
    settings: {
        "import/resolver": {
            alias: {
                extensions: [".js", ".jsx", ".ts", ".tsx"],
                map: [["@", "./components"]]
            },
            typescript: {}
        },
        extends: [...compat.extends("airbnb-base"), ...compat.extends("airbnb-typescript/base")]
    },
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        semi: "warn",
        "comma-dangle": "warn",
        indent: "warn",
        "no-trailing-spaces": "warn",
        "vue/no-unused-components": "error",
        "vue/html-closing-bracket-spacing": "warn",
        "vue/html-indent": "warn",
        "vue/html-self-closing": "warn",
        "object-curly-spacing": "warn",
        "vue/html-button-has-type": "warn",
        "import/order": "warn",
        "keyword-spacing": "warn",
        "space-before-blocks": "warn",
        quotes: "warn",
        "no-unused-vars": "off",
        "no-multiple-empty-lines": "warn",
        "vue/no-v-html": "off",
        "import/prefer-default-export": "off",
        "import/no-named-as-default": "off",
        "class-methods-use-this": "off",
        "no-shadow": "off",
        "vuejs-accessibility/mouse-events-have-key-events": "off",
        "vuejs-accessibility/click-events-have-key-events": "off",
        "vuejs-accessibility/form-control-has-label": "off",
        "vuejs-accessibility/label-has-for": "off",
        "func-names": "off",
        "import/no-cycle": "off",
        "vue/max-len": [
            "error",
            {
                code: 150,
                ignoreComments: true,
                ignoreUrls: true
            }
        ],
        "import/extensions": [
            "error",
            "ignorePackages",
            {
                js: "never",
                jsx: "never",
                ts: "never",
                tsx: "never"
            }
        ]
    }
});
