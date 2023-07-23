
'use strict';

const {
    C, N, O,
} = require('../consts');

function conProxyUnwrap (o) 
{
    if( typeof(o) != 'object' )
        return o;
    
    if( o.hasOwnProperty(N) )
        return o[N]
    else
        return o;
}
exports.conProxyUnwrap = conProxyUnwrap;
