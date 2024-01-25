
'use strict';

const {Kernel} = require('./kernel');
const {TNode} = require('../node/tnode');
const {ObjNode} = require('../node/objnode');
const {GetKernel} = require('./get');
const {descFunc, anyToString} = require('../util');

class GetSetKernel extends GetKernel
{
    constructor(bindings, getFunc, setFunc) {
        super(bindings, getFunc);
        this._setFunc = setFunc;
    }
    
    get settable () { return true }

    get debugLines () {
        let rv = [];
        rv.push(`getter: ${descFunc(this._getFunc, 30)}`);
        rv.push(`computeCount: ${this.computeCount}`);
        rv.push(`setter: ${descFunc(this._setFunc, 30)}`);
        return rv;
    }
    
    _setArgs () {
        var rv = [];
        for( let b of this._bindings ) {
            if( b instanceof TNode ) {
                rv.push( b.value )
            } else if( b instanceof ObjNode ) {
                // this Proxy will call this.dependencyFound
                rv.push( b.getDTProxyOverMe({
                    overNode: b,
                    purpose: 'setter'
                }));
            } else {
                throw new Error(`unknown binding: ${b}`);
            }
        }
        return rv;
    }

    setValue(v) {
        let args = this._setArgs();
        args = args.concat([v]);
        this._setFunc.apply(null, args);
    }
    
}
exports.GetSetKernel = GetSetKernel;
