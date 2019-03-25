const expect = require("chai").expect;
const { helpers } = require("../index");

describe("Multiple components depending on each other", function() {
  let utils = `
    import React from 'react';
    import htm from 'html';
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
  describe("merging Files", () => {
    it("should remove `export default` line from files", () => {
      expect(helpers.removeDefaultExport(utils)).to.equal(
        helpers.removeNewlines(
          `import React from 'react';
                    import htm from 'html';
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
            import htm from 'html';
            const html = html.bind(React.createElement)`,
            "./utils"
          )
        )
      ).to.equal(
        helpers.removeNewlines(
          `import React from 'react';
              import htm from 'html';
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
          import htm from 'html';
          import {RedZone} from "./utils";
          import styled from 'styled-components';
          const html = html.bind(React.createElement)`,
            "./utils"
          )
        )
      ).to.equal(
        helpers.removeNewlines(
          `import React from 'react';
            import htm from 'html';
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
            import htm from 'html';
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
      });
      it("should remove duplicate imports", () => {
        expect(
          helpers.removeNewlines(helpers.removeDuplicateImports(mergedResult))
        ).to.equal(
          helpers.removeNewlines(
            `
            import React from 'react';
            import htm from 'html';
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
      });
    });
    it("should remove duplicate dependencies", () => {
      expect(
        helpers.removeNewlines(
          helpers.removeDuplicates({
            files: {
              root: index,
              "./Text": Text
            },
            resolutions: {
              root: ["./Text"]
            }
          })
        )
      ).to.equals(helpers.removeNewlines(result));
    });
  });
  describe("generating HTML", () => {
    it("When all dependencies are relative to each other", () => {
      let schema = {
        files: {
          "./Text": Text,
          "./utils": utils,
          root: index
        },
        resolutions: {
          root: ["./Text", "./utils"],
          "./Text": ["./utils"]
        }
      };
      helpers.createHTMLFromSchema(schema).then(content => {
        expect(content).to.equal(
          "<div><h1>This is the heading</h1><p>this is the text content</p></div>"
        );
      });
    });
  });
});
