
'use strict';

exports.allOwnKeys = o => Object.getOwnPropertyNames(o)
    .concat(Object.getOwnPropertySymbols(o));

exports.allOwnEntries = o => exports.allOwnKeys(o).map(
    k => [k, o[k]]
);

exports.allOwnValues = o => exports.allOwnKeys(o).map(
    k => o[k]
);

exports.anyToString = x => {
    if( typeof(x)=='undefined' )
        return 'undefined';
    else if( typeof(x)=='symbol' )
        return x.toString();
    else if( x===null ) 
        return 'null'
    else
        return ''+x;
};
