
'use strict';

const {DEBUG} = require('../consts');

class Kernel {
    constructor() {
        this._isFinalized = false;
        this._node = null;
    }

    //////////////////////////////////////////////////////////

    attachNode(node) {
        if( this._node !== null )
            throw new Error(`Already attached to a Node`);
        this._node = node;
    }
    detachNode(node) {
        this._node = null;
    }
    
    get node () {
        if( this._node===null )
            throw new Error('Not attached to a node');
        return this._node;
    }

    nodeValueChanged(node) { throw new Error('TODO'); }
    nodeValueSpoiled(node) { throw new Error('TODO'); }

    //////////////////////////////////////////////////////////

    finalizeDefinition () {}

    get debugName () { return this.node.fullName + '/K' }
    
    log(msg) {
        if( DEBUG )
            console.log(`${this.debugName}: ${msg}`);
    }

    //////////////////////////////////////////////////////////
    
    get settable () { throw new Error('TODO') }

    computeIfNeeded () {}
}
exports.Kernel = Kernel;
