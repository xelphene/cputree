
'use strict';

const {ObjNode, C, N, O, inpdef, InputNode} = require('../');

var r = new ObjNode({});
var p = r[C];

p.x.y = () => 222;
p.a.b.c = () => 333;
p.a.b.i = new InputNode({});

p.alias = [p.a, p.x];

r.init({
    a: {
        b: {
            i: 999 
        }
    }
});

r.logFlat();
r[O].a.b.i = 1000;
r.logFlat();
