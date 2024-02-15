
'use strict';

const {TInputNode} = require('../node/tinput');
const validate = require('../validate');
const {InputFiller} = require('./fill_input');

for( let k of Object.keys(validate) ) {
    exports[k] = defaultValue => new TInputNode({
        defaultValue,
        validate: validate[k]
    });
}

