
'use strict';

const {
    ObjNode, AliasValidateNode, InputNode, ComputeNode,
    parent,
} = require('../');

var root = new ObjNode({});

var a = new ObjNode({});
root.add('a', a);
var a_cn =  new ComputeNode({
    computeFunc: () => 1
});
a.add('cn',a_cn);

var b = new ObjNode({});
root.getProp('a').add('b', b);

var c = new ObjNode({});
root.getProp('a').getProp('b').add('c', c);
var c_cn = new ComputeNode({
    computeFunc: () => 2
})
c.add('cn', c_cn);
var c_cn3 = new ComputeNode({
    computeFunc: () => 3
})
c.add('cn3', c_cn3);

///////////////

root.finalizeEntireTree();

//root.logStruct();
root.computeIfNeeded();
root.logStruct();
console.log('---');

//for( let n of c.iterAncestors() )
//for( let n of c.getProp('cn').iterAncestors() )
for( let n of root.iterAncestors() )
    console.log(n.fullName);

console.log('---');

//var nc = c.nearestCommonAncestor(c_cn);
//var nc = a_cn.nearestCommonAncestor(c_cn);
//var nc = c_cn.nearestCommonAncestor(c_cn);
//var nc = c_cn.nearestCommonAncestor(b);
var nc = b.nearestCommonAncestor(c_cn);
console.log(nc.fullName);

console.log('---');

for( let n of c_cn3.nodesToAncestor(c) )
    console.log(n.fullName);

//console.log(`WTF: ${a.fullName}`);

console.log('---');

console.log( c_cn3.pathToNode(a_cn) );
console.log( a_cn.pathToNode(c_cn3) );

console.log('---');
console.log( c_cn3.nav( c_cn3.pathToNode(a_cn) ).fullName );
console.log( a_cn.nav( a_cn.pathToNode(c_cn3) ).fullName  );

console.log('---');

//a_cn.nav([parent,'asdf']);
//a_cn.nav([parent,'cn','asdf']);
a_cn.nav([parent,parent,parent]);


