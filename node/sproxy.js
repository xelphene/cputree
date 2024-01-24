
'use strict';

const {
    DEBUG, CTL, getn, getp, N,
    isDTProxy, dtProxyWrappedObject,
    root, parent, endProxy,
    PRE_FINAL_LEAF_VALUE, bmap
} = require('../consts');

const Node = require('./node').Node;
const ANode = require('./anode').ANode;
const VNode = require('../vnode/vnode').VNode;

class MapDef {
    constructor(node, mapFunc) {
        this.node = node;
        this.mapFunc = mapFunc;
    }
}
exports.MapDef = MapDef;


exports.getDTProxyHandler = function({overNode, rcvr, purpose}) 
{
    if( overNode[isDTProxy]===true )
        throw new Error(`Trying to get a compute proxy over a compute proxy`);

    if( ! ['branch','compute','setter'].includes(purpose) )
        throw new Error(`invalid value ${purpose} for purpose arg`);
    
    if( purpose=='setter' )
    {
        if( rcvr===undefined )
            rcvr = {
                dependencyFound: () => {}
            };
    } else {
        if( ! (rcvr instanceof Node) && ! (rcvr instanceof ANode) && !(rcvr instanceof VNode) )
            throw new Error(`Node, ANode or VNode instance required for rcvr, not ${rcvr}`);
    }
    
    if( DEBUG )
        var log = function(m) {
            console.log(`${overNode.fullName}/DTProxy: ${m}`);
        }
    else
        var log = function(m) {};
    
    let proxyOpen = true;
    
    return {
    get: (_, key) => {
        log(`get ${overNode.fullName} . ${key.toString()} ${overNode.isTreeFinalized ? 'finalized' : 'fluid'}`);
        
        // removed for mapinout, which has CNs that return funcs that are
        // closures over a DTProxied 'this'
        // this should be OK. ref to proxy will only be held in the ComputeNode
        //if( ! proxyOpen )
        //    throw new Error(`use of derelict proxy`);
        
        if( key===isDTProxy ) {
            return true;
        }
        else if( key===bmap ) {
            if( purpose=='branch' )
                return (mapFunc) => new MapDef(overNode,mapFunc);
            else
                throw new Error(`attempt to get bmap key via a proxy for ${purpose}`);
        }
        else if( key===Symbol.for('nodejs.util.inspect.custom') ) {
            // when doing something like console.log(this) within a compute
            // func, this never gets called.  instead,
            // overNode[Symbol.for('nodejs.util.inspect.custom')] gets
            // called directly.  I have no idea why.  This operation is
            // handled as a special case there.
            return `DT Proxy over ${overNode.fullName}`;
        }
        else if( key===Symbol.toStringTag ) {
            return overNode.name;
        }
        else if( key===dtProxyWrappedObject ) {
            return overNode;
        }
        else  if( key===root ) {
            return overNode.root.getDTProxyOverMe({rcvr,purpose});
        }
        else if( key===parent ) {
            if( overNode.isRoot )
                throw new Error(`attempting to get parent on root node.`);
            return overNode.parent.getDTProxyOverMe({rcvr,purpose});
        }
        else if( key===CTL ) {
            return overNode;
        }
        else if( key===N ) {
            return overNode;
        }
        /*
        else if( overNode.portalEndpointsRegistry.haveEndpoint(key) ) {
            return overNode.portalEndpointsRegistry.getEndpointNode(key)
                .getDTProxyOverMe({rcvr,purpose});
        }
        */
        else if( key===getn ) {
            return function (n) {
                //if( ! overNode.treeHasNode(n) ) {
                if( ! overNode.root.treeHasNode(n) ) {
                    throw new Error('[getn]() was called for a node not in this tree');
                }
                if( n.isBranch )
                    return n.getDTProxyOverMe({rcvr,purpose});
                else {
                    rcvr.dependencyFound(n);
                    if( overNode.isTreeFinalized )
                        return n.value;
                    else
                        return PRE_FINAL_LEAF_VALUE;
                }
            }
        }
        else if( key===getp ) {
            return function (path) {
                let n = overNode.nav(path);
                if( n.isBranch )
                    return n.getDTProxyOverMe({rcvr, purpose});
                else {
                    rcvr.dependencyFound(n);
                    if( overNode.isTreeFinalized )
                        return n.value;
                    else
                        return PRE_FINAL_LEAF_VALUE;
                }
            }
        }
        else if( key===endProxy ) {
            return () => {
                log('ending proxy');
                proxyOpen = false;
            };
        }
        else if( overNode.hasBranchWithKey(key) )  {
            return overNode.getProp(key).getDTProxyOverMe({rcvr,purpose});
        }
        else if( overNode.hasLeafWithKey(key) ) {
            log(`get leaf ${overNode.fullName}.${key.toString()}`);
            rcvr.dependencyFound(overNode.getProp(key));
            if( overNode.isTreeFinalized ) {
                return overNode.getProp(key).value;
            }
            else
                return PRE_FINAL_LEAF_VALUE;
        }
        else if( overNode.sliderKeyExists(key) ) {
            return overNode.getSliderNode(key).getDTProxyOverMe({rcvr,purpose});
        }
        else {
            log(`get returning default undefined`);
            // Reflect.get() will return undefined if no such prop is on the proxied object
            return;
        }
    },
    has(overNode, key) {
        log(`has ${key.toString()}`);
        return overNode.hasNodeWithKey(key);
    },
    ownKeys(overNode) {
        log(`ownKeys`);
        return overNode.getAllPropKeys();
    },
    getOwnPropertyDescriptor(_, key) { 
        log(`getOwnPropertyDescriptor ${overNode.fullName} . ${key.toString()} ${overNode.isTreeFinalized}`);
        if( ! overNode.hasNodeWithKey(key) )
            return;
        return {
            //value: overNode.isTreeFinalized ? overNode.getProp(key).value : PRE_FINAL_LEAF_VALUE,
            //value: exports.getDTProxyHandler.get({overNode, key, }),
            value: overNode.getProp(key).getDTProxyOverMe({rcvr,purpose}),
            writable: false,
            enumerable: overNode.getProp(key).enumerable,
            configurable: true
        }
    },

    set(overNode, key, value) {
        log(`set ${key} = ${value}`);
        //if( ! overNode.hasc(key) )
        //    throw new Error(`Node ${overNode.fullName} has no child named ${key}`);
        //if( ! overNode.hasInputWithKey(key) )
        //    throw new Error(`Node ${overNode.getc(key).fullName} is not an InputNode`);
        //overNode.getc(key).value = value;
        
        if( overNode.hasc(key) ) {
            if( overNode.getc(key).settable )
                overNode.getc(key).value = value;
            else
                throw new Error(`Node ${overNode.getc(key).fullName} is not settable`);
        } else
            throw new Error(`Node ${overNode.fullName} has no child named ${key}`);
        
        return true; // need to return trueish for Proxy set or exception
        
        //return overNode.getc(key).value = value;
        //throw new Error('invalid proxy operation'); 
    },
    deleteProperty(_, key) { throw new Error('invalid proxy operation'); },
    defineProperty(_, key, descriptor) { throw new Error('invalid proxy operation'); },
    };
};

