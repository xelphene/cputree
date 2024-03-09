
'use strict';

const {unwrap, getTBProxyHandler} = require('./util');
const {LeafNode} = require('../node/leaf');
const {TInputNode} = require('../node/tinput');
const {TMapBoundNode} = require('../node/tmapbound');
const {
    mioSrcBranch, mioMapIn, mioMapOut, mioInput,
} = require('../consts');
const {toPath, Path} = require('../path');
const {TreeFiller} = require('./fill');
const {PotentialNode} = require('./potn');
const {potnPathFromRoot} = require('../consts');

class MapFuncBuilder extends TreeFiller
{
    constructor({src, mapSrcToDst, mapDstToSrc, graft, replaceSrcInputs}) {
        super();
        src = unwrap(src);
        if( src instanceof PotentialNode )
            throw new Error(`Map operation given potential node ${src[potnPathFromRoot]} as src`);
        this.src = src;

        // may be null, in which case child classes will
        // override the getter
        this._mapSrcToDst = mapSrcToDst;
        this._mapDstToSrc = mapDstToSrc;
        
        this.dstParent = null;
        this.dstKey = null;
        this._bindings = null;
        this.dst = null;

        this._graft = graft!==false;
        this._replaceSrcInputs = replaceSrcInputs;
    }
    
    get willFillLeaf () { return this.src instanceof LeafNode }
    
    fill(dstParent, dstKey, buildProxyBindings) {
        this.dstParent = dstParent;
        this.dstKey = dstKey;
        this._bindings = buildProxyBindings;
        this.srcInSameTree = this.dstParent.inSameTree(this.src);
        
        if( this.src instanceof LeafNode ) {
            this._fillLeaf();
            this.dst = this.dstParent.getc(this.dstKey);
        } else {
            this.dst = this.dstParent.addBranch(this.dstKey);
            this._fillBranch();
        }
    }

    sproutForMergeTemp(bindings) {
        this.srcInSameTree = true;
        return this._sprout(bindings);
    }
    
    sprout(bindings) {
        this.srcInSameTree = false;
        return this._sprout(bindings);
    }
    
    _sprout(bindings) {
        if( bindings!==undefined )
            this._bindings = bindings;
        else
            this._bindings = [];
        if( this.src instanceof LeafNode ) {
            this.dst = new TMapBoundNode({
                bindings: this.mapFuncBindings,
                mapGetFunc: this.mapSrcToDst,
                mapSetFunc: this.mapDstToSrc,
                srcNode: this.src
            });
        } else {
            this.dst = new this.src.BranchNodeClass({});
            this._fillBranch();
        }
        return this.dst;
    }
    
    get mapSrcToDst () { return this._mapSrcToDst }
    get mapDstToSrc () { return this._mapDstToSrc }
    get mapFuncBindings () { return this._bindings }
    
    get replaceSrcInputs () {
        if( this._replaceSrcInputs !== undefined )
            return this._replaceSrcInputs;
        else
            return ! this.srcInSameTree;
    }

    _fillLeaf()
    {
        this.dstParent.addc(this.dstKey, new TMapBoundNode({
            bindings: this.mapFuncBindings,
            mapGetFunc: this.mapSrcToDst,
            mapSetFunc: this.mapDstToSrc,
            srcNode: this.src
        }));
    }
    
    _fillBranch()
    {
        //this.dst = this.dstParent.addBranch(this.dstKey);
        if( this.src.isRoot ) {
            // this automatically grafts the src tree onto
            // dst[mioSrcBranch] if it is not a part of dst.  doesn't
            // necessarily *have* to though
            
            if( this._graft ) {
                this.dst.addc(mioSrcBranch, this.src);
                this.dst.getc(mioSrcBranch).enumerable = false;
                
                // TODO: if we're grafting, then we're *encapsulating*
                // mioSrcBranch.
                // make every TInputNode in mioSrcBranch relay
                // FROM the new TMapBoundNodes we create
            }
        }
        
        for( let srcNode of this.src.iterTree() ) {
            if( ! srcNode.isLeaf )
                continue;

            let dstPath = toPath(
                srcNode.nodesToAncestor(this.src)
                .slice(0,-1)
                .reverse()
                .map( i => i.key ) 
            );
            
            if( this.replaceSrcInputs && srcNode instanceof TInputNode ) {
                let dstNode = new TInputNode({
                    validate: srcNode.validate
                });
                this.dst.addNodeAtPath( dstPath, dstNode );

                let srcNodeNew = new TMapBoundNode({
                    bindings: this.mapFuncBindings,
                    mapGetFunc: this.mapDstToSrc, 
                    mapSetFunc: this.mapSrcToDst,
                    srcNode: dstNode
                });
                srcNode.replace(srcNodeNew);
            } else {
                let dstNode = new TMapBoundNode({
                    bindings: this.mapFuncBindings,
                    mapGetFunc: this.mapSrcToDst, 
                    mapSetFunc: this.mapDstToSrc,
                    srcNode
                });
                this.dst.addNodeAtPath( dstPath, dstNode );
            }
        }
    }
}
exports.MapFuncBuilder = MapFuncBuilder;

/*k
function map(src, mapFunc, opts)
{
    if( opts===undefined ) opts = {};
    if( opts.graft === undefined ) opts.graft = true;
    
    return new MapFuncBuilder({
        src,
        mapGetFunc: mapFunc,
        mapSetFunc: null,
        graft: opts.graft,
    });
}
exports.map = map;

function mapBi(src, mapSrcToDst, mapDstToSrc, opts)
{
    if( opts===undefined ) opts = {};
    if( opts.graft === undefined ) opts.graft = true;
    
    if( typeof(mapFunc)=='function' && mapSetFunc===undefined )
        return new MapFuncBuilder({
            src,
            mapSrcToDst: mapSrcToDst,
            mapDstToSrc: mapFunc,
            graft: opts.graft,
        });
    else if( typeof(mapFunc)=='function' && typeof(mapSetFunc)=='function' )
        return new MapFuncBuilder({
            src,
            mapGetFunc: mapFunc,
            mapSetFunc: mapSetFunc,
            graft: opts.graft,
        });
    else
        throw new TypeError(`mapBi requires src Node and one or two functions as arguments`);
        
}
exports.mapBi = mapBi;


*/

function mapSym(src, mapFunc, opts)
{
    if( opts===undefined ) opts = {};
    if( opts.graft === undefined ) opts.graft = true;

    return new MapFuncBuilder({
        src,
        mapSrcToDst: mapFunc,
        mapDstToSrc: mapFunc,
        graft: opts.graft,
    });
}
exports.mapSym = mapSym;


