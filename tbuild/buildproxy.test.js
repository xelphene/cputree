
'use strict';

const {N, TBProxyHandler, nget, nset} = require('../consts');
const {TNode} = require('../node/tnode');
const {RelayInputKernel} = require('../kernel/relayinput');
const {GetKernel} = require('../kernel/get');
const {InputKernel} = require('../kernel/input');
const {tbuild, unwrap, tinsert, bexist, tinput} = require('../tbuild');
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

test('leaf_alias', () =>
{
    var R = tbuild();
    R.c = t => 222;
    R.c2 = R.c;
    
    R = unwrap(R);
    R.init({});
    
    expect( R.nav('c2').getValue() ).toBe( 222 );
});

test('potn', () =>
{
    var R = tbuild();
    
    R.x = t => 200;
    R.o.c = t => t.x + 22;
    R.o.p.c = t => t.x + 2;
    
    R = unwrap(R);
    R.init({});
    
    expect( R.nav('o.c').getValue() ).toBe( 222 );
    expect( R.nav('o.p.c').getValue() ).toBe( 202 );
    
    //R.logDebug();
});

test('potn_create_rhs', () =>
{
    var R = tbuild();
    
    R.i = tinsert.input(1);
    R.i = R.o.i;
    
    R = unwrap(R);
    R.init({
        o: {
            i: 2
        }
    });
    
    expect( R.nav('i').getValue() ).toBe( 2 );
    expect( R.nav('o.i').getValue() ).toBe( 2 );
    expect( R.nav('i').kernel ).toBeInstanceOf( RelayInputKernel );
    expect( R.nav('o.i').kernel ).toBeInstanceOf( InputKernel );
        
    //R.logDebug();
});


test('potn_create_getset', () =>
{
    var R = tbuild();
    R.i = tinsert.input( 20 );
    
    R.o.gs[nget] = t => t.i * 10;
    R.o.gs[nset] = (t,v) => t.i = v / 10;
    
    R = unwrap(R);
    R.init({});
    
    expect( R.nav('o.gs').getValue() ).toBe( 200 );
    
    R.nav('o.gs').setValue( 300 );

    expect( R.nav('i').getValue()    ).toBe( 30 );
    expect( R.nav('o.gs').getValue() ).toBe( 300 );
    
    //R.logDebug();
});

test('potn_create_getset_rev', () =>
{
    var R = tbuild();
    R.i = tinsert.input( 20 );
    
    R.o.gs[nset] = (t,v) => t.i = v / 10;
    R.o.gs[nget] = t => t.i * 10;
    
    R = unwrap(R);
    R.init({});
    
    expect( R.nav('o.gs').getValue() ).toBe( 200 );
    
    R.nav('o.gs').setValue( 300 );

    expect( R.nav('i').getValue()    ).toBe( 30 );
    expect( R.nav('o.gs').getValue() ).toBe( 300 );
    
    //R.logDebug();
});

test('potn_create_getset_no_set', () =>
{
    var R = tbuild();
    R.i = tinsert.input( 20 );
    
    //R.o.gs[nset] = (t,v) => t.i = v / 10;
    R.o.gs[nget] = t => t.i * 10;
    
    R = unwrap(R);
    R.init({});

    expect( () => R.nav('o.gs').setValue( 300 ) )
        .toThrow("a TNode with a GetSetKernel was created at ☉.o.gs, but it's setFunc was not assigned");
});

test('potn_create_getset_no_get', () =>
{
    var R = tbuild();
    R.i = tinsert.input( 20 );
    
    R.o.gs[nset] = (t,v) => t.i = v / 10;
    //R.o.gs[nget] = t => t.i * 10;
    
    R = unwrap(R);

    expect( () => R.init({}) )
        .toThrow("a TNode with a GetSetKernel was created at ☉.o.gs, but it's getFunc was not assigned");
});

test('tinput', () =>
{
    var R = tbuild();
    
    R.i = tinput.number(3);
    R.j = tinput.any();
    
    R = unwrap(R);
    R.init({});
    
    expect( R.getc('i').getValue() ).toBe(3);
    R.getc('i').setValue(4);
    expect( R.getc('i').getValue() ).toBe(4);
    expect( () => R.getc('i').setValue('x') ).toThrow('Input validation failure setting ☉.i to x: number required; got string');
    
    R.getc('j').setValue('z');
    expect( R.getc('j').getValue() ).toBe('z');
});
