
'use strict';

const {addNodeIfPossible} = require('../util');
const {InputValidationError} = require('../errors');
const {TreeNode} = require('./treenode');
const {LeafNode} = require('./leaf');
const {anyToString} = require('../util');
const {TRelayInputNode} = require('./trelayinput');

/*

TODO: restructure assignment / implied init

initValueDefault () // init with default value
initValueAssign (v) // init by first assignment
setValue (v) // ONLY called for post-init assigns

*/

class TInputNode extends TreeNode {
    constructor({defaultValue, validate}) {
        super({});

        this._defaultValue = defaultValue;
        this._validate = validate;
        this._value = null;
        this._initted = false;
    }

    get debugValue() { return this._value }
    /*
    get debugLines () {
        return [];
    }
    */

    copyNode() {
        return new this.constructor({
            defaultValue: this._defaultValue,
            validate: this._validate
        });
    }

    nodeValueChanged () { throw new Error('should never happen'); }
    nodeValueSpoiled () { throw new Error('should never happen'); }
    
    get settable () { return true }

    get validate () { return this._validate }

    get fresh () { return true }

    get value () { return this.getValue() }
    
    getValue () {
        if( ! this._initted )
            this._setValue(this._defaultValue, true, true);

        return this._value;
    }
    
    setValue (v) {
        this._setValue(v, !this._initted, false);
        addNodeIfPossible(v, this);
        this.fireNodeValueChanged();
    }

    set value (v) {
        this.setValue(v);
    }
    
    _setValue(value, onInit, isDefault) 
    {
        if( this._validate !== undefined )
        {
            let valResult = this._validate(this, value);
            if( ! valResult[0] )
                throw new InputValidationError({
                    node: this,
                    value,
                    error: valResult[1],
                    onInit,
                    isDefault
                });
            if( valResult.length==3 )
                value = valResult[2];
        }
        this._initted = true;
        this._value = value;
        addNodeIfPossible(this._value, this);
    }
    
    computeIfNeeded() {
        if( ! this._initted )
            this._setValue(this._defaultValue, true, true);
    }
    
    replaceWithRelay(srcNode) {
        if( this.isFinalized )
            throw new Error(`Cannot relay input after finalization`);
        if( ! (srcNode instanceof LeafNode) )
            throw new TypeError(`LeafNode required for srcNode`);

        const newNode = new TRelayInputNode({
            validate: this._validate,
            srcNode:  srcNode
        });
        this.replace(newNode);
    }
}
exports.TInputNode = TInputNode;

