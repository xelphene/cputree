
'use strict';

const {
    ObjNode, InputNode, ComputeNode,
    parent,
} = require('../');

var root = new ObjNode({});

root.add('inp0', new InputNode({
    validate: (node, value) => {
        if( typeof(value)=='number' ) {
            return [true, ''];
        } else {
            return [false, `number required; got ${typeof(value)}`];
        }
    }
}) );

root.add('sub', new ObjNode({}) );
root.getProp('sub').add('cn',
    new ComputeNode({
        computeFunc: function () {
            return this[parent].inp0 + 1
        }
    })
);
//root.addCompute('dx', () => 10 );
root.add('dx', new ComputeNode({
    computeFunc: function () {
        console.log('compute dx');
        return 10
    }
}));

root.add('cStr', new ComputeNode({
    computeFunc: () => 'z'
}));

///////////////

root.logStruct();

console.log('');
console.log('--- link and finalize');
console.log('');

//root.getProp('inp0').linkToPath('^.dx');
root.getProp('inp0').linkToNode( root.getProp('dx') );
//root.getProp('inp0').linkToPath('^.cStr');
//root.getProp('inp0').linkToPath('^.asdf');
root.finalizeEntireTree();
//root.getProp('inp0').value = 111;

console.log('--- computeIfNeeded:');
root.computeIfNeeded();
root.logStruct();

console.log(root.rawObject);
