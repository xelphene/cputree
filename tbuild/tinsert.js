
'use strict';

const {unwrap, getTBProxyHandler} = require('./util');
const {TNode} = require('../node/tnode');
const {InputKernel} = require('../kernel');
const {TreeFiller} = require('./fill');

class InputFiller extends TreeFiller {
    constructor(defaultValue) {
        super();
        this._defaultValue = defaultValue;
    }
    
    fill(dstParent, dstKey, buildProxyBindings) {
        unwrap(dstParent).addc(dstKey,
            new TNode( new InputKernel({
                defaultValue: this._defaultValue
            }))
        );
    }
}

function input(defaultValue) {
    return new InputFiller(defaultValue);
}
exports.input = input;

exports.map = require('./map').map;
exports.mapBi = require('./map').mapBi;
exports.powMap = require('./map_pow').powMap;

