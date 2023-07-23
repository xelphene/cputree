
'use strict';

function main () {

const {
    tmpl, bmap, bfunc, parent, 
    ObjNode
} = require('../');


var a = new ObjNode({});
var ap = a.getConProxy();
ap.inp = tmpl.inpdef.number();


var b = new ObjNode({});
var bp = b.getConProxy();
bp.inp = tmpl.inpdef.number(); // GETS ORPHANED

var c = new ObjNode({});
var cp = c.getConProxy();
cp.inp = tmpl.inpdef.number();

bp.c = c;
bp.c.inp = bp.inp;

ap.b = b;
bp.inp = ap.inp;

a.logStruct();
//return;

a.finalizeEntireTree();
a.getProp('inp').value = 222;
a.computeIfNeeded();
a.logStruct();
return;

}
main();
