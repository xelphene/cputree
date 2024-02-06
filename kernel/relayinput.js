
'use strict';

const {Kernel} = require('./kernel');
const {LeafNode} = require('../node/leaf');
const {InputValidationError} = require('../errors');

class RelayInputKernel extends Kernel {
    constructor({validate, srcNode}) {
        super();
        this._validate = validate;
        this._fresh = false;
        this._cachedValue = undefined;
        this._computeCount = 0;
        
        if( ! (srcNode instanceof LeafNode) )
            throw new Error(`LeafNode instance required for srcNode argument`);
        this._srcNode = srcNode;
    }
    
    get settable () { return false }
    get srcNode  () { return this._srcNode }
    get computeCount () { return this._computeCount }
    get fresh () { return this._fresh }
    get debugValue () { return this._cachedValue }
    
    get debugLines () {
        let rv = [];
        rv.push(`srcNode: ${this.srcNode.debugName}`);
        rv.push(`computeCount: ${this.computeCount}`);
        return rv;
    }

    attachNode(node) {
        super.attachNode(node);
        this.node._listenTo( this.srcNode );
    }
    
    detachNode(node) {
        this.node._unlistenTo( this.srcNode );
        super.detachNode(node);
    }

    nodeValueChanged(node) {
        if( this.fresh ) {
            this.log(`heard nodeValueChanged from ${node.debugName}`);
            this._fresh = false;
            this.node.fireNodeValueSpoiled();
        }
    }
    nodeValueSpoiled(node) {
        if( this.fresh ) {
            this.log(`heard nodeValueSpoiled from ${node.debugName}`);
            this._fresh = false;
            this.node.fireNodeValueSpoiled();
        }
    }
    
    _relaySet() {
        let value = this.srcNode.getValue();
        if( this._validate !== undefined )
        {
            let valResult = this._validate(this, value);
            if( ! valResult[0] )
                throw new InputValidationError({
                    node: this.node,
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
exports.RelayInputKernel = RelayInputKernel;
