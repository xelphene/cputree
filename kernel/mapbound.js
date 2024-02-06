
'use strict';

const {Kernel} = require('./kernel');
const {LeafNode} = require('../node/leaf');
const {TNode} = require('../node/tnode');
const {ObjNode} = require('../node/objnode');
const {descFunc, anyToString} = require('../util');

class MapBoundKernel extends Kernel {
    constructor({bindings, mapGetFunc, mapSetFunc, srcNode}) {
        super();
        for( let i=0; i<bindings.length; i++ )
            if( 
                ! (bindings[i] instanceof ObjNode) &&
                ! (bindings[i] instanceof TNode)
            ) {
                throw new Error(`TNode | ObjNode instance required for binding ${i}`);
            }

        this._bindings = bindings;
        
        if( mapSetFunc===null || typeof(mapSetFunc)=='function' )
            this._mapSetFunc = mapSetFunc;
        else
            throw new TypeError(`mapSetFunc argument must be null or a function`);
        
        if( typeof(mapGetFunc) != 'function' )
            throw new TypeError(`mapGetFunc argument must be a function`);
        this._mapGetFunc = mapGetFunc;
        
        if( ! (srcNode instanceof LeafNode) )
            throw new Error(`LeafNode instance required for srcNode argument`);
        this._srcNode = srcNode;

        this._fresh = false;
        this._cachedValue = undefined;
        this._computeCount = 0;
    }
    
    attachNode(node) {
        super.attachNode(node)
        this.node._listenTo( this._srcNode );
    }

    get settable () { return this._mapSetFunc!==null && this._srcNode.settable }
    get fresh    () { return this._fresh }

    get debugValue () { return this._cachedValue }

    get computeCount () { return this._computeCount }

    get srcValue () { return this._srcNode.getValue() }
    
    get debugLines () {
        let rv = [];
        rv.push(`settable: ${this.settable}`);
        rv.push(`mapGetFunc: ${descFunc(this._mapGetFunc, 30)}`);
        rv.push(`mapSetFunc: ${descFunc(this._mapSetFunc, 30)}`);
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
    
    _setArgs (assignedValue) {
        var rv = [];
        for( let b of this._bindings ) {
            if( b instanceof TNode ) {
                this.node._listenTo(b);
                rv.push( b.value );
            } else if( b instanceof ObjNode ) {
                // this Proxy will call this.dependencyFound
                // OPT: cache the proxy returned here.
                rv.push( b.getDTProxyOverMe({
                    overNode: b,
                    purpose: 'setter'
                }));
            } else {
                throw new Error(`unknown binding: ${b}`);
            }
        }
        rv.push(assignedValue);
        return rv;
    }
    
    setValue(assignedValue) {
        if( ! this.settable )
            throw new Error(`this.node.debugName is not settable`);
        let args = this._setArgs(assignedValue);
        let nv = this._mapSetFunc.apply(null, args);
        this._srcNode.setValue(nv);
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
        rv.push(this.srcValue);
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
            let v = this._mapGetFunc.apply(null, args);
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
exports.MapBoundKernel = MapBoundKernel;
