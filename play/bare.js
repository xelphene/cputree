
'use strict';

const {
    ObjNode, AliasValidateNode, InputNode, ComputeNode,
} = require('../');

var root = new ObjNode({});
root.addObj('sub', {});
root.getProp('sub').add('cn',
    new ComputeNode({
        computeFunc: () => 1
    })
);
//root.addCompute('dx', () => 10 );
root.addCompute('dx', function () {
    console.log('compute dx');
    return 10
});

//////////////
// all of the following are equivalent and work

// here, mlatA: problem: ☉.mlatA.a does not auto-listen to ☉.dx. mlatB.a and mlatC.a do tho.
//root.addMapObj('mlatA', 'lat', v => v+root.getProp('dx').value ); 
// but this works:
root.addMapObj('mlatA', 'lat', function (v) {
    root.getProp('dx').addChangeListener( root.getProp('mlatA') );
    return v + root.getProp('dx').value 
}); 

root.addMapObj('mlatB', 'lat', function (v) { return v+this.dx });

root.addMapObj('mlatC', root.getProp('lat'), function (v) { return v+this.dx });

///////////////

root.finalizeEntireTree();

root.logStruct();
console.log('--- computeIfNeeded:');
root.computeIfNeeded();
console.log('---');
root.logStruct();
console.log('---');
console.log(root.getProp('mlatA').getProp('a').value);
console.log(root.getProp('mlatB').getProp('a').value);
console.log(root.getProp('mlatC').getProp('a').value);

console.log('---');
console.log( root.getChildKey( root.getProp('mlatA') ) );
console.log( root.getChildKey( root.getProp('dx') ) );

