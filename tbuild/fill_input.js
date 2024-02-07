
// possibly obsolete

'use strict';

const {InputKernel} = require('../kernel');
const {TreeFiller} = require('./fill');

class InputFiller extends TreeFiller {
    constructor(defaultValue, validate) {
        super();
        this._defaultValue = defaultValue;
        this._validate = validate;
    }
    
    fill(dstParent, dstKey, buildProxyBindings) {
        unwrap(dstParent).addc(dstKey,
            new TNode( new InputKernel({
                defaultValue: this._defaultValue,
                validate: this._validate
            }))
        );
    }
}
exports.InputFiller = InputFiller;
