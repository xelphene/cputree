
'use strict';

const {
    ObjNode, ComputeNode, InputNode,
    parent, bmap, bfunc, mio, mioMapOut, mioMapIn, mioSrcBranch,
} = require('../../');

function getTestLib () {
    var r = new ObjNode({});
    
    r.add('inp0', new InputNode({}));
    
    r.add('s', new ObjNode({}));
    r.getProp('s').add('c0', new ComputeNode({
        computeFunc: function () {
            return this[parent].inp0+1
        }
    }));
    r.getProp('s').add('i', new InputNode({}));
    r.getProp('s').add('j', new ComputeNode({
        computeFunc: () => 3
    }));
    r.add('j', new InputNode({}));
        
    return r;
}

function test_getMapOut_graft (t)
{
    var root = new ObjNode({});
    root.addc('mb', mio.getMapOut(getTestLib()) );
    root.getc('mb').getc(mioMapOut).computeFunc = function () {
        return x => x + this[parent].xf;
    };

    root.add('xf', new InputNode({}));
    root.finalizeEntireTree();

    root.getc('xf').value = 10;
    root.getc('mb').getc(mioSrcBranch).getc('s').getc('i').value = 202;
    root.getc('mb').getc(mioSrcBranch).getc('inp0').value = 100;
    root.getc('mb').getc(mioSrcBranch).getc('j').value = 303;

    root.computeIfNeeded();
    
    var o = root.rawObject;
    
    t.callEq( () => o.mb.inp0, 110 );
    t.callEq( () => o.mb.j, 313 );
    t.callEq( () => o.mb.s.i, 212 );
    t.callEq( () => o.mb.s.c0, 111 );
    t.callEq( () => o.mb.s.j, 13 );
}

function test_getMapOut_same (t)
{
    var root = new ObjNode({});
    root.add('orig', getTestLib());
    root.addc('mb', mio.getMapOut(root.getc('orig')) );
    root.getc('mb').getc(mioMapOut).computeFunc = function () {
        return x => x + this[parent].xf;
    };

    finish_out_same(t, root);
}

function test_getMapOutBCF_same (t)
{
    var root = new ObjNode({});
    root.add('orig', getTestLib());
    
    var mb = mio.getMapOutBCF(
        function () {
            return this.orig[bmap](
                v => v + this.xf
            )
        }
    );
    root.add('mb', mb);
    
    finish_out_same(t, root);
}

function test_getMapBiLink_graft(t)
{
    var root = new ObjNode({});
    root.addc('mb', mio.getMapBiLink( getTestLib() ) );
    finish_bi(t, root);
}

function test_getMapBiLink_same(t)
{
    var root = new ObjNode({});
    root.addc('orig', getTestLib() );
    root.addc('mb', mio.getMapBiLink(root.getc('orig')) );
    finish_bi(t, root);
}

function test_getMapBiReplace_graft(t)
{
    var root = new ObjNode({});
    root.addc('mb', mio.getMapBiReplace( getTestLib() ) );
    finish_bi(t, root);
}

function test_getMapBiReplace_same(t)
{
    var root = new ObjNode({});
    root.addc('orig', getTestLib() );
    root.addc('mb', mio.getMapBiReplace(root.getc('orig')) );
    finish_bi(t, root);
}


// called from:
//  test_getMapBiReplace_same
//  test_getMapBiReplace_graft
//  test_getMapBiLink_same
//  test_getMapBiLink_graft
function finish_bi(t, root)
{
    root.getc('mb').getc(mioMapIn).computeFunc = function () {
        return x => -x 
    };
    root.getc('mb').getc(mioMapOut).computeFunc = function () {
        return x => x + this[parent].xf
    };

    root.add('xf', new InputNode({}));
    root.finalizeEntireTree();
    
    
    root.nav('xf').value = 10;
    root.nav('mb.inp0').value = 100;
    root.nav('mb.s.i').value = 202;
    root.nav('mb.j').value = 303;

    root.computeIfNeeded();
    // root.mb.s.c0 == -89 == -root.mb.inp0 + 1 + xf
    // root.mb.j == 303 == -root.mb.j 
    t.callEq( () => root.nav('mb.s.c0').value, -89 );
    t.callEq( () => root.nav('mb.j').value, 303 );


    root.nav('xf').value = 20;
    root.computeIfNeeded();
    // root.mb.s.c0 == -79 == -root.mb.inp0 + 1 + xf
    t.callEq( () => root.nav('mb.s.c0').value, -79 );


    root.nav('mb.inp0').value = 101;
    root.computeIfNeeded();
    // root.mb.s.c0 == -80 == -root.mb.inp0 + 1 + xf
    t.callEq( () => root.nav('mb.s.c0').value, -80 );


    t.callEq( () => root.nav('mb.s.c0').computeCount, 3 );
    t.callEq( () => root.nav('mb.s.j').computeCount, 2 );
}


// called from:
//  test_getMapOutBCF_same
//  test_getMapOut_same
function finish_out_same(t, root)
{
    root.add('xf', new InputNode({}));
    root.finalizeEntireTree();
    root.getProp('xf').value = 10;
    root.getProp('orig').getProp('inp0').value = 100;
    root.getProp('orig').getProp('s').getProp('i').value = 202;
    root.getProp('orig').getProp('j').value = 303;
    console.log('######');

    root.computeIfNeeded();
    
    var o = root.rawObject;
    
    t.callEq( () => o.orig.inp0, 100 );
    t.callEq( () => o.orig.j, 303 );
    t.callEq( () => o.orig.s.i, 202 );
    t.callEq( () => o.orig.s.c0, 101 );
    t.callEq( () => o.orig.s.j, 3 );

    t.callEq( () => o.mb.inp0, 110 );
    t.callEq( () => o.mb.j, 313 );
    t.callEq( () => o.mb.s.i, 212 );
    t.callEq( () => o.mb.s.c0, 111 );
    t.callEq( () => o.mb.s.j, 13 );
    
    o.xf = 20;
    root.computeIfNeeded();

    t.callEq( () => o.mb.inp0, 120 );
    t.callEq( () => o.mb.j, 323 );
    t.callEq( () => o.mb.s.i, 222 );
    t.callEq( () => o.mb.s.c0, 121 );
    t.callEq( () => o.mb.s.j, 23 );

    o.orig.inp0 = 1000;
    root.computeIfNeeded();
    
    t.callEq( () => root.nav('orig.s.c0').computeCount, 2 );
    t.callEq( () => root.nav('mb.s.c0').computeCount, 3 );
    t.callEq( () => root.nav('mb.s.j').computeCount, 2 );
}


function main () {
    const Tester = require('../tester').Tester;
    var t = new Tester();

    test_getMapOut_graft(t);
    test_getMapOut_same(t);

    test_getMapOutBCF_same(t);
    
    test_getMapBiLink_graft(t);
    test_getMapBiLink_same(t);
    
    test_getMapBiReplace_graft(t);
    test_getMapBiReplace_same(t);

    console.log('');
    console.log('='.repeat(40));
    console.log('test results:');
    t.logResults();
}

if( require.main === module ) {
    main();
}

