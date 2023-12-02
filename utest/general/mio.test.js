
'use strict';

const {
    ObjNode, GetSetNode, InputNode,
    parent, bmap, bfunc, mio, mioMapOut, mioMapIn, mioSrcBranch,
} = require('../../');

function getTestLib () {
    var r = new ObjNode({});
    
    r.add('inp0', new InputNode({}));
    
    r.add('s', new ObjNode({}));
    r.getProp('s').add('c0', new GetSetNode({
        getter: function () {
            return this[parent].inp0+1
        }
    }));
    r.getProp('s').add('i', new InputNode({}));
    r.getProp('s').add('j', new GetSetNode({
        getter: () => 3
    }));
    r.add('j', new InputNode({}));
        
    return r;
}

test('getMapOut_graft', () => 
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
    
    expect( o.mb.inp0 ).toBe( 110 );
    expect( o.mb.j ).toBe( 313 );
    expect( o.mb.s.i ).toBe( 212 );
    expect( o.mb.s.c0 ).toBe( 111 );
    expect( o.mb.s.j ).toBe( 13 );
});

test('getMapOut_same', () =>
{
    var root = new ObjNode({});
    root.add('orig', getTestLib());
    root.addc('mb', mio.getMapOut(root.getc('orig')) );
    root.getc('mb').getc(mioMapOut).computeFunc = function () {
        return x => x + this[parent].xf;
    };

    finish_out_same(root);
});

test('getMapOutBCF_same', () =>
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
    
    finish_out_same(root);
});

test('getMapBiLink_graft', () =>
{
    var root = new ObjNode({});
    root.addc('mb', mio.getMapBiLink( getTestLib() ) );
    finish_bi(root);
});

test('getMapBiLink_same', () =>
{
    var root = new ObjNode({});
    root.addc('orig', getTestLib() );
    root.addc('mb', mio.getMapBiLink(root.getc('orig')) );
    finish_bi(root);
});

test('getMapBiReplace_graft', () =>
{
    var root = new ObjNode({});
    root.addc('mb', mio.getMapBiReplace( getTestLib() ) );
    finish_bi(root);
});

test('getMapBiReplace_same', () =>
{
    var root = new ObjNode({});
    root.addc('orig', getTestLib() );
    root.addc('mb', mio.getMapBiReplace(root.getc('orig')) );
    finish_bi(root);
});


// called from these tests:
//  getMapBiReplace_same
//  getMapBiReplace_graft
//  getMapBiLink_same
//  getMapBiLink_graft
function finish_bi(root)
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
    expect( root.nav('mb.s.c0').value ).toBe( -89 );
    expect( root.nav('mb.j').value ).toBe( 303 );


    root.nav('xf').value = 20;
    root.computeIfNeeded();
    // root.mb.s.c0 == -79 == -root.mb.inp0 + 1 + xf
    expect( root.nav('mb.s.c0').value ).toBe( -79 );


    root.nav('mb.inp0').value = 101;
    root.computeIfNeeded();
    // root.mb.s.c0 == -80 == -root.mb.inp0 + 1 + xf
    expect( root.nav('mb.s.c0').value ).toBe( -80 );


    expect( root.nav('mb.s.c0').computeCount ).toBe( 3 );
    expect( root.nav('mb.s.j').computeCount ).toBe( 2 );
}


// called from these tests:
//  getMapOutBCF_same
//  getMapOut_same
function finish_out_same(root)
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
    
    expect( o.orig.inp0 ).toBe( 100 );
    expect( o.orig.j ).toBe( 303 );
    expect( o.orig.s.i ).toBe( 202 );
    expect( o.orig.s.c0 ).toBe( 101 );
    expect( o.orig.s.j ).toBe( 3 );

    expect( o.mb.inp0 ).toBe( 110 );
    expect( o.mb.j ).toBe( 313 );
    expect( o.mb.s.i ).toBe( 212 );
    expect( o.mb.s.c0 ).toBe( 111 );
    expect( o.mb.s.j ).toBe( 13 );
    
    o.xf = 20;
    root.computeIfNeeded();

    expect( o.mb.inp0 ).toBe( 120 );
    expect( o.mb.j ).toBe( 323 );
    expect( o.mb.s.i ).toBe( 222 );
    expect( o.mb.s.c0 ).toBe( 121 );
    expect( o.mb.s.j ).toBe( 23 );

    o.orig.inp0 = 1000;
    root.computeIfNeeded();
    
    expect( root.nav('orig.s.c0').computeCount ).toBe( 2 );
    expect( root.nav('mb.s.c0').computeCount ).toBe( 3 );
    expect( root.nav('mb.s.j').computeCount ).toBe( 2 );
}
