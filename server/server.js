const { app } = require("./index");
const PORT = process.env.PORT || 3000;
app.listen(PORT, err => {
  if (err) throw err;
  console.log(`> Running on localhost:3000`);
});
