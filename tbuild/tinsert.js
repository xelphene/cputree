
'use strict';

const {treeFillFunc} = require('../consts');
const {unwrap, getTBProxyHandler} = require('./util');
const {TNode} = require('../node/tnode');
const {InputKernel} = require('../kernel');

function input(defaultValue)
{
    function insertInput (dst, key, dstProxyHandler) {
        unwrap(dst).addc(key, 
            new TNode( new InputKernel(defaultValue) )
        )
    }
    insertInput[treeFillFunc] = true;
    return insertInput;
}
exports.input = input;

exports.map = require('./map').map;
exports.mapBi = require('./map').mapBi;
exports.powMap = require('./map_pow').powMap;

