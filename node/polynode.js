
// demo: play/polynode_test.js

'use strict';

const {unwrap} = require('../tbuild/util');
const {LeafNode} = require('./leaf');
const {TreeNode} = require('./treenode');
const {THIS_NODE} = require('../consts');

class PolyNode extends TreeNode {
    constructor({ getFunc, bindings }) {
        super({});
        this._getFunc = getFunc;
        this._bindings = bindings;
        this._fresh = false;
        this._initted = false;
        // listen to bindings
        for( let b of bindings ) {
            b = unwrap(b);
            if( b instanceof LeafNode )
                this._listenToHandle(b.handle);
            else if( b===THIS_NODE )
                continue;
            else
                throw new Error(`unknown binding ${b}`);
        }
        this._bindings = bindings;
    }
    
    _getFunc () {
        throw new Error('not implemented');
    }

    // called when one our getFunc's bindings changes
    handleValueChanged(handle) {
        this.fireNodeValueSpoiled();
        this._fresh = false;
    }
    handleValueSpoiled(handle) {
        this.fireNodeValueSpoiled();
        this._fresh = false;
    }

    _getArgs () {
        const rv = [];
        for( let b of this._bindings ) {
            if( b===THIS_NODE ) {
                rv.push( this._value );
            } else {
                rv.push( b.value );
            }
        }
        return rv;
    }

    _setArgs (v) {
        const rv = [];
        for( let b of this._bindings ) {
            if( b===THIS_NODE ) {
                rv.push( v );
            } else {
                rv.push( b.value );
            }
        }
        return rv;
    }
    
    _initCompute () {
        // the initial value is already in this._value
        // just need to ensure it is valid
        const args = this._getArgs();
        const v = this._getFunc.apply(null, args );
        if( v != this._value )
            throw new Error(`Init value for ${this.fullName} == ${this._value} is out of range`);
        this._initted = true;
        this._fresh = true;
    }
    
    _compute () {
        if( ! this._initted ) {
            this._initCompute();
            return;
        }
        const args = this._getArgs();
        this._value = this._getFunc.apply(null, args );
        this._fresh = true;
    }
    
    getValue () {
        if( ! this._fresh ) {
            this._compute();
            this.fireNodeValueChanged();
        }
        return this._value;
    }
    
    get value () { return this.getValue() }
    
    get debugValue () { return this._value }
    
    settable () { return true }
    
    setValue(v) {
        if( ! this._initted ) {
            this._value = v;
            return;
        }
         this._value = this._getFunc.apply(null, this._setArgs(v) );
         this._fresh = true;
    }
    
    computeIfNeeded() {
        this.getValue();
    }
}
exports.PolyNode = PolyNode;
