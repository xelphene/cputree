
'use strict';

const {ObjNode} = require('../index');

var S = Symbol('S');

var root = new ObjNode({});
var p = root.getConProxy();

p.f = () => 222;
p.m = p.f;
p.m[S] = true;

console.log(root.nav('m'));
