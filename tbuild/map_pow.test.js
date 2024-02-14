
'use strict';

const {tbuild, unwrap, tinsert, bexist} = require('../tbuild');

var R;

beforeEach( () => {
    R = tbuild();
    R.o = bexist;
    R.o.i = tinsert.input(2);
    R.o.f = t => 4;
    R.pow = tinsert.input(3);
});

test('branch_func', () => {
    R.mp = tinsert.powMap( R.o, t => t.pow );
    
    R = unwrap(R);
    R.init({});
    
    test_branch_rest();
});

test('branch_node', () => {
    R.mp = tinsert.powMap( R.o, R.pow );
    
    R = unwrap(R);
    R.init({});
    
    test_branch_rest();
});

test('node_func', () => {
    R.mp = bexist;
    R.mp.i = tinsert.powMap( R.o.i, t => t.pow );
    
    R = unwrap(R);
    R.init({});

    test_rest_leaf();
});

test('node_node', () => {
    R.mp = bexist;
    R.mp.i = tinsert.powMap( R.o.i, R.pow );
    
    R = unwrap(R);
    R.init({});

    test_rest_leaf();
});

function test_rest_leaf () {
    expect( R.nav('mp.i').getValue() ).toBe( 2000 );
    expect( R.nav('mp.i').fresh ).toBe( true );
    expect( R.nav('mp.i').computeCount ).toBe( 1 );
    
    R.nav('mp.i').setValue( 3000 );    

    expect( R.nav('mp.i').fresh ).toBe( false );
    expect( R.nav('o.i').getValue() ).toBe( 3 );
    expect( R.nav('mp.i').getValue() ).toBe( 3000 );
    expect( R.nav('mp.i').computeCount ).toBe( 2 );

    R.nav('pow').setValue( 2 );    
    
    expect( R.nav('mp.i').fresh ).toBe( false );
    expect( R.nav('mp.i').getValue() ).toBe( 300 );
    expect( R.nav('mp.i').computeCount ).toBe( 3 );
}

function test_branch_rest() {
    expect( R.nav('mp.i').getValue() ).toBe( 2000 );
    expect( R.nav('mp.f').getValue() ).toBe( 4000 );
    expect( R.nav('mp.i').fresh ).toBe( true );
    expect( R.nav('mp.f').fresh ).toBe( true );
    expect( R.nav('mp.i').computeCount ).toBe( 1 );
    expect( R.nav('mp.f').computeCount ).toBe( 1 );
    
    R.nav('mp.i').setValue( 3000 );
    
    expect( R.nav('mp.i').fresh ).toBe( false );
    expect( R.nav('mp.f').fresh ).toBe( true );
    expect( R.nav('o.i').getValue() ).toBe( 3 );
    expect( R.nav('mp.i').getValue() ).toBe( 3000 );
    expect( R.nav('mp.f').getValue() ).toBe( 4000 );
    expect( R.nav('mp.i').computeCount ).toBe( 2 );
    expect( R.nav('mp.f').computeCount ).toBe( 1 );

    R.nav('pow').setValue( 2 );    
    
    expect( R.nav('mp.i').fresh ).toBe( false );
    expect( R.nav('mp.f').fresh ).toBe( false );
    expect( R.nav('mp.i').getValue() ).toBe( 300 );
    expect( R.nav('mp.f').getValue() ).toBe( 400 );
    expect( R.nav('mp.i').computeCount ).toBe( 3 );
    expect( R.nav('mp.f').computeCount ).toBe( 2 );
}
