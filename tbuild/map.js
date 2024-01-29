
'use strict';

const {treeFillFunc} = require('../consts');
const {unwrap, getTBProxyHandler} = require('./util');
const {TNode} = require('../node/tnode');
const {GetKernel, MapGetKernel, MapGetBoundKernel} = require('../kernel');
const {
    mioSrcBranch, mioMapIn, mioMapOut, mioInput,
} = require('../consts');
const {toPath, Path} = require('../path');


function fillAllLeaf(mapBranch, srcBranch, mapFunc, mapFuncBindings)
{
    for( let n of srcBranch.iterTree() )
        if( n.isLeaf )
        {
            let newPath = toPath( n.nodesToAncestor(srcBranch).slice(0,-1).reverse().map( i => i.key ) );
            /*
            // prior
            let tn = new TNode({ kernel:
                new MapGetKernel( mapFuncNode, n )
            });
            mapBranch.addNodeAtPath( newPath, tn );
            */
            
            let f = function () {
                let v = [...arguments].slice(-1)
                return mapFunc.apply(null, [...arguments].concat(v))
            }
            let tn = new TNode({ kernel:
                new MapGetBoundKernel( mapFuncBindings, f, n )
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
    function insertMap (dstParent, key, mapFuncBindings)
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
        
        /*
        // prior
        if( typeof(mapFunc)=='function' )
            var mapFuncNode = new TNode({ kernel:
                new GetKernel(
                    mapFuncBindings,
                    function () {
                        return v => mapFunc.apply(null, [...arguments].concat(v) )
                    }
                )
            });
        else
            throw new Error(`unknown mapFunc`);
        //fillAllLeaf(dst, src, mapFuncNode);
        */
        
        
        fillAllLeaf(dst, src, mapFunc, mapFuncBindings);
    }
    insertMap[treeFillFunc] = true;
    return insertMap;
}
exports.map = map;

function powMap(src, pow)
{
    pow = unwrap(pow);
    if( pow instanceof TNode ) {
        var mapFunc = (p,v) => v * 10**p;
        var mapFuncBindings = [pow];
    } else if( typeof(pow)=='function' ) {
        var mapFunc = function () {
            let v = [...arguments].slice(-1);
            let p = pow.apply(null, [...arguments].slice(0,-1));
            return v * 10**p;
        }
        var mapFuncBindings = nul;
    } else
        throw new Error('not implemented yet');
    
    function insertPowMap(dstParent, key, buildProxyBindings) {
        if( mapFuncBindings===null )
            mapFuncBindings = buildProxyBindings;
        map(src, mapFunc)(dstParent, key, mapFuncBindings);
    }
    insertPowMap[treeFillFunc] = true;
    return insertPowMap;
}
exports.powMap = powMap;
