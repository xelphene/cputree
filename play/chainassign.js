
'use strict';

const {ObjNode, InputNode, inpdef} = require('gobj4');

var root = new ObjNode({});
var p = root.getConProxy();

//var x = p.i = new InputNode({});
//console.log(x);

p.f = p.e = () => 222;
//var x = p.e = inpdef.number();
//console.log(x);
root.finalizeEntireTree();
root.computeIfNeeded();
root.logFlat();
