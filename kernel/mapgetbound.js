
'use strict';

const {Kernel} = require('./kernel');
const {TNode} = require('../node/tnode');
const {ObjNode} = require('../node/objnode');
const {descFunc, anyToString} = require('../util');

class MapGetBoundKernel extends Kernel {
    constructor(bindings, mapFunc, srcNode) {
        super();
        for( let i=0; i<bindings.length; i++ )
            if( 
                ! (bindings[i] instanceof ObjNode) &&
                ! (bindings[i] instanceof TNode)
            ) {
                throw new Error(`TNode | ObjNode instance required for binding ${i}`);
            }

        this._bindings = bindings;
        this._mapFunc = mapFunc;
        this._srcNode = srcNode;

        this._fresh = false;
        this._cachedValue = undefined;
        this._computeCount = 0;
    }
    
    attachNode(node) {
        super.attachNode(node)
        this.node._listenTo( this._srcNode );
    }

    get settable () { return false }
    get fresh    () { return this._fresh }

    get debugValue () { return this._cachedValue }

    get computeCount () { return this._computeCount }

    get srcValue () { return this._srcNode.getValue() }
    
    get debugLines () {
        let rv = [];
        rv.push(`mapFunc: ${descFunc(this._mapFunc, 30)}`);
        rv.push(`srcNode: ${this._srcNode.fullName}`);
        rv.push(`computeCount: ${this.computeCount}`);
        return rv;
    }
    
    dependencyFound(node) {
        this.log(`heard that I depend on ${node.debugName}`);
        this.node._listenTo(node);
    }
    
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
    
    _getArgs() {
        var rv = [];
        for( let b of this._bindings ) {
            if( b instanceof TNode ) {
                this.node._listenTo(b);
                rv.push( b.value )
            } else if( b instanceof ObjNode ) {
                // this Proxy will call this.dependencyFound
                // OPT: cache the proxy returned here.
                rv.push( b.getDTProxyOverMe({
                    overNode: b,
                    rcvr: this,
                    purpose: 'compute'
                }));
            } else {
                throw new Error(`unknown binding: ${b}`);
            }
        }
        return rv;
    }
    
    getValue () {
        if( this._fresh )
            return this._cachedValue;
        else {
            // TODO: exc handling
            let args = this._getArgs().concat([this.srcValue]);
            //console.log(`CALL ${this.debugName}`);
            //console.log(args);
            let v = this._mapFunc.apply(null, args);
            //console.log(v);
            //console.log(`^ end call`);
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

}
exports.MapGetBoundKernel = MapGetBoundKernel;
