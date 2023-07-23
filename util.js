
'use strict';

exports.allOwnKeys = o => Object.getOwnPropertyNames(o)
    .concat(Object.getOwnPropertySymbols(o));

exports.allOwnEntries = o => exports.allOwnKeys(o).map(
    k => [k, o[k]]
);

exports.allOwnValues = o => exports.allOwnKeys(o).map(
    k => o[k]
);

