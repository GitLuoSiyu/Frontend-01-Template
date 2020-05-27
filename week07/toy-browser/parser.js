"use strict";

const Layout = require('./layout')
const CSS = require('./main')
const EOF = Symbol("EOF"); // end of file

let curTocken = null;
let curAttribute = null;

const stack = [{
    type: 'document',
    children: []
}];
let curTextNode = null;

function emit(tocken) {
    const top = stack[stack.length - 1]
    if (tocken.type === 'text') {
        if (curTextNode === null) {
            curTextNode = {
                type: 'text',
                content: '',
            }
            top.children.push(curTextNode)
        }
        curTextNode.content += tocken.content;
    }
    if (tocken.type === 'tagStart') {
        const element = {
            type: 'element',
            attributes: [],
            children: [],
            tagName: tocken.tagName,
        }
        for (let i in tocken) {
            if (!['type', 'tagName'].includes(i)) {
                element.attributes.push({
                    name: i,
                    value: tocken[i],
                })
            }
        }
        element.parent = top;
        CSS.computeCSS(element)
        top.children.push(element);
        if (!tocken.isSelfClosing) {
            stack.push(element)
        }
        curTextNode = null;
    } else if (tocken.type === 'tagEnd') {
        if (top.tagName !== tocken.tagName) {
            throw new Error('tag not match')
        } else {
            if (top.tagName === 'style') {
                CSS.addCSSRules(top.children[0].content)
            }
            Layout.layout(top)
            stack.pop();
        }
        curTextNode = null;
    }
    // console.log(tocken)
}

function data(c) {
    switch (c) {
        case '<':
            return tagOpen;
        case '\u0000': {
            try {
                throw new Error('unexpected-null-character')
            } catch (error) {
                emit({
                    type: 'text',
                    content: c,
                })
            }
        }
        case EOF: {
            emit(EOF)
            return end;
        }
        default: {
            emit({
                type: 'text',
                content: c,
            })
            return data;
        }
    }
}

function tagOpen(c) {
    switch (c) {
        case '/': {
            curTocken = {
                type: 'tagEnd',
                tagName: '',
            }
            return endTagOPen;
        }
        case EOF: {
            try {
                throw new Error('eof-before-tag-name')
            } catch (error) {
                emit({
                    type: 'LESS-THAN SIGN',
                    value: '\u003c',
                })
                emit(EOF)
                return end;
            }
        }
        default: {
            if (/^[a-zA-Z]$/.test(c)) {
                curTocken = {
                    type: 'tagStart',
                    tagName: '',
                }
                return tagName(c);
            } else {
                try {
                    throw new Error('invalid-first-character-of-tag-name')
                } catch (error) {
                    emit({
                        type: 'LESS-THAN SIGN',
                        value: '\u003c',
                    })
                    return data(c);
                }
            }
        }
    }
}

function tagName(c) {
    switch (c) {
        case '/':
            return selfClosingStartTag;
        case '>': {
            emit(curTocken)
            return data;
        };
    case '\u0000': {
        try {
            throw new Error('unexpected-null-character')
        } catch (error) {
            curTocken.tagName += '\ufffd';
        }
    }
    case EOF: {
        try {
            throw new Error('eof-in-tag')
        } catch (error) {
            emit(EOF)
            return end;
        }
    }
    default: {
        if (/^[\r\n\f ]/.test(c)) {
            return beforeAttrbuteName;
        } else if (/^[a-zA-Z]$/.test(c)) {
            curTocken.tagName += c;
            return tagName;
        } else {
            curTocken.tagName += c;
            return tagName;
        }
    }
    }
}

function endTagOPen(c) {
    switch (c) {
        case '>': {
            try {
                throw new Error('missing-end-tag-name')
            } catch (error) {
                return data;
            }
        };
    case EOF: {
        try {
            throw new Error('eof-before-tag-name')
        } catch (error) {
            emit({
                type: 'LESS-THAN SIGN',
                value: '\u003c',
            })
            emit({
                type: 'SOLIDUS',
                value: '\u002f',
            })
            emit(EOF)
            return end;
        }
    }
    default: {
        if (/^[a-zA-Z]$/.test(c)) {
            return tagName(c)
        }
    }
    }
}

function selfClosingStartTag(c) {
    switch (c) {
        case '>': {
            curTocken.isSelfClosing = true;
            console.log(curTocken)
            emit(curTocken)
            curAttribute = null;
            curTocken = null;
            return data;
        }
        case EOF:
            return end;
        default: {
            return beforeAttrbuteName(c);
        }
    }
}

function beforeAttrbuteName(c) {
    switch (c) {
        case '=': {
            try {
                throw new Error('unexpected-equals-sign-before-attribute-name parse')
            } catch (error) {
                curAttribute = {
                    name: c,
                    value: '',
                }
                return attributeName;
            }
        }
        case '>':
        case '/':
        case EOF:
            return afterAttributeNmae(c);
        default: {
            if (/^[\r\n\f ]/.test(c)) {
                return beforeAttrbuteName;
            } else {
                curAttribute = {
                    name: '',
                    value: ''
                }
                return attributeName(c);
            }
        }
    }
}

