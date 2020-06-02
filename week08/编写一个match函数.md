### 编写一个 match 函数
```javascript
var selectorObj = {};

let parent = {};
let cur = {
  val: '',
};

function emit (cur) {
  console.log(cur, selectorObj)
  switch (cur.type) {
    case 'descendant': {
      const ancestor = Object.assign({}, selectorObj)
      selectorObj = {
        ancestor,
      }
      break;
    }
    case 'children': {
      const parent = Object.assign({}, selectorObj)
      selectorObj = {
        parent,
      };
      break;
    }
    case 'next': {
      const previous = Object.assign({}, selectorObj)
      selectorObj = {
        previous,
      };
      break;
    }
    case 'after': {
      const before = Object.assign({}, selectorObj)
      selectorObj = {
        before,
      };
      break;
    }
    default: {
      selectorObj[cur.type] = cur.val;
      break;
    }
  }
  console.log('selectorObj', selectorObj)
}

function dealSelector(char, isEmit = false) {
  switch (char) {
    case ' ': {
      if (Object.keys(cur)[1]) {
        emit(cur)
        delete cur.type;
      }
      cur.val = '';
      cur.type = 'descendant'
      break;
    }
    case '>': {
      if (Object.keys(cur)[1]) {
        emit(cur)
        delete cur.type;
      }
      cur.val = '';
      cur.type = 'children'
      break;
    }
    case '+': {
      if (Object.keys(cur)[1]) {
        emit(cur)
        delete cur.type;
      }
      cur.val = '';
      cur.type = 'next'
      break;
    }
    case '~': {
      if (Object.keys(cur)[1]) {
        emit(cur)
        delete cur.type;
      }
      cur.val = '';
      cur.type = 'after'
      break;
    }
    case ':': {
      if (Object.keys(cur)[1]) {
        emit(cur)
        delete cur.type;
      }
      cur.val = '';
      cur.type = 'pseudo'
      break;
    }
    case '.': {
      if (Object.keys(cur)[1]) {
        emit(cur)
        delete cur.type;
      }
      cur.val = '';
      cur.type = 'class';
      break;
    }
    case '#': {
      if (Object.keys(cur)[1]) {
        emit(cur)
        delete cur.type;
      }
      cur.val = '';
      cur.type = 'id'
      break;
    }
    case '[': {
      if (Object.keys(cur)[1]) {
        emit(cur)
        delete cur.type;
      }
      cur.val = '';
      cur.type = 'attr'
      break;
    }
    case ']': {
      emit(cur)
      delete cur.type;
      break;
    }
    case '*': {
      cur.type = 'universal'
      cur.val = char;
      emit(cur)
      delete cur.type;
      break;
    }
    default: {
      if (cur.type) {
        cur.val += char
      } else {
        cur.type = 'tag'
        cur.val += char;
      }
      if (isEmit) {
        emit(cur)
      }
      break;
    }
  }
}

function match(selector, element) {
  for(let i = 0; i < selector.length; i++) {
    dealSelector(selector[i], i === selector.length - 1)
  }
  console.log(selectorObj)
  return true;
}

match("div #id.class+p~span", document.getElementById("id"));
match("div div>#id.class", document.getElementById("id"));
match("div div>#id.class+p", document.getElementById("id"));
match("div div>#id.class+p~span", document.getElementById("id"));
```