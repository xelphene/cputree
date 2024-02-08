
'use strict';

class NodeHandle {
    constructor(node) {
        const {LeafNode} = require('./leaf');
        const {ObjNode}  = require('./objnode');
        if( !(node instanceof LeafNode) && !(node instanceof ObjNode) )
            throw new Error('LeafNode or ObjNode instance required for argument');
        this._node = node;
    }
    
    repoint(newNode) {
        const {LeafNode} = require('./leaf');
        const {ObjNode}  = require('./objnode');
        if( this._node instanceof LeafNode ) {
            if( ! (newNode instanceof LeafNode) )
                throw new Error('repointing LeafNode handle to non-LeafNode');
        } else {
            if( ! (newNode instanceof ObjNode) )
                throw new Error('repointing ObjNode handle to non-ObjNode');
        }

        this._node = newNode;
    }
    
    get node () { return this._node }
}
exports.NodeHandle = NodeHandle;
