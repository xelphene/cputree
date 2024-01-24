
'use strict';

const {VNode} = require('../vnode/vnode');
const {LeafNode} = require('./leaf');

// TODO: enumerability should be a property of a TNode

class TNode extends LeafNode {
    constructor({parent, vNode}) {
        super({parent});
        if( vNode instanceof VNode || vNode===undefined )
            this._vNode = vNode;
        else
            throw new TypeError(`VNode instance required`);
    }
    
    get nodeType () { return 'tno' }
    get nodeAbbr () { return 'tnode' }
    get debugInfo () {
        if( this.hasVNode )
            return this.vNode.debugValue
        else
            return '(no VNode)'
    }
    
    get vNode () {
        if( ! this.hasVNode )
            throw new Error(`${this.debugName} has no vNode`);
        return this._vNode;
    }
    set vNode (vn) {
        if( ! (vn instanceof VNode) )
            throw new TypeError(`VNode instance required`);
        this._vNode = vn;
    }
    get hasVNode () { return this._vNode!==undefined }
    
    finalizeDefinition () {
        if( ! this.hasVNode )
            throw new Error(`${this.debugName} cannot finalize without a vNode ref`);
        super.finalizeDefinition();
    }
    
    addChangeListener(node) {
        // TODO: add info about our path, for debugging, somehow.
        this.vNode.addChangeListener(node);
    }
    delChangeListener(node) {
        this.vNode.delChangeListener(node);
    }
    
    _listenTo(otherNode)    { throw new Error('should never happen'); }
    _unlistenTo(otherNode)  { throw new Error('should never happen'); }
    fireNodeValueChanged () { throw new Error('should never happen'); }
    fireNodeValueSpoiled () { throw new Error('should never happen'); }
    nodeValueChanged(node)  { throw new Error('should never happen'); }
    nodeValueSpoiled(node)  { throw new Error('should never happen'); }
    dependencyFound(node)   { throw new Error('should never happen'); }
    
    computeIfNeeded () {
        if( this.hasVNode )
            this.vNode.computeIfNeeded();
    }
    
    get settable () { return this.vNode.settable }
    set value (v)   { this.vNode.value = v }
    setValue(v)     { this.vNode.value = v }
    get value ()    { return this.vNode.value }
    getValue()      { return this.vNode.value }
}
exports.TNode = TNode;
