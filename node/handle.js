
'use strict';

class NodeHandle {
    constructor(node) {}
    
    get node () { return this._node }
}
exports.NodeHandle = NodeHandle;

class LeafHandle extends NodeHandle {
    constructor(node) {
        super();
        const {LeafNode} = require('./leaf');
        if( !(node instanceof LeafNode) )
            throw new Error('LeafNode instance required for argument');
        this._node = node;
        
        this._changeListeners = new Set();
    }

    repoint(newNode) {
        const {LeafNode} = require('./leaf');
        if( ! (newNode instanceof LeafNode) )
            throw new Error('repointing LeafNode handle to non-LeafNode');
        this._node = newNode;
    }

    addChangeListener(l) { this._changeListeners.add(l) }
    delChangeListener(l) { this._changeListeners.delete(l) }
    get changeListeners () { return this._changeListeners }
    get listenerNames() { return [...this._changeListeners].map( n => n.debugName ) }
    get listenerNamesStr() { return this.listenerNames.join(', ') }
    get speakingTo     () { return [...this._changeListeners]; }
    get speakingToStr  () { return this.speakingTo.map(  n => n.debugName ).join(', ') }

}
exports.LeafHandle = LeafHandle;

class ObjHandle extends NodeHandle {
    constructor(node) {
        super();
        const {ObjNode}  = require('./objnode');
        if( !(node instanceof ObjNode) )
            throw new Error('ObjNode instance required for argument');
        this._node = node;
    }

    repoint(newNode) {
        const {ObjNode}  = require('./objnode');
        if( ! (newNode instanceof ObjNode) )
            throw new Error('repointing ObjNode handle to non-ObjNode');
        this._node = newNode;
    }
}
exports.ObjHandle = ObjHandle;
