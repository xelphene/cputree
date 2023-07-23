
'use strict';

const {
    ObjNode, AliasValidateNode, InputNode, ComputeNode,
    parent
} = require('../../');
const {NavError} = require('../../errors');

function test(t) 
{

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
root.computeIfNeeded();
//root.logStruct();
//console.log('---');

//for( let n of c.iterAncestors() )
//for( let n of c.getProp('cn').iterAncestors() )
//for( let n of root.iterAncestors() )
//    console.log(n.fullName);

//console.log('---');

root.logStruct();

t.callEq( () => c.nearestCommonAncestor(c_cn), c );
t.callEq( () => a_cn.nearestCommonAncestor(c_cn), a );
t.callEq( () => c_cn.nearestCommonAncestor(c_cn), c_cn );
t.callEq( () => c_cn.nearestCommonAncestor(b), b );
t.callEq( () => b.nearestCommonAncestor(c_cn), b );

//for( let n of c_cn3.nodesToAncestor(c) )
//    console.log(n.fullName);
t.callEq( () => c_cn3.nodesToAncestor(c)[0], c_cn3 );
t.callEq( () => c_cn3.nodesToAncestor(c)[1], c );

//console.log('---');

//console.log( c_cn3.pathToNode(a_cn) );
t.callEq( () => c_cn3.pathToNode(a_cn).array[0], parent );
t.callEq( () => c_cn3.pathToNode(a_cn).array[1], parent );
t.callEq( () => c_cn3.pathToNode(a_cn).array[2], parent );
t.callEq( () => c_cn3.pathToNode(a_cn).array[3], 'cn' );

//console.log( a_cn.pathToNode(c_cn3) );
t.callEq( () => a_cn.pathToNode(c_cn3).array[0], parent );
t.callEq( () => a_cn.pathToNode(c_cn3).array[1], 'b' );
t.callEq( () => a_cn.pathToNode(c_cn3).array[2], 'c' );
t.callEq( () => a_cn.pathToNode(c_cn3).array[3], 'cn3' );

//console.log('---');

//console.log( c_cn3.nav( c_cn3.pathToNode(a_cn) ).fullName );
t.callEq( () => c_cn3.nav( c_cn3.pathToNode(a_cn) ), a_cn );

//console.log( a_cn.nav( a_cn.pathToNode(c_cn3) ).fullName  );
t.callEq( () => a_cn.nav( a_cn.pathToNode(c_cn3) ), c_cn3 );

//console.log('---');

//a_cn.nav([parent,'asdf']);
t.callExc( () => a_cn.nav([parent,'asdf']), NavError);
//a_cn.nav([parent,'cn','asdf']);
t.callExc( () => a_cn.nav([parent,'cn','asdf']), NavError);
//a_cn.nav([parent,parent,parent]);
t.callExc( () => a_cn.nav([parent,parent,parent]), NavError);

}

function main () {
    const Tester = require('../tester').Tester;
    var t = new Tester();

    test(t);

    console.log('');
    console.log('='.repeat(40));
    console.log('test results:');
    t.logResults();
}

if( require.main === module ) {
    main();
}

