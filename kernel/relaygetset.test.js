
'use strict';

const {ObjNode} = require('../node/objnode');
const {TNode} = require('../node/tnode');
const {InputKernel} = require('./input');
const {GetKernel} = require('./get');
const {GetSetKernel} = require('./getset');
const {MapBoundKernel} = require('./mapbound.js');
const {RelayGetSetKernel} = require('./relaygetset');
const {LeafNode} = require('../node/leaf');

var R;

beforeEach( () => {
    R = new ObjNode({});
    R.addc('i', new TNode( new InputKernel({defaultValue: 1}) ) );
    R.addc('j', new TNode( new InputKernel({defaultValue: -1}) ) );
    R.addc('cj', new TNode( new GetKernel({
        bindings: [R],
        getFunc: t => t.j * 10
    })));
    R.addc('ci', new TNode( new GetKernel({
        bindings: [R],
        getFunc: t => t.i * 2
    })));
});

/*
test('relay_input', () =>
{
    R.addc('r', new TNode( new RelayGetSetKernel({
        bindings: [R],
        getFunc:  t => t.i*100,
        setFunc:  (t,v) => { t.i = v/100 },
        srcNode:  R.getc('j')
    })));
    
    R.init({});
    //R.logDebug();
    //console.log( R.rawObject );
    
    expect( R.getc('r').getValue() ).toBe( 100 );
    R.getc('j').setValue(200);
    expect( R.getc('i').getValue() ).toBe( 2 );

    //console.log( R.rawObject );
});
*/

test('relay_compute', () =>
{
    R.addc('r', new TNode( new RelayGetSetKernel({
        bindings: [R],
        getFunc:  t => t.i*100,
        setFunc:  (t,v) => { t.i = v/100 },
        srcNode:  R.getc('cj')
    })));
    
    R.init({});
    //R.logDebug();
    
    expect( R.getc('r').getValue() ).toBe( -10 );

    R.getc('j').setValue(30);
    expect( R.getc('cj').kernel.fresh ).toBe( false );
    R.computeIfNeeded();

    expect( R.getc('cj').kernel.fresh ).toBe( true );
    expect( R.getc('cj').kernel.getValue() ).toBe( 300 );
    expect( R.getc('i').getValue() ).toBe( 3 );
});
