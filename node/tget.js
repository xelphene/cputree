
'use strict';

const {nget, nset} = require('../consts');
const {Node} = require('../node/node');
const {LeafNode} = require('./leaf');
const {TreeNode}  =require('./treenode');
const {NodeHandle} = require('../node/handle');
const {descFunc, anyToString} = require('../util');
const {ObjNode} = require('../node/objnode');

class TGetNode extends TreeNode {
    constructor({bindings, getFunc}) {
        super({});

        for( let i=0; i<bindings.length; i++ ) {
            if( bindings[i] instanceof Node ) {
                bindings[i] = bindings[i].handle;
            } else if( bindings[i] instanceof NodeHandle ) {
                // ok
            } else {
                throw new Error(`Node instance required for binding ${i}`);
            }
        }

        this._bindings = bindings;
        
        this.getFunc = getFunc;
        
        this._fresh = false;
        this._cachedValue = undefined;
        this._computeCount = 0;
    }

    get bindings () { return this._bindings }
    
    get getFunc  () { return this._getFunc }
    set getFunc  (getFunc) {
        if( typeof(getFunc) != 'function' )
            throw TypeError(`function required for getFunc`);
        this._getFunc = getFunc;
    }
    
    get settable () { return false }
    get fresh    () { return this._fresh }

    get debugValue () { return this._cachedValue }

    get debugLines () {
        let rv = super.debugLines;
        rv.push(`getter: ${descFunc(this._getFunc, 30)}`);
        rv.push(`computeCount: ${this.computeCount}`);
        rv.push(`fresh: ${this.fresh}`);
        return rv;
    }
    
    get computeCount () { return this._computeCount }
    
    // called only from a DTProxy
    dependencyFound(node) {
        this.log(`heard that I depend on ${node.debugName}`);
        this._listenToHandle(node.handle);
    }
    
    nodeValueChanged(node) { throw new Error('deprecated'); }
    nodeValueSpoiled(node) { throw new Error('deprecated'); }
    
    handleValueChanged(handle) {
        if( this.fresh ) {
            this.log(`heard handleValueChanged from ${handle.node.debugName}`);
            this._fresh = false;
            this.fireNodeValueSpoiled();
        }
    }
    handleValueSpoiled(handle) {
        if( this.fresh ) {
            this.log(`heard handleValueSpoiled from ${handle.node.debugName}`);
            this._fresh = false;
            this.fireNodeValueSpoiled();
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
            if( b.node instanceof LeafNode ) {
                this._listenToHandle(b);
                rv.push( b.node.value )
            } else {
                // this Proxy will call this.dependencyFound
                // OPT: cache the proxy returned here.
                rv.push( b.node.getDTProxyOverMe({
                    rcvr: this,
                    purpose: 'compute'
                }));
            }
        }
        return rv;
    }

    get value () { return this.getValue() }
    
    getValue ()
    {
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
            this.fireNodeValueChanged();
            return v;
        }
    }
    
    computeIfNeeded () {
        if( ! this._fresh )
            this.getValue();
    }

}
exports.TGetNode = TGetNode;
