
'use strict';

function main () {

const {
    tmpl, bmap, bfunc, parent, 
    ObjNode, bexist, getn,
    LeafNode, BranchNode,
    buildMioTree,
    conProxyUnwrap
} = require('../');
const number = tmpl.inpdef.number;

function add1( srcNode )
{
    srcNode = conProxyUnwrap(srcNode);

    if( srcNode instanceof BranchNode ) {
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

/*
function addX( branch, leaf )
{
    branch = conProxyUnwrap(branch);
    leaf = conProxyUnwrap(leaf);
    var f = function () {
        return this[getn](branch)[bmap](
            x => x + this[getn](leaf)
        );
    }
    f[bfunc] = true;
    return f;
}
*/
function addX( srcNode, xNode )
{
    srcNode = conProxyUnwrap(srcNode);
    xNode = conProxyUnwrap(xNode);
    
    if( srcNode instanceof BranchNode ) {
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

}
main();
