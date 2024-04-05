
'use strict';

const {Node, TInputNode, TGetNode} = require('../node');
const {TreeFiller} = require('../tbuild/fill');
const {nget, nset} = require('../consts');
const {tbuild, unwrap, tinsert, bexist, tinput} = require('../tbuild');
const {predFunc} = require('../');

var T = tbuild();
T.p = () => 10;
T.unit = tinput.string();

function getSaWidthCtl (unit) {
    var T = tbuild();
    
    T.input = tinput.any();

    T.value[nget] = t => {
        if( t.input===undefined )
            return t.default;
        else
            return t.input;
    }
    T.value[nset] = (t, value) => {
        if( typeof(value) != 'number' )
            throw new Error(`number required, not ${typeof(value)}`);
        if( value <= 0 )
            throw new Error(`number > 0 required, not ${value}`);
        t.input = value;    
    }

    T.default = predFunc(unit, {
        in: t => 0.375,
        cm: t => 1
    })
    
    T.incDecQty = predFunc(unit, {
        in: t => 0.125,
        cm: t => 0.1
    })
    T.inc = t => () => { t.value = t.value + t.incDecQty };
    T.dec = t => () => {
        if( t.value > t.incDecQty )
            t.value = t.value - t.incDecQty
    }
    return unwrap(T);
}

T.saWidth = getSaWidthCtl(T.unit);
//T.saWidth = getSaWidthCtl('in');
T.q = t => t.p + t.saWidth.value;

T = unwrap(T);
T.init({unit: 'in'});
T.logDebug();

var t = T.rawObject;
console.log( t.saWidth.value );

console.log('='.repeat(40));

t.saWidth.inc();
console.log( t.saWidth.value );

console.log('='.repeat(40));

t.saWidth.value = 0.6;
console.log( t.saWidth.value );

console.log('='.repeat(40));

t.saWidth.inc();
console.log( t.saWidth.value );

console.log('='.repeat(40));

console.log( t.q );

console.log('='.repeat(40));

t.unit = 'cm';
t.saWidth.dec();
console.log( t.q );

console.log('='.repeat(40));

t.unit = 'in';
t.saWidth.dec();
t.saWidth.dec();
t.saWidth.dec();
t.saWidth.dec();
console.log( t.q );
t.saWidth.dec();
console.log( t.q );

