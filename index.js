import {prompt} from 'inquirer';
import {readdirSync, mkdirSync, statSync, readFile, writeFile} from 'fs';
import {join, normalize} from 'path';

const modulesPath = fixPath(join(__dirname, '../app/src/'));
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
      const templatePath = fixPath(`${__dirname}/template`);
      // eslint-disable-next-line max-len
      const targetPath = fixPath(join(__dirname, `../app/src/${moduleName}/components/${component}`));

      try {
        mkdirSync(targetPath);

        createDirectoryContents(templatePath, targetPath, component);
      } catch (error) {
        console.log(error);
      }
    });

/**
 * copy file from template to target path.
 * @param {string} templatePath template path.
 * @param {string} newProjectPath target project path.
 * @param {string} component name of component.
 */
function createDirectoryContents(templatePath, newProjectPath, component) {
  const filesToCreate = readdirSync(templatePath);

  filesToCreate.forEach((file) => {
    const origFilePath = `${templatePath}/${file}`;
    const replaceFileName = file.replace(/template/, component);
    const targetPath = `${newProjectPath}/${replaceFileName}`;

    // get stats about the current file
    const stats = statSync(origFilePath);
    if (stats.isFile()) {
      try {
        readFile(origFilePath, 'utf8', function(err, data) {
          if (err) {
            return console.log(err);
          }
          const result = data.replace(/template/g, component);

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
