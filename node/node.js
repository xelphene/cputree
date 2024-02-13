
'use strict';

const {sprintf} = require('sprintf-js');

const {
    ROOT_STR, NAME_SEP, DEBUG, parent, root, N, enumerable
} = require('../consts');
const {toPath,Path} = require('../path');
const NavError = require('../errors').NavError;
const {NodeHandle} = require('./handle');

class Node {
    constructor({parent}) {
        if( parent!==undefined )
            throw new Error(`passing parent in constructor arg is deprecated`);
        this._parent = parent; // can be undefined
        this._enumerable = undefined;
        this._auxHandles = [];
    }
    
    get isRoot () { return this._parent===undefined }
    get hasParent () { return this._parent!==undefined }
    get parent () {
        if( this.isRoot )
            throw new Error('Trying to get parent of root node');
        return this._parent
    }
    set parent (n) {
        if( this.definitionFinalized )
            throw new Error(`attempt to set parent after definitionFinalized`);
        this._parent = n; 
    }
    
    
    // call only from parent ObjNode
    parentAttaching(p) {
        if( this.definitionFinalized )
            throw new Error(`parentAttaching() after definitionFinalized`);
        this._parent = p;
    }
    
    
    // call from anywhere
    detachParent() {
        if( this.definitionFinalized )
            throw new Error(`detachParent() after definitionFinalized`);
        if( this.hasParent )
            this.parent.childDetaching(this);
        let p = this._parent;
        this._parent = undefined;
        return p;
    }
    
    // call only from parent ObjNode
    parentDetaching () {
        if( this.definitionFinalized )
            throw new Error(`parentDetaching() after definitionFinalized`);
        this._parent = undefined;
    }
    
    get root () {
        return this.isRoot ? this : this.parent.root;
    }
    
    get name () {
        if( this.isRoot )
            return ROOT_STR
        else {
            let k = this.parent.getChildKey(this);
            if( typeof(k)=='string' )
                return k
            else
                return k.toString().slice(7,-1);
        }
    }

    get [N] () { return this }

    /** key is what this node is known at in the ObjNode which contains it.
        just like the name of any attribute in an ordinary JS object.
        can be either a string or Symbol
    */
    get key () {
        if( this.isRoot ) {
            throw new Error('unable to produce a key for the root node');
        } else {
            return this.parent.getChildKey(this);
        }
    }

    /*
    get keyPath () {
        if( this.isRoot )
            return [];
        else
            return this.parent.keyPath.concat([this.key]);
    }
    */

    get pathFromRoot () {
        if( this.isRoot )
            return toPath([]);
        else {
            return this.parent.pathFromRoot.concat(toPath([this.key]));
        }
    }

    get pathToRoot() {
        return this.pathToNode(this.root);
    }

    get fullNameParts () {
        if( this.isRoot ) {
            return [this.name]
        } else {
            return this.parent.fullNameParts.concat([this.name]);
        }
    }
    get fullName () {
        if( this.isRoot ) {
            return this.name;
        } else {
            return this.fullNameParts.join(NAME_SEP)
        }
    }
    
    get relName () {
        if( this.isRoot )
            return '';
        else
            return this.fullNameParts.slice(1).join(NAME_SEP);
    }
    
    get debugName () {
        return `${this.fullName}(${this.nodeAbbr})`;
    }

    get debugInfo  () { return '' }
    get debugValue () { return '' }

    get depth () { return this.isRoot ? 0 : this.parent.depth+1 }

    log (m) {
        if( DEBUG ) {
            console.log(`${this.debugName}: ${m}`) 
        }
    }

    get enumerable ()  { return this._enumerable === undefined ? true : this._enumerable }
    set enumerable (v) {
        this._enumerable = v;
    }
    // when working via conproxy we use the cputree.enumerable symbol
    // but conproxy get on an ObjNode's input prop returns the actual
    // InputNode
    get [enumerable] () { return this.enumerable }
    set [enumerable] (v) { this.enumerable = v }

    finalizeDefinition () {}

    logStruct() {
        for( let n of this.iterTreeDF() ) {
            if( n.isRoot )
                continue;
            let indent = '  '.repeat(n.depth-1);
            console.log(`${indent}${n.fullName}(${n.nodeAbbr})  ${n.debugInfo}`);
        }
    }

