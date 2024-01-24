
'use strict';

exports.allOwnKeys = o => Object.getOwnPropertyNames(o)
    .concat(Object.getOwnPropertySymbols(o));

exports.allOwnEntries = o => exports.allOwnKeys(o).map(
    k => [k, o[k]]
);

exports.allOwnValues = o => exports.allOwnKeys(o).map(
    k => o[k]
);

exports.anyToString = (x, maxLen) => {
    if( typeof(x)=='undefined' )
        var s = 'undefined';
    else if( typeof(x)=='symbol' )
        var s = x.toString();
    else if( x===null ) 
        var s = 'null'
    else
        var s = ''+x;

    if( maxLen!==undefined && s.length > maxLen )
        return s.slice(0,maxLen-3) + '...';
    else
        return s;
};

exports.descFunc = (f, maxLen) => {
    let js = JSON.stringify(f.toString()).slice(1,-1);
    if( js.length > maxLen )
        return js.slice(0,maxLen-3) + '...';
    else
        return js;
};
