import polka from "polka";
import send from "@polka/send-type";
import bodyParser from "body-parser";
import { createHTMLDirectly } from "./html_creation";
const app = polka();

app.use(bodyParser.json());

app.post("/generate", async (req, res) => {
  let { component, props } = req.body;
  try {
    let result = await createHTMLDirectly(component, tempFile, props);
    send(res, 200, { html: result });
  } catch (error) {
    send(res, 400, {
      error: { message: error.message, stack: error.stack }
    });
  } finally {
  }
});

export default app;
