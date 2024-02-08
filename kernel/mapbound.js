
'use strict';

const {Kernel} = require('./kernel');
const {LeafNode} = require('../node/leaf');
const {TNode} = require('../node/tnode');
const {ObjNode} = require('../node/objnode');
const {descFunc, anyToString} = require('../util');
const {NodeHandle} = require('../node/handle');
const {Node} = require('../node/node');

class MapBoundKernel extends Kernel {
    constructor({bindings, mapGetFunc, mapSetFunc, srcNode}) {
        super();

        for( let i=0; i<bindings.length; i++ ) {
            if( bindings[i] instanceof Node ) {
                bindings[i] = bindings[i].handle;
            } else if( bindings[i] instanceof NodeHandle ) {
                // ok
            } else {
                throw new Error(`Node instance required for binding ${i}`);
            }
        }
        
        
        /*
        for( let i=0; i<bindings.length; i++ )
            if( 
                ! (bindings[i] instanceof ObjNode) &&
                ! (bindings[i] instanceof TNode)
            ) {
                throw new Error(`TNode | ObjNode instance required for binding ${i}`);
            }
        */
        
        this._bindings = bindings;
        
        if( mapSetFunc===null || typeof(mapSetFunc)=='function' )
            this._mapSetFunc = mapSetFunc;
        else
            throw new TypeError(`mapSetFunc argument must be null or a function`);
        
        if( typeof(mapGetFunc) != 'function' )
            throw new TypeError(`mapGetFunc argument must be a function`);
        this._mapGetFunc = mapGetFunc;
        
        if( srcNode instanceof NodeHandle ) {
            if( !(srcNode.node instanceof LeafNode) )
                throw new Error(`LeafNode or LeafNode Handle instance required for srcNode argument`);
        } else if( srcNode instanceof LeafNode ) {
            srcNode = srcNode.handle;
        } else
            throw new Error(`LeafNode or LeafNode Handle instance required for srcNode argument`);
        this._srcNode = srcNode;

        this._fresh = false;
        this._cachedValue = undefined;
        this._computeCount = 0;
    }
    
    attachNode(node) {
        super.attachNode(node)
        this.node._listenTo( this._srcNode.node );
    }
    
    detachNode(node) {
        this.node._unlistenTo( this._srcNode.node );
        super.detachNode(node);
    }

    get settable () { return this._mapSetFunc!==null && this._srcNode.node.settable }
    get fresh    () { return this._fresh }

    get debugValue () { return this._cachedValue }

    get computeCount () { return this._computeCount }

    get srcValue () { return this._srcNode.node.getValue() }
    
    get debugLines () {
        let rv = [];
        rv.push(`settable: ${this.settable}`);
        rv.push(`mapGetFunc: ${descFunc(this._mapGetFunc, 30)}`);
        rv.push(`mapSetFunc: ${descFunc(this._mapSetFunc, 30)}`);
        rv.push(`srcNode: ${this._srcNode.node.fullName}`);
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
            if( b.node instanceof LeafNode ) {
                this.node._listenTo(b.node);
                rv.push( b.node.value );
            } else {
                // this Proxy will call this.dependencyFound
                // OPT: cache the proxy returned here.
                rv.push( b.node.getDTProxyOverMe({
                    purpose: 'setter'
                }));
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
        this._srcNode.node.setValue(nv);
    }
    
    _getArgs() {
        var rv = [];
        for( let b of this._bindings ) {
            if( b.node instanceof LeafNode ) {
                this.node._listenTo(b.node);
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
            this.node.fireNodeValueChanged();
            return v;
        }
    }
    
    computeIfNeeded () {
        if( ! this._fresh )
            this.getValue();
    }

}
exports.MapBoundKernel = MapBoundKernel;
