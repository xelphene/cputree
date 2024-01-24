
'use strict';

const {GetVNode, InputVNode, GetSetVNode} = require('../vnode');
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

R.addc('e', new TNode({ vNode: new GetVNode(
    [R.getc('j')], j => j**2 + 1
)}));
R.addc('e2', new TNode({ vNode: new GetVNode(
    [R.getc('e')], e => e*10
)}));


R.addc('s', new TNode({ vNode: new GetSetVNode(
    [R],
    t => -t.i,
    (t,v) => { t.i = -v }
)}));

R.init({});
R.computeIfNeeded();
R.logStruct();

console.log('-');
R.getc('s').value = -.5;
R.computeIfNeeded();
R.logStruct();

console.log('-===-=-');

console.log(  R.getc('s').vNode.debugLines )

console.log('-===-=-');

R.logDebug({maxNameLen:15});

/*
console.log('-');
R.getc('i').value = 10;
R.getc('j').value = 20;
R.computeIfNeeded();
R.logStruct();
*/
