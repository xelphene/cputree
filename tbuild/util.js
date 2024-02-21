
'use strict';

const {N} = require('../consts');
const {TBProxyHandler} = require('../consts');
const {ObjNode} = require('../node/objnode');

function unwrap (o) 
{
    if( typeof(o) != 'object' )
        return o;
    
    if( o.hasOwnProperty(N) )
        return o[N]
    else
        return o;
}
exports.unwrap = unwrap;

function isTBProxy(o) {
    return o.hasOwnProperty(TBProxyHandler);
}
exports.isTBProxy = isTBProxy;

function getTBProxyHandler(o) {
    if( o.hasOwnProperty(TBProxyHandler) )
        return o[TBProxyHandler];
    else
        throw new Error(`Not a tree build proxy`);
}
exports.getTBProxyHandler = getTBProxyHandler;

function merge (base, inc, opts) {
    base = unwrap(base);
    inc = unwrap(inc);
    if( ! (base instanceof ObjNode) )
        throw new Error(`ObjNode instance required for base argument`);
    base.merge(inc, opts);
}
exports.merge = merge;
