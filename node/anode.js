
'use strict';

const {DEBUG} = require('../path');
const {BaseComputeNode} = require('./compute');
const {isKernelDefSettable, makeKernel} = require('./zygote_kernel');

class ANode {
    constructor({nodeDef}) {
        this._changeListeners = new Set();
        this._listeningTo = new Set();
        this._isFinalized = false;

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

    //////////////////////////////////////////////////////////

    get nodeType () { return 'anode' }
    get nodeAbbr () { return 'and' }

    get debugName () { return '(anon)' }
    get fullName  () { return '(anon)' }

    log (m) {
        if( DEBUG ) {
            console.log(`${this.debugName}: ${m}`) 
        }
    }

    //////////////////////////////////////////////////////////

    finalizeDefinition () {
        this._kernel = makeKernel(this, this._nodeDef);
        this._isFinalized = true
    }
    get isFinalized () { return this._isFinalized }

    //////////////////////////////////////////////////////////

    addChangeListener(node) { this._changeListeners.add(node) }
    delChangeListener(node) { this._changeListeners.delete(node) }
    get changeListeners () { return this._changeListeners }
    get listenerNames() { return [...this._changeListeners].map( n => n.debugName ) }
    get listenerNamesStr() { return this.listenerNames.join(', ') }
    get speakingTo     () { return [...this._changeListeners]; }
    get speakingToStr  () { return this.speakingTo.map(  n => n.debugName ).join(', ') }

    _listenTo(otherNode) {
        this._listeningTo.add(otherNode);
        otherNode.addChangeListener(this);
    }
    _unlistenTo(otherNode) {
        otherNode.delChangeListener(this);
        this._listeningTo.delete(otherNode);
    }

    get hearingFrom    () { return [...this._listeningTo]; }
    get hearingFromStr () { return this.hearingFrom.map( n => n.debugName ).join(', ') }
    isListeningTo (n) {
        for( let n2 of this._listeningTo )
            if( n===n2 )
                return true;
        return false;
    }
    get listeningToStr () {
        return [...this._listeningTo].map(n => n.debugName).join(', ')
    }

    fireNodeValueChanged () {
        for( let l of [...this._changeListeners] ) {
            l.nodeValueChanged(this);
        }
        for( let f of this._extListeners )
            f(this.value);
    }
    fireNodeValueSpoiled () {
        for( let l of [...this._changeListeners] ) {
            l.nodeValueSpoiled(this);
        }
    }

    //////////////////////////////////////////////////////////
    
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
exports.ANode = ANode;
