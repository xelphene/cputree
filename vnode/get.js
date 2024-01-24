
'use strict';

const {VNode} = require('./vnode');
const {ObjNode} = require('../node/objnode');

class GetVNode extends VNode {
    constructor(bindings, func) {
        super();
        for( let i=0; i<bindings.length; i++ )
            //if( ! (bindings[i] instanceof Node) && ! (bindings[i] instanceof ANode))
            if( ! (bindings[i] instanceof VNode) && !(bindings[i] instanceof ObjNode) )
                throw new Error(`VNode instance required for binding ${i}`);
        
        this._bindings = bindings;
        this._func = func;
        
        this._fresh = false;
        this._cachedValue = undefined;
        this._computeCount = 0;
    }

    get settable () { return false }
    get fresh    () { return this._fresh }
    get nodeType () { return 'vget' }
    get nodeAbbr () { return 'vgt' }
    get debugName () {
        return `<<GetVNode ${JSON.stringify(this._func.toString())}>>`
    }
    get debugValue () { return this._cachedValue }
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
    
    // TODO: separate persisten listens (i.e. from bindings) from
    // those gathered via DTProxy. save persistent ones.
    _getArgs() {
        var rv = [];
        for( let b of this._bindings ) {
            // TODO: handle TNodes
            if( b instanceof VNode ) {
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

    get value () {
        if( this._fresh )
            return this._cachedValue;
        else {
            // TODO: exc handling
            let args = this._getArgs();
            //console.log(`CALL`);
            //console.log(args);
            let v = this._func.apply(null, args);
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
            this.value;
    }
}
exports.GetVNode = GetVNode;
