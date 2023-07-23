
'use strict';

const {
    C, N, O, conproxy_ObjNode, conproxy_ComputeNode
} = require('../consts');

function conProxyUnwrap (o) 
{
    if( typeof(o) != 'object' )
        return o;
    
    if( o.hasOwnProperty(N) )
        return o[N]
    else if( o[conproxy_ObjNode] )
        return o[conproxy_ObjNode];
    else if( o[conproxy_ComputeNode] )
        return o[conproxy_ComputeNode];
    else
        return o;
}
exports.conProxyUnwrap = conProxyUnwrap;
