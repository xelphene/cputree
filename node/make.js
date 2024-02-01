
'use strict';

const kernel = require('../kernel');
const {TNode} = require('./tnode');

function makeNode(...args) {
    if( args.length < 1 )
        throw new Error(`At least one argument is required to makeNode`);
    const cls = args[0];
    if( typeof(cls) != 'string' )
        throw new TypeError(`string required for argument 0, not ${typeof(cls)}`);
    if( ! Object.keys(kernel).includes(cls+'Kernel') )
        throw new Error(`No Kernel with class name ${cls}`);
    return new TNode( new kernel[cls+'Kernel'](...args.slice(1)) );
}
exports.makeNode = makeNode;
