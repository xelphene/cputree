
'use strict';

const {DEBUG} = require('../consts');
const {N, treeFillFunc, TBProxyHandler, bexist, isDTProxy} = require('../consts');
const {ObjNode} = require('../node/objnode');
const {TNode} = require('../node/tnode');
const {LeafNode} = require('../node/leaf');
const {GetKernel} = require('../kernel');
const tinsert = require('./tinsert');
const {MapFuncBuilder} = require('./map');
const {unwrap} = require('./util');
const {mapBi} = require('./map');

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
        
        // TODO
        // if( ! o.hasc(key) )
        //     return getPotentialNodeProxy(o, key);
        
        throw new Error(`${this.logPrefix}: unknown get op`);        
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
        
        // TODO: is treeFillFunc obsolete? I think so.

        if( o.hasc(key) && o.getc(key).settable ) {
            if( ! o.getc(key).canRelayInput )
                throw new Error(`(settable) = (leaf): LHS cannot relay input`);
            if( v instanceof LeafNode ) {
                o.getc(key).relayInput( v );
                return true;
            }
            if( typeof(v)=='function' ) {
                let an = new TNode( new GetKernel({
                    bindings: this.bindings,
                    getFunc: v
                }));
                o.getc(key).relayInput(an);
                return true;
            }
            throw new Error(`Assignment to settable: RHS is unknown.`);
        }
        
        if( typeof(v)=='function' && !v.hasOwnProperty(treeFillFunc) ) {
            if( o.hasc(key) && o.getc(key).kernel instanceof GetKernel )
                o.del(key);
            this.log(`new getter`);
            let tnode = new TNode( new GetKernel({
                bindings: this._bindings,
                getFunc: v
            }));
            o.addc(key, tnode);
            return true;
        }
        
        if( typeof(v)=='function' && v.hasOwnProperty(treeFillFunc) ) {
            this.log(`tree fill ${v.name}`);
            v(o, key, this.bindings);
            return true;
        }
        
        if( v instanceof MapFuncBuilder ) {
            this.log(`tree fill Builder ${v.name}`);
            v.fill(o, key, this.bindings);
            return true;
        }
        
        if( v instanceof ObjNode ) {
            v = unwrap(v);
            
            if( o.root.treeHasNode(v) ) {
                this.log(`map branch from within tree`);
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

