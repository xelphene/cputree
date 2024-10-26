
'use strict';

const {LeafNode} = require('./leaf');

class TreeNode extends LeafNode {
    get debugLines () {
        let rv = [
            `class: ${this.constructor.name}`,
            `value: ${this.debugValueStr}`,
        ];
        
        rv.push(`listeningToHandles:`);
        for( let h of this._listeningToHandles )
            rv.push(`  ${h.node.fullName} (${h.node.constructor.name})`);

        rv.push(`speakingTo via Handles:`);
        for( let h of this.handles ) {
            for( let l of h.changeListeners )
                rv.push(`  ${l.fullName} (${l.constructor.name})`);
        }
        
        return rv;
    }

    addChangeListener(node) { throw new Error('deprecated'); }
    delChangeListener(node) { throw new Error('deprecated'); }
    
    _listenTo   () { throw new Error('deprecated'); }
    _unlistenTo () { throw new Error('deprecated'); }
    
    replace(newNode) {
        if( ! newNode.isRoot )
            throw new Error('newNode is already in a tree');
        
        newNode.absorbHandles(this);
        
        if( ! this.isRoot ) {
            const key = this.key;
            const parent = this.detachParent();
            parent.addc(key, newNode);
        }
        
        this.safeDestroy();
    }
    
    safeDestroy() {
        if( this._handle !== null )
            throw new Error(`safeDestroy called on a Node which still has a primary Handle`);
        if( this._auxHandles.length != 0 )
            throw new Error(`safeDestroy called on a Node which still has ${this._auxHandles.length} aux Handles`);

        if( ! this.isRoot )
            this.detachParent();
        
        this._unlistenAllHandles();
    }
    
    // iterate over all TMapBoundNodes which have this as their srcNode
    // optionally only show those which have the given mapGetFunc and mapSetFunc
    * iterMapNodes_OLD ({mapGetFunc,mapSetFunc}) {
        const {TMapBoundNode} = require('./tmapbound');
        for( let h of this.handles )
            for( let n of h.changeListeners )
                if( n instanceof TMapBoundNode && n.srcNode===this ) {
                    if( mapGetFunc!==undefined && n.mapGetFunc!==mapGetFunc )
                        continue;
                    if( mapSetFunc!==undefined && n.mapSetFunc!==mapSetFunc )
                        continue;
                    yield n;
                }
    }

    // recursively iterate over all TMapBoundNodes which have this as their
    // srcNode.  yield eacy TMapBoundNode as well as an array of all
    // TMapBoundNodes in between
    //
    // optionally only show those which have the given mapGetFunc
    // and mapSetFunc
    * iterMapNodes ({mapGetFunc,mapSetFunc,stack,testSrcNode}) {
        if( testSrcNode===undefined ) testSrcNode=this;
        if( stack===undefined ) stack=[];
        
        stack = stack.concat(this);
        
        const {TMapBoundNode} = require('./tmapbound');
        for( let h of this.handles )
            for( let n of h.changeListeners )
                if( n instanceof TMapBoundNode && n.srcNode===this ) {
                    if( mapGetFunc!==undefined && n.mapGetFunc!==mapGetFunc )
                        continue;
                    if( mapSetFunc!==undefined && n.mapSetFunc!==mapSetFunc )
                        continue;
                    
                    // TODO: this should yield objects with methods to
                    // reverse the map call chain
                    //yield [n, stack.concat(n) ];
                    yield [n, stack.concat(n), v => n.testRevValue(v, testSrcNode) ];
                    
                    const iter = n.iterMapNodes({
                        mapGetFunc, mapSetFunc, testSrcNode,
                        stack: stack,
                    })
                    for( let i of iter )
                        yield i;
                }
    }
};
exports.TreeNode = TreeNode;
