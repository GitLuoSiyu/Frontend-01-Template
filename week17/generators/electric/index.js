var Generator = require('yeoman-generator');
module.exports = class extends Generator {
  prompting() {
    this.log('prompting - zap');
  }

  writing() {
    this.log('writing - zap');
  }
};