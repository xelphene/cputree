
'use strict';

const {bexist} = require('../consts');
const {
    Node, LeafNode, ObjNode,
    TInputNode, TGetNode, TRelayInputNode,
} = require('../node');
const {TreeFiller} = require('./fill');
const {unwrap} = require('./util');
const { PotentialNode } = require('./potn');

class LHSWrapper {
    constructor(o, key) {
        this.o = o;
        this.key = key;
    }
    
    get exists () {
        return this.o.hasc(this.key);
    }

    get value () {
        if( ! this.exists )
            throw new Error(`LHSWrapper value getter called on non-existent key`);
        return this.o.getc(this.key);
    }
    
    get isSettableNode () {
        return this.exists && this.o.getc(this.key).settable;
    }
    
    get isBranch () {
        return this.exists && this.value instanceof ObjNode;
    }
    
    get isLeaf () {
        return this.exists && this.value instanceof LeafNode;
    }

    get isInput () {
        return this.exists && this.value instanceof TInputNode;
    }
    
    get summary () {
        return `LHS ${this.o.fullName}.${this.key.toString()} isLeaf=${this.isLeaf} isInput=${this.isInput}`;
    }
}
exports.LHSWrapper = LHSWrapper;



class RHSWrapper
{
    constructor(o, key, value) {
        this.o = o;
        this.key = key;
        this.value = value;
    }

    get isPrimitiveIsh () {
        if( ['number','string','boolean','null'].includes(typeof(this.value)) )
            return true;
        else if( this.value === null )
            return true;
        else
            return false;
    }

    get isInput () {
        return this.value instanceof TInputNode;
    }
    
    get isBranch () {
        return this.value instanceof ObjNode;
    }
    
    get isLeaf () {
        return this.value instanceof LeafNode;
    }
    
    get isFunction () {
        return typeof(this.value)=='function'
    }
    
    get isPotential () {
        return this.value instanceof PotentialNode
    }
    
    get isTreeFiller () {
        return this.value instanceof TreeFiller
    }
    
    get isNode () {
        return this.value instanceof Node;
    }
    
    get isNodeInOurTree () {
        return this.isNode && this.o.root.treeHasNode(this.value);
    }
    
    get isBexist () {
        return this.value===bexist;
    }

    get summary () {
        return `o=${this.o.fullName} key=${this.key.toString()} isLeaf=${this.isLeaf} isInput=${this.isInput} isBexist=${this.isBexist} isNodeInOurTree=${this.isNodeInOurTree} isPrimitiveIsh=${this.isPrimitiveIsh}`;
    }
}
exports.RHSWrapper = RHSWrapper;

