
'use strict';

const {LeafHandle} = require('./handle');
const {LeafNode} = require('./leaf');
const {TreeNode} = require('./treenode');
const {InputValidationError} = require('../errors');

class TRelayInputNode extends TreeNode {
    constructor({validate, srcNode}) {
        super({});
        this._validate = validate;
        this._fresh = false;
        this._cachedValue = undefined;
        this._computeCount = 0;
        
        if( srcNode instanceof LeafNode )
            srcNode = srcNode.handle;
        if( ! (srcNode instanceof LeafHandle) )
            throw new Error(`LeafNode or LeafHandle instance required for srcNode argument`);
        
        this._srcNode = srcNode;
        this._listenToHandle( srcNode );
    }
    
    get settable () { return false }
    get srcNode  () { return this._srcNode }
    get computeCount () { return this._computeCount }
    get fresh () { return this._fresh }
    get debugValue () { return this._cachedValue }
    
    get debugLines () {
        let rv = super.debugLines;
        rv.push(`srcNode: ${this.srcNode.node.debugName}`);
        rv.push(`computeCount: ${this.computeCount}`);
        return rv;
    }

    nodeValueChanged(node) { throw new Error('deprecated'); }
    nodeValueSpoiled(node) { throw new Error('deprecated'); }

    handleValueChanged(handle) {
        if( this.fresh ) {
            this.log(`heard handleValueChanged from ${handle.node.debugName}`);
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
    
    _relaySet() {
        let value = this.srcNode.node.getValue();
        if( this._validate !== undefined )
        {
            let valResult = this._validate(this, value);
            if( ! valResult[0] )
                throw new InputValidationError({
                    node: this,
                    value,
                    error: valResult[1],
                    onInit: false,
                    isDefault: false
                });
            if( valResult.length==3 )
                value = valResult[2];
        }
        this._fresh = true;
        this._cachedValue = value;
    }

    getValue () {
        if( this._fresh )
            return this._cachedValue;
        else {
            this._relaySet();
            return this._cachedValue;
        }
    }

    computeIfNeeded() {
        if( ! this._fresh )
            this._relaySet();
    }
}
exports.TRelayInputNode = TRelayInputNode;
