
'use strict';

function main () {

const {
    tmpl, bmap, bfunc, parent, 
    ObjNode, InputNode
} = require('../');
const {conproxy_ObjNode} = require('../consts');

var o = new ObjNode({});
var p = o.getConProxy();

//p.inp0 = tmpl.inpdef.number();
p.inp0 = tmpl.inpdef.any();
p.s1 = new ObjNode({});
p.s1.inp_s0 = tmpl.inpdef.any();
p.s1.inp_s1 = tmpl.inpdef.any();
p.s1.c0 = () => 3;
p.s1.s1a = new ObjNode({});
p.s1.s1a.inp = tmpl.inpdef.any();
p.s1.c1 = () => 33;

p.s2 = new ObjNode({});
p.s2.inp6 = tmpl.inpdef.any();
p.s2.s2a = new ObjNode({});
o.getProp('s2').enumerable = false;
p.s2.s2a.inp7 = tmpl.inpdef.any();

p.m1 = function () {
    return this.s1;
}
p.m1[bfunc] = true;
p.m1.inpE1 = tmpl.inpdef.any();

////////////////////////////////////////////

console.log('');
console.log('//////');
console.log('');

o.finalizeEntireTree();
o.computeIfNeeded();

o.logStruct();

console.log('');

//for( let n of o.iterTreeInput({includeNonEnumerable:true}) )
for( let n of o.iterTreeInput() )
    console.log(n.fullName);

return;

}
main();
