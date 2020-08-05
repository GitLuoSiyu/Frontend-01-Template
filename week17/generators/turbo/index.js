var Generator = require('yeoman-generator');
module.exports = class extends Generator {
  prompting() {
    this.log('prompting - turbo');
  }

  writing() {
    this.log('writing - turbo');
  }
};