
'use strict';

const {
    C, N, conproxy_ObjNode, potnPathFromRoot, nget, nset,
} = require('../consts');
const pbExist = Symbol('pbExist');
const pgsExist = Symbol('pgsExist');
const pbParent = Symbol('pbParent');
const pbKeyInParent = Symbol('pbKeyInParent');
const pbIs = Symbol('pbIs');
const ObjNode = require('../node/index.js').ObjNode;

class PotentialNode
{
    constructor(parent, keyInParent) {
        if( ! parent instanceof PotentialNode && ! parent instanceof ObjNode )
            throw new Error('Invalid value for parent to PotentialNode.');
        if( ! ['symbol','string'].includes(typeof(keyInParent)) )
            throw new Error('Invalid type for keyInParent to PotentialNode.');
        this[pbParent] = parent;
        this[pbKeyInParent] = keyInParent;
    }

    get [potnPathFromRoot] () {
        if( this[pbParent] instanceof PotentialNode )
            return this[pbParent][potnPathFromRoot].append(this[pbKeyInParent]);
        else
            // must be an ObjNode
            return this[pbParent].pathFromRoot.append(this[pbKeyInParent]);
    }

    [pbExist] () {
        if( this[pbParent] instanceof PotentialNode )
            return this[pbParent][pbExist]()
                .addBranch(this[pbKeyInParent]);
        else
            // must be an ObjNode
            return this[pbParent].addBranch(this[pbKeyInParent]);
    }
    
    [pgsExist] () {
        if( this[pbParent] instanceof PotentialNode )
            return this[pbParent][pbExist]()
                .addc(
                    this[pbKeyInParent],
                    new this[pbParent].GetSetNodeClass({})
                );
        else
            // must be an ObjNode
            return this[pbParent].addc(
                this[pbKeyInParent],
                new this[pbParent].GetSetNodeClass({})
            );
    }
    
    [pbIs] () { return true }
}
exports.PotentialNode = PotentialNode;

const PotentialNodeProxyHandler = 
{
    set(o, key, v) {
        if( key===nget || key===nset ) {
            const cpuProxyHandler = require('./conproxy').cpuProxyHandler;
            var realGetSetNode = o[pgsExist]();
            return cpuProxyHandler.set(realGetSetNode, key, v);
        } else {
            // ANY set operation will trigger [pbExist]() and then 
            // get a new proxy over the real node
            // and repeat the set operation via that proxy
            const conProxyHandler = require('./conproxy').conProxyHandler;
            var realObjNode = o[pbExist]();
            return conProxyHandler.set(realObjNode, key, v);
        }
    },

    get (o,key)
    {
        if( [conproxy_ObjNode, C, N].includes(key) )
            throw new Error(`attempt to get special key ${key.toString()} on a PotentialNode ${o[potnPathFromRoot]} via Proxy`);
        
        if( [potnPathFromRoot, 'constructor'].includes(key) )
            return Reflect.get(o, key);
        
        return new Proxy(
            new PotentialNode(o, key),
            PotentialNodeProxyHandler
        );
    },
    
    has(o, key) { throw new Error('invalid proxy operation'); },
    ownKeys(o)  { throw new Error('invalid proxy operation'); },
    getOwnPropertyDescriptor (o, key) {
        if( [potnPathFromRoot, 'constructor'].includes(key) )
            return Reflect.getOwnPropertyDescriptor(o, key);
        throw new Error(`invalid proxy operation: ${key.toString()} on ${o[pbKeyInParent].toString()}`);
    },
    
    deleteProperty (o, key) { throw new Error('invalid proxy operation'); },
    defineProperty (o, key, descriptor) { throw new Error('invalid proxy operation'); },
}

function getPotentialNodeProxy (parent, key) {
    return new Proxy(
        new PotentialNode(parent, key),
        PotentialNodeProxyHandler
    );
}
exports.getPotentialNodeProxy = getPotentialNodeProxy;
