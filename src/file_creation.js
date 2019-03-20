import fs from "fs";
import path from "path";

function writeMyData(file_name, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file_name, data, function(err, data) {
      if (err) {
        console.log(err);
        reject();
      }
      console.log("Successfully Written to File.");
      resolve();
    });
  });
}
export const createComponentFile = (name, text) => {
  var dirname = path.dirname(name);
  let exists = false;
  if (fs.existsSync(dirname)) {
    exists = true;
  } else {
    fs.mkdirSync(dirname);
    exists = true;
  }
  if (exists) {
    return writeMyData(name, text);
  }
};
