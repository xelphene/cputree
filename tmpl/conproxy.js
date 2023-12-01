
'use strict';

const {
    enumerable, bfunc, bexist, parent, root, bexpand,
    nget, nset,
    MAJORS, C, N, O,
    potnPathFromRoot,
} = require('../consts');
const {
    ObjNode, GetSetNode, InputNode, MapNode,
} = require('../node');
const { getMapOut, getMapOutBCF } = require('../mio');
const { getPotentialNodeProxy, PotentialNode } = require('./potn');
const { conProxyUnwrap } = require('./unwrap');
const { getAliasBranch } = require('../mio/alias');

//var plog = console.log;
var plog = function () {};

const cpuProxyHandler =
{
    get: (o,key) => {
        plog(`CPU GET on ${o.fullName} for ${key.toString()}`);
        if( key===N )
            return o;
        else
            return Reflect.get(o,key);
    },
    getOwnPropertyDescriptor: (o, key) => {
        plog(`CPU GETOPD on ${o.fullName} for ${key.toString()}`);
        if( key===N ) {
            return {
                configurable: true,
                enumerable: false,
                value: o
            };
        }
        else
            return Reflect.getOwnPropertyDescriptor(o,key);
    },
    set(o, key, v) {
        plog(`CPU SET ${o.fullName} ${key.toString()} = ${v.toString()}`);
        if( key===bfunc ) {
            //plog(`CPU SET ${o.fullName}  bfunc=${v}`);
            if( v )
                o.parent.computeToMap(o.key);
            return v;
        }
        else if( o instanceof o.parent.GetSetNodeClass && key===nget ) {
            if( typeof(v)!='function' )
                throw new Error(`function required for assignment to GetSetNode[nget], not ${typeof(o)}`);
            o.computeFunc = v;
            return true;
        }
        else if( o instanceof o.parent.GetSetNodeClass && key===nset ) {
            if( typeof(v)!='function' )
                throw new Error(`function required for assignment to GetSetNode[nset], not ${typeof(o)}`);
            o.setFunc = v;
            return true;
        }
        else if( key===enumerable ) {
            o.enumerable = v;
            return true;
        }
        else
            //return Reflect.set(o, key, v);
            return Reflect.set(o.computeFunc, key, v);
    },
};
exports.cpuProxyHandler = cpuProxyHandler;

