
'use strict';

const {tbuild, unwrap, tinsert, bexist} = require('../tbuild');
beforeEach(() => { global.console = require('console'); });

var R;

beforeEach( () => {
    R = tbuild();
    R.src = bexist;
    R.src.i = tinsert.input(2);
    R.src.f = t => 4;
    R.pow = tinsert.input(3);
});

test('branch_func', () => {
    R.dst = tinsert.powMap( R.src, t => t.pow );
    
    R = unwrap(R);
    R.init({});
    
    test_branch_rest();
});

test('branch_node', () => {
    R.dst = tinsert.powMap( R.src, R.pow );
    
    R = unwrap(R);
    R.init({});
    
    test_branch_rest();
});


test('node_func', () => {
    R.dst = bexist;
    R.dst.i = tinsert.powMap( R.src.i, t => t.pow );
    
    R = unwrap(R);
    R.init({});

    test_rest_leaf();
});

test('node_node', () => {
    R.dst = bexist;
    R.dst.i = tinsert.powMap( R.src.i, R.pow );
    
    R = unwrap(R);
    R.init({});

    test_rest_leaf();
});

function test_rest_leaf () {
    expect( R.nav('dst.i').getValue() ).toBe( 2000 );
    expect( R.nav('dst.i').fresh ).toBe( true );
    expect( R.nav('dst.i').computeCount ).toBe( 1 );
    
    R.nav('dst.i').setValue( 3000 );    

    expect( R.nav('dst.i').fresh ).toBe( false );
    expect( R.nav('src.i').getValue() ).toBe( 3 );
    expect( R.nav('dst.i').getValue() ).toBe( 3000 );
    expect( R.nav('dst.i').computeCount ).toBe( 2 );

    R.nav('pow').setValue( 2 );    
    
    expect( R.nav('dst.i').fresh ).toBe( false );
    expect( R.nav('dst.i').getValue() ).toBe( 300 );
    expect( R.nav('dst.i').computeCount ).toBe( 3 );
}

function test_branch_rest() {
    expect( R.nav('dst.i').getValue() ).toBe( 2000 );
    expect( R.nav('dst.f').getValue() ).toBe( 4000 );
    expect( R.nav('dst.i').fresh ).toBe( true );
    expect( R.nav('dst.f').fresh ).toBe( true );
    expect( R.nav('dst.i').computeCount ).toBe( 1 );
    expect( R.nav('dst.f').computeCount ).toBe( 1 );
    
    R.nav('dst.i').setValue( 3000 );
    
    expect( R.nav('dst.i').fresh ).toBe( false );
    expect( R.nav('dst.f').fresh ).toBe( true );
    expect( R.nav('src.i').getValue() ).toBe( 3 );
    expect( R.nav('dst.i').getValue() ).toBe( 3000 );
    expect( R.nav('dst.f').getValue() ).toBe( 4000 );
    expect( R.nav('dst.i').computeCount ).toBe( 2 );
    expect( R.nav('dst.f').computeCount ).toBe( 1 );

    R.nav('pow').setValue( 2 );    
    
    expect( R.nav('dst.i').fresh ).toBe( false );
    expect( R.nav('dst.f').fresh ).toBe( false );
    expect( R.nav('dst.i').getValue() ).toBe( 300 );
    expect( R.nav('dst.f').getValue() ).toBe( 400 );
    expect( R.nav('dst.i').computeCount ).toBe( 3 );
    expect( R.nav('dst.f').computeCount ).toBe( 2 );
}
