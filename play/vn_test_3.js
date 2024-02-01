
'use strict';

const {
    GetKernel, InputKernel, GetSetKernel, MapGetKernel, MapBoundKernel
} = require('../kernel');
const {makeNode} = require('../');
const {ObjNode} = require('../node/objnode');
const {TNode}   = require('../node/tnode');

var R = new ObjNode({});
//R.addc('i', new TNode( new InputKernel(0.1)  ));
R.addc('i', makeNode('Input', 0.1) );
R.addc('j', new TNode( new InputKernel(0.2)  ));
R.addc('c', new TNode(
    new GetKernel(
        [R.getc('i'), R.getc('j')], (i,j) => (i+j) * 10
    )
));

R.addc('s', new TNode( new GetSetKernel(
    [R],
    t => -t.i,
    (t,v) => { t.i = -v }
)));

var anonNode = new TNode(
    new GetKernel(
        [R], t => t.i * 10
    )
);

R.addc('a', new TNode(
    new GetKernel(
        [R, anonNode], (t, an) => an * 10 + t.j
    )
));

var mapFuncNode = new TNode(
    new GetKernel(
        [R, R.getc('c')], (t,c) => v => t.j * v - c
    )
);

R.addc('m', new TNode(
    new MapGetKernel( mapFuncNode, R.getc('a') )
));

R.addc('mb', new TNode(
    new MapBoundKernel({
        bindings: [R, R.getc('c')],
        mapGetFunc: (t,c,v) => t.j * v - c,
        mapSetFunc: null,
        srcNode: R.getc('a')
    })
));
   

R.init({});
R.computeIfNeeded();
R.logDebug({maxNameLen:15});
/*
console.log('-'.repeat(80));

R.getc('s').setValue( -.5 );
R.computeIfNeeded();
R.logDebug({maxNameLen:15});

console.log('-'.repeat(80));

console.log( anonNode.debugLines );
*/
