
'use strict';

const {
    isComputeProxy,  computeProxyWrappedObject, endProxy,
    CTL, enumerable, PRE_FINAL_LEAF_VALUE,
    isDTProxy,
} = require('../consts');

const LeafNode = require('./leaf').LeafNode;
const BaseComputeNode = require('./compute').BaseComputeNode;

class GetSetNode extends BaseComputeNode {
    constructor({parent, setter, getter}) {
        super({parent, computeFunc:getter});
        this._setFunc = setter;
    }

    set getFunc (f) {
        if( this.isFinalized )
            throw new Error(`cannot modify getter after finalization`);
        this._f = f;
    }
    
    get getFunc () { return this._f }
    
    set setFunc (f) {
        if( this.isFinalized )
            throw new Error(`cannot modify setter after finalization`);
        this._setFunc = f;
    }
    
    get setFunc () { return this._setFunc }
    
    copyNode () {
        let n = new this.constructor({});
        if( this._directEnumFlag !== undefined )
            n.enumerable = this._directEnumFlag;
        n.computeFunc = this._f;
        n.setFunc = this._setFunc;
        
        return n;
    }

    get nodeType () { return 'getset' }
    get nodeAbbr () { return 'gst' }
    
    setValue(newValue) {
        if( ! this.isFinalized )
            throw new Error(`cannot set value before finalization`);
        
        var proxy = this.parent.getDTProxyOverMe({purpose:'setter'});
        
        try {
            this.setFunc.apply(proxy, [newValue]);
        } catch(e) {
            // TODO: this will catch exceptions thrown in the same manner as
            // this throw. need to detect them and just retrow.
            // maybe at a symbol prop to the Error obj and then watch for it?
            
            //console.error(`--- begin tree dump ----`);
            //this.root.logFlat();
            //console.error(`--- end tree dump ---`);
            console.error('');
            console.error(`Exception in GetSet node ${this.fullName}:`);
            console.error(e);
            throw e;
        }
        
        proxy[endProxy]();
    }
}
exports.GetSetNode = GetSetNode
