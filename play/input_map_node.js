
'use strict';

function main () {

const {
    tmpl, bmap, bfunc, parent, 
    ObjNode
} = require('../');
const {conproxy_ObjNode} = require('../consts');

var o = new ObjNode({});
var p = o.getConProxy();

//p.inp0 = tmpl.inpdef.number();
p.inp0 = tmpl.inpdef.any();
p.cn = function () { return 22 }
p.sub = new ObjNode({});
p.sub.inp0 = tmpl.inpdef.number();
p.sub.inpc = tmpl.inpdef.number();

// this works now and makes sense. just like old refCN style:
//p.sub.inp0 = function () { return this[parent].inp0 };
//p.sub.inpc = function () { return this[parent].cn };

// but what I really want to do is:
p.sub.inp0 = p.inp0;
p.sub.inpc = p.cn;
// ^ implemented and working now. 

////////////////////////////////////////////

console.log('');
console.log('//////');
console.log('');

o.finalizeEntireTree();

o.getProp('inp0').value = 999;
o.computeIfNeeded();
o.logStruct();

//o.getProp('inp0').value = 'z'; // exception, as expected.
o.getProp('inp0').value = 1;
o.computeIfNeeded();
o.logStruct();

return;

}
main();
