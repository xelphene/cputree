
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
    
    // iterate over all MapNodes with me as their srcNode.
    // if non-null, return only those whose funcs and bindings are as specified
    * iterMyMapNodes({ mapGetFunc, mapSetFunc, bindings }) {
        const {TMapBoundNode} = require('./tmapbound');
        for( let h of this.handles )
            for( let n of h.changeListeners )
                if( n instanceof TMapBoundNode && n.srcNode===this ) {
                    const match = n.hasEquivMapping({
                        mapGetFunc, mapSetFunc, bindings
                    });
                    if( match )
                        yield n
                }
    }
    
    // find every TMapBoundNode anywhere originating from this node and
    // whose mapping behavior is as specified in the list of mappings
    // mapSpecs is a TMapBound.getMapSpec return value
    * findMapNodesBySpecs (mapSpecs) {
        if( mapSpecs.length < 1 )
            throw new Error(`need at least 1 mapSpec`);
        
        const iter = this.iterMyMapNodes({
            mapGetFunc:     mapSpecs[0].mapGetFunc,
            mapSetFunc:     mapSpecs[0].mapSetFunc,
            bindings:       mapSpecs[0].bindings,
        })

        for( let node of iter ) {
            if( mapSpecs.length==1 )
                yield node;
            else {
                for( let node2 of node.findMapNodesBySpecs( mapSpecs.slice(1) ) )
                    yield node2;
            }
        }        
    }

    // find every TMapBoundNode anywhere originating from this node and
    // whose mapping behavior is the same as mapNode
    * findMapNodesLike (mapNode) {
        const mapSpecs = mapNode.getMapSpecs();
        mapSpecs.reverse();
        for( let n of this.findMapNodesBySpecs( mapSpecs ) )
            if( n!==mapNode )
                yield n;
    }
};
exports.TreeNode = TreeNode;
