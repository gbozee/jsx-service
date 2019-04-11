import polka from "polka";
import send from "@polka/send-type";
import bodyParser from "body-parser";
import { createHTMLDirectly } from "./html_creation";
import helpers from "./helpers";
const app = polka();

app.use(bodyParser.json());

app.post("/generate", async (req, res) => {
  let { text, props, schema } = req.body;
  try {
    let result;
    if (schema) {
      result = await helpers.createHTMLFromSchema(schema, props);
    } else {
      result = await createHTMLDirectly(text, undefined, props);
    }
    send(res, 200, { html: result });
  } catch (error) {
    send(res, 400, {
      error: { message: error.message, stack: error.stack }
    });
  } finally {
  }
});

export default app;