const conProxyHandler = 
{
    has(o, key) {
        plog(`HAS on ${o.fullName} for ${key.toString()}`);
        if( key===N )
            return true;
        else
            return o.hasNodeWithKey(key) 
    },
    ownKeys(o)  {
        return o.getAllPropKeys()
            .concat(N);
    },

    get: (o,key) => {
        plog(`CON GET on ${o.fullName} for ${key.toString()}`);
        if( key=='hasOwnProperty' )
            return o.hasOwnProperty;
        else if( key===C )
            // should always be the exact Proxy object we were called through
            return o[C];
        else if( key===N )
            // return the ObjNode that this Proxy wraps
            return o;
        else if( key===O )
            // return the rawObject for the ObjNode that this Proxy wraps
            return o[O];
        else if( o.hasGetSetWithKey(key) )
            return new Proxy(o.getProp(key), cpuProxyHandler);
        else if( o.hasObjWithKey(key) )
            //return new Proxy(o.getProp(key), conProxyHandler);
            return o.getProp(key)[C];
        else if( o.hasInputWithKey(key) )
            return o.getProp(key);
        else {
            return getPotentialNodeProxy(o, key);
            //return;
            //return Reflect.get(o,key);
        }
    },
    
    getOwnPropertyDescriptor: (o, key) => {
        plog(`GETOPD on ${o.fullName} for ${key.toString()}`);
        if( key=='hasOwnProperty' )
            return {
                configurable: true,
                enumerable: false,
                value: Object.prototype.hasOwnProperty
            }
        else if( key===N ) {
            plog(`GET [N]`);
            return {
                configurable: true,
                enumerable: false,
                value: o
            };
        } else if( key===C ) {
            plog(`GET [C]`);
            return {
                configurable: true,
                enumerable: false,
                // should always be the exact Proxy object we were called through
                value: o[C]
            };
        } else if( o.hasGetSetWithKey(key) )
            return {
                configurable: true,
                enumerable: true,
                value: new Proxy(o.getProp(key), cpuProxyHandler)
            }
        else if( o.hasObjWithKey(key) )
            return {
                configurable: true,
                enumerable: true,
                //value: new Proxy(o.getProp(key), conProxyHandler)
                value: o.getProp(key)[C],
            }
        else if( o.hasInputWithKey(key) )
            return {
                configurable: true,
                enumerable: true,
                value: o.getProp(key)
            }
        else
            return;
            //return Reflect.getOwnPropertyDescriptor(o,key);
    },
    
    set: (o, key, v) => {
        plog(`SET on ${o.fullName} for ${key.toString()}`);
        if( key===enumerable ) {
            plog(' set enumerable flag');
            o.enumerable = v;
            return true;
        }
        else if( key===MAJORS ) {
            plog(' set ObjNode majors');
            o.majors = v;
            return true;
        }
        else if( v===bexist ) {
            plog(' add branch if there isnt one.');
            if( o.hasNodeWithKey(key) )
                if( o.getProp(key) instanceof ObjNode )
                    return true;
                else
                    throw new Error(`a node exists at ${o.getProp(key).fullName}, but it is a ${o.getProp(key).nodeType} rather than a ${o.nodeType}.`);
            else
                o.add(key, new o.constructor({}));
            return true;
        } else if( typeof(v)=='function' && v.hasOwnProperty(bfunc) ) {
            plog('  new map branch');
            o.add(key, getMapOutBCF(v));
            return true;
        } else if( typeof(v)=='function' && v.hasOwnProperty(bexpand) && v[bexpand]==true ) {
            plog('  new branch via branch expansion function');
            o.add(key, v);
            return true;
        } else if( typeof(v)=='function' && ! v.hasOwnProperty(bfunc) && ! v.hasOwnProperty(bexpand) ) {
            if( o.hasInputWithKey(key) ) {
                plog('  convert input to PostValCompute');
                let pv = o.getProp(key).validate;
                o.del(key);
                o.add(key, new o.PostValidateComputeClass({
                    computeFunc: v,
                    postValidate: pv
                }));
            } else {
                if( o.hasGetSetWithKey(key) )
                    o.del(key);
                plog('  new compute node');
                o.addGetSet(key, v);
            }
            return true;
        } else if( !(v instanceof PotentialNode) && typeof(v)=='object' && Object.keys(v).length==0 ) {
            // TODO: delete this mode. its just <ObjNode> = {};. kind of vague and error prone.
            plog('  new ObjNode');
            o.add(key, new o.constructor({}));
            return true;
        }
        else if( v instanceof ObjNode ) {
            // potentially unwrap a conproxy
            v = conProxyUnwrap(v);
            
            if( o.root.treeHasNode(v) ) {
                plog(`  make ${o.fullName}.${key} a map from ${v.fullName}`);
                o.add(key, getMapOut(v));
                return true;
            } else {
                plog('  add existing ObjNode from separate tree');
                o.add(key, v);
            }
            return true;
        }
        else if( v instanceof InputNode || v instanceof GetSetNode || v instanceof MapNode || v instanceof GetSetNode ) {
            v = conProxyUnwrap(v);
            if( v.isRoot ) {
                // adding a newly built InputNode
                // simple overwrite
                if( o.hasNodeWithKey(key) )
                    o.del(key);
                o.add(key, v);
                return true;
            } else if( o.root.treeHasNode(v) ) {
                // make this an alias to the 'v' input node
                if( o.hasInputWithKey(key) ) {
                    o.getProp(key).linkToNode(v);
                } else {
                    // something else. simple overwrite.
                    if( o.hasNodeWithKey(key) )
                        o.del(key);
                    let n = o.add(key, new o.MapNodeClass({}));
                    n.srcPath = o.pathToNode(v).prepend(parent);
                }
                return true;
            } else {
                throw new Error(`conProxy assignment of an InputNode or GetSetNode which is neither an orphan nor in the conProxy's tree`);
            }
        }
        else if( Array.isArray(v) ) {
            o.add(key, getAliasBranch(v));
            return true;
        }
        else if( o.hasInputWithKey(key) && v instanceof PotentialNode ) {
            o.root.addp( v[potnPathFromRoot], o.getc(key).copyNode() );
            o.getc(key).linkToPath( v[potnPathFromRoot].prepend(root) );
            //throw new Error('yup');
            return true;
        } else if( ! o.hasc(key) && v instanceof PotentialNode ) {
            // neither LHS nor RHS actually exists.
            // no-op.
            return true;
        } else {
            throw new TypeError('unknown set operation');
        }
    },

    deleteProperty: (o, key) => { throw new Error('invalid proxy operation'); },
    defineProperty: (o, key, descriptor) => { throw new Error('invalid proxy operation'); },
};
exports.conProxyHandler = conProxyHandler;

exports.conProxyUnwrap = conProxyUnwrap;
