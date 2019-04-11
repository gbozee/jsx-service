const expect = require("chai").expect;
const path = require("path");
const request = require("supertest");
const fs = require("fs");
const { getHTML, babelTransform, app } = require("../index");

describe("Babel Transpiling", function() {
  describe("React component as a string", () => {
    let text = `
    import React from 'react';

    let Age = React.lazy(()=>import("./holla"))
    
    class Sample extends React.Component{
      state = {
        abiola: 1
      }
      render(){
        return <h2>{this.state.abiola}</h2>
      }
    }
    export default function Name({name}){
      return <div>{name}<Sample/></div>
    }
    `;
    let file = path.resolve(__dirname, "..", "modules", "name.js");
    it("Should generate an html file from the module", async function() {
      let content = await babelTransform.compile(text, file, {
        name: "Abiola"
      });
      expect(content).to.equal("<div>Abiola<h2>1</h2></div>");
    });
    it("Should compile schema with babel flag", async () => {
      let schema = {
        babel: true,
        files: {
          "./Text": `
          import React from 'react';
          
          export function Heading({className, children}){
              return <h1 className={className}>{children}</h1>
          }
          function Text(props){
              return <p {...props}/>
          }
          export default Text`,
          root: `
          import React from 'react';
          import Text, {Heading} from "./Text";
      
          export default function ({name,age, className}){
              return <div>
                  <Heading className={className}>{name}</Heading>
                  <Text>{age}</Text>
              </div>
          }
          `
        }
      };
      let response = await request(app.handler)
        .post("/generate")
        .send({
          schema,
          props: {
            name: "Hello",
            age: "World",
            className: "two"
          }
        })
        .set("Accept", "application/json")
        .expect(200);
      expect(response.body.html).to.equal(
        '<div><h1 class="two">Hello</h1><p>World</p></div>'
      );
    });
    it("Should compile with emotion-core", async () => {
      let text = `
      /** @jsx jsx */
      import { css, jsx } from '@emotion/core'
      import React from 'react';
      
      const style = \`
        color: red;
        font-size: 20px;\`
      
      export default function Name({name}){
        return <div css={css\`\${style}\`}>{name}</div>
      }
  
        `;

      let content = await babelTransform.compile(text, file, { name: "Shola" });
      expect(content).includes("data-emotion-css");
      expect(content).include("Shola");
    });
  });
  describe("With Context usage and const functions", () => {
    let text = `
    import React from "react";

const AppContext = React.createContext({
  state: {}
});

const Provider = ({ initialState }) => {
  return (
    <AppContext.Provider value={{ state: initialState }}>
      <Application />
    </AppContext.Provider>
  );
};

const Application = ({}) => {
  let context = React.useContext(AppContext);
  return <div>{context.state.name}</div>;
};

export default function(props) {
  return <Provider initialState={props} />;
}

    `;
    it("Should compile to the correct result", async () => {
      let content = await babelTransform.compile(text, undefined, { name: "Shola" });
      expect(content).to.equal(`<div>Shola</div>`);
    });
  });
});
