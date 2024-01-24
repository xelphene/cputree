
'use strict';

const {VNode} = require('./vnode');
const {TNode} = require('../node/tnode');
const {ObjNode} = require('../node/objnode');
const {descFunc, anyToString} = require('../util');

class GetVNode extends VNode {
    constructor(bindings, func) {
        super();
        for( let i=0; i<bindings.length; i++ )
            if( 
                ! (bindings[i] instanceof VNode) && 
                ! (bindings[i] instanceof ObjNode) &&
                ! (bindings[i] instanceof TNode)
            ) {
                throw new Error(`VNode instance required for binding ${i}`);
            }
        
        this._bindings = bindings;
        this._getFunc = func;
        
        this._fresh = false;
        this._cachedValue = undefined;
        this._computeCount = 0;
    }

    get settable () { return false }
    get fresh    () { return this._fresh }
    get nodeType () { return 'vget' }
    get nodeAbbr () { return 'vgt' }
    get debugName () {
        return `<<GetVNode ${JSON.stringify(this._getFunc.toString())}>>`
    }
    get debugValue () { return this._cachedValue }
    get debugLines () {
        let rv = [];
        rv.push(`class: ${this.constructor.name}`);
        rv.push(`cachedValue: ${anyToString(this._cachedValue, 30)}`);
        rv.push(`fresh: ${this.fresh}`);
        rv.push(`getter: ${descFunc(this._getFunc, 30)}`);
        rv.push(`computeCount: ${this.computeCount}`);
        rv.push(`hearingFrom (${this._listeningTo.size}):`);
        for( let n of this._listeningTo )
            rv.push(`  ${n.debugName}`);
        rv.push(`speakingTo (${this._changeListeners.size}):`);
        for( let n of this._changeListeners )
            rv.push(`  ${n.debugName}`);
        return rv;
    }
    
    get computeCount () { return this._computeCount }
    
    dependencyFound(node) {
        this.log(`heard that I depend on ${node.debugName}`);
        this._listenTo(node);
    }
    
    nodeValueChanged(node) {
        if( this.fresh ) {
            this._fresh = false;
            super.nodeValueChanged(node);
        }
    }
    nodeValueSpoiled(node) {
        if( this.fresh ) {
            this._fresh = false;
            super.nodeValueSpoiled(node);
        }
    }
    
    // TODO: separate persistent listens (i.e. from bindings) from
    // those gathered via DTProxy. save persistent ones.
    _getArgs() {
        var rv = [];
        for( let b of this._bindings ) {
            if( b instanceof VNode || b instanceof TNode ) {
                this._listenTo(b);
                rv.push( b.value )
            } else if( b instanceof ObjNode ) {
                // this Proxy will call this.dependencyFound
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
    get value () { return this.getValue() }
    
    computeIfNeeded () {
        if( ! this._fresh )
            this.value;
    }
}
exports.GetVNode = GetVNode;
