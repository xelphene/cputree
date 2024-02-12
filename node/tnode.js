
'use strict';

const {nget, nset} = require('../consts');
const {Kernel} = require('../kernel/kernel');
const {LeafNode} = require('./leaf');

class TNode extends LeafNode {
    constructor(k) {
        super({});

        if( !(k instanceof Kernel) ) 
            throw new TypeError(`Kernel instance required`);
        
        this._kernel = k;
        this._kernel.attachNode(this);
    }
    
    get nodeType () { return 'tno' }
    get nodeAbbr () { return 'tnode' }

    get debugName () { return this.fullName }
    get fullName () {
        if( this.isRoot )
            return '<anon>';
        else
            return super.fullName;
    }
    
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
    
    detachKernel () {
        this._kernel.detachNode();
        this._kernel = null;
    }
    get kernel () { return this._kernel; }
    set kernel (k) {
        if( this.isFinalized )
            throw new Error(`Cannot set kernel after finalization`);
        if( ! (k instanceof Kernel) )
            throw new TypeError(`Kernel instance required`);
        this._unlistenAll();
        this._kernel.detachNode();
        this._kernel = k;
        this._kernel.attachNode(this);
    }

    relayInput(srcNode) {
        if( this.isFinalized )
            throw new Error(`Cannot relay input after finalization`);
        if( ! (srcNode instanceof LeafNode) )
            throw new TypeError(`LeafNode required for srcNode`);
        
        const {InputKernel, RelayInputKernel} = require('../kernel');
        
        if( ! (this.kernel instanceof InputKernel) )
            throw new Error(`Cannot relay as my kernel is not an InputKernel`);

        this.kernel = new RelayInputKernel({
            validate: this.kernel.validate,
            srcNode
        });
    }
    
    canRelayInput() {
        const {InputKernel} = require('../kernel');
        return this.kernel instanceof InputKernel;
    }
    
    get isAnyInput () {
        const {InputKernel, RelayInputKernel} = require('../kernel');
        return (
            this.kernel instanceof InputKernel ||
            this.kernel instanceof RelayInputKernel
        );
    }

    copyNode () {
        return new this.constructor( this.kernel.copyKernel() );
    }
    
    finalizeDefinition () {
        if( this._kernel === undefined )
            throw new Error(`Cannot finalize a TNode which has no Kernel`);
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
    getValue()      {
        if( this._handle===null )
            throw new Error(`attempt to use abandoned TNode`);
        return this.kernel.getValue()
    }
    
    static get GetSetKernelClass () {
        return require('../kernel/getset').GetSetKernel;
    }
    
    set [nget] (f) {
        if( ! (this._kernel instanceof require('../kernel/getset').GetSetKernel) )
            throw new TypeError(`${this.debugName}: use of nget Symbol accessor requires a GetSetKernel`);
        this._kernel.getFunc = f;
    }
    set [nset] (f) {
        if( ! (this._kernel instanceof require('../kernel/getset').GetSetKernel) )
            throw new TypeError(`${this.debugName}: use of nset Symbol accessor requires a GetSetKernel`);
        this._kernel.setFunc = f;
    }
    
    merge(otherNode) {
        
    }
}
exports.TNode = TNode;

