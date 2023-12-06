
'use strict';

const {parent, root, N} = require('../consts');
const Node = require('./node').Node;
const toPath = require('../path').toPath;
const NavError = require('../errors').NavError;

class LeafNode extends Node {
    constructor({parent}) {
        super({parent});
        this._changeListeners = new Set();
        this._isFinalized = false;
        this._directEnumFlag = undefined;
        this._extListeners = [];
    }

    finalizeDefinition () { this._isFinalized = true }
    get isFinalized () { return this._isFinalized }

    get isLeaf ()   { return true }
    get isBranch () { return false }
    get isComputable () { return this.computeIfNeeded !== undefined }

    get enumerable () {
        if( this._directEnumFlag === undefined )
            return true;
        else
            return this._directEnumFlag;
    }
    set enumerable (v) {
        this._directEnumFlag = v;
    }


    addChangeListener(node) { this._changeListeners.add(node) }
    delChangeListener(node) { this._changeListeners.delete(node) }
    get changeListeners () { return this._changeListeners }
    get listenerNames() { return [...this._changeListeners].map( n => n.debugName ) }
    get listenerNamesStr() { return this.listenerNames.join(', ') }
    get speakingTo     () { return [...this._changeListeners]; }
    get speakingToStr  () { return this.speakingTo.map(  n => n.debugName ).join(', ') }
    fireNodeValueChanged () {
        for( let l of [...this._changeListeners] ) {
            l.nodeValueChanged(this);
        }
        for( let f of this._extListeners )
            f(this.value);
    }
    fireNodeValueSpoiled () {
        for( let l of [...this._changeListeners] ) {
            l.nodeValueSpoiled(this);
        }
    }
    
    computeIfNeeded () { }

    * iterTreeDF () {
        yield this;
    }
    
    /*
    nav(path) {
        if( path.length==0 )
            return this;

        if( path[0]===parent )
            if( this.isRoot )
                throw new Error('attempt to get parent of root node');
            else
                return this.parent.nav(path.slice(1));
        else if( path[0]===root )
            return this.root;
        else if( ! this.isRoot && this.parent.sliderKeyExists(path[0]) )
            return this.parent.getSliderNode(path[0]).nav( path.slice(1) );
        else
            throw new Error(`${this.fullName} is a leaf node`);
    }
    */
    nav(path, originNode, pathFromOrigin) 
    {
        path = toPath(path);
        
        if( originNode===undefined ) {
            originNode = this;
            pathFromOrigin = path;
        }
        
        if( path.length==0 )
            return this;

        if( path.first===parent )
            if( this.isRoot )
                //throw new Error('attempt to get parent of root node');
                throw new NavError({
                    nodeAtError: this,
                    msg: 'attempt to get parent of root node',
                    originNode, pathFromOrigin
                });
            else
                return this.parent
                    .nav( path.rest, originNode, pathFromOrigin );
        else if( path.first===root )
            return this.root.nav( path.rest, originNode, pathFromOrigin );
        else if( ! this.isRoot && this.parent.sliderKeyExists(path.first) )
            return this.parent
                .getSliderNode(path.first)
                .nav( path.rest, originNode, pathFromOrigin );
        else
            //throw new Error(`${this.fullName} is a leaf node`);
            throw new NavError({
                nodeAtError: this,
                msg: 'this is a leaf node',
                originNode, pathFromOrigin
            });
    }

    treeHasNode(n) {
        return n===this;
    }

    get ultimateSrc () {
        return this;
    }

    get [N] () { return this }

    addExtListener(f) {
        this._extListeners.push(f);
    }
    
    rmExtListeners() {
        this._extListeners = [];
    }
}
exports.LeafNode = LeafNode;
