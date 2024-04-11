
'use strict';

const {DEBUG, potnPathFromRoot} = require('../consts');
const {N, TBProxyHandler, bexist, isDTProxy} = require('../consts');
const {
    TInputNode, TGetNode, LeafNode, ObjNode, TRelayInputNode
} = require('../node');
const tinsert = require('./tinsert');
const {MapFuncBuilder} = require('./map');
const {unwrap} = require('./util');
const {mapSym} = require('./map');
const {TreeFiller} = require('./fill');
const { getPotentialNodeProxy, PotentialNode, pbExist } = require('./potn');
const {RHSWrapper, LHSWrapper} = require('./hswrapper');

function makeHasOwnProperty(o) {
    return prop => (
        prop===N ||
        prop===TBProxyHandler ||
        o.hasc(prop)
    )
}

class BuildProxy
{
    constructor( bindings ) {
        this._bindings = bindings;
        this.logPrefix = `BP`;
    }
    
    get bindings () { return this._bindings }

    log(msg) {
        if( DEBUG )
            console.log(`${this.logPrefix}: ${msg}`);
    }
    
    has(o, key) {
        if( key===N )
            return true;
        else if( key===TBProxyHandler )
            return true;
        else
            return o.hasNodeWithKey(key);
    }
    
    ownKeys(o) {
        return o.getAllPropKeys().concat(
            [N, TBProxyHandler]
        );
    }

    deleteProperty (o, key) { throw new Error('invalid proxy operation') }
    defineProperty (o, key, descriptor) { throw new Error('invalid proxy operation') }
    
    get (o, key) {
        this.logPrefix = `BP ${o.fullName} GET ${key.toString()}`;
        
        if( key===N )
            return o;
        
        if( key===TBProxyHandler )
            return this;
        
        if( key=='hasOwnProperty')
            return makeHasOwnProperty(o);
        
        if( o.hasObjWithKey(key) )
            return new Proxy( o.getc(key), this );
        
        if( o.hasLeafWithKey(key) )
            return o.getc(key);
        
        return getPotentialNodeProxy(o, key, this);
    }
    
    getOwnPropertyDescriptor (o, key) {
        this.logPrefix = `BP ${o.fullName} GETOPD ${key.toString()}`;
        
        // if the property 'key' is non-existent or configurable on the
        // underlying object 'o', it must be configurable here.

        if( key===N )
            return {
                configurable: true,
                enumerable: false,
                value: o
            }
        
        if( key===TBProxyHandler )
            return {
                configurable: true,
                enumerable: false,
                value: this
            }
        
        if( key=='hasOwnProperty' )
            return {
                configurable: true,
                enumerable: false,
                value: this.get(o, key),
            }
        
        if( o.hasObjWithKey(key) )
            return {
                configurable: true,
                enumerable: true,
                value: this.get(o, key),
            }
        
        if( o.hasLeafWithKey(key) )
            return {
                configurable: true,
                enumerable: true,
                value: this.get(o, key)
            }
        
        throw new Error(`${this.logPrefix}: unknown getOwnPropertyDescriptor op`);
    }
    
