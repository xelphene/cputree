
'use strict';

const {TNode} = require('../node/tnode');
const {InputKernel} = require('../kernel');
const validate = require('../validate');
const {InputFiller} = require('./fill_input');

for( let k of Object.keys(validate) ) {
    exports[k] = defaultValue => new TNode(
        new InputKernel({
            defaultValue,
            validate: validate[k]
        })
    );
}

