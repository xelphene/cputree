
'use strict';

const {DEBUG, potnPathFromRoot} = require('../consts');
const {N, TBProxyHandler, bexist, isDTProxy} = require('../consts');
const {
    TInputNode, TGetNode, LeafNode, ObjNode, TRelayInputNode
} = require('../node');
const tinsert = require('./tinsert');
const {MapFuncBuilder} = require('./map');
const {unwrap} = require('./util');
const {mapBi} = require('./map');
const {TreeFiller} = require('./fill');
const { getPotentialNodeProxy, PotentialNode } = require('./potn');

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
        
        // if LHS is a settable, treat specially. don't overwrite.
        if( o.hasc(key) && o.getc(key).settable )
            return this.assignToSettable(o, key, v);
        
        if( v instanceof PotentialNode ) {
            if( ! o.hasc(key) )
                // neither LHS nor RHS exist. no-op.
                return true
            else
                throw new Error(`Cannot assign [non-settable existing node] = [potential node]`);
        }
        
        if( typeof(v)=='function' ) {
            if( o.hasc(key) )
                o.del(key);
            this.log(`new getter`);
            let tgetnode = new TGetNode({
                bindings: this._bindings,
                getFunc: v
            });
            o.addc(key, tgetnode);
            return true;
        }
        
        if( v instanceof TreeFiller ) {
            if( o.hasc(key) )
                o.del(key);
            this.log(`tree fill ${v.name}`);
            v.fill(o, key, this.bindings);
            return true;
        }
        
        if( v instanceof ObjNode || v instanceof LeafNode ) {
            if( o.hasc(key) )
                o.del(key);

            v = unwrap(v);
            
            if( o.root.treeHasNode(v) ) {
                this.log(`map from within tree`);
                mapBi(v, x => x).fill(o, key, []);
            } else {
                this.log(`graft separate tree`);
                o.add(key, v);
            }
            
            return true;
        }
        
        if( v===bexist ) {
            if( o.hasNodeWithKey(key) ) {
                if( o.getProp(key) instanceof ObjNode )
                    return true
                else 
                    throw new Error(`A non-branch node already exists at ${o.getProp(key).fullName}`);
            } else {
                o.add(key, new o.constructor({}));
                return true;
            }
        }
        
        throw new Error(`${this.logPrefix}: unknown set op`);
    }
    
    assignToSettable(o, key, v)
    {
        //if( ! o.getc(key).canRelayInput )
        //    throw new Error(`[non-relay-capable settable] = [leaf]: LHS is settable but cannot relay`);
        if( ! (o.getc(key) instanceof TInputNode) )
             throw new Error(`[non-TInputNode] = [leaf]: LHS is settable but is not an Input that can be converted to relay`);
        
        if( v instanceof LeafNode ) {
            //o.getc(key).relayInput( v );
            o.getc(key).replaceWithRelay( v );
            return true;
        }
        
        if( typeof(v)=='function' ) {
            let an = new TGetNode({
                bindings: this.bindings,
                getFunc: v
            });
            //o.getc(key).relayInput(an);
            o.getc(key).replaceWithRelay( an );
            return true;
        }
        
        // LHS = settable. RHS = PotentialNode
        // create a similar node (i.e. an Input) at RHS
        // make LHS relay *from* it        
        if( v instanceof PotentialNode ) {
            let rhsNode = o.root.addp( v[potnPathFromRoot], o.getc(key).copyNode() );
            //o.getc(key).relayInput( rhsNode );
            o.getc(key).replaceWithRelay( rhsNode );
            return true;
        }
        
        throw new Error(`[settable] = [?]: RHS is unknown.`);
    }
    
}
exports.BuildProxy = BuildProxy;

function tbuild (root, opts)
{
    if( root===undefined || root===null )
        root = new ObjNode({});
    
    if( opts===undefined )
        opts = {};

    if( opts.bind===undefined )
        opts.bind = [root];
    
    const bp = new BuildProxy(opts.bind);
    
    return new Proxy(root, bp);
}
exports.tbuild = tbuild;