    set (o, key, v) {
        this.logPrefix = `BP ${o.fullName} SET ${key.toString()}`;
        
        const lhs = new LHSWrapper(o, key);
        const rhs = new RHSWrapper(o, key, unwrap(v));

        this.log(`LHS: ${lhs.summary}`);
        this.log(`RHS: ${rhs.summary}`);
        
        // >>> assignToSettable
        if( lhs.isInput && rhs.isLeaf && rhs.isNodeInOurTree ) {
            o.getc(key).replaceWithRelay( rhs.value );
            return true;
        }
        
        if( lhs.isInput && rhs.isFunction ) {
            let an = new TGetNode({
                bindings: this.bindings,
                getFunc: rhs.value
            });
            //o.getc(key).relayInput(an);
            o.getc(key).replaceWithRelay( an );
            return true;
        }
        
        // LHS = settable. RHS = PotentialNode
        // create a similar node (i.e. an Input) at RHS
        // make LHS relay *from* it
        if( lhs.isInput && rhs.isPotential ) {
            let rhsNode = o.root.addp(
                rhs.value[potnPathFromRoot],
                o.getc(key).copyNode()
            );
            o.getc(key).replaceWithRelay( rhsNode );
            return true;
        }
        
        if( lhs.isLeaf && rhs.isTreeFiller ) {
            if( ! rhs.value.willFillLeaf )
                throw new Error(`[LeafNode] = [non-Leaf-producing TreeFiller]: LHS and RHS must be a LeafNodes`);
            let oldNode = o.delc(key);
            rhs.value.fill(o, key, this.bindings);
            o.getc(key).absorbHandles(oldNode);
            oldNode.safeDestroy();
            return true;
        }
        
        if( lhs.isBranch && rhs.isTreeFiller ) {
            // LHS is branch. just delete and replace.
            o.delc(key);
            rhs.value.fill(o, key, this.bindings);
            return true;
        }
        
        if( ! lhs.exists && rhs.isTreeFiller ) {
            // LHS does not exist
            rhs.value.fill(o, key, this.bindings);
            return true;
        }
        
        if( ! lhs.exists && rhs.isPrimitiveIsh ) {
            o.addc(key, new TGetNode({
                bindings: [],
                getFunc:  () => rhs.value
            }))
            return true;
        }

        // <<< assignToSettable
        
        
        if( ! lhs.exists && rhs.value instanceof PotentialNode )
            // neither LHS nor RHS exist. no-op.
            return true
        
        if( ! lhs.isSettableNode && rhs.value instanceof PotentialNode ) {
            throw new Error(`Cannot assign [non-settable existing node] = [potential node]`);
        }
        
        if( lhs.isLeaf && typeof(rhs.value)=='function' ) {
            let tgetnode = new TGetNode({
                bindings: this._bindings,
                getFunc: rhs.value
            });
            tgetnode.absorbHandles(o.getc(key));
            o.getc(key).safeDestroy();
            o.addc(key, tgetnode);
            return true;
        }
        
        if( ! lhs.exists && typeof(rhs.value)=='function' ) {
            this.log(`new getter`);
            let tgetnode = new TGetNode({
                bindings: this._bindings,
                getFunc: rhs.value
            });
            o.addc(key, tgetnode);
            return true;
        }

        if( lhs.isBranch && rhs.isLeaf )
            throw new Error(`Invalid assignment: [existing branch] = [new leaf]`);
        
        if( lhs.isLeaf && rhs.isLeaf && ! rhs.isNodeInOurTree ) {
            let oldNode = o.delc(key);
            o.add(key, rhs.value);
            o.getc(key).absorbHandles(oldNode);
            oldNode.safeDestroy();
            return true;
        }
        
        if( lhs.isLeaf && rhs.isLeaf && rhs.isNodeInOurTree ) {
            let oldNode = o.delc(key);
            mapSym(rhs.value, x => x).fill(o, key, []);
            o.getc(key).absorbHandles(oldNode);
            oldNode.safeDestroy();
            return true;
        }

        if( ! lhs.exists && rhs.isLeaf && rhs.isNodeInOurTree ) {
            mapSym(rhs.value, x => x).fill(o, key, []);
            return true;
        }
        
        if( ! lhs.exists && rhs.isLeaf && ! rhs.isNodeInOurTree ) {
            o.add(key, rhs.value);
            return true;
        }

        if( lhs.isBranch && rhs.isBranch && rhs.isNodeInOurTree ) {
            o.del(key);
            mapSym(rhs.value, x => x).fill(o, key, []);
            return true;
        }

        if( lhs.isBranch && rhs.isBranch && ! rhs.isNodeInOurTree ) {
            o.del(key);
            o.add(key, rhs.value);
            return true;
        }
        
        if( ! lhs.exists && rhs.isBranch && rhs.isNodeInOurTree ) {
            mapSym(rhs.value, x => x).fill(o, key, []);
            return true;
        }
        
        if( ! lhs.exists && rhs.isBranch && ! rhs.isNodeInOurTree ) {
            o.add(key, rhs.value);
            return true;
        }

        // assignment of symbol bexist

        if( lhs.isBranch && rhs.isBexist )
            return true; // no-op
        
        if( lhs.isLeaf && rhs.isBexist )
            throw new Error(`A non-branch node already exists at ${o.getProp(key).fullName}`);
        
        if( ! lhs.exists && rhs.isBexist ) {
            o.add(key, new o.constructor({}));
            return true;
        }
        
        throw new Error(`${this.logPrefix}: unknown set op`);
    }
}
exports.BuildProxy = BuildProxy;

function tbuild (root, opts)
{
    if( opts===undefined )
        opts = {};
    else if( Array.isArray(opts) )
        opts = {bind: opts};

    if( opts.ObjNodeClass===undefined )
        opts.ObjNodeClass = ObjNode;

    if( root===undefined || root===null )
        root = new opts.ObjNodeClass({});
    else if( root instanceof PotentialNode )
        root = root[pbExist]();
    else
        root = unwrap(root);

    if( opts.bind===undefined )
        opts.bind = [root];
    else {
        opts.bind = opts.bind.map(unwrap);
        for( let i=0; i<opts.bind.length; i++ )
            if( opts.bind[i] instanceof PotentialNode )
                opts.bind[i] = opts.bind[i][pbExist]();
    }
    
    const bp = new BuildProxy(opts.bind);
    
    return new Proxy(root, bp);
}
exports.tbuild = tbuild;

