import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { renderStylesToString } from "emotion-server";
import { createComponentFile } from "../main";
// import { requireFromString } from "require-from-memory";
// import requireFromString from "require-from-string";

export async function getHTML(Component, props = {}) {
  const html = renderStylesToString(
    renderToStaticMarkup(React.createElement(Component, props))
  );
  return new Promise(resolve => resolve(html));
}

export async function getHTMLFromText(text, name, props = {}) {
  await createComponentFile(name, text);
  let file_module = await import(name);
  let result = await getHTML(file_module.default, props);
  return result;
}

function requireFromString(filename, src) {
  var Module = module.constructor;
  var m = new Module(filename, module.parent);
  m.paths = module.paths;
  m._compile(src, filename);
  return m;
}
export async function createHTMLDirectly(text, name, props = {}) {
  let file_module = requireFromString(name, text);
  return await getHTML(file_module.exports.default, props);
}
