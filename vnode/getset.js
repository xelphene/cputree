
'use strict';

const {VNode} = require('./vnode');
const {ObjNode} = require('../node/objnode');
const {GetVNode} = require('./get');
const {descFunc, anyToString} = require('../util');

class GetSetVNode extends GetVNode
{
    constructor(bindings, getFunc, setFunc) {
        super(bindings, getFunc);
        this._setFunc = setFunc;
    }
    
    get settable () { return true }
    get nodeType () { return 'vst' }
    get nodeAbbr () { return 'vgetset' }
    get debugName () {
        return `<<GetSetVNode ${JSON.stringify(this._getFunc.toString())}`
    }
    get debugLines () {
        let rv = [];
        rv.push(`class: ${this.constructor.name}`);
        rv.push(`cachedValue: ${anyToString(this._cachedValue, 30)}`);
        rv.push(`fresh: ${this.fresh}`);
        rv.push(`getter: ${descFunc(this._getFunc, 30)}`);
        rv.push(`computeCount: ${this.computeCount}`);
        rv.push(`setter: ${descFunc(this._setFunc, 30)}`);
        rv.push(`hearingFrom (${this._listeningTo.size}):`);
        for( let n of this._listeningTo )
            rv.push(`  ${n.debugName}`);
        rv.push(`speakingTo (${this._changeListeners.size}):`);
        for( let n of this._changeListeners )
            rv.push(`  ${n.debugName}`);
        return rv;
    }
    
    _setArgs () {
        var rv = [];
        for( let b of this._bindings ) {
            // TODO: handle TNodes
            if( b instanceof VNode ) {
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
    get value ()  { return this.getValue() }
    set value (v) { this.setValue(v) }
    
}
exports.GetSetVNode = GetSetVNode;
