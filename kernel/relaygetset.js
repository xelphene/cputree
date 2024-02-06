
'use strict';

const {GetSetKernel} = require('./getset');
const {LeafNode} = require('../node/leaf');

/*

TODO: This works but has strange side effects: This will hear
nodeValueChanged() during a computeIfNeeded, but it's set func code could
then cause some other node which already returned from computeIfNeeded to
become spoiled.  the result will be that computeIfNeeded will not
necessarily result in a tree in which everything is fresh,  but it should. 
need to rework the concept of 'freshness' as a tree-wide queue which
computeIfNeeded handles in order. more efficient that way anyway.

*/

class RelayGetSetKernel extends GetSetKernel
{
    constructor({bindings, getFunc, setFunc, srcNode}) {
        super({bindings, getFunc, setFunc});
        
        if( ! (srcNode instanceof LeafNode) )
            throw new Error(`LeafNode instance required for srcNode argument`);
        this._srcNode = srcNode;
    }
    
    get settable () { return false }
    get srcNode  () { return this._srcNode }
    
    get debugLines () {
        return super.debugLines.concat([
            `srcNode: ${this.srcNode.debugName}`
        ]);
    }
    
    attachNode(node) {
        super.attachNode(node);
        this.node._listenTo( this.srcNode );
    }
    
    detachNode(node) {
        this.node._unlistenTo( this.srcNode );
        super.detachNode(node);
    }
    
    setValue(v) {
        throw new Error(`Unable to set a relaying GetSet node`);
    }
    
    _setRelay() {
        let v = this.srcNode.getValue();
        let args = this._setArgs();
        args = args.concat([v]);
        this.log(`relay set from ${this.srcNode.debugName} to ${v}`);
        this._setFunc.apply(null, args);
    }
    
    nodeValueChanged(node) {
        if( node===this.srcNode ) {
            this.log(`my relay src node ${this.srcNode.debugName} changed`);
            this._setRelay();
        } else {
            this.log(`something else changed`);
            super.nodeValueChanged(node);
        }
    }
}
exports.RelayGetSetKernel = RelayGetSetKernel;
