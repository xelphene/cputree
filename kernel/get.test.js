
'use strict';

const {ObjNode} = require('../node/objnode');
const {TNode} = require('../node/tnode');
const {InputKernel} = require('./input');
const {GetKernel} = require('./get');

var R;

beforeEach(() => {
    global.console = require('console');
});

beforeEach( () => {
    R = new ObjNode({});
});

test('bind_leaf', () => {
    R.addc('i', new TNode( new InputKernel({defaultValue: 1}) ) );
    R.addc('j', new TNode( new InputKernel({defaultValue: 100}) ) );
    R.addc('c', new TNode( new GetKernel({
        bindings: [R.getc('i')],
        getFunc: i => i+1
    })));
    
    R.init({});
    rest();
});

test('bind_obj', () => {
    R.addc('i', new TNode( new InputKernel({defaultValue: 1}) ) );
    R.addc('j', new TNode( new InputKernel({defaultValue: 100}) ) );
    R.addc('c', new TNode( new GetKernel({
        bindings: [R],
        getFunc: t => t.i + 1
    })));
    
    R.init({});
    rest();
});

function rest() {
    expect( R.getc('c').kernel.fresh ).toBe( true );
    expect( R.getc('c').getValue() ).toBe( 2 );
    expect( R.getc('c').kernel.fresh ).toBe( true );
    expect( R.getc('c').kernel.computeCount ).toBe( 1 );
    
    R.getc('i').setValue(10);
    expect( R.getc('c').kernel.fresh ).toBe( false );
    expect( R.getc('c').getValue() ).toBe( 11 );
    expect( R.getc('c').kernel.computeCount ).toBe( 2 );
    expect( R.getc('c').kernel.fresh ).toBe( true );

    expect( R.getc('c').getValue() ).toBe( 11 );
    expect( R.getc('c').kernel.computeCount ).toBe( 2 );

    R.getc('j').setValue(200);
    expect( R.getc('c').getValue() ).toBe( 11 );
    expect( R.getc('c').kernel.computeCount ).toBe( 2 );
    
}
