
'use strict';

const {VNode} = require('./vnode');

class InputVNode extends VNode {
    constructor(defaultValue) {
        super();
        this._defaultValue = defaultValue;
        this._haveAssignedValue = false;
        this._assignedValue = null;
    }

    get debugName()  { return `<<input v=${this.value}>>` }
    get debugValue() { return this.value }
    get debugLines () {
        let rv = [];
        rv.push(`class: ${this.constructor.name}`);
        return rv;
    }

    nodeValueChanged () { throw new Error('should never happen'); }
    nodeValueSpoiled () { throw new Error('should never happen'); }
    _listenTo(otherNode) {throw new Error('should never happen'); }
    _unlistenTo(otherNode) {throw new Error('should never happen'); }
    fireNodeValueSpoiled () { throw new Error('should never happen'); }
    
    get nodeType () { return 'vinput'; }
    get nodeAbbr () { return 'vin'; }
    
    get settable () { return true }
    
    get value () {
        if( this._haveAssignedValue )
            return this._assignedValue;
        else
            return this._defaultValue;
    }
    
    set value (v) {
        this._haveAssignedValue = true;
        this._assignedValue = v;
        this.fireNodeValueChanged();
    }
}
exports.InputVNode = InputVNode;
