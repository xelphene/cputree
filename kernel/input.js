
'use strict';

const {Kernel} = require('./kernel');

class InputKernel extends Kernel {
    constructor(defaultValue) {
        super();
        this._defaultValue = defaultValue;
        this._haveAssignedValue = false;
        this._assignedValue = null;
    }

    get debugValue() { return this.getValue() }
    get debugLines () {
        let rv = [];
        return rv;
    }

    nodeValueChanged () { throw new Error('should never happen'); }
    nodeValueSpoiled () { throw new Error('should never happen'); }
    
    get settable () { return true }

    get fresh () { return true }
    
    getValue () {
        if( this._haveAssignedValue )
            return this._assignedValue;
        else
            return this._defaultValue;
    }
    
    setValue (v) {
        this._haveAssignedValue = true;
        this._assignedValue = v;
        this.node.fireNodeValueChanged();
    }
}
exports.InputKernel = InputKernel;
