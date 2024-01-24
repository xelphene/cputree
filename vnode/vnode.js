
'use strict';

const {DEBUG} = require('../consts');

class VNode {
    constructor() {
        this._changeListeners = new Set();
        this._listeningTo = new Set();
        this._isFinalized = false;
    }

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
    }
    fireNodeValueSpoiled () {
        for( let l of [...this._changeListeners] ) {
            l.nodeValueSpoiled(this);
        }
    }

    // called when:
    //  our compute function depends on an Input node value and that Input changes.
    // NOTE: subclasses should implement a freshness flag
    nodeValueChanged(node) {
        // ignore this from compute nodes
        // they send nodeValueSpoiled which for us accomplishes the same
        //if( node instanceof BaseComputeNode ) {
        //    this.log(`ignoring nodeValueChanged from ${node.debugName}`);
        //    return;
        //}
        this.log(`heard nodeValueChanged from ${node.debugName}`);
        this.fireNodeValueChanged();
    }
    
    // called when: 
    //  our compute function depends on some Leaf node value and it spoliates.
    // NOTE: subclasses should implement a freshness flag
    nodeValueSpoiled(node) {
        this.log(`heard nodeValueSpoiled from ${node.debugName}`);
        this.fireNodeValueSpoiled();
    }

    //////////////////////////////////////////////////////////

    finalizeDefinition () {}

    get nodeType () {}
    get nodeAbbr () {}
    
    get debugName () {}
    get fullName  () { return this.debugName } // TODO: deprecate
    
    log(msg) {
        if( DEBUG )
            console.log(`${this.debugName}: ${msg}`);
    }

    //////////////////////////////////////////////////////////
    
    get value () {}
    set value (v) {}
    get settable () {}

    computeIfNeeded () {}
}
exports.VNode = VNode;
