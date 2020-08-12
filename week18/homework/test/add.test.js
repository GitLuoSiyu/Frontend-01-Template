var add = require('../src/add.js');
// import {add} from '../src/add.js'
var assert = require('assert');
// import assert from 'assert';

// beforeEach(function () {
//   // beforeEach hook
// });

// beforeEach(function namedFun() {
//   // beforeEach:namedFun
// });

// beforeEach('加法函数的测试', function () {
//   // beforeEach:some description
// });

describe('加法函数的测试', function() {
  it('1 加 1 应该等于 2', function() {
    assert.equal(add.add(1, 1), 2);
  });
  it.skip('should return -1 unless present', function () {
    // this test will not be run
  });
});

class User {
  save(v){
    // v(new Error('err'))
    v()
  }
}
describe('User', function () {
  describe('#save()', function () {
    it('should save without error', function (done) {
      console.log(done)
      var user = new User('Luna');
      // user.save(function (err) {
      //   if (err) done(err);
      //   else done();
      // });
      user.save(done);
    });
  });
});

// it('should complete this test', function (done) {
//   return new Promise(function (resolve) {
//     assert.ok(true);
//     resolve();
//   }).then(done);
// });

describe('hooks', function () {
  before(function () {
    // runs once before the first test in this block
    console.log('runs once before the first test in this block')
  });

  after(function () {
    // runs once after the last test in this block
    console.log('runs once after the last test in this block')
  });

  beforeEach(function () {
    // runs before each test in this block
    console.log('runs before each test in this block')
  });

  afterEach(function () {
    // runs after each test in this block
    console.log('runs after each test in this block')
  });

  // test cases
});