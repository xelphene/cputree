
'use strict';

const {GetKernel, InputKernel, GetSetKernel} = require('../vnode');
const {ObjNode} = require('../node/objnode');
const {TNode}   = require('../node/tnode');

var j = new InputKernel(0.2);
var c = new GetKernel(
    [i, j], (i,j) => (i+j) * 10
);

var R = new ObjNode({});
R.addc('i', new TNode({  kernel: new InputKernel(0.1)  }));
R.addc('j', new TNode({  kernel: new InputKernel(0.2)  }));
R.addc('c', new TNode({
    kernel: new GetKernel(
        [i, j], (i,j) => (i+j) * 10
    )
}));

R.addc('d', new TNode({ kernel: new GetKernel(
    [R], t => t.j**2
)}));

R.addc('e', new TNode({ kernel: new GetKernel(
    [R.getc('j')], j => j**2 + 1
)}));
R.addc('e2', new TNode({ kernel: new GetKernel(
    [R.getc('e')], e => e*10
)}));


R.addc('s', new TNode({ kernel: new GetSetKernel(
    [R],
    t => -t.i,
    (t,v) => { t.i = -v }
)}));

R.init({});
R.computeIfNeeded();
R.logStruct();

console.log('-');
R.getc('s').value = -.5;
R.computeIfNeeded();
R.logStruct();

console.log('-===-=-');

console.log(  R.getc('s').vNode.debugLines )

console.log('-===-=-');

R.logDebug({maxNameLen:15});

/*
console.log('-');
R.getc('i').value = 10;
R.getc('j').value = 20;
R.computeIfNeeded();
R.logStruct();
*/
