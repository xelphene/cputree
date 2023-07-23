
'use strict';

const {
    ObjNode, AliasValidateNode, InputNode, ComputeNode,
    getUniProxy,
} = require('../');

var root = new ObjNode({});
root.add('sub', new ObjNode({}) );
root.getc('sub').add('cn',
    new ComputeNode({
        computeFunc: () => 1
    })
);
//root.addCompute('dx', () => 10 );
root.add('dx', new ComputeNode({
    computeFunc: function () {
        console.log('compute dx');
        return 10
    }
}));


///////////////

root.finalizeEntireTree();

console.log('--- computeIfNeeded:');
root.computeIfNeeded();
console.log('---');
root.logStruct();
console.log('---');

var p = getUniProxy(root);
var v = p.sub.cn;
console.log(`V: ${v}`);
