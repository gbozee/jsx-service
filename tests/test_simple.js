const expect = require("chai").expect;
const path = require("path");
const request = require("supertest");
const fs = require("fs");
const {
  createComponentFile,
  getHTML,
  getHTMLFromText,
  app,
  createHTMLDirectly
} = require("../index");

describe("Array", function() {
  describe("React component as a string", () => {
    let text = `
    import React from 'react';
    import htm from 'htm';
    
    const html = htm.bind(React.createElement);
    
    export default function Name({name}){
      return html\`<div>\${name}</div>\`
    }
    
    
    `;
    let file = path.resolve(__dirname, "..", "modules", "name.js");
    it("should create a file locally", function(done) {
      createComponentFile(file, text).then(() => {
        let result = fs.existsSync(file);
        console.log(result);
        expect(result).to.equal(true);
        done();
      });
    });
    it("Should generate an html file from the module", function(done) {
      getHTMLFromText(text, file, { name: "Abiola" }).then(content => {
        expect(content).to.equal("<div>Abiola</div>");
        done();
      });
    });
    it("Should return a text response of the html", function(done) {
      request(app.handler)
        .post("/generate")
        .send({ text, props: { name: "Abiola" } })
        .set("Accept", "application/json")
        .expect(200)
        .then(response => {
          expect(response.body.html).to.equal("<div>Abiola</div>");
          done();
        });
    });
  });
  describe("React components with emotion styling", () => {
    let text = `
    import React from 'react';
    import htm from 'htm';
    import {css} from 'emotion';

    const html = htm.bind(React.createElement);

    const style = css\`
      color: red;
      font-size: 20px;\`
    
    export default function Name({name}){
      return html\`<div className="\${style}">\${name}</div>\`
    }

      `;
    let file = path.resolve(__dirname, "..", "modules", "css.js");

    it("Should generate an html file from the module", function(done) {
      getHTMLFromText(text, file, { name: "Shola" }).then(content => {
        expect(content).includes("data-emotion-css");
        expect(content).include("Shola");
        done();
      });
    });
    it("Should use the inmemory implementation for the module", function(done) {
      createHTMLDirectly(text, file, { name: "Shola" }).then(content => {
        expect(content).includes("data-emotion-css");
        expect(content).include("Shola");
        done();
      });
    });
  });
  describe("More Complex Scenario", () => {
    let text2 = `
    import React from "react";
    import { css } from "emotion";
    import htm from "htm";

    const html = htm.bind(React.createElement);

    const style = css\`;
    color: yellow;
    \`;

    export function First ({ age }) {
      return html\`
        <h2 className="\${style}">\${age}</h2>
      \`;
    };

    const Last = ({ name, age }) => {
      return html\`<div>
        <\${First} age=\${age}/>
        \${name}
        </div>\`;
    };

    export default function(props) {
      return html\` <\${Last} ...\${props} /> \`;
    }

      `;
      let file = path.resolve(__dirname, "..", "modules", "css.js");

    it("Should generate an html file from the module", function(done) {
      createHTMLDirectly(text2, file, { name: "Shola", age: 25 }).then(content => {
        expect(content).includes("data-emotion-css");
        expect(content).include("Shola");
        expect(content).include("25");
        done();
      });
    });
  });
});
