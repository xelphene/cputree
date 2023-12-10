
'use strict';

const {
    isComputeProxy,  computeProxyWrappedObject, endProxy,
    CTL, enumerable, PRE_FINAL_LEAF_VALUE,
    isDTProxy, excOriginNode, excTopNode
} = require('../consts');

const LeafNode = require('./leaf').LeafNode;
const BaseComputeNode = require('./compute').BaseComputeNode;
const errors = require('../errors');

class GetSetNode extends BaseComputeNode {
    constructor({parent}) {
        super({parent});
        this._setFunc = undefined;
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
            if( e instanceof errors.InputValidationError )
                throw e;

            if( ! e.hasOwnProperty(excTopNode) )
                Object.defineProperty(e, excTopNode, {
                    value: this,
                    writable: true,
                    enumerable: false
                });
            else
                e[excTopNode] = this;

            if( excOriginNode in e )
                throw e;

            // TODO: this will catch exceptions thrown in the same manner as
            // this throw. need to detect them and just retrow.
            // maybe at a symbol prop to the Error obj and then watch for it?
            
            //console.error(`--- begin tree dump ----`);
            //this.root.logFlat();
            //console.error(`--- end tree dump ---`);
            //console.error('');
            //console.error(`Exception in GetSet node ${this.fullName}:`);
            //console.error(e);

            e.message = `${this.fullName}: ${e.message}`;
            Object.defineProperty(e, excOriginNode, {
                enumerable: false,
                value: this
            });

            throw e;
        }
        
        proxy[endProxy]();
    }
}
exports.GetSetNode = GetSetNode
