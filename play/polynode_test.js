
'use strict';

const {tbuild, tinput, unwrap} = require('../tbuild');
const {THIS_NODE} = require('../consts');
const {PolyNode} = require('../node/polynode');
//const {MinMaxPolyNode} = require('../node/minmaxpolynode');

const T = tbuild();
T.i = tinput.number();
T.maxLen = t => t.i*10;
T.minLen = tinput.number();

T.curLen = new PolyNode({
    bindings: [THIS_NODE, T.minLen, T.maxLen],
    getFunc: (myLen, minLen, maxLen) => {
        console.log(`GETFUNC myLen=${myLen} minLen=${minLen} maxLen=${maxLen}`);
        if( minLen >= maxLen )
            throw new Error(`minLen, ${minLen}, is not less than maxLen, ${maxLen}`);
        
        if( myLen > maxLen )
            return maxLen
        else if( myLen < minLen )
            return minLen
        else
            return myLen
    }
});

//T.curLen = new MinMaxPolyNode({
//    min: T.minLen, max: T.maxLen

const t = unwrap(T);
const o = t.rawObject;
t.init({
    i: 2,
    curLen: 15,
    minLen: 5
});

//t.logFlat();

console.log( `o.curLen: ${o.curLen}` );
console.log(' - - set i=1');
o.i = 1;
console.log( `o.curLen: ${o.curLen}` );

console.log(' - - set i=3');
o.i = 3;
console.log( `o.curLen: ${o.curLen}` );

console.log(' - - set minLen=11');
o.minLen = 11;
console.log( `o.curLen: ${o.curLen}` );

console.log(' - - set curLen=29');
o.curLen = 29;
console.log( `o.curLen: ${o.curLen}` );


//console.log( t.nav('curLen').getValue() )


