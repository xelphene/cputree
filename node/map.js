
'use strict';

const {BaseComputeNode} = require('./compute');
const {PRE_FINAL_LEAF_VALUE} = require('../consts');
const {MapComputeError} = require('../errors');

// FUTOPT: store a reference to mapFuncNode & srcNode upon finalization

class MapNode extends BaseComputeNode {
    constructor({parent}) {
        super({parent});
        
        this._mapFuncPath = undefined;
        this._srcPath = undefined;
        
        this._value = undefined;
        this._computeCount = 0;
        this._enumerable = true;
    }
    
    get nodeType () { return 'map' }
    get nodeAbbr () { return 'map' }

    get srcNodeStr () {
        if( this._srcPath !== undefined ) {
            if( this.isFinalized )
                return this.srcNode.fullName;
            else
                return this._srcPath.toString();
        } else
            return '(none)';
    }
    
    get mapFuncStr () {
        if( this._mapFuncPath !== undefined ) {
            if( this.isFinalized )
                return this.mapFuncNode.fullName;
            else
                return this._mapFuncPath.toString();
        } else
            return '(identity)';
    }
    
    get debugInfo () {
        let f = this._needsComputing ? 'stale' : 'fresh';
        return `value: ${this._value} (${f});  computeCount: ${this.computeCount};  srcNode: ${this.srcNodeStr}  mapFuncNode: ${this.mapFuncStr}`;
    }

    get enumerable () {
        return this._enumerable;
    }
    
    set enumerable (v) {
        this._enumerable = v;
    }
    
    get computeFunc () {
        if( this._mapFuncPath !== undefined ) {
            if( this.isFinalized )
                return this.nav(this._mapFuncPath).value;
            else
                throw new Error(`unable to get computeFunc pre-finalization when one is set`);
        } else
            return x => x;
    }
    
    get srcNode () {
        if( ! this.isFinalized )
            throw new Error(`unable to get srcNode before finalization`);
        if( this._srcPath===undefined )
            throw new Error(`no srcPath was ever set on MapNode at ${this.fullName}`);
        
        return this.nav(this._srcPath);
    }
    
    get hasSrcNode () {
        if( this._srcPath===undefined )
            return false;
        return this.hasNodeAtPath(this._srcPath);
    }

    get ultimateSrc () {
        if( ! this.isFinalized )
            throw new Error(`unable to get ultimateSrc before finalization`);
        return this.srcNode.ultimateSrc;
    }
        

    get mapFuncNode () {
        if( ! this.isFinalized )
            throw new Error(`unable to get mapFuncNode before finalization`);
        if( this._mapFuncPath===undefined )
            throw new Error(`no mapFuncPath was ever set on MapNode at ${this.fullName}`);

        return this.nav(this._mapFuncPath);
    }
    
    set srcPath(srcPath) {
        if( this.isFinalized )
            throw new Error(`unable to set srcPath on MapComputeNode after finalization`);
        this._srcPath = srcPath;
    }
    
    get srcPath() {
        return this._srcPath;
    }
    
    set mapFuncPath(mapFuncPath) {
        if( this.isFinalized )
            throw new Error(`unable to set mapFuncPath on MapComputeNode after finalization`);
        this._mapFuncPath = mapFuncPath;
    }
    
    setSrcByNode(srcNode) {
        this.srcPath = this.pathToNode(srcNode);
    }
    
    setMapFuncByNode(mapFuncNode) {
        this.mapFuncPath = this.pathToNode(mapFuncNode);
    }
    
    finalizeDefinition() {
        if( this.isFinalized )
            throw new Error(`finalizeDefinition() called twice`);
        if( this._srcPath===undefined )
            throw new Error(`srcPath on ${this.fullName} has not been set`);
        
        this._isFinalized = true;
        
        this.srcNode.addChangeListener(this);
        this._listeningTo.add(this.srcNode);
        
        if( this._mapFuncPath !== undefined ) {
            this.mapFuncNode.addChangeListener(this);
            this._listeningTo.add(this.mapFuncNode);
        }
        
    }

    recompute () {
        if( ! this.isFinalized )
            throw new Error(`cannot recompute before finalization`);

        //this._value = this.computeFunc( this.srcNode.value );
        
        try {
            this._value = this.computeFunc( this.srcNode.value );
        } catch (e) {
            //throw new Error(`Exception in map node at ${this.fullName} with source ${this.srcNodeStr}: ${e}`);
            if( ! (e instanceof MapComputeError) )
                throw new MapComputeError(this, e);
            else
                throw e;
        }
        
        
        this._needsComputing = false;
        this._computeCount++;
    }

    dependencyFound(node) {
        throw new Error(`should never happen on MapNode`);
    }

    copyNode() {
        let c = new this.constructor({});
        c.enumerable = this.enumerable;
        c.srcPath = this._srcPath;
        c.mapFuncPath = this._mapFuncPath;
        return c;
    }
}
exports.MapNode = MapNode;
