
'use strict';

const {treeFillFunc} = require('../consts');
const {unwrap, getTBProxyHandler} = require('./util');
const {TNode} = require('../node/tnode');
const {GetKernel, MapGetKernel} = require('../kernel');
const {
    mioSrcBranch, mioMapIn, mioMapOut, mioInput,
} = require('../consts');
const {toPath, Path} = require('../path');


function fillAllLeaf(mapBranch, srcBranch, mapFuncNode)
{
    for( let n of srcBranch.iterTree() )
        if( n.isLeaf )
        {
            let newPath = toPath( n.nodesToAncestor(srcBranch).slice(0,-1).reverse().map( i => i.key ) );
            /*
            let newCN = mapBranch.addNodeAtPath(newPath, new MapNode({}));
            newCN.setSrcByNode(n);
            newCN.setMapFuncByNode(mapBranch.getProp(mioMapOut));
            */
            
            let tn = new TNode({ kernel:
                new MapGetKernel( mapFuncNode, n )
            });
            mapBranch.addNodeAtPath( newPath, tn );
            
        }
}

// map *always* does a map-get only.
// mapBi will do bi-map (wether with 1 func or 2)
function map(src, mapFunc, opts)
{
    src = unwrap(src);
    
    if( opts===undefined )
        opts = {};
    if( opts.graft===undefined )
        opts.graft = true;
    
    function insertMap (dstParent, key, dstProxyHandler)
    {
        // TODO: handle it if src is a leaf node
        
        var dst = dstParent.addBranch(key);
        
        /*
        // TODO
        if( src.isRoot && opts.graft ) {
            dst.add(mioSrcBranch, srcBranch);
            dst.getc(mioSrcBranch).enumerable = false;
        }
        */
        
        if( typeof(mapFunc)=='function' )
            var mapFuncNode = new TNode({ kernel:
                new GetKernel(
                    dstProxyHandler.bindings,
                    function () {
                        return v => mapFunc.apply(null, [...arguments].concat(v) )
                    }
                )
            });
        else
            throw new Error(`unknown mapFunc`);
        
        /*
        mapBranch.add(mioMapOut, new GetSetNode({
            getter: function () { return x => x }
        }));
        mapBranch.getProp(mioMapOut).enumerable = false;
        */
        
        fillAllLeaf(dst, src, mapFuncNode);
    }
    insertMap[treeFillFunc] = true;
    return insertMap;
}
exports.map = map;
