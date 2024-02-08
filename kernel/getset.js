
'use strict';

const {Kernel} = require('./kernel');
const {LeafNode} = require('../node/leaf');
const {TNode} = require('../node/tnode');
const {ObjNode} = require('../node/objnode');
const {GetKernel} = require('./get');
const {descFunc, anyToString} = require('../util');

class GetSetKernel extends GetKernel
{
    constructor({bindings, getFunc, setFunc}) {
        super({bindings, getFunc});
        this.setFunc = setFunc;
    }

    get setFunc () { return this._setFunc }
    set setFunc (setFunc) {
        if( typeof(setFunc) != 'function' )
            throw TypeError(`function required for setFunc`);
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
            if( b.node instanceof LeafNode ) {
                rv.push( b.node.value )
            } else {
                // this Proxy will call this.dependencyFound
                rv.push( b.node.getDTProxyOverMe({
                    purpose: 'setter'
                }));
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
