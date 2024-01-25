
'use strict';

const {Kernel} = require('../kernel/kernel');
const {LeafNode} = require('./leaf');

// TODO: enumerability should be a property of a TNode

class TNode extends LeafNode {
    constructor({parent, kernel}) {
        super({parent});

        if( ! (kernel instanceof Kernel) ) 
            throw new TypeError(`Kernel instance required`);
        this._kernel = kernel;
        this._kernel.attachNode(this);
    }
    
    get nodeType () { return 'tno' }
    get nodeAbbr () { return 'tnode' }

    get debugInfo () {
        return `${this.kernel.constructor.name} = ${this.kernel.debugValue}`;
    }
    get debugLines () {
        let rv = [];
        
        rv.push(`V: ${this.kernel.debugValue}`);
        rv.push(`fresh: ${this.kernel.fresh}`);
        rv.push(`kernel: ${this.kernel.constructor.name}`);
        
        rv.push(`speakingTo (${this._changeListeners.size}):`);
        for( let n of this._changeListeners )
            rv.push(`  ${n.fullName}`);
        rv.push(`hearingFrom (${this._listeningTo.size}):`);
        for( let n of this._listeningTo )
            rv.push(`  ${n.fullName}`);
        for( let l of this.kernel.debugLines )
            rv.push(`K: ${l}`);
        return rv;
    }
    
    get kernel () {
        return this._kernel;
    }
    /*
    set kernel (k) {
        if( ! (k instanceof Kernel) )
            throw new TypeError(`Kernel instance required`);
        this._kernel = k;
    }
    get hasVNode () { return this._kernel!==undefined }
    */
    
    finalizeDefinition () {
        super.finalizeDefinition();
    }
    
    nodeValueChanged(node)  { this.kernel.nodeValueChanged(node) }
    nodeValueSpoiled(node)  { this.kernel.nodeValueSpoiled(node) }

    dependencyFound(node)   { throw new Error('should never happen'); }
    
    computeIfNeeded () {
        this.kernel.computeIfNeeded();
    }
    
    get settable () { return this.kernel.settable }
    set value (v)   { this.kernel.setValue(v) }
    setValue(v)     { this.kernel.setValue(v) }
    get value ()    { return this.getValue() }
    getValue()      { return this.kernel.getValue() }
}
exports.TNode = TNode;
