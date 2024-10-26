
'use strict';

const {TreeNode}  =require('./treenode')
const {LeafNode} = require('./leaf');
const {NodeHandle} = require('../node/handle');
const {Node} = require('../node/node');
const {descFunc, anyToString, addNodeIfPossible} = require('../util');

class TMapBoundNode extends TreeNode {
    constructor({bindings, mapGetFunc, mapSetFunc, srcNode}) {
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
        
        this._listenToHandle( this._srcNode );
    }

    get settable () { return this._mapSetFunc!==null && this._srcNode.node.settable }
    get fresh    () { return this._fresh }

    get debugValue () { return this._cachedValue }

    get computeCount () { return this._computeCount }

    get srcValue () { return this._srcNode.node.getValue() }
    get srcNode  () { return this._srcNode.node }
    
    get mapGetFunc () { return this._mapGetFunc }
    get mapSetFunc () { return this._mapSetFunc }
    
    invokeMapGetFunc (v) {
        const args = [];
        for( let b of this._bindings ) {
            if( b.node instanceof LeafNode )
                args.push( b.node.value )
            else
                // setter purpose used because it has no side effects
                args.push( b.node.getDTProxyOverMe({ purpose: 'setter' }) );
        }
        args.push(v);
        return this._mapGetFunc.apply(null, args);
    }

    invokeMapSetFunc (v) {
        var args = [];
        for( let b of this._bindings ) {
            if( b.node instanceof LeafNode )
                args.push( b.node.value );
            else
                // setter purpose used because it has no side effects
                args.push( b.node.getDTProxyOverMe({ purpose: 'setter' }) );
        }
        args.push(v);
        return this._mapSetFunc.apply(null, args);
    }

    // pretend this node has value v
    // 
    // recursively reverse map operations and return the value that my
    // ultimate srcNode would have
    //
    // optionally, pretend testSrcNode is srcNode. don't crawl all the way 
    // back up to real srcNode
    testRevValue (v, testSrcNode) {
        if( !(this.srcNode instanceof TMapBoundNode) || testSrcNode===this.srcNode ) {
            return this.invokeMapSetFunc(v)
        } else {
            return this.srcNode.testRevValue( this.invokeMapSetFunc(v) )
        }
    }
    
    get debugLines () {
        let rv = super.debugLines;
        rv.push(`settable: ${this.settable}`);
        rv.push(`mapGetFunc: ${descFunc(this._mapGetFunc, 30)}`);
        rv.push(`mapSetFunc: ${descFunc(this._mapSetFunc, 30)}`);
        rv.push(`srcNode: ${this._srcNode.node.fullName}`);
        rv.push(`computeCount: ${this.computeCount}`);
        rv.push(`fresh: ${this.fresh}`);
        return rv;
    }
    
    dependencyFound(node) {
        this.log(`heard that I depend on ${node.debugName}`);
        //this.node._listenTo(node);
        this._listenToHandle(node.handle);
    }
    
    nodeValueChanged(node) { throw new Error('deprecated'); }
    nodeValueSpoiled(node) { throw new Error('deprecated'); }
     
    handleValueChanged(handle) {
        if( this.fresh ) {
            this.log(`heard nodeValueChanged from ${handle.node.debugName}`);
            this._fresh = false;
            this.fireNodeValueSpoiled();
        }
    }
    handleValueSpoiled(handle) {
        if( this.fresh ) {
            this.log(`heard nodeValueSpoiled from ${handle.node.debugName}`);
            this._fresh = false;
            this.fireNodeValueSpoiled();
        }
    }
    
    _setArgs (assignedValue) {
        var rv = [];
        for( let b of this._bindings ) {
            if( b.node instanceof LeafNode ) {
                this._listenToHandle(b);
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
            throw new Error(`${this.debugName} is not settable`);
        let args = this._setArgs(assignedValue);
        let nv = this._mapSetFunc.apply(null, args);
        this._srcNode.node.setValue(nv);
    }
    
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
    
    getValue () {
        if( this._fresh )
            return this._cachedValue;
        else {
            // TODO: exc handling
            let args = this._getArgs();
            args.push(this.srcValue);
            //console.log(`CALL ${this.debugName}`);
            //console.log(args);
            let v = this._mapGetFunc.apply(null, args);
            //console.log(v);
            //console.log(`^ end call`);
            this._cachedValue = v;
            this._fresh = true;
            this._computeCount++;
            this.fireNodeValueChanged();
            
            addNodeIfPossible(v, this);
            
            return v;
        }
    }

    get value () { return this.getValue () }
    
    computeIfNeeded () {
        if( ! this._fresh )
            this.getValue();
    }
}
exports.TMapBoundNode = TMapBoundNode;
