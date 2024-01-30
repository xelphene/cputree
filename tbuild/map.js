
'use strict';

const {unwrap, getTBProxyHandler} = require('./util');
const {TNode} = require('../node/tnode');
const {LeafNode} = require('../node/leaf');
const {GetKernel, MapGetKernel, MapGetBoundKernel} = require('../kernel');
const {
    treeFillFunc, mioSrcBranch, mioMapIn, mioMapOut, mioInput,
} = require('../consts');
const {toPath, Path} = require('../path');

class MapFuncBuilder
{
    constructor(src, mapFunc) {
        src = unwrap(src);
        this.src = src;

        // may be null, in which case child classes will
        // override the mapFunc getter
        this._mapFunc = mapFunc;
        
        this.dstParent = null;
        this.dstKey = null;
        this.buildProxyBindings = null;
        this.dst = null;
    }
    
    fill(dstParent, dstKey, buildProxyBindings) {
        this.dstParent = dstParent;
        this.dstKey = dstKey;
        this.buildProxyBindings = buildProxyBindings;
        
        if( this.src instanceof LeafNode ) 
            this._fillLeaf();
        else
            this._fillBranch();
    }

    get mapFunc         () { return this._mapFunc }
    get mapFuncBindings () { return this.buildProxyBindings }

    _fillLeaf()
    {
        this.dstParent.addc(this.dstKey, new TNode({ kernel:
            new MapGetBoundKernel(
                this.mapFuncBindings,
                this.mapFunc,
                this.src
            )
        }));
    }
    
    _fillBranch()
    {
        this.dst = this.dstParent.addBranch(this.dstKey);
        if( this.src.isRoot ) {
            // this automatically grafts the src tree onto
            // dst[mioSrcBranch] if it is not a part of dst.  doesn't
            // necessarily *have* to though
            this.dst.addc(mioSrcBranch, this.src);
            this.dst.getc(mioSrcBranch).enumerable = false;
        }
        
        for( let n of this.src.iterTree() )
            if( n.isLeaf )
            {
                let newPath = toPath(
                    n.nodesToAncestor(this.src)
                    .slice(0,-1)
                    .reverse()
                    .map( i => i.key ) 
                );
            
                let tn = new TNode({ kernel:
                    new MapGetBoundKernel(
                        this.mapFuncBindings,
                        this.mapFunc, 
                        n
                    )
                });
                this.dst.addNodeAtPath( newPath, tn );
            }
    }
}
exports.MapFuncBuilder = MapFuncBuilder;

function map(src, mapFunc, opts) {
    return new MapFuncBuilder(src, mapFunc, opts);
}
exports.map = map;
