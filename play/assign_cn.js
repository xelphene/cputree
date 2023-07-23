
'use strict';

const {
    ObjNode, C, N, O, bexist, InputNode
} = require('../');

var S = Symbol('S');

var r = new ObjNode({});
var R = r[C];
var o = r[O];

R.sub.f2 = () => 's222';

R.inp = new InputNode({});
R.f = function () {
    //console.log(`inp within f: ${this.inp}`);
    console.log(this);
    //this.inp = 2;
    return this.inp+1;
}
R.f2 = () => S;
R[S] = () => 'ess';

r.init({
    inp: 1
});

r.logFlat();

console.log('---');
o.inp = 10;
console.log(o.f);
