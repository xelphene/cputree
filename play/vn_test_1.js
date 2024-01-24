
'use strict';

const {GetVNode, InputVNode} = require('../vnode');

var i = new InputVNode(0.1);
var j = new InputVNode(0.2);
var c = new GetVNode(
    [i, j], (i,j) => (i+j) * 10
);

console.log( c.value );

i.value = 0.2;

console.log('////////////////');

console.log( c.value );
console.log( c.computeCount );
console.log( c.value );
console.log( c.computeCount );
//console.log(c.hearingFrom);
