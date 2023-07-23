
'use strict';

const {
    tmpl, bmap, bfunc, parent, get, CTL,
    ObjNode, InputNode, ComputeNode
} = require('../');

var root = new ObjNode({});

var sym1 = Symbol('sym1');
var sym2 = Symbol('sym2');

var x_y_z_inp = new InputNode({});
root.addDeep(['x',sym1,'y',sym2,'inp'], x_y_z_inp );

root.addDeep(['x',sym1,'y2','z','inp'], new InputNode({}) );

console.log(x_y_z_inp.keyPath);

//root.finalizeEntireTree();
//saa_inp.value = 221;
//root.computeIfNeeded();
root.logStruct();
