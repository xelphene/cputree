
'use strict';

const {ObjNode, InputNode, GetSetNode} = require('../');

var root = new ObjNode({});
root.add('c', new GetSetNode({ getter: () => -9 }));
root.add('i', new InputNode({}));
root.add('g', new GetSetNode({
    getter: function() {
        return this.i+1
    }
}));
root.add('h', new GetSetNode({
    getter: function () {
        return this.i + this.g;
    },
    setter: function (v) {
        this.i = v+1;
    }
}));

root.init({i: 100});

root.logFlat();

var o = root.rawObject;

console.log(o);

//o.g = 3; // TypeError 
//root.nav('g').setValue(4); // NoSetterError: cannot set value on ☉.g because it has no setter

o.h = 8;
console.log(o);

root.logStruct();

console.log( root.nav('g').isListeningTo( root.nav('i') ) ); // true
console.log( root.nav('g').isListeningTo( root.nav('h') ) ); // false
console.log( root.nav('g').isListeningTo( root.nav('c') ) ); // false

console.log( root.nav('h').isListeningTo( root.nav('i') ) ); // true
console.log( root.nav('h').isListeningTo( root.nav('g') ) ); // true
console.log( root.nav('h').isListeningTo( root.nav('c') ) ); // false
