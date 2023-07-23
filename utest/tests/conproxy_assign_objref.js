
'use strict';

const {
    bmap, bfunc, parent, inpn,
    ObjNode, bexist, getn,
    LeafNode,
    buildMioTree,
    conProxyUnwrap
} = require('../../');
const number = inpn.number;


function test(t) {


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


var oa = new ObjNode({});
var pa = oa.getConProxy();

pa.dx = number();
pa.cx = function () { return 100 };

pa.isrc = bexist;
pa.isrc.c = function () { return 222 };
pa.isrc.i = number();

console.log('');

pa.s2 = pa.isrc;

pa.sPlusOne = add1( pa.isrc );
//pa.sPlusOne = add1( oa.getProp('isrc') );
pa.isrc_c_plus_1 = add1( pa.isrc.c );

//pa.sPluxDx = addX( oa.getProp('isrc'), oa.getProp('dx') );
pa.sPlusDx = addX( pa.isrc, pa.dx );
pa.sPlusCx = addX( pa.isrc, pa.cx );
pa.isrc_c_plus_dx = addX( pa.isrc.c, pa.dx );

console.log('');

////////////////////////////////////////////

oa.finalizeEntireTree();
oa.rawObject.isrc.i = 2;
oa.rawObject.dx = 10;

oa.computeIfNeeded();
oa.logStruct();

t.callEq( () => oa.getProp('s2').getProp('i').value, 2 );
t.callEq( () => oa.getProp('s2').getProp('c').value, 222 );
t.callEq( () => oa.getProp('sPlusOne').getProp('i').value, 3 );
t.callEq( () => oa.getProp('sPlusOne').getProp('c').value, 223 );
t.callEq( () => oa.getProp('sPlusDx').getProp('i').value, 12 );
t.callEq( () => oa.getProp('sPlusDx').getProp('c').value, 232 );
t.callEq( () => oa.getProp('sPlusCx').getProp('i').value, 102 );
t.callEq( () => oa.getProp('sPlusCx').getProp('c').value, 322 );
t.callEq( () => oa.getProp('isrc_c_plus_1').value,  223 );
t.callEq( () => oa.getProp('isrc_c_plus_dx').value, 232 );

console.log('');

oa.rawObject.dx = 20;
oa.computeIfNeeded();
oa.logStruct();

t.callEq( () => oa.getProp('sPlusDx').getProp('i').value, 22  );
t.callEq( () => oa.getProp('sPlusDx').getProp('c').value, 242 );
t.callEq( () => oa.getProp('sPlusCx').getProp('i').value, 102 );
t.callEq( () => oa.getProp('sPlusCx').getProp('c').value, 322 );
t.callEq( () => oa.getProp('isrc_c_plus_1').value,  223 );
t.callEq( () => oa.getProp('isrc_c_plus_dx').value, 242 );


t.callEq( () => oa.getProp('s2').getProp('i').computeCount, 1 );
t.callEq( () => oa.getProp('s2').getProp('c').computeCount, 1 );
t.callEq( () => oa.getProp('sPlusOne').getProp('i').computeCount, 1 );
t.callEq( () => oa.getProp('sPlusOne').getProp('c').computeCount, 1 );
t.callEq( () => oa.getProp('sPlusDx').getProp('i').computeCount,  2 );
t.callEq( () => oa.getProp('sPlusDx').getProp('c').computeCount,  2 );
t.callEq( () => oa.getProp('sPlusCx').getProp('i').computeCount,  1 );
t.callEq( () => oa.getProp('sPlusCx').getProp('c').computeCount,  1 );
t.callEq( () => oa.getProp('isrc_c_plus_1').computeCount,  1 );
t.callEq( () => oa.getProp('isrc_c_plus_dx').computeCount, 2 );

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

