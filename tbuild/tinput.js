
'use strict';

const {TInputNode} = require('../node/tinput');
const validate = require('../validate');

for( let k of Object.keys(validate) ) {
    exports[k] = defaultValue => new TInputNode({
        defaultValue,
        validate: validate[k]
    });
}

