
'use strict';

const {C, N, O, ObjNode, GetSetNode, InputNode} = require('../');
const {ANode} = require('../node/anode');
const {ZygoteNode} = require('../node/zygote');

var root = new ObjNode({});
root.addc( 'c222', new GetSetNode({getter: () => 222}) );
root.addc( 'c1',   new GetSetNode({getter: () => 1}) );
root.addc( 'i1',   new InputNode({}) );
root.addc( 'i2',   new InputNode({}) );
root.addc( 'i_n',  new InputNode({}) );

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

root.addc( 'zm_zi', new ZygoteNode({
    nodeDef: {
        type: 'map',
        src:  root.getc('zi'),
        mapGetFunc: (t,v) => v * t.i_n,
        mapSetFunc: (t,v) => v * t.i_n,
        bind: [root]
    }
}));

//

var an = new ANode({
    nodeDef: {
        type: 'get',
        func: t => t.i1 + 1,
        bind: [root]
    }
});
// TODO: could just build this in to ANode
// or make ANode take a Kernel instance
an.finalizeDefinition();

root.addc( 'a_get', new ZygoteNode({
    nodeDef: {
        type: 'get',
        func: (t,a) => a + t.i2 + 1,
        bind: [root, an]
    }
}));

//////////////////////////////////////

root.logStruct();

root.init({
    i1: 300,
    i2: 2,
    i_n: -1,
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
console.log('---');

root.computeIfNeeded();
root.logStruct();
console.log('---');

o.i_n = 1;
console.log( o.zm_zi );
console.log('==== anon');

console.log( an.value );
console.log( o.a_get );
console.log('-');
o.i1 = 500;
console.log( an.value );
console.log( o.a_get );
