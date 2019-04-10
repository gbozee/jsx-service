import { transformAsync } from "@babel/core";
import { createHTMLDirectly } from "../html_creation";

async function rewrite(codeSnippet, props) {
  let result = await transformAsync(codeSnippet, {
    presets: ["@babel/preset-react"],
    plugins: [
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-syntax-dynamic-import"
    ]
  });
  return result;
}
async function compile(codeSnippet, fileName = undefined, props) {
  let result = await rewrite(codeSnippet);
  return createHTMLDirectly(result.code, undefined, props);
}
export default {
  compile
};
