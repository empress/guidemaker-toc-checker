const { expect } = require('chai');
const { existsSync, readFileSync } = require('fs');
const walkSync = require('walk-sync');
const _ = require('lodash');
const yaml = require('js-yaml');
const {
  extname,
  basename,
  dirname,
  join,
} = require('path');

module.exports = () => {
  const allPaths = walkSync('guides');

  const foldersWithMarkdown = _.chain(allPaths)
    .filter(filePath => extname(filePath) === '.md')
    .map(filePath => `guides/${filePath}`)
    .map(filePath => dirname(filePath))
    .uniq()
    .value();

  const pagesFiles = _.chain(allPaths)
    .filter(filePath => basename(filePath) === 'pages.yml')
    .map(filePath => `guides/${filePath}`)
    .value();

  /**
   * Autogenerate some mocha tests
   */
  foldersWithMarkdown.forEach((filepath) => {
    it(`checking folder ${filepath} for index.md`, function () {
      expect(existsSync(join(filepath, 'index.md')), `${join(filepath, 'index.md')} must exist`).to.be.ok;
    });
  });

  pagesFiles.forEach((pagesPath) => {
    it(`checking if all links in ${pagesPath} are correct`, function () {
      const pages = yaml.safeLoad(readFileSync(pagesPath, 'utf8'));
      const pagesFileDir = dirname(pagesPath);
      pages.forEach((section) => {
        section.pages.forEach((page) => {
          let filename = join(pagesFileDir, section.url, page.url);
          if (filename.endsWith('/')) {
            filename.replace(/\/^/, '.md');
          } else {
            filename += '.md';
          }
          expect(existsSync(filename), `${filename} must exist`).to.be.ok;
        });
      });
    });
  });
};
