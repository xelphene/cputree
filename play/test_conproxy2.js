
'use strict';

function main () {

const {
    tmpl, bmap, bfunc, parent, 
    ObjNode
} = require('../');
const {conproxy_ObjNode} = require('../consts');

var o = new ObjNode({});
var p = o.getConProxy();

p.cn0 = function () { return 222 };
p.inpA = tmpl.inpdef.any();

p.inp0 = tmpl.inpdef.number();
// ... later: make it into a refCN:
p.inp0 = function () { return this.cn0 };
//p.inp0 = function () { return this.inpA };

p.inp1 = tmpl.inpdef.number();
p.dx = tmpl.inpdef.number();
p.cn = function () { return 22 }
p.sub = {};
p.sub.scn = function () { return this[parent].inp1*10 + this[parent].cn };

p.smap = function () {
    return this.sub;
}
p.smap[bfunc] = true;

p.smap2 = function () {
    return this.sub[bmap](
        v => v+this.dx
    );
}
p.smap2[bfunc] = true;

var s = new ObjNode({});
var sp = s.getConProxy();
sp.inp10 = tmpl.inpdef.number();
sp.cn = function () { return 500 };
sp.cn2 = function () { return 502 };

p.subobj = sp;

p.subobj.inp10 = function () { return this[parent].cn0 };

////////////////////////////////////////////

console.log('');
console.log('//////');
console.log('');
o.finalizeEntireTree();
o.getProp('inpA').value = 'Az';
o.getProp('inp1').value = 11;
o.getProp('dx').value = 1000;
o.computeIfNeeded();
o.logStruct();
return;
o.getProp('inpA').value = 'Az';
o.getProp('inp1').value = 10;
o.getProp('dx').value = 1000;
o.computeIfNeeded();
console.log('');
o.logStruct();

//console.log(p.smap2);

console.log('');

/*
console.log(p instanceof ObjNode);
console.log( p.hasOwnProperty(conproxy_ObjNode) );
console.log(p[conproxy_ObjNode]);
console.log(p[conproxy_ObjNode][conproxy_ObjNode]);
*/

}
main();
