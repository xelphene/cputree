
'use strict';

const {N, treeFillFunc, TBProxyHandler, bexist} = require('../consts');
const {ObjNode} = require('../node/objnode');
const {TNode} = require('../node/tnode');
const {GetKernel} = require('../kernel');
const tinsert = require('./tinsert');
const {MapFuncBuilder} = require('./map');

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
    }
    
    get bindings () { return this._bindings }
    
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
        const logPrefix = `BP ${o.fullName} GET ${key.toString()}`;
        const log = msg => console.log(`${logPrefix}: ${msg}`);
        
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
        
        throw new Error(`${logPrefix}: unknown get op`);        
    }
    
    getOwnPropertyDescriptor (o, key) {
        const logPrefix = `BP ${o.fullName} GETOPD ${key.toString()}`;
        const log = msg => console.log(`${logPrefix}: ${msg}`);
        
        if( key===N )
            return {
                configurable: false,
                enumerable: false,
                value: o
            }
        
        if( key===TBProxyHandler )
            return {
                configurable: false,
                enumerable: false,
                value: this
            }
        
        if( key=='hasOwnProperty' )
            return {
                configurable: false,
                enumerable: false,
                value: this.get(o, key),
            }
        
        if( o.hasObjWithKey(key) )
            return {
                configurable: false,
                enumerable: true,
                value: this.get(o, key),
            }
        
        if( o.hasLeafWithKey(key) )
            return {
                configurable: false,
                enumerable: true,
                value: this.get(o, key)
            }
        
        throw new Error(`${logPrefix}: unknown getOwnPropertyDescriptor op`);
    }
    
    set (o, key, v) {
        const logPrefix = `BP ${o.fullName} SET ${key.toString()}`;
        const log = msg => console.log(`${logPrefix}: ${msg}`);
        
        if( typeof(v)=='function' && !v.hasOwnProperty(treeFillFunc) ) {
            if( o.hasGetSetWithKey(key) || o.hasInputWithKey(key) )
                o.del(key);
            log(`new getter`);
            let tnode = new TNode( new GetKernel({
                bindings: this._bindings,
                getFunc: v
            }));
            o.addc(key, tnode);
            return true;
        }
        
        if( typeof(v)=='function' && v.hasOwnProperty(treeFillFunc) ) {
            log(`tree fill ${v.name}`);
            v(o, key, this.bindings);
            return true;
        }
        
        if( v instanceof MapFuncBuilder ) {
            log(`tree fill Builder ${v.name}`);
            v.fill(o, key, this.bindings);
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
        
        throw new Error(`${logPrefix}: unknown set op`);
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

