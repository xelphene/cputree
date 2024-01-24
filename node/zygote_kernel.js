
'use strict';

const {Node} = require('./node');
const {LeafNode} = require('./leaf');

class ConstKernel {
    constructor(node, value) {
        this._node = node;
        this._value = value;
    }
    
    get settable () { return false }
    
    getValue () { return this._value }
    setSalue (v) { throw new Error('Unable to set value of a Const node') }
}

class GetKernel {
    constructor(node, func, bindings) {
        const {ANode} = require('./anode');
        for( let i=0; i<bindings.length; i++ )
            if( ! (bindings[i] instanceof Node) && ! (bindings[i] instanceof ANode))
                throw new Error(`Node instance required for binding ${i}`);
        
        this._node = node;
        this._bindings = bindings;
        this._func = func;
    }

    get settable () { return false }
    
    dependencyFound(node) {
        // TODO:localdep:
        // make depFound listenTo the dep Node
    }
    
    // TODO:localdep: implement nodeValueChanged/Spoiled
    // when received, tell our Node that we spoiled
    // our Node, in turns, tells all its listeners it spoild
    
    _getArgs() {
        const {ANode} = require('./anode');
        var rv = [];
        for( let b of this._bindings ) {
            if( b instanceof LeafNode || b instanceof ANode ) {
                // TODO:localdep: make this listen directly to b
                // do b.addChangeListener(this);
                this._node.dependencyFound(b)
                rv.push( b.value )
            } else {
                // TODO: make rcvr this
                rv.push( b.getDTProxyOverMe({
                    overNode: b,
                    rcvr: this._node,
                    purpose: 'compute'
                }));
            }
        }
        return rv;
    }
    
    getValue() {
        return this._func.apply(null, this._getArgs());
    }
}

class InputKernel {
    constructor(node, defaultValue) {
        this._node = node;
        this._defaultValue = defaultValue;
        this._haveAssignedValue = false;
        this._assignedValue = null;
    }
    
    get settable () { return true }
    
    getValue () {
        if( this._haveAssignedValue )
            return this._assignedValue;
        else
            return this._defaultValue;
    }
    
    setValue (v) {
        this._haveAssignedValue = true;
        this._assignedValue = v;
        return true;
    }
}

class MapKernel {
    constructor(node, mapGetFunc, bindings, srcNode) {
        this._node = node;
        this._mapGetFunc = mapGetFunc;
        for( let i=0; i<bindings.length; i++ )
            if( ! (bindings[i] instanceof Node) )
                throw new Error(`Node instance required for binding ${i}`);
        this._bindings = bindings;
        this._srcNode = srcNode;
        this._node.dependencyFound(this._srcNode);
    }
    
    get settable () { return false }
    
    _getArgs() {
        var rv = [];
        for( let b of this._bindings ) {
            if( b instanceof LeafNode ) {
                this._node.dependencyFound(b)
                rv.push( b.value )
            } else {
                rv.push( b.getDTProxyOverMe({
                    overNode: b,
                    rcvr: this._node,
                    purpose: 'compute'
                }));
            }
        }
        rv.push( this._srcNode.value );
        return rv;
    }
    
    getValue() {
        return this._mapGetFunc.apply(null, this._getArgs() );
    }
}

////////////////////////////////////////////////////

function makeKernel(node, nodeDef)
{
    if( nodeDef.type=='const' )
        return new ConstKernel(node, nodeDef.value);
    else if( nodeDef.type=='get' )
        return new GetKernel(node, nodeDef.func, nodeDef.bind);
    else if( nodeDef.type=='input' )
        return new InputKernel(node, nodeDef.defaultValue);
    else if( nodeDef.type=='map' )
        return new MapKernel( node, nodeDef.mapGetFunc, nodeDef.bind, nodeDef.src);
    else
        throw new Error(`unknown nodeDef.type: ${nodeDef.type}`);
}
exports.makeKernel = makeKernel;

function isKernelDefSettable(nodeDef) {
    if( nodeDef.type=='const' )
        return false;
    else if( nodeDef.type=='get' )
        return false;
    else if( nodeDef.type=='input' )
        return true;
    else if( nodeDef.type=='map' ) {
        return nodeDef.mapSetFunc!==undefined;
    } else
        throw new Error(`unknown kernel type ${nodeDef}`);
}
exports.isKernelDefSettable = isKernelDefSettable;
