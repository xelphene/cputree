
'use strict';

const {
    GetKernel, InputKernel, GetSetKernel, MapGetKernel, MapBoundKernel
} = require('../kernel');
const {makeNode} = require('../');
const {ObjNode} = require('../node/objnode');
const {TNode}   = require('../node/tnode');

var R = new ObjNode({});
//R.addc('i', new TNode( new InputKernel(0.1)  ));
R.addc('c', new TNode( new GetKernel([], () => 222) ));
R.addc('i', new TNode( new InputKernel(2)  ));
R.addc('j', new TNode( new InputKernel(4)  ));
R.addc('p', new TNode( new InputKernel(3)  ));

R.addc('mb', new TNode(
    new MapBoundKernel({
        bindings: [R],
        mapGetFunc:  (t,v) => v * 10**t.p, 
        mapSetFunc:  (t,v) => v / 10**t.p,
        srcNode: R.getc('i')
    })
));

R.addc('mg', new TNode(
    new MapBoundKernel({
        bindings: [R],
        mapGetFunc:  (t,v) => v * 10**t.p, 
        mapSetFunc:  (t,v) => v / 10**t.p,
        srcNode: R.getc('c')
    })
));
   

R.init({});
R.computeIfNeeded();
R.logDebug({maxNameLen:15});
console.log( R.rawObject );

console.log('-'.repeat(80));

R.rawObject.p = 2;
console.log( R.rawObject );

console.log('-'.repeat(80));

R.rawObject.mb = 300;
console.log( R.rawObject );

console.log('-'.repeat(80));

R.rawObject.mg = 333 ;
console.log( R.rawObject );


/*

R.computeIfNeeded();
R.logDebug({maxNameLen:15});

console.log('-'.repeat(80));

console.log( anonNode.debugLines );
*/
