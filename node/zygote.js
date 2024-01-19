
'use strict';

const {Node} = require('./node');
const {LeafNode} = require('./leaf');
const {anyToString} = require('../util');
const {BaseComputeNode} =  require('./compute');
const {isKernelDefSettable, makeKernel} = require('./zygote_kernel');

class ZygoteNode extends LeafNode 
{
    constructor({parent, nodeDef}) {
        super({parent});
        if( nodeDef===undefined )
            this._nodeDef = {
                type: 'const',
                value: 222
            }
        else
            this._nodeDef = nodeDef
        this._cachedValue = null;
        this._computeCount = 0;
        this._fresh = false;
    }
    
    get nodeType () { return 'zyg' }
    get nodeAbbr () { return 'zygote' }
    
    finalizeDefinition() {
        super.finalizeDefinition();
        this._kernel = makeKernel(this, this._nodeDef);
    }
    
    get settable () { return isKernelDefSettable(this._nodeDef) }
    setValue(v) {
        if( this._kernel.setValue(v) ) {
            this._fresh = false;
            this.fireNodeValueChanged();
        }
    }
    getValue()  {
        if( this._fresh )
            return this._cachedValue;
        else {
            let v = this._kernel.getValue();
            this._cachedValue = v;
            this._fresh = true;
            this._computeCount++;
            return v;
        }
    }
    get value () { return this.getValue() }
    
    get debugInfo() {
        let f = this._fresh ? 'F' : 's';
        return `value: ${anyToString(this._cachedValue)} (${f}); CC: ${this._computeCount}; listensToMe: ${this.listenerNamesStr};  listeningTo: ${this.listeningToStr}`
    }
    
    computeIfNeeded() { this.getValue() }
    
    // dep handling
    
    dependencyFound(node) {
        this.log(`heard that I depend on ${node.debugName}`);
        this._listenTo(node);
    }
    
    // called when:
    //  our compute function depends on an Input node value and that Input changes.
    nodeValueChanged(node) {
        // ignore this from compute nodes
        // they send nodeValueSpoiled which for us accomplishes the same
        if( node instanceof BaseComputeNode ) {
            this.log(`ignoring nodeValueChanged from ${node.debugName}`);
            return;
        }
        this.log(`heard nodeValueChanged from ${node.debugName}`);
        this._fresh = false;
        this.fireNodeValueSpoiled();
    }
    
    // called when: 
    //  our compute function depends on some Leaf node value and it spoliates.
    nodeValueSpoiled(node) {
        if( this._needsComputing ) { return };
        this.log(`heard nodeValueSpoiled from ${node.debugName}`);
        this._fresh = false;
        this.fireNodeValueSpoiled();
    }
    
}
exports.ZygoteNode = ZygoteNode;
