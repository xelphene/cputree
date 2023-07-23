
'use strict';

const {conProxyUnwrap} = require('../tmpl/unwrap');
const {Path, toPath} = require('../path');
const {bexpand} = require('../consts');
const {ObjNode} = require('../node');

function buildAliasBranch(dst, srcs)
{
    srcs = srcs.map( s => conProxyUnwrap(s) );
    srcs = srcs.map( s => typeof(s)=='string' ? toPath(s) : s );
    srcs = srcs.map( s => s instanceof Path ? dst.nav(s) : s );
    
    var i=0;    
    for( let src of srcs )
    {
        if( src===undefined )
            throw new Error(`Item with index ${i} in the srcs list is undefined.`);
        if( ! src instanceof ObjNode )
            throw new Error(`Item with index ${i} is not a ObjNode instance.`);

        if( src.isBranch ) {
            for( let src2 of src.iterTreeLeaf() )
            {
                let mn = dst.addNodeAtPath(src2.pathFromRoot, new dst.MapNodeClass({}));
                mn.setSrcByNode(src2);
            }
        } else {
            let mn = dst.addNodeAtPath(src.pathFromRoot, new dst.MapNodeClass({}));
            mn.setSrcByNode(src);
        }
        i++;
    }    
}
exports.buildAliasBranch = buildAliasBranch;

function getAliasBranch(srcs) 
{
    var f = dst => buildAliasBranch(dst, srcs);
    f[bexpand] = true;
    return f;
};
exports.getAliasBranch = getAliasBranch;

