
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
};
exports.TreeNode = TreeNode;
