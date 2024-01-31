
'use strict';

const {Kernel} = require('./kernel');
const {ANode} = require('../node/anode');
const {TNode} = require('../node/tnode');
const {ObjNode} = require('../node/objnode');
const {descFunc, anyToString} = require('../util');

class MapGetKernel extends Kernel {
    constructor(mapFuncNode, srcNode) {
        super();
        if( !(mapFuncNode instanceof TNode) && !(mapFuncNode instanceof ANode) )
            throw new Error(`TNode or ANode instance required for mapFuncNode`);
        if( !(srcNode instanceof TNode) && !(srcNode instanceof ANode) )
            throw new Error(`TNode or ANode instance required for srcNode`);
        this._mapFuncNode = mapFuncNode;
        this._srcNode = srcNode;

        this._fresh = false;
        this._cachedValue = undefined;
        this._computeCount = 0;
    }
    
    attachNode(node) {
        super.attachNode(node)
        this.node._listenTo( this._mapFuncNode );
        this.node._listenTo( this._srcNode );
    }
    
    get settable () { return false }
    get fresh    () { return this._fresh }

    get debugValue () { return this._cachedValue }

    get mapFunc () {
        let mf = this._mapFuncNode.getValue();
        if( typeof(mf) != 'function' )
            throw new Error(`${this.debugName}: my mapFuncNode ${this._mapFuncNode.fullName} returned something other than a function (type=${type(mf)}).`);
        return mf;
    }
    
    get srcValue () { return this._srcNode.getValue() }

    get debugLines () {
        let rv = [];
        rv.push(`mapFuncNode: ${this._mapFuncNode.fullName}`);
        rv.push(`mapFunc: ${descFunc(this.mapFunc, 30)}`);
        rv.push(`srcNode: ${this._srcNode.fullName}`);
        rv.push(`computeCount: ${this.computeCount}`);
        return rv;
    }
    
    get computeCount () { return this._computeCount }

    nodeValueChanged(node) {
        if( this.fresh ) {
            this.log(`heard nodeValueChanged from ${node.debugName}`);
            this._fresh = false;
            this.node.fireNodeValueSpoiled();
        }
    }
    nodeValueSpoiled(node) {
        if( this.fresh ) {
            this.log(`heard nodeValueSpoiled from ${node.debugName}`);
            this._fresh = false;
            this.node.fireNodeValueSpoiled();
        }
    }

    getValue () {
        if( this._fresh )
            return this._cachedValue;
        else {
            let v = this.mapFunc.apply(null, [this.srcValue]);
            this._cachedValue = v;
            this._fresh = true;
            this._computeCount++;
            return v;
        }
    }

    computeIfNeeded () {
        if( ! this._fresh )
            this.getValue();
    }

};
exports.MapGetKernel = MapGetKernel;
