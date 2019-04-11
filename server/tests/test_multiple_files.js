const expect = require("chai").expect;
const request = require("supertest");
const { helpers, app } = require("../index");

describe("Multiple components depending on each other", function() {
  let utils = `
    import React from 'react';
    import htm from 'htm';
    const html = htm.bind(React.createElement)

    export default html;
    `;
  let Text = `
    import React from 'react';
    import html from "./utils";
    
    export function Heading(props){
        return html\`<h1 ...\${props}/>\`
    }
    function Text(props){
        return html\`<p ...\${props}/>\`
    }
    export default Text`;

  let index = `
    import React from 'react';
    import html from "./utils";
    import Text, {Heading} from "./Text";

    export default function (){
        return html\`<div>
            <\${Heading}>This is the heading</\${Heading}>
            <\${Text}>This is the text content</\${Text}>
        </div>\`
    }
    `;
  let result = `
    import React from 'react';
    import html from "./utils";
    export function Heading(props){
        return html\`<h1 ...\${props}/>\`
    }
    function Text(props){
        return html\`<p ...\${props}/>\`
    }
    export default function (){
        return html\`<div>
            <\${Heading}>This is the heading</\${Heading}>
            <\${Text}>This is the text content</\${Text}>
        </div>\`
    }
    `;

  let merged = `
    import React from 'react';
    import htm from 'htm';
    const html = htm.bind(React.createElement)
    export function Heading(props){
        return html\`<h1 ...\${props}/>\`
    }
    function Text(props){
        return html\`<p ...\${props}/>\`
    }
    export default function (){
        return html\`<div>
            <\${Heading}>This is the heading</\${Heading}>
            <\${Text}>This is the text content</\${Text}>
        </div>\`
    }
    `;
  describe("Get dependencies", () => {
    it("should get dependencies from files passed", () => {
      expect(helpers.getDependencies(utils)).to.eql([]);
      expect(helpers.getDependencies(Text)).to.eql(["./utils"]);
      expect(helpers.getDependencies(index)).to.eql(["./utils", "./Text"]);
      expect(
        helpers.getDependencies(`
      import React from 'react';
      import html from "../utils";
      import age from "../../../age";
      
      export function Heading(props){
          return html\`<h1 ...\${props}/>\`
      }
      function Text(props){
          return html\`<p ...\${props}/>\`
      }
      export default Text`)
      ).to.eql(["./utils", "./age"]);
    });
    it("should remove duplicate lines", () => {
      expect(
        helpers.removeNewlines(
          helpers.cleanSnippet(`
        import React from 'react';
        import htm from 'htm';
        const html = htm.bind(React.createElement)
        const html = htm.bind(React.createElement)
        export function Heading(props){
        return html\`<h1 ...\${props}/>\`
        }
        function Text(props){
        return html\`<p ...\${props}/>\`
        }`)
        )
      ).to.eql(
        helpers.removeNewlines(`
      import React from 'react';
      import htm from 'htm';
      const html = htm.bind(React.createElement)
      export function Heading(props){
      return html\`<h1 ...\${props}/>\`
      }
      function Text(props){
      return html\`<p ...\${props}/>\`
      }
  `)
      );
    });
  });
  describe("merging Files", () => {
    it("should remove `export default` line from files", () => {
      expect(helpers.removeDefaultExport(utils)).to.equal(
        helpers.removeNewlines(
          `import React from 'react';
                    import htm from 'htm';
                    const html = htm.bind(React.createElement)`
        )
      );
    });
    it("should reorder the imports to the bottom.", () => {
      expect(
        helpers.removeNewlines(
          helpers.reOrderImports(
            `
            import React from 'react';
            import utils from "./utils";
            import htm from 'htm';
            const html = html.bind(React.createElement)`,
            "./utils"
          )
        )
      ).to.equal(
        helpers.removeNewlines(
          `import React from 'react';
              import htm from 'htm';
              import utils from "./utils";
              const html = html.bind(React.createElement)`
        )
      );
    });
    it("should reorder imports for more advanced scenarios", () => {
      expect(
        helpers.removeNewlines(
          helpers.reOrderImports(
            `import React from 'react';
          import utils from "./utils";
          import htm from 'htm';
          import {RedZone} from "./utils";
          import styled from 'styled-components';
          const html = html.bind(React.createElement)`,
            "./utils"
          )
        )
      ).to.equal(
        helpers.removeNewlines(
          `import React from 'react';
            import htm from 'htm';
            import styled from 'styled-components';
            import utils from "./utils";
            import {RedZone} from "./utils";
            const html = html.bind(React.createElement)`
        )
      );
    });
    describe("Imports", () => {
      let mergedResult = `
            import React from 'react';
            import React from 'react';
            import htm from 'htm';
            const html = htm.bind(React.createElement)
            export function Heading(props){
                return html\`<h1 ...\${props}/>\`
            }
            function Text(props){
                return html\`<p ...\${props}/>\`
            }
            export default Text`;
      it("should replace `import` of a file with actual content", () => {
        expect(
          helpers.removeNewlines(
            helpers.replaceImport(Text, "./utils", utils),
            "\n"
          )
        ).to.equal(helpers.removeNewlines(mergedResult, "\n"));
        expect(
          helpers.removeNewlines(
            helpers.replaceImport(
              `
            import React from 'react';
            import html from "../utils";
            
            export function Heading(props){
                return html\`<h1 ...\${props}/>\`
            }
            function Text(props){
                return html\`<p ...\${props}/>\`
            }
            export default Text`,
              "./utils",
              utils
            ),
            "\n"
          )
        ).to.equal(helpers.removeNewlines(mergedResult, "\n"));
      });
      it("should remove duplicate imports", () => {
        expect(
          helpers.removeNewlines(helpers.removeDuplicateImports(mergedResult))
        ).to.equal(
          helpers.removeNewlines(
            `
            import React from 'react';
            import htm from 'htm';
            const html = htm.bind(React.createElement)
            export function Heading(props){
                return html\`<h1 ...\${props}/>\`
            }
            function Text(props){
                return html\`<p ...\${props}/>\`
            }
            export default Text`
          )
        );
        expect(
          helpers.removeNewlines(
            helpers.removeDuplicateImports(`
        import React from 'react';
        import React from "react";`)
          )
        ).to.equal(`import React from 'react';`);
      });
    });
    it("should remove duplicate dependencies", () => {
      let rr = helpers.removeDuplicates({
        files: {
          root: index,
          "./Text": Text,
          "./utils": utils
        }
      });
      expect(helpers.removeNewlines(rr)).to.equal(
        helpers.removeNewlines(merged)
      );
    });
  });
  describe("generating HTML", () => {
    it("When all dependencies are relative to each other", async () => {
      let schema = {
        files: {
          "./Text": Text,
          "./utils": utils,
          root: index
        }
      };
      let content = await helpers.createHTMLFromSchema(schema);
      expect(content).to.equal(
        "<div><h1>This is the heading</h1><p>This is the text content</p></div>"
      );
    });
    it("When an api call is made with custom props", async () => {
      let schema = {
        files: {
          "./Text": `
          import React from 'react';
          import html from "./utils";
          
          export function Heading({className, children}){
              return html\`<h1 className=\${className}>\${children}</h1>\`
          }
          function Text(props){
              return html\`<p ...\${props}/>\`
          }
          export default Text`,
          "./utils": `
          import React from 'react';
          import htm from 'htm';
          const html = htm.bind(React.createElement)
      
          export default html;
          `,
          root: `
          import React from 'react';
          import html from "./utils";
          import Text, {Heading} from "./Text";
      
          export default function ({name,age, className}){
              return html\`<div>
                  <\${Heading} className=\${className}>\${name}</\${Heading}>
                  <\${Text}>\${age}</\${Text}>
              </div>\`
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
    it("Scenario for similar module used in different file location", async () => {
      let schema = {
        files: {
          "./Text": `
          import React from 'react';
          import html from "../utils";
          
          export function Heading({className, children}){
              return html\`<h1 className=\${className}>\${children}</h1>\`
          }
          function Text(props){
              return html\`<p ...\${props}/>\`
          }
          export default Text`,
          "./utils": `
          import React from 'react';
          import htm from 'htm';
          const html = htm.bind(React.createElement)
      
          export default html;
          `,
          root: `
          import React from 'react';
          import html from "../../utils";
          import Text, {Heading} from "./Text";
      
          export default function ({name,age, className}){
              return html\`<div>
                  <\${Heading} className=\${className}>\${name}</\${Heading}>
                  <\${Text}>\${age}</\${Text}>
              </div>\`
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
  });
});
