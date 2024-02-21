
'use strict';

const {
    C, N, potnPathFromRoot, nget, nset,
} = require('../consts');
const pbExist = Symbol('pbExist');
const pgsExist = Symbol('pgsExist');
const pbParent = Symbol('pbParent');
const pbBuildProxy = Symbol('bpBuildProxy');
const pbKeyInParent = Symbol('pbKeyInParent');
const pbIs = Symbol('pbIs');
const ObjNode = require('../node/objnode.js').ObjNode;

class PotentialNode
{
    constructor(parent, keyInParent, buildProxy) {
        if( ! parent instanceof PotentialNode && ! parent instanceof ObjNode )
            throw new Error('Invalid value for parent to PotentialNode.');
        if( ! ['symbol','string'].includes(typeof(keyInParent)) )
            throw new Error('Invalid type for keyInParent to PotentialNode.');
        if( ! (buildProxy instanceof require('./buildproxy').BuildProxy) )
            throw new Error('BuildProxy instance required for buildProxy arg');
        this[pbParent] = parent;
        this[pbKeyInParent] = keyInParent;
        this[pbBuildProxy] = buildProxy;
    }

    get [potnPathFromRoot] () {
        if( this[pbParent] instanceof PotentialNode )
            return this[pbParent][potnPathFromRoot].append(this[pbKeyInParent]);
        else
            // must be an ObjNode
            return this[pbParent].pathFromRoot.append(this[pbKeyInParent]);
    }

    // turn this PotentialNode into a real ObjNode
    [pbExist] () {
        if( this[pbParent] instanceof PotentialNode )
            return this[pbParent][pbExist]()
                .addBranch(this[pbKeyInParent]);
        else
            // parent must be a real ObjNode instance, not another PotentialNode
            return this[pbParent].addBranch(this[pbKeyInParent]);
    }
    
    // turn this PotentialNode into a real TGetSetNode
    // with dummy get/set funcs in it
    [pgsExist] () {
        if( this[pbParent] instanceof PotentialNode )
            var p = this[pbParent][pbExist]();
        else
            var p = this[pbParent];

        p.addc(
            this[pbKeyInParent],
            new p.TGetSetNodeClass({
                bindings: this[pbBuildProxy].bindings,
                getFunc:  () => { throw new Error(`a TGetSetNode was created at ${p.fullName}.${this[pbKeyInParent].toString()}, but it's getFunc was not assigned.`) },
                setFunc:  () => { throw new Error(`a TGetSetNode was created at ${p.fullName}.${this[pbKeyInParent].toString()}, but it's setFunc was not assigned.`) },
            })
        )
        
        return p.getc( this[pbKeyInParent] );
    }
    
    [pbIs] () { return true }
}
exports.PotentialNode = PotentialNode;

const PotentialNodeProxyHandler = 
{
    set(o, key, v) {
        if( key===nget ) {
            var realTGetSetNode = o[pgsExist]();
            realTGetSetNode.getFunc = v;
            return true;
        } else if( key===nset ) {
            //const cpuProxyHandler = require('./conproxy').cpuProxyHandler;
            //var realGetSetNode = o[pgsExist]();
            //return cpuProxyHandler.set(realGetSetNode, key, v);
            var realTGetSetNode = o[pgsExist]();
            realTGetSetNode.setFunc = v;
            return true;
        } else {
            // ANY set operation will trigger [pbExist]() and then 
            // get a new proxy over the real node
            // and repeat the set operation via that proxy
            
            //const conProxyHandler = require('./conproxy').conProxyHandler;
            //var realObjNode = o[pbExist]();
            //return conProxyHandler.set(realObjNode, key, v);
            
            var realObjNode = o[pbExist]();
            return o[pbBuildProxy].set(realObjNode, key, v);
        }
    },

    get (o,key)
    {
        if( [C, N].includes(key) )
            throw new Error(`attempt to get special key ${key.toString()} on a PotentialNode ${o[potnPathFromRoot]} via Proxy`);
        
        if( key==='hasOwnProperty' )
            return k => o.hasOwnProperty(k);
        
        if( [potnPathFromRoot, 'constructor'].includes(key) )
            return Reflect.get(o, key);
        
        return new Proxy(
            new PotentialNode(o, key, o[pbBuildProxy]),
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

function getPotentialNodeProxy (parent, key, buildProxy) {
    return new Proxy(
        new PotentialNode(parent, key, buildProxy),
        PotentialNodeProxyHandler
    );
}
exports.getPotentialNodeProxy = getPotentialNodeProxy;
