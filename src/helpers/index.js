function splitAndClean(text) {
  return text
    .split("\n")
    .filter(Boolean)
    .map(x => x.trim());
}

function createHTMLFromSchema(schema, props = {}) {
  let text = removeDuplicates(schema);
}

function removeDuplicates({ files, resolutions }) {
  let componentNames = Object.keys(resolutions);
  let nonRoot = componentNames.filter(
    (x, i) => i !== componentNames.indexOf("root")
  );
  let merged = nonRoot.map(component => {
    let merger = resolutions[component].map(x => files[x]).join("\n");
    return removeDefaultExport(merger);
  });
  let dependencies = resolutions.root;
  if (nonRoot.length > 0) {
    let mergingResolutions = [].concat(...nonRoot.map(x => resolutions[x]));
    dependencies = [...new Set([...dependencies, ...mergingResolutions])];
  }
  // let transform = nonRoot.map((component, index) => {
  //   let result = resolutions[component].map(x => {
  //     let orderedImport = reOrderImports(merged[index], x);
  //     let replacement = replaceImport(orderedImport, x, files[x]);
  //     return replacement;
  //   });
  //   let reordered = reOrderImports(result.join("\n"));
  //   return removeDuplicateImports(reordered);
  // });
  // if (transform.length > 0) {
  //   debugger;
  //   return;
  // }
  let rootJoin = dependencies.map(x => files[x]).join("\n");
  rootJoin = removeDefaultExport(rootJoin, "\n");
  let splitting = splitImportAndNonImport(rootJoin, dependencies);
  let importPath = splitting.modulePathImport
    .map(x => {
      let i = dependencies.find(o => x.includes(o));
      return files[i];
    })
    .join("\n");
  debugger;
  rootJoin = []
    .concat(
      ...splitting.notModulePathImport,
      importPath,
      splitting.withoutImport
    )
    .join("\n");

  let orderedImport = [];
  let finalText = rootJoin;
  finalText = reOrderImports(finalText, dependencies);
  dependencies.forEach((x, index) => {
    let replacement = replaceImport(finalText, x, files[x], "\n");
    finalText = replacement;
    orderedImport.push(replacement.split("\n"));
  });
  // let orderedImport = dependencies.map((x, index) => {
  //   let hmo = reOrderImports(rootJoin, x);
  //   let replacement = replaceImport(hmo, x, files[x], "\n");
  //   debugger;
  //   return replacement.split("\n");
  // });
  let { withoutImport, notModulePathImport } = splitImportAndNonImport(
    files.root,
    dependencies
  );
  let merger = []
    .concat(...orderedImport)
    .concat(notModulePathImport, withoutImport);
  let reordered = reOrderImports(merger.join("\n"), dependencies);
  let result = removeDuplicateImports(reordered);
  return result;
}
function removeNewlines(text, delimiter = "") {
  let result = splitAndClean(text).join(delimiter);
  return result;
}
function removeDefaultExport(text, delimiter = "") {
  let lineArray = splitAndClean(text);
  let remaining = lineArray.filter(line => !line.includes("export default"));
  return removeNewlines(remaining.join("\n"), delimiter);
}
function replaceImport(
  textContent,
  modulePath,
  moduleContent,
  delimiter = "\n"
) {
  let orderedImportContent = reOrderImports(textContent, modulePath);
  let cleanModuleContent = removeDefaultExport(moduleContent, delimiter);
  let {
    notModulePathImport,
    modulePathImport,
    withoutImport
  } = splitImportAndNonImport(orderedImportContent, modulePath);
  let newModulePathImport = modulePathImport.map(() => cleanModuleContent);
  let result = notModulePathImport
    .concat(newModulePathImport)
    .concat(withoutImport)
    .join(delimiter);
  return result;
}
function removeDuplicateImports(text, delimiter = "\n") {
  let { importLines, withoutImport } = splitImportAndNonImport(text);
  let noDuplicate = [...new Set(importLines)].concat(withoutImport);
  let result = noDuplicate.join(delimiter);
  return result;
}
function reOrderImports(text, modulePath) {
  let {
    notModulePathImport,
    modulePathImport,
    withoutImport
  } = splitImportAndNonImport(text, modulePath);
  return notModulePathImport
    .concat(modulePathImport)
    .concat(withoutImport)
    .join("\n");
}
function splitImportAndNonImport(text, modulePath) {
  let lineArray = splitAndClean(text);

  let importLines = lineArray.filter(x => x.includes("import"));
  let notModulePathImport = importLines.filter(x => {
    if (Array.isArray(modulePath)) {
      return !modulePath.some(m => x.includes(m));
    }
    return !x.includes(modulePath);
  });
  let modulePathImport = importLines.filter(x => {
    if (Array.isArray(modulePath)) {
      return modulePath.some(m => x.includes(m));
    }
    return x.includes(modulePath);
  });
  let withoutImport = lineArray.filter(x => !importLines.includes(x));
  return {
    importLines,
    notModulePathImport,
    modulePathImport,
    withoutImport
  };
}
export default {
  createHTMLFromSchema,
  removeDuplicates,
  removeDefaultExport,
  removeNewlines,
  replaceImport,
  removeDuplicateImports,
  reOrderImports
};
