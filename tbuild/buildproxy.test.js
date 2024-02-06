
'use strict';

const {N, TBProxyHandler} = require('../consts');
const {TNode} = require('../node/tnode');
const {RelayInputKernel} = require('../kernel/relayinput');
const {GetKernel} = require('../kernel/get');
const {tbuild, unwrap, tinsert, bexist} = require('../tbuild');
const {BuildProxy} = require('./buildproxy');

beforeEach(() => {
    global.console = require('console');
});

test('get', () =>
{
    var R = tbuild();
    R.c = t => 3;

    expect( R[N] ).toBe( unwrap(R) );
    expect( R[TBProxyHandler].constructor ).toBe( BuildProxy );

    expect( Object.getOwnPropertyDescriptor(R, N).value ).toBe( unwrap(R) );
    expect( Object.getOwnPropertyDescriptor(R, TBProxyHandler).value.constructor )
        .toBe( BuildProxy);
    
    expect( R.hasOwnProperty(N) ).toBe( true );
    expect( R.hasOwnProperty(TBProxyHandler) ).toBe( true );
    
    const tn = new TNode( new GetKernel({
        bindings: [],
        getFunc:  () => 900
    }));
    unwrap(R).addc('d', tn);
    
    expect( R.d ).toBe( tn );
    expect( R.hasOwnProperty('d') ).toBe( true );
    expect( Object.getOwnPropertyDescriptor(R, 'd').value ).toBe( tn );
        
    R = unwrap(R);
    R.init({});
});

test('branch', () =>
{
    function getTree() {
        var S = tbuild();
        S.i = tinsert.input(222);
        S.c = t => t.i + 1;
        return S;
    }
        
    var R = tbuild();
    
    var s = getTree();
    R.s = s;
    R.s2 = R.s;
    
    ////////////////////////////

    expect( unwrap(R.s) ).toBe( unwrap(s) );
    expect( R.hasOwnProperty('s') ).toBe( true );
    expect( unwrap(
        Object.getOwnPropertyDescriptor(R, 's').value
    )).toBe( unwrap(s) );

    ////////////////////////////
    
    R = unwrap(R);
    R.init({});
    
    ////////////////////////////
    
    expect( R.nav('s.i').getValue()  ).toBe( 222 );
    expect( R.nav('s.c').getValue()  ).toBe( 223 );
    expect( R.nav('s2.i').getValue() ).toBe( 222 );
    expect( R.nav('s2.c').getValue() ).toBe( 223 );
    
    R.nav('s.i').setValue( 300 );
    
    expect( R.nav('s2.i').kernel.fresh ).toBe( false );
    expect( R.nav('s2.i').getValue() ).toBe( 300 );
    expect( R.nav('s2.i').kernel.fresh ).toBe( true );
    expect( R.nav('s2.i').kernel.computeCount ).toBe( 2 );
    
    R.nav('s2.i').setValue( 40 );

    expect( R.nav('s.i').getValue() ).toBe( 40 );
    expect( R.nav('s2.i').kernel.fresh ).toBe( false );
    expect( R.nav('s2.i').getValue() ).toBe( 40 );
    expect( R.nav('s2.i').kernel.fresh ).toBe( true );
    expect( R.nav('s2.i').kernel.computeCount ).toBe( 3 );
    
});

test('input_relay', () =>
{
    var R = tbuild();
    
    R.i1 = tinsert.input(1);
    R.i2 = tinsert.input(2);
    R.i3 = tinsert.input(3);
    R.c = t => 100;
    R.c = t => 101; // overwrite
    
    R.src_get = t => t.src_input+1;
    R.src_input = tinsert.input(20);
    
    R.i1 = R.src_get;
    R.i2 = R.src_input;
    R.i3 = t => t.src_input+2;
    
    R = unwrap(R);
    R.init({});
    
    expect( R.nav('i1').getValue() ).toBe( 21 );
    expect( R.nav('i2').getValue() ).toBe( 20 );
    expect( R.nav('i3').getValue() ).toBe( 22 );
    expect( R.nav('i1').kernel ).toBeInstanceOf( RelayInputKernel );
    expect( R.nav('i2').kernel ).toBeInstanceOf( RelayInputKernel );
    expect( R.nav('i3').kernel ).toBeInstanceOf( RelayInputKernel );
    expect( R.nav('c').kernel  ).toBeInstanceOf( GetKernel );
    
    R.nav('src_input').setValue(30);

    expect( R.nav('i1').getValue() ).toBe( 31 );
    expect( R.nav('i2').getValue() ).toBe( 30 );
    expect( R.nav('i3').getValue() ).toBe( 32 );
    expect( R.nav('c').getValue()  ).toBe( 101 );
});
