
'use strict';

const {parent, root, N} = require('../consts');
const Node = require('./node').Node;
const toPath = require('../path').toPath;
const NavError = require('../errors').NavError;
const {LeafHandle} = require('./handle');

class LeafNode extends Node {
    constructor({parent}) {
        super({parent});
        this._changeListeners = new Set();
        this._isFinalized = false;
        this._directEnumFlag = undefined;
        this._extListeners = [];
        this._listeningTo = new Set();
        this._listeningToHandles = new Set();
        this._handle = new LeafHandle(this);
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
    get listenerNames() {
        return [...this._changeListeners]
            .map( n => n.debugName )
    }
    get listenerNamesStr() { return this.listenerNames.join(', ') }
    get speakingTo     () { return [...this._changeListeners]; }
    get speakingToStr  () { return this.speakingTo.map(  n => n.debugName ).join(', ') }

    _listenTo(otherNode) {
        this._listeningTo.add(otherNode);
        otherNode.addChangeListener(this);
    }
    _unlistenTo(otherNode) {
        otherNode.delChangeListener(this);
        this._listeningTo.delete(otherNode);
    }
    _unlistenAll() {
        for( let n of this._listeningTo )
            n.delChangeListener(this);
    }

    _listenToHandle(handle) {	
        if( ! (handle instanceof LeafHandle) )
            throw new Error('LeafHandle instance required');
        this._listeningToHandles.add(handle);
        handle.addChangeListener(this);
    }
    _unlistenToHandle(handle) {
        if( ! (handle instanceof LeafHandle) )
            throw new Error('LeafHandle instance required');
        handle.delChangeListener(this);
        this._listeningToHandles.delete(handle);
    }
    _unlistenAllHandles() {
        for( let n of this._listeningToHandles )
            n.delChangeListener(this);
    }

    get hearingFrom    () { return [...this._listeningTo]; }
    get hearingFromStr () { return this.hearingFrom.map( n => n.debugName ).join(', ') }
    isListeningTo (n) {
        for( let n2 of this._listeningTo )
            if( n===n2 )
                return true;
        return false;
    }
    get listeningToStr () {
        return [...this._listeningTo].map(n => n.debugName).join(', ')
    }
    
    handleValueChanged (h) {}
    handleValueSpoiled (h) {}
    
    fireNodeValueChanged () {
        for( let l of [...this._changeListeners] ) {
            l.nodeValueChanged(this);
        }
        
        for( let h of this.handles )
            for( let l of h.changeListeners )
                l.handleValueChanged(h);
                
        for( let f of this._extListeners )
            f(this.value);
    }
    fireNodeValueSpoiled () {
        for( let l of [...this._changeListeners] ) {
            l.nodeValueSpoiled(this);
        }
        for( let h of this.handles )
            for( let l of h.changeListeners )
                l.handleValueSpoiled(h);
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
