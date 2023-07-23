
'use strict';

function main () {

const {
    tmpl, bmap, bfunc, parent, 
    ObjNode, bexist,
} = require('../');
const number = tmpl.inpdef.number;

var o = new ObjNode({});
var p = o.getConProxy();

//p.inp0 = tmpl.inpdef.number();
p.isrc = bexist;
p.isrc.inp0 = number();
p.isrc.inp1 = number();
p.isrc.s1 = bexist;
p.isrc.s1.inp2 = number();

p.b = bexist;
p.b.isrc = bexist;
p.b.isrc.inp0 = number();
p.b.isrc.inp1 = number();
p.b.isrc.s1 = bexist;
p.b.isrc.s1.inp2 = number();

////////////

p.tomap = bexist;
p.tomap.inp0 = number();
p.tomap.inp1 = number();
p.tomap.s1 = bexist;
p.tomap.s1.inp2 = number();

p.s = bexist;
p.s.tomap = bexist;
p.s.tomap.inp0 = number();
p.s.tomap.inp1 = number();
p.s.tomap.s1 = bexist;
p.s.tomap.s1.inp2 = number();

p.s.b = bexist;
p.s.b.tomap = bexist;
p.s.b.tomap.inp0 = number();
p.s.b.tomap.inp1 = number();
p.s.b.tomap.s1 = bexist;
p.s.b.tomap.s1.inp2 = number();

////////////////////////////////////////////


o.getProp('tomap').treeInputMap( o.getProp('isrc') );
o.getProp('s').getProp('tomap').treeInputMap( o.getProp('isrc') );
o.getProp('s').getProp('b').getProp('tomap').treeInputMap( o.getProp('b').getProp('isrc') );

console.log('');
console.log('//////');
console.log('');

o.finalizeEntireTree();

o.getProp('isrc').getProp('inp0').value = 0;
o.getProp('isrc').getProp('inp1').value = 1;
o.getProp('isrc').getProp('s1').getProp('inp2').value = 2;
o.getProp('b').getProp('isrc').getProp('inp0').value = 1000;
o.getProp('b').getProp('isrc').getProp('inp1').value = 1001;
o.getProp('b').getProp('isrc').getProp('s1').getProp('inp2').value = 1002;

o.computeIfNeeded();
o.logStruct();

console.log(o.rawObject.s.tomap);
console.log(o.rawObject.s.tomap.s1.inp2);
o.rawObject.isrc.s1.inp2 = 20;
console.log(o.rawObject.s.tomap.s1.inp2);

return;

}
main();
