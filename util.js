
'use strict';

const {VALUE_NODE, N, isDTProxy, dtProxyWrappedObject} = require('./consts');

exports.allOwnKeys = o => Object.getOwnPropertyNames(o)
    .concat(Object.getOwnPropertySymbols(o));

exports.allOwnEntries = o => exports.allOwnKeys(o).map(
    k => [k, o[k]]
);

exports.allOwnValues = o => exports.allOwnKeys(o).map(
    k => o[k]
);

exports.anyToString = (x, maxLen) => {
    if( x===null )
        var s = 'null';
    else if( typeof(x)=='object' && x[N] )
        return `ObjNode ${x[N].fullName}`;
    else if( typeof(x)=='object' && 'toString' in x )
        return x.toString();
    else if( typeof(x)=='object' && ! ('toString' in x) )
        return '[object]'
    else if( typeof(x)=='undefined' )
        var s = 'undefined';
    else if( typeof(x)=='symbol' )
        var s = x.toString();
    else if( typeof(x)=='function' )
        var s = exports.descFunc(x, maxLen);
    else
        var s = ''+x;

    if( maxLen!==undefined && s.length > maxLen )
        return s.slice(0,maxLen-3) + '...';
    else
        return s;
};

exports.descFunc = (f, maxLen) => {
    if( f===null )
        return 'null';
    else if( typeof(f)=='function' ) {
        let js = JSON.stringify(f.toString()).slice(1,-1);
        if( js.length > maxLen )
            return js.slice(0,maxLen-3) + '...';
        else
            return js;
    } else
        throw new TypeError(`function or null required for argument 0`);
};

exports.nodeOf = function(x) {
    if( typeof(x)==='object' && x.hasOwnProperty(VALUE_NODE) )
        return x[VALUE_NODE];
    else
        throw new Error('value has no node');
}

exports.hasNode = function (x) {
    return typeof(x)=='object' && x!==null && x.hasOwnProperty(VALUE_NODE)
}

exports.addNodeIfPossible = function(x, node) {
    if( typeof(x)=='object' && x!==null && ! Object.isFrozen(x) ) {
        let d = Object.getOwnPropertyDescriptor(x, VALUE_NODE);
        if( d===undefined || d.writable )
            Object.defineProperty(x, VALUE_NODE, {
                enumerable: false,
                value: node
            })
    }

}
