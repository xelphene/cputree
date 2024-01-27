
'use strict';

const {treeFillFunc} = require('../consts');
const {unwrap, getTBProxyHandler} = require('./util');
const {TNode} = require('../node/tnode');
const {InputKernel} = require('../kernel');
const {map} = require('./map');

function input(defaultValue)
{
    function insertInput (dst, key, dstProxyHandler) {
        unwrap(dst).addc(key, 
            new TNode({  kernel: new InputKernel(defaultValue)  })
        )
    }
    insertInput[treeFillFunc] = true;
    return insertInput;
}
exports.input = input;

exports.map = map;

/*
function bind(bindings, getFunc, setFunc) {
}
bind[tinsert] = true;
exports.bind = bind;
*/

