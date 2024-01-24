
'use strict';

const {GetVNode, InputVNode} = require('../vnode');
const {ObjNode} = require('../node/objnode');
const {TNode}   = require('../node/tnode');

var i = new InputVNode(0.1);
var j = new InputVNode(0.2);
var c = new GetVNode(
    [i, j], (i,j) => (i+j) * 10
);

var R = new ObjNode({});
R.addc('i', new TNode({vNode: i}));
R.addc('j', new TNode({vNode: j}));
R.addc('c', new TNode({vNode: c}));

R.addc('d', new TNode({ vNode: new GetVNode(
    [R], t => t.j**2
)}));

R.init({});
R.computeIfNeeded();
R.logStruct();

console.log('-');

R.getc('i').value = 10;
R.getc('j').value = 20;
R.computeIfNeeded();
R.logStruct();

/*
console.log( c.value );

i.value = 0.2;

console.log('////////////////');

console.log( c.value );
console.log( c.computeCount );
console.log( c.value );
console.log( c.computeCount );
//console.log(c.hearingFrom);
*/
