
'use strict';

const {ObjNode, C, N, O, inpn} = require('../index');

var root = new ObjNode({});
var p = root[C];

p.val = inpn.number();
p.f = () => 222;

p.f2 = function () {
    return this.val*10;
}

p.setVal = function () {
    return v => {
        if( v%2 != 1 )
            throw new Error(`only odd numbers, not ${v}`);
        this.val = v;
    }
}

root.init({
    val: 1
});
var o = root[O];

console.log(o);
o.setVal(11);

console.log('-');
console.log(o);
