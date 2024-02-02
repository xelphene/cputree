
'use strict';

const {ObjNode} = require('../node/objnode');
const {TNode} = require('../node/tnode');
const {InputKernel} = require('./input');
const {GetSetKernel} = require('./getset');

var R;

beforeEach( () => {
    R = new ObjNode({});
});

test('bind_obj', () => {
    R.addc('i', new TNode( new InputKernel({defaultValue: 1}) ) );
    R.addc('j', new TNode( new InputKernel({defaultValue: 100}) ) );
    R.addc('c', new TNode( new GetSetKernel({
        bindings: [R],
        getFunc: t => t.i * 10,
        setFunc: (t,v) => { t.i = v / 10 }
    })));

    R.init({});

    expect( R.getc('c').kernel.fresh ).toBe( true );
    expect( R.getc('c').kernel.computeCount ).toBe( 1 );
    expect( R.getc('c').getValue() ).toBe(10);
    expect( R.getc('c').kernel.computeCount ).toBe( 1 );
    
    R.getc('c').setValue(20);
    
    expect( R.getc('c').kernel.fresh ).toBe( false );
    expect( R.getc('c').kernel.computeCount ).toBe( 1 );
    expect( R.getc('i').getValue() ).toBe( 2 );

    expect( R.getc('c').getValue() ).toBe( 20 );
    expect( R.getc('c').kernel.fresh ).toBe( true );
    expect( R.getc('c').kernel.computeCount ).toBe( 2 );
    
    //rest();
});

test('bind_multi', () => {
    R.addc('i', new TNode( new InputKernel({defaultValue: 1}) ) );
    R.addc('j', new TNode( new InputKernel({defaultValue: 10}) ) );
    R.addc('c', new TNode( new GetSetKernel({
        bindings: [R, R.getc('j')],
        getFunc: (t,j) => t.i * t.j,
        setFunc: (t,j,v) => { t.i = v /t.j }
    })));

    R.init({});
    
    expect( R.getc('c').kernel.fresh ).toBe( true );
    expect( R.getc('c').kernel.computeCount ).toBe( 1 );
    expect( R.getc('c').getValue() ).toBe(10);
    expect( R.getc('c').kernel.computeCount ).toBe( 1 );
    
    R.getc('c').setValue(20);
    
    expect( R.getc('c').kernel.fresh ).toBe( false );
    expect( R.getc('c').kernel.computeCount ).toBe( 1 );
    expect( R.getc('i').getValue() ).toBe( 2 );
    expect( R.getc('c').getValue() ).toBe( 20 );
    expect( R.getc('c').kernel.fresh ).toBe( true );
    expect( R.getc('c').kernel.computeCount ).toBe( 2 );

    R.getc('j').setValue(100);
    R.getc('c').setValue(300);
    
    expect( R.getc('c').kernel.fresh ).toBe( false );
    expect( R.getc('c').kernel.computeCount ).toBe( 2 );
    expect( R.getc('i').getValue() ).toBe( 3 );
    expect( R.getc('c').getValue() ).toBe( 300 );
    expect( R.getc('c').kernel.fresh ).toBe( true );
    expect( R.getc('c').kernel.computeCount ).toBe( 3 );
});

