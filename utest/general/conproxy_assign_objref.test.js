
'use strict';

const {
    bmap, bfunc, parent, inpn,
    ObjNode, bexist, getn,
    LeafNode,
    buildMioTree,
    conProxyUnwrap
} = require('../../');
const number = inpn.number;

var root;

function add1( srcNode )
{
    srcNode = conProxyUnwrap(srcNode);

    if( srcNode instanceof ObjNode ) {
        var f = function () {
            return this[getn](srcNode)[bmap]( x => x+1 )
        }
        f[bfunc] = true;
    } else if( srcNode instanceof LeafNode ) {
        var f = function () {
            return this[getn](srcNode)+1;
        }
    } else
        throw new Error(`add1 passed an unknown value as srcNode`);
        
    return f;
}

function addX( srcNode, xNode )
{
    srcNode = conProxyUnwrap(srcNode);
    xNode = conProxyUnwrap(xNode);
    
    if( srcNode instanceof ObjNode ) {
        var f = function () {
            return this[getn](srcNode)[bmap](
                x => x + this[getn](xNode)
            )
        }
        f[bfunc] = true;
    } else if( srcNode instanceof LeafNode ) {
        var f = function () {
            return this[getn](srcNode) + this[getn](xNode);
        }
    } else
        throw new Error(`add1 passed an unknown value as srcNode`);
        
    return f;
}

beforeEach( () => {
    root = new ObjNode({});
    var pa = root.getConProxy();
    
    pa.dx = number();
    pa.cx = function () { return 100 };
    
    pa.isrc = bexist;
    pa.isrc.c = function () { return 222 };
    pa.isrc.i = number();
    
    pa.s2 = pa.isrc;
    
    pa.sPlusOne = add1( pa.isrc );
    //pa.sPlusOne = add1( root.getProp('isrc') );
    pa.isrc_c_plus_1 = add1( pa.isrc.c );
    
    //pa.sPluxDx = addX( root.getProp('isrc'), root.getProp('dx') );
    pa.sPlusDx = addX( pa.isrc, pa.dx );
    pa.sPlusCx = addX( pa.isrc, pa.cx );
    pa.isrc_c_plus_dx = addX( pa.isrc.c, pa.dx );
    
    ////////////////////////////////////////////

    //root.finalizeEntireTree();
    //root.rawObject.isrc.i = 2;
    //root.rawObject.dx = 10;
    root.init({
        isrc: {
            i: 2
        },
        dx: 10
    });

    root.computeIfNeeded();
})

test('init', () => 
{
    expect( root.getProp('s2').getProp('i').value ).toBe( 2 );
    expect( root.getProp('s2').getProp('c').value ).toBe( 222 );
    expect( root.getProp('sPlusOne').getProp('i').value ).toBe( 3 );
    expect( root.getProp('sPlusOne').getProp('c').value ).toBe( 223 );
    expect( root.getProp('sPlusDx').getProp('i').value ).toBe( 12 );
    expect( root.getProp('sPlusDx').getProp('c').value ).toBe( 232 );
    expect( root.getProp('sPlusCx').getProp('i').value ).toBe( 102 );
    expect( root.getProp('sPlusCx').getProp('c').value ).toBe( 322 );
    expect( root.getProp('isrc_c_plus_1').value ).toBe(  223 );
    expect( root.getProp('isrc_c_plus_dx').value ).toBe( 232 );
})

test('update', () =>
{
    root.rawObject.dx = 20;
    root.computeIfNeeded();
    
    expect( root.getProp('sPlusDx').getProp('i').value ).toBe( 22  );
    expect( root.getProp('sPlusDx').getProp('c').value ).toBe( 242 );
    expect( root.getProp('sPlusCx').getProp('i').value ).toBe( 102 );
    expect( root.getProp('sPlusCx').getProp('c').value ).toBe( 322 );
    expect( root.getProp('isrc_c_plus_1').value ).toBe(  223 );
    expect( root.getProp('isrc_c_plus_dx').value ).toBe( 242 );

    expect( root.getProp('s2').getProp('i').computeCount ).toBe( 1 );
    expect( root.getProp('s2').getProp('c').computeCount ).toBe( 1 );
    expect( root.getProp('sPlusOne').getProp('i').computeCount ).toBe( 1 );
    expect( root.getProp('sPlusOne').getProp('c').computeCount ).toBe( 1 );
    expect( root.getProp('sPlusDx').getProp('i').computeCount ).toBe(  2 );
    expect( root.getProp('sPlusDx').getProp('c').computeCount ).toBe(  2 );
    expect( root.getProp('sPlusCx').getProp('i').computeCount ).toBe(  1 );
    expect( root.getProp('sPlusCx').getProp('c').computeCount ).toBe(  1 );
    expect( root.getProp('isrc_c_plus_1').computeCount ).toBe(  1 );
    expect( root.getProp('isrc_c_plus_dx').computeCount ).toBe( 2 );

});
