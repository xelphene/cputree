
'use strict';

const {
    inpn, bmap, bfunc, parent, 
    ObjNode, bexist, getn,
    LeafNode, BranchNode,
    InputNode, ComputeNode, MapNode,
    buildMioTree,
    conProxyUnwrap,
    inpdef
} = require('../../');


function test(t) {


class TestInputNode extends InputNode {};

var oa = new ObjNode({});
var pa = oa.getConProxy();

pa.i1 = inpn.number();
pa.cx = function () { return 100 };


pa.i1 = new TestInputNode({});
pa.i2 = new TestInputNode({});
pa.ic = new TestInputNode({});

pa.i1r = pa.i1;

pa.ic = pa.cx;

console.log('');


////////////////////////////////////////////

oa.finalizeEntireTree();
oa.getProp('i1').value = 'i1value';

oa.computeIfNeeded();

oa.logStruct();

t.callEq( () => oa.getProp('i1') instanceof TestInputNode, true );
t.callEq( () => oa.getProp('i2') instanceof TestInputNode, true );
t.callEq( () => oa.getProp('i1') !== oa.getProp('i2'), true );
t.callEq( () => oa.getProp('ic') instanceof TestInputNode, true );
t.callEq( () => oa.getProp('ic').linkSrcNode.fullName, '☉.cx' );
t.callEq( () => oa.getProp('i1r') instanceof MapNode, true );
t.callEq( () => oa.getProp('i1r').value, 'i1value' );
t.callEq( () => oa.getProp('ic').value, 100 );

console.log('');

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

