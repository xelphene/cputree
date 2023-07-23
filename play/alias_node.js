
'use strict';

const {
    ObjNode, AliasValidateNode, InputNode, ComputeNode,
    parent
} = require('../');

var numval = (node, value) => {
    if( typeof(value)=='number' ) {
        return [true, ''];
    } else {
        return [false, `number required; got ${typeof(value)}`];
    }
}


var strval = (node, value) => {
    if( typeof(value)=='string' ) {
        return [true, ''];
    } else {
        return [false, `string required; got type ${typeof(value)}`];
    }
}

var root = new ObjNode({});

root.add('inp0', new InputNode({
    validate: numval
}));
root.add('cn', new ComputeNode({
    //computeFunc: () => 222
    computeFunc: function () {
        return this.inp0+1
    }
}));

root.add('sub', new ObjNode({}));
root.getProp('sub').add('inpA', new AliasValidateNode({
    //srcNodePath: [parent,parent,'cn'],
    srcNodePath: [parent,parent,'NAH'],
    validate: numval,
}));
/*
root.getProp('sub').add('inpFail', new AliasValidateNode({
    srcNode: root.getProp('cn'),
    validate: strval,
}));
*/

///////////////

root.finalizeEntireTree();
root.getProp('inp0').value = 221;
root.logStruct();
console.log('--- computeIfNeeded:');
root.computeIfNeeded();
console.log('---');
root.logStruct();
console.log('---');

root.getProp('inp0').value = 1000;
root.logStruct();
console.log(root.rawObject.sub.inpA);
root.logStruct();

console.log(root.rawObject);