function attributeName(c) {
    switch (c) {
        case '=': {
            return beforeAttributeValue;
        }
        case '/':
        case '>':
        case EOF:
            return afterAttributeNmae(c);
        case '\'':
        case '"':
        case '<': {
            try {
                throw new Error('unexpected-character-in-attribute-name')
            } catch (error) {
                curAttribute.name += c;
                return attributeName;
            }
        }
        case '\u0000': {
            try {
                throw new Error('unexpected-null-character')
            } catch (error) {
                curAttribute.name = '\ufffd'
                return attributeName;
            }
        }
        default: {
            if (/^[\r\n\f ]/.test(c)) {
                return afterAttributeNmae(c)
            }
            if (/[a-zA-Z]/) {
                curAttribute.name += c;
                return attributeName;
            } else {
                curAttribute.name += c;
                return attributeName;
            }
        }
    }
}

function afterAttributeNmae(c) {
    switch (c) {
        case '/':
            return selfClosingStartTag;
        case '=':
            return beforeAttributeValue;
        case EOF: {
            emit(EOF)
            return end;
        }
        case '>': {
            curTocken[curAttribute.name] = curAttribute.value;
            console.log(curTocken)
            emit(curTocken)
            curAttribute = null;
            return data;
        }
        default: {
            if (/^[\r\n\f ]/.test(c)) {
                return afterAttributeNmae;
            } else {
                return attributeName(c);
            }
        }
    }
}

function beforeAttributeValue(c) {
    switch (c) {
        case '\'':
            return singleQuotedAttributeValue;
        case '"':
            return doubleQuotedAttributeValue;
        case '>': {
            try {
                throw new Error('missing-attribute-value')
            } catch (error) {
                emit(curTocken)
                return data;
            }
        }
        case EOF:
            return beforeAttributeValue;
        default: {
            if (/^[\r\n\f ]/.test(c)) {
                return beforeAttributeValue;
            } else if (/^[a-zA-Z]$/.test(c)) {
                return attributeName;
            } else {
                return unquotedAttributeValue(c);
            }
        }
    }
}

function doubleQuotedAttributeValue(c) {
    switch (c) {
        case '"':
            return afterQuotedAttributeValue;
        case '\u0000': {
            try {
                throw new Error('unexpected-null-character')
            } catch (error) {
                curAttribute.value += '\ufffd'
            }
        }
        case EOF: {
            try {
                throw new Error('eof-in-tag')
            } catch (error) {
                emit(EOF)
                return end;
            }
        }
        default: {
            curAttribute.value += c;
            return doubleQuotedAttributeValue;
        }
    }
}

function singleQuotedAttributeValue(c) {
    switch (c) {
        case '\'':
            return afterQuotedAttributeValue
        case '\u0000': {
            try {
                throw new Error('unexpected-null-character')
            } catch (error) {
                curAttribute.value += '\ufffd'
            }
        }
        case EOF: {
            try {
                throw new Error('eof-in-tag')
            } catch (error) {
                emit(EOF)
                return end;
            }
        }
        default: {
            curAttribute.value += c;
            return doubleQuotedAttributeValue;
        }
    }
}

function afterQuotedAttributeValue(c) {
    switch (c) {
        case '/': {
            curTocken[curAttribute.name] = curAttribute.value;
            return selfClosingStartTag;
        }
        case '>': {
            curTocken[curAttribute.name] = curAttribute.value;
            emit(curTocken)
            return data;
        }
        case EOF: {
            try {
                throw new Error('eof-in-tag')
            } catch (error) {
                emit(EOF)
                return end;
            }
        }
        default: {
            if (/^[\r\n\f ]/.test(c)) {
                return beforeAttrbuteName;
            } else {
                try {
                    throw new Error('missing-whitespace-between-attributes')
                } catch (error) {
                    return beforeAttrbuteName(c);
                }
            }
        }
    }
}

function unquotedAttributeValue(c) {
    switch (c) {
        case '/': {
            curTocken[curAttribute.name] = curAttribute.value;
            console.log(curTocken)
            return selfClosingStartTag;
        }
        case '>': {
            curTocken[curAttribute.name] = curAttribute.value;
            emit(curTocken)
            return data;
        }
        case '\'':
        case '"':
        case '`':
        case '<':
        case '=': {
            try {
                throw new Error('unexpected-character-in-unquoted-attribute-value')
            } catch (error) {
                curAttribute.value += c;
            }
        }
        case '\u0000': {
            try {
                throw new Error('unexpected-null-character')
            } catch (error) {
                curAttribute.value += '\ufffd'
            }
        }
        case EOF: {
            try {
                throw new Error('eof-in-tag')
            } catch (error) {
                emit(EOF)
                return end;
            }
        }
        default: {
            if (/^[\r\n\f ]/.test(c)) {
                // curTocken[curAttribute.name] = curAttribute.value;
                return beforeAttrbuteName;
            } else {
                curAttribute.value += c;
            }
        }
    }
}

function end(c) {
    return end;
}


module.exports.parserHTML = function parserHTML(html) {
    console.log(html)
    let state = data;
    for (let c of html) {
        // console.log('==>', JSON.stringify(c))
        state = state(c)
    }
    // 标识文件结尾
    state = state(EOF)
    console.dir(stack[0])
}