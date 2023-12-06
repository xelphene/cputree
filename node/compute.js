
'use strict';

const {
    isComputeProxy,  computeProxyWrappedObject, endProxy,
    CTL, enumerable, PRE_FINAL_LEAF_VALUE,
    isDTProxy, excOriginNode
} = require('../consts');

const LeafNode = require('./leaf').LeafNode;
const errors = require('../errors');

class BaseComputeNode extends LeafNode {
    constructor({parent,computeFunc}) {
        super({parent});
        this._f = computeFunc;
        this._value = undefined;
        this._needsComputing = true;
        this._listeningTo = new Set();
        this._computeCount = 0;
        this._currentValueIsABranchNode = false;
        this._directEnumFlag = undefined;
    }

    copyNode () {
        let c = new this.constructor({});
        if( this._directEnumFlag !== undefined )
            c.enumerable = this._directEnumFlag;
        c.computeFunc = this._f;
        
        return c;
    }

    get enumerable () {
        if( this._directEnumFlag !== undefined )
            return this._directEnumFlag;
        else if( this.computeFunc[enumerable] !== undefined )
            return this.computeFunc[enumerable];
        else
            return true;
    }
    
    set enumerable (v) {
        //this.computeFunc[enumerable] = v;
        this._directEnumFlag = v;
    }

    get computeFunc () { return this._f }
    set computeFunc (f) { this._f = f }

    get hearingFrom    () { return [...this._listeningTo]; }
    get hearingFromStr () { return this.hearingFrom.map( n => n.debugName ).join(', ') }

    // called when:
    //  our compute function depends on an Input node value and that Input changes.
    nodeValueChanged(node) {
        this.log(`heard nodeValueChanged from ${node.debugName}`);
        this._needsComputing = true;
        this.fireNodeValueSpoiled();
    }
    
    // called when: 
    //  our compute function depends on some Leaf node value and it spoliates.
    nodeValueSpoiled(node) {
        if( this._needsComputing ) { return };
        this.log(`heard nodeValueSpoiled from ${node.debugName}`);
        this._needsComputing = true;
        this.fireNodeValueSpoiled();
    }
    
    recompute() {
        if( ! this.isFinalized )
            throw new Error(`cannot recompute before finalization`);

        // stop listening to everything.
        // our deps may change upon recomputation
        // this will be rebuilt by calls this.dependancyFound() 
        for( let n of this._listeningTo ) {
            n.delChangeListener(this);
        }
        
        this._computeCount++;
        
        //var proxy = this.parent.getProxy(this);
        var proxy = this.parent.getDTProxyOverMe({rcvr:this, purpose:'compute'});
        //var newValue = this._f.apply(proxy, []);
        
        try {
            var newValue = this._f.apply(proxy, []);
        } catch (e) {
            if( e instanceof errors.InputValidationError )
                throw e;
            if( excOriginNode in e )
                throw e;
            
            // TODO: this will catch exceptions thrown in the same manner as
            // this throw. need to detect them and just retrow.
            // maybe at a symbol prop to the Error obj and then watch for it?
            
            //console.error(`--- begin tree dump ----`);
            //this.root.logFlat();
            //console.error(`--- end tree dump ---`);
            
            //console.error('');
            //console.error(`Exception in compute node ${this.fullName}:`);
            //console.error(e);
            
            e.message = `${this.fullName}: ${e.message}`;
            Object.defineProperty(e, excOriginNode, {
                enumerable: false,
                value: this
            });

            throw e;
        }
        
        

        //if( typeof(newValue)=='object' && newValue!==null && newValue[isComputeProxy] ) {
        if( typeof(newValue)=='object' && newValue!==null && newValue[isDTProxy] ) {
            throw new Error(`CN at ${this.fullName} has returned a another branch node as it's value.`);

            //this.log(`my compute function's return value is a proxy over another BranchNode. unwrapping it.`);
            //newValue = newValue[computeProxyWrappedObject];
        }
        
        proxy[endProxy]();
        
        this._currentValueIsABranchNode = typeof(newValue)=='object' && newValue!==null && CTL in newValue;
        
        this._value = newValue;
        this._needsComputing = false;

        this.log(`RECOMPUTED as ${this._valueStr}. _currentValueIsABranchNode==${this._currentValueIsABranchNode}`);

        //this.log(`computed as ${this._value}. will notify my listeners ${this.listenerNamesStr}.`);
        //for( let l of this._changeListeners ) {
        //for( let l of [...this._changeListeners] ) {
        //    l.nodeChanged(this);
        //}

        // TODO: why did I comment this out?
        this.fireNodeValueChanged();
    }
    
    // called only from the Proxy when a dependancy is found while executing
    // our function
    dependencyFound(node) {
        /*
        console.log(node);
        console.log(node.debugName);
        console.log(this._f.toString());
        */
        this.log(`heard that I depend on ${node.debugName}`);
        node.addChangeListener(this);
        this._listeningTo.add(node);
    }
    
    get computeCount () { return this._computeCount }

    computeIfNeeded() {
        if( this._needsComputing ) {
            this.recompute();
        }
    }
    
    get value () {
        if( ! this.isFinalized )
            return PRE_FINAL_LEAF_VALUE;

        if( this._needsComputing ) {
            this.recompute();
        }
        return this._value;
    }
    
    get existingValue () {
        return this._value;
    }

    get listeningToStr () {
        return [...this._listeningTo].map(n => n.debugName).join(', ')
    }

    get debugValue () {
        if( typeof(this._value)=='function' )
            return JSON.stringify(this._value.toString());
        else
            return this._value;
        
        //return JSON.stringify(''+this._value);
        
        /*
        if( this._currentValueIsABranchNode ) {
            return `branch: ${this._value[CTL].fullName}`;
        } else {
            return this._value
        }
        */
        
        /*
        if( ['undefined','boolean','number','string'].includes( typeof(this._value) ) )
            return this._value;
        else
            return typeof(this._value);
        */
    }
    
    get debugInfo () {
        let f = this._needsComputing ? 'stale' : 'fresh';
        if( this.debugValue === undefined )
            var dv = 'undefined';
        else
            var dv = this.debugValue.toString()
        return `value: ${dv} (${f});  computeCount: ${this.computeCount};  listensToMe: ${this.listenerNamesStr};  listeningTo: ${this.listeningToStr}`
    }
    
    get valueStr () {
        if( this._value===undefined )
            return 'undefined'
        else
            return this._value.toString();
    }
}
exports.BaseComputeNode = BaseComputeNode;

class ComputeNode extends BaseComputeNode {
    constructor({parent, computeFunc}) {
        super({parent, computeFunc});
    }
    get nodeType () { return 'compute' }
    get nodeAbbr () { return 'cpu' }
}
exports.ComputeNode = ComputeNode;

class PostValidateComputeNode extends ComputeNode {
    constructor({parent, computeFunc, postValidate}) {
        super({parent, computeFunc}); 
        if( typeof(postValidate)!='function')
            throw new Error(`function required for postValidate, not ${typeof(postValidate)}`);
        this._postValidate = postValidate
    }
    get nodeType () { return 'postValCompute' }
    get nodeAbbr () { return 'cpv' }
    
    recompute () {
        super.recompute();
        var [valid, error] = this._postValidate(this, this._value);
        if( ! valid )
            throw new errors.PostValCNValidationError({
                node: this,
                value: this._value,
                error
            });
    }
}
exports.PostValidateComputeNode = PostValidateComputeNode;
