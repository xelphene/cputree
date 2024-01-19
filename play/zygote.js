
'use strict';

const {C, N, O, ObjNode, GetSetNode, InputNode} = require('../');
const {ZygoteNode} = require('../node/zygote');

var root = new ObjNode({});
root.addc( 'c222', new GetSetNode({getter: () => 222}) );
root.addc( 'c1',   new GetSetNode({getter: () => 1}) );
root.addc( 'i1',   new InputNode({}) );
root.addc( 'i2',   new InputNode({}) );

root.addc( 'z1', new ZygoteNode({}) );

root.addc( 'zc', new ZygoteNode({
    nodeDef: {
        type: 'get',
        func: (t,c1) => t.c222 + c1 + t.i1,
        bind: [root, root.getc('c1')]
    }
}));

root.addc( 'zi', new ZygoteNode({
    nodeDef: {
        type: 'input',
        defaultValue: 999
    }
}));

root.addc( 'zc_i_2', new ZygoteNode({
    nodeDef: {
        type: 'get',
        func: (t) => t.zi + t.i2,
        bind: [root]
    }
}));

root.logStruct();

root.init({
    i1: 300,
    i2: 2
});
var o = root.rawObject;
console.log('---');

root.logStruct();
console.log('---');

o.i1 = 400;
console.log(o.zc);
console.log('---');

root.logStruct();
console.log('---');

o.zi = 1222;
console.log(o.zi);
root.logStruct();
console.log('---');

console.log(o.zc_i_2);
