
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

let no1 = new ObjNode({});

o.finalizeEntireTree();
o.computeIfNeeded();
o.logStruct();

console.log( o.treeHasNode(no1) );

console.log( o.treeHasNode( o.getProp('s') ) ); // FALSE

// rest: true
console.log( o.treeHasNode( o.getProp('s').getProp('tomap') ) );
console.log( o.treeHasNode( o.getProp('s').getProp('tomap') ) );
console.log( o.treeHasNode( o.getProp('s').getProp('tomap').getProp('s1') ) );
console.log( o.treeHasNode( o.getProp('isrc').getProp('inp0') ) );


return;

}
main();
