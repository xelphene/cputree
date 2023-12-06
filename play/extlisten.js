
'use strict';

const {ObjNode, C, N, O, listen, inpn, InputNode} = require('../index');

var root = new ObjNode({});
var P = root[C];

P.i1 = new InputNode({});
P.i2 = new InputNode({});

P.f1 = function () {
    return this.i1 * 2;
}

P.f2 = function () {
    return this.i2 + this.f1;
}

root.init({
    i1: 2,
    i2: 4
});

var o = root[O];
// works
//listen( P.f2, v => console.log(`update f2: ${v}`) );
//listen( root.nav('f2'), v => console.log(`update f2: ${v}`) );

listen( root.nav('f1'), v => console.log(`update f1: ${v}`) );

console.log('-----------');
o.i2 = 3;
o.i1 = 5;
console.log('gonna compute...');
root.computeIfNeeded();

console.log('-----------');
o.i2 = 10;
console.log('gonna compute...');
root.computeIfNeeded();

console.log('-----------');
root.logStruct();
