
'use strict';

const {Kernel} = require('./kernel');
const {TNode} = require('../node/tnode');
const {ANode} = require('../node/anode');
const {ObjNode} = require('../node/objnode');
const {descFunc, anyToString} = require('../util');

class GetKernel extends Kernel {
    constructor(bindings, func) {
        super();
        for( let i=0; i<bindings.length; i++ )
            if( 
                ! (bindings[i] instanceof ObjNode) &&
                ! (bindings[i] instanceof TNode) &&
                ! (bindings[i] instanceof ANode)
            ) {
                throw new Error(`TNode | ObjNode instance required for binding ${i}`);
            }
        
        this._bindings = bindings;
        this._getFunc = func;
        
        this._fresh = false;
        this._cachedValue = undefined;
        this._computeCount = 0;
    }

    get settable () { return false }
    get fresh    () { return this._fresh }

    get debugValue () { return this._cachedValue }

    get debugLines () {
        let rv = [];
        rv.push(`getter: ${descFunc(this._getFunc, 30)}`);
        rv.push(`computeCount: ${this.computeCount}`);
        return rv;
    }
    
    get computeCount () { return this._computeCount }
    
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
    
    // TODO: separate persistent listens (i.e. from bindings) from
    // those gathered via DTProxy. save persistent ones.
    // the persistent ones would be set up on finalization
    // if we have the static deps optimization set, *all* listens are 
    // persistent
    _getArgs() {
        var rv = [];
        for( let b of this._bindings ) {
            if( b instanceof TNode || b instanceof ANode ) {
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
            let args = this._getArgs();
            //console.log(`CALL ${this.debugName}`);
            //console.log(args);
            let v = this._getFunc.apply(null, args);
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
exports.GetKernel = GetKernel;