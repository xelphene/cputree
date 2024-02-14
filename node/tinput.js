
'use strict';

const {InputValidationError} = require('../errors');
const {TreeNode} = require('./treenode');
const {LeafNode} = require('./leaf');
const {anyToString} = require('../util');

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
    }
    
    computeIfNeeded() {
        if( ! this._initted )
            this._setValue(this._defaultValue, true, true);
    }

}
exports.TInputNode = TInputNode;

