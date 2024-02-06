
'use strict';

const {InputValidationError} = require('../errors');
const {Kernel} = require('./kernel');

class InputKernel extends Kernel {
    constructor({defaultValue, validate}) {
        super();
        this._defaultValue = defaultValue;
        this._validate = validate;
        this._value = null;
        this._initted = false;
    }

    get debugValue() { return this._value }
    get debugLines () {
        let rv = [];
        return rv;
    }

    nodeValueChanged () { throw new Error('should never happen'); }
    nodeValueSpoiled () { throw new Error('should never happen'); }
    
    get settable () { return true }

    get validate () { return this._validate }

    get fresh () { return true }
    
    getValue () {
        if( ! this._initted )
            this._setValue(this._defaultValue, true, true);

        return this._value;
    }
    
    setValue (v) {
        this._setValue(v, !this._initted, false);
        this.node.fireNodeValueChanged();
    }
    
    _setValue(value, onInit, isDefault) 
    {
        if( this._validate !== undefined )
        {
            let valResult = this._validate(this, value);
            if( ! valResult[0] )
                throw new InputValidationError({
                    node: this.node,
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
}
exports.InputKernel = InputKernel;
