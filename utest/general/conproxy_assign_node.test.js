
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


test('conproxy reassign', () => 
{
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
    
    //console.log('');
    
    ////////////////////////////////////////////
    
    //oa.finalizeEntireTree();
    //oa.getProp('i1').value = 'i1value';
    //oa.computeIfNeeded();
    oa.init({
        i1: 'i1value'
    });
    
    //oa.logStruct();
     
    expect( oa.getProp('i1') instanceof TestInputNode ).toBe( true );
    expect( oa.getProp('i2') instanceof TestInputNode ).toBe( true );
    expect( oa.getProp('i1') !== oa.getProp('i2') ).toBe( true );
    expect( oa.getProp('ic') instanceof TestInputNode ).toBe( true );
    expect( oa.getProp('ic').linkSrcNode.fullName ).toBe( '☉.cx' );
    expect( oa.getProp('i1r') instanceof MapNode ).toBe( true );
    expect( oa.getProp('i1r').value ).toBe( 'i1value' );
    expect( oa.getProp('ic').value ).toBe( 100 );

});
