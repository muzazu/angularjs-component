#!/usr/bin/env node
const {prompt} = require('inquirer');
const {readdirSync, mkdirSync, statSync, readFile, writeFile} = require('fs');
const {join, normalize} = require('path');

const CURR_DIR = process.cwd();
const modulesPath = fixPath(join(CURR_DIR, './app/src/'));
const modules = readdirSync(modulesPath);

const QUESTIONS = [
  {
    name: 'component-name',
    type: 'input',
    message: 'Component Name:',
    validate: function(input) {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
      else {
        // eslint-disable-next-line max-len
        return 'Component name may only include letters, numbers, underscores and hashes.';
      }
    },
  },
  {
    name: 'module-name',
    type: 'list',
    message: 'Target Module name:',
    choices: modules,
  },
];


prompt(QUESTIONS)
    .then((answers) => {
      const component = answers['component-name'];
      const moduleName = answers['module-name'];
      const dashedComponent = camelCaseToDash(component);
      const templatePath = fixPath(`${__dirname}/template`);
      // eslint-disable-next-line max-len
      const targetPath = fixPath(join(CURR_DIR, `./app/src/${moduleName}/components/${dashedComponent}`));

      try {
        mkdirSync(targetPath);

        createDirectoryContents(
            templatePath, targetPath, component, moduleName
        );
      } catch (error) {
        console.log(error);
      }
    });

/**
 * copy file from template to target path.
 * @param {string} templatePath template path.
 * @param {string} newProjectPath target project path.
 * @param {string} component name of component.
 * @param {string} moduleName name of module.
 */
function createDirectoryContents(
    templatePath, newProjectPath, component, moduleName
) {
  const filesToCreate = readdirSync(templatePath);

  filesToCreate.forEach((file) => {
    const origFilePath = `${templatePath}/${file}`;
    const dashedComponent = camelCaseToDash(component);
    const replaceFileName = file.replace(/template/, dashedComponent);
    const targetPath = `${newProjectPath}/${replaceFileName}`;

    // get stats about the current file
    const stats = statSync(origFilePath);
    if (stats.isFile()) {
      try {
        readFile(origFilePath, 'utf8', function(err, data) {
          if (err) {
            return console.log(err);
          }
          const result = data.replace(/REPTMPDashed/g, dashedComponent)
              .replace(/REPTMP/g, component)
              .replace(/moduleName/g, moduleName);

          writeFile(targetPath, result, 'utf8', function(err) {
            if (err) return console.log(err);
          });
        });
      } catch (err) {
        console.log(err);
      }
    }
  });
}

/**
 * fallback path for windows.
 * @param {string} originalPath template path.
 * @return {string} path string.
 */
function fixPath(originalPath) {
  const normalizePath = normalize(originalPath);
  return normalizePath.replace(/\\/g, '/');
}

/**
 * fallback path for windows.
 * @param {string} url filename or module name.
 * @return {string} dashed string.
 */
function camelCaseToDash(url) {
  return url.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
}
