
'use strict';

const {LeafNode} = require('./leaf');

class TreeNode extends LeafNode {
    get debugLines () {
        let rv = [
            `class: ${this.constructor.name}`,
            `value: ${this.debugValue}`,
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
        
        this._unlistenAllHandles();
        
        newNode.absorbHandles(this);
        
        if( ! this.isRoot ) {
            const key = this.key;
            const parent = this.detachParent();
            parent.addc(key, newNode);
        }
    }
};
exports.TreeNode = TreeNode;
