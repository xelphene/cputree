
'use strict';

const {unwrap, getTBProxyHandler} = require('./util');
const {TInputNode} = require('../node/tinput');
const {TreeFiller} = require('./fill');

class InputFiller extends TreeFiller {
    constructor(defaultValue) {
        super();
        this._defaultValue = defaultValue;
    }
    
    fill(dstParent, dstKey, buildProxyBindings) {
        unwrap(dstParent).addc(dstKey,
            new TInputNode({
                defaultValue: this._defaultValue
            })
        );
    }
}

function input(defaultValue) {
    return new InputFiller(defaultValue);
}
exports.input = input;

exports.map = require('./map').map;
exports.mapSym = require('./map').mapSym;
exports.mapSplit = require('./map').mapSplit;
exports.powMap = require('./map_pow').powMap;

