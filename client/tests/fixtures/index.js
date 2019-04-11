import React from "react";
import html from "./utils";
import Text, { Heading } from "./Text";

export default function() {
  return html`<div>
        <${Heading}>This is the heading</${Heading}>
        <${Text}>This is the text content</${Text}>
    </div>`;
}