    logFlat(opts) {
        if( typeof(opts)=='object' ) {
            var includeNonEnumerable = opts.includeNonEnumerable;
            var showValues = opts.showValues;
            var includeBranches = opts.includeBranches;
        } else {
            var includeNonEnumerable = false;
            var showValues = true;
            var includeBranches = false;
        }
        
        for( let n of this.iterTree({includeNonEnumerable}) ) {
            if( n.isLeaf || includeBranches )
                if( showValues )
                    console.log(`${n.fullName}    ${n.debugValue}`);
                else
                    console.log(`${n.fullName}`);
        }
    }
    
    logDebug(opts) {
        const {TNode} = require('./tnode');
        if( typeof(opts)=='object' ) {
            var includeNonEnumerable = opts.includeNonEnumerable;
            var includeBranches = opts.includeBranches;
            var maxNameLen = opts.maxNameLen;
        }
        if( includeNonEnumerable===undefined )
            includeNonEnumerable = true;
        if( includeBranches===undefined )
            includeBranches = false;
        if( maxNameLen===undefined )
            maxNameLen = 50;
        
        for( let n of this.iterTree({includeNonEnumerable}) ) {
            if( n.isLeaf || includeBranches )
                console.log( sprintf(`%-${maxNameLen}s`, n.fullName) );
            /*
            if( n instanceof TNode ) {
                for( let l of n.vNode.debugLines )
                    console.log( sprintf(`%-${maxNameLen}s %s`, '', l) );
            }
            */
            if( n instanceof TNode ) {
                for( let l of n.debugLines )
                    console.log( sprintf(`%-${maxNameLen}s %s`, '', l) );
            }
        }
    }

    * iterAncestors () {
        yield this;
        let n = this;
        while( ! n.isRoot )
        {
            yield n.parent;
            n = n.parent;
        }
    }

    nearestCommonAncestor(other) {
        for( let ta of this.iterAncestors() )
            for( let oa of other.iterAncestors() ) {
                //console.log(`? ta=${ta.fullName} oa=${oa.fullName}`);
                if( ta===oa )
                    return ta;
            }
        throw new Error(`unable to find common ancestor of ${this.fullName} and ${other.fullName}`);
    }

    // always returns an array of length >= 1
    // rv[0] == this
    // rv[-1] == a
    nodesToAncestor(a) {
        let path = [];
        for( let n of this.iterAncestors() ) {
            path.push(n);
            if( n===a )
                return path;
        }
        throw new Error(`${a.fullName} is not an ancestor of ${this.fullName}`);
    }
    
    pathToNode(other) {
        let ca = this.nearestCommonAncestor(other);
        
        // nav from me up to ca
        let path = Array(this.nodesToAncestor(ca).length-1).fill(parent);
        
        path = path.concat(
            other.nodesToAncestor(ca).reverse().slice(1).map(n=>n.key)
        );
        
        return new Path(path);
    }
    

    hasp(path) { return this.hasNodeAtPath(path) }
    hasNodeAtPath(path) {
        try {
            this.nav(path);
            return true;
        } catch (e) {
            if( e instanceof NavError ) {
                //console.log(e);
                return false;
            } else
                throw e;
        }
    }
    
    delp(path) { return this.delNodeAtPath(path) }
    delNodeAtPath(path) {
        path = toPath(path);
        this.nav(path).parent.detachChild(path.last);
    }

    getp(path) { return this.nav(path) }

    callIfNode(path, f) {
        if( this.hasNodeAtPath(path) )
            return f(this.nav(path));
    }
    
    //
    
    get auxHandles () {
        if( this._handle === null )
            throw new Error(`attempt to get handle of an abandoned Node`);
        return this._auxHandles
    }
    get handle () {
        if( this._handle === null )
            throw new Error(`attempt to get handle of an abandoned Node`);
        return this._handle
    }
    
    abandonHandles () {
        //if( this._changeListeners.size > 0 )
        //    throw new Error(`cannot abandon a Node with changeListeners`);
        const handle = this._handle;
        const auxHandles = this._auxHandles;
        this._handle = null;
        this._auxHandles = [];
        return [handle, auxHandles];
    }
    
    absorbHandles(otherNode) {
        const [handle, auxHandles] = otherNode.abandonHandles();
        handle.repoint(this);
        auxHandles.map( h => h.repoint(this) );
        this._auxHandles.push(handle);
        this._auxHandles = this._auxHandles.concat(auxHandles);
    }
    
    get handles () {
        return this._auxHandles.concat([this._handle]);
    }
}

exports.Node = Node;
