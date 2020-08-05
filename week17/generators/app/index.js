var Generator = require('yeoman-generator');

module.exports = class extends Generator {
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);

    // This makes `appname` a required argument.
    // this.argument("appname", { type: String, required: true });
    // this.log(this.options.appname);
    this.config.set('name', 'ghj')

    // Next, add your custom code
    this.option('babel', {
      hide: true,
    }); // This method adds support for a `--babel` flag

    this.option("coffee");

    // And you can then access it later; e.g.
    this.scriptSuffix = this.options.coffee ? ".coffee" : ".js";
    // Some generator methods can only be called inside the constructor function. 
    // These special methods may do things like set up important state controls and may not function outside of the constructor.

    // this.composeWith(require.resolve('../turbo'));
    // this.composeWith(require.resolve('../electric'));
    // this.composeWith(require.resolve('generator-bootstrap/generators/app'), {preprocessor: 'sass'});
    // this.composeWith('backbone:route', {rjs: true});
  }
  // Every method added to the prototype is run once the generator is called–and usually in sequence.
  // But, some special method names will trigger a specific run order.
  // method1() {
  //   this.log('method 1 just ran');
  // }

  // method2() {
  //   this.log('method 2 just ran');
  // }
  paths() {
    this.log(this.destinationRoot())
    // returns '~/projects'

    this.log(this.destinationPath('index.js'));
    // returns '~/projects/index.js'

    
    this.log(this.sourceRoot());
    // returns './templates'

    this.log(this.templatePath('index.js'));
    // returns './templates/index.js'
  }
  installingLodash() {
    // this.npmInstall(['lodash'], { 'save-dev': true });
  }
  initializing() {
    // Your initialization methods (checking current project state, getting configs, etc)
    console.log('initializing===================')
    console.log('initializing===================end')
  }
  async prompting () {
    console.log('prompting===================')
    this.answers = await this.prompt([
      {
        type: "input",
        name: "name",
        message: "Your project name",
        default: this.appname // Default to current folder name
      },
      {
        type: "confirm",
        name: "cool",
        message: "Would you like to enable the Cool feature?"
      },
      {
        type: "input",
        name: "username",
        message: "What's your GitHub username",
        store: true
      },
      {
        type    : 'input',
        name    : 'title',
        message : 'Your project title',
      }
    ]);
    console.log('prompting===================end')
  }
  configuring(){
    // Saving configurations and configure the project (creating .editorconfig files and other metadata files
    console.log('configuring===================')
    this.log(this.config.getAll())
    console.log('configuring===================end')
  }
  default() {
    // If the method name doesn’t match a priority, it will be pushed to this group
    console.log('default===================')
    console.log('default===================end')
  }
  writing() {
    // Where you write the generator specific files (routes, controllers, etc)
    console.log('writing===================')
    console.log(this.answers)
    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('public/index.html'),
      { title: this.answers.title }
    );
    console.log('writing===================end')
  }
  conflicts() {
    // Where conflicts are handled (used internally)
    console.log('conflicts===================')
    console.log('conflicts===================end')
  }
  install() {
    // Where installations are run (npm, bower)
    console.log('install===================')
    console.log('install===================end')
  }
  end() {
    //  Called last, cleanup, say good bye, etc
    console.log('end===================')
    console.log('end===================end')
  }
};