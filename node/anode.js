
'use strict';

const {DEBUG} = require('../path');
const {Kernel} = require('../kernel/kernel');

class ANode {
    constructor({kernel}) {
        this._changeListeners = new Set();
        this._listeningTo = new Set();
        this._isFinalized = false;

        if( ! (kernel instanceof Kernel) ) 
            throw new TypeError(`Kernel instance required`);
        this._kernel = kernel;
        this._kernel.attachNode(this);
    }

    //////////////////////////////////////////////////////////

    get nodeType () { return 'anode' }
    get nodeAbbr () { return 'and' }

    get debugName () { return '<anon>' }
    get fullName  () { return '<anon>' }

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


    log (m) {
        if( DEBUG ) {
            console.log(`${this.debugName}: ${m}`) 
        }
    }

    //////////////////////////////////////////////////////////

    finalizeDefinition () {
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
    
    nodeValueChanged(node)  { this.kernel.nodeValueChanged(node) }
    nodeValueSpoiled(node)  { this.kernel.nodeValueSpoiled(node) }

    dependencyFound(node)   { throw new Error('should never happen'); }

    //////////////////////////////////////////////////////////
    
    computeIfNeeded () {
        this.kernel.computeIfNeeded();
    }
    
    get settable () { return this.kernel.settable }
    set value (v)   { this.kernel.setValue(v) }
    setValue(v)     { this.kernel.setValue(v) }
    get value ()    { return this.getValue() }
    getValue()      { return this.kernel.getValue() }

}
exports.ANode = ANode;
