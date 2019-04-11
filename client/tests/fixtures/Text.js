import React from "react";
import html from "./utils";

export function Heading(props) {
  return html`
    <h1 ...${props} />
  `;
}
function Text(props) {
  return html`
    <p ...${props} />
  `;
}
export default Text;
