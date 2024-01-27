
'use strict';

const {N} = require('../consts');
const {TBProxyHandler} = require('../consts');

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

