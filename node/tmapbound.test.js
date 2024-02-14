
'use strict';

const {ObjNode} = require('../node/objnode');
const {TInputNode} = require('./tinput');
const {TGetNode} = require('./tget');
const {TGetSetNode} = require('./tgetset');
const {TMapBoundNode} = require('./tmapbound');

beforeEach(() => { global.console = require('console'); });

var R;

beforeEach( () => {
    R = new ObjNode({});

    R.addc('i', new TInputNode({defaultValue: 1}) );
    R.addc('j', new TInputNode({defaultValue: 2}) );
    
    R.addc('mul', new TInputNode({defaultValue: 10}) );
    
    R.addc('c', new TGetNode({
        bindings: [R],
        getFunc: t => t.i + t.j,
    }));
});

test('bind_obj_src_cpu', () =>
{
    R.addc('mc', new TMapBoundNode({
        bindings:   [R],
        mapGetFunc: (t, v) => v * t.mul,
        mapSetFunc: (t, v) => v / t.mul,
        srcNode:    R.getc('c')
    }));

    R.init({});
    
    expect( R.getc('mc').computeCount ).toBe( 1 );
    expect( R.getc('mc').fresh ).toBe( true );
    expect( R.getc('mc').getValue() ).toBe( 30 );
    expect( R.getc('mc').settable ).toBe( false );

    R.getc('mul').setValue(100);

    expect( R.getc('mc').computeCount ).toBe( 1 );
    expect( R.getc('mc').fresh ).toBe( false );
    expect( R.getc('mc').getValue() ).toBe( 300 );
    expect( R.getc('mc').computeCount ).toBe( 2 );
    expect( R.getc('mc').fresh ).toBe( true );
    
    R.getc('j').setValue(3);

    expect( R.getc('mc').computeCount ).toBe( 2 );
    expect( R.getc('mc').fresh ).toBe( false );
    expect( R.getc('mc').getValue() ).toBe( 400 );
    expect( R.getc('mc').computeCount ).toBe( 3 );
    expect( R.getc('mc').fresh ).toBe( true );
});

test('bind_leaf_src_cpu', () =>
{
    R.addc('mc', new TMapBoundNode({
        bindings:   [R.getc('mul')],
        mapGetFunc: (mul, v) => v * mul,
        mapSetFunc: (mul, v) => v / mul,
        srcNode:    R.getc('c')
    }));

    R.init({});
    
    expect( R.getc('mc').computeCount ).toBe( 1 );
    expect( R.getc('mc').fresh ).toBe( true );
    expect( R.getc('mc').getValue() ).toBe( 30 );
    expect( R.getc('mc').settable ).toBe( false );

    R.getc('mul').setValue(100);

    expect( R.getc('mc').computeCount ).toBe( 1 );
    expect( R.getc('mc').fresh ).toBe( false );
    expect( R.getc('mc').getValue() ).toBe( 300 );
    expect( R.getc('mc').computeCount ).toBe( 2 );
    expect( R.getc('mc').fresh ).toBe( true );
    
    R.getc('j').setValue(3);

    expect( R.getc('mc').computeCount ).toBe( 2 );
    expect( R.getc('mc').fresh ).toBe( false );
    expect( R.getc('mc').getValue() ).toBe( 400 );
    expect( R.getc('mc').computeCount ).toBe( 3 );
    expect( R.getc('mc').fresh ).toBe( true );
});
test('bind_obj_src_inp', () =>
{
    R.addc('mj', new TMapBoundNode({
        bindings:   [R],
        mapGetFunc: (t, v) => v * t.mul,
        mapSetFunc: (t, v) => v / t.mul,
        srcNode:    R.getc('j')
    }));

    R.init({});
    
    expect( R.getc('mj').computeCount ).toBe( 1 );
    expect( R.getc('mj').fresh ).toBe( true );
    expect( R.getc('mj').getValue() ).toBe( 20 );
    expect( R.getc('mj').settable ).toBe( true );

    R.getc('mul').setValue(100);

    expect( R.getc('mj').computeCount ).toBe( 1 );
    expect( R.getc('mj').fresh ).toBe( false );
    expect( R.getc('mj').getValue() ).toBe( 200 );
    expect( R.getc('mj').computeCount ).toBe( 2 );
    expect( R.getc('mj').fresh ).toBe( true );
    
    R.getc('j').setValue(3);

    expect( R.getc('mj').computeCount ).toBe( 2 );
    expect( R.getc('mj').fresh ).toBe( false );
    expect( R.getc('mj').getValue() ).toBe( 300 );
    expect( R.getc('mj').computeCount ).toBe( 3 );
    expect( R.getc('mj').fresh ).toBe( true );
    
    R.getc('mj').setValue(400);

    expect( R.getc('mj').computeCount ).toBe( 3 );
    expect( R.getc('mj').fresh ).toBe( false );
    expect( R.getc('mj').getValue() ).toBe( 400 );
    expect( R.getc('mj').computeCount ).toBe( 4 );
    expect( R.getc('mj').fresh ).toBe( true );
    expect( R.getc('j').getValue() ).toBe( 4 );
});

test('bind_leaf_src_inp', () =>
{
    R.addc('mj', new TMapBoundNode({
        bindings:   [R.getc('mul')],
        mapGetFunc: (mul, v) => v * mul,
        mapSetFunc: (mul, v) => v / mul,
        srcNode:    R.getc('j')
    }));

    R.init({});
    
    expect( R.getc('mj').computeCount ).toBe( 1 );
    expect( R.getc('mj').fresh ).toBe( true );
    expect( R.getc('mj').getValue() ).toBe( 20 );
    expect( R.getc('mj').settable ).toBe( true );

    R.getc('mul').setValue(100);

    expect( R.getc('mj').computeCount ).toBe( 1 );
    expect( R.getc('mj').fresh ).toBe( false );
    expect( R.getc('mj').getValue() ).toBe( 200 );
    expect( R.getc('mj').computeCount ).toBe( 2 );
    expect( R.getc('mj').fresh ).toBe( true );
    
    R.getc('j').setValue(3);

    expect( R.getc('mj').computeCount ).toBe( 2 );
    expect( R.getc('mj').fresh ).toBe( false );
    expect( R.getc('mj').getValue() ).toBe( 300 );
    expect( R.getc('mj').computeCount ).toBe( 3 );
    expect( R.getc('mj').fresh ).toBe( true );
    
    R.getc('mj').setValue(400);

    expect( R.getc('mj').computeCount ).toBe( 3 );
    expect( R.getc('mj').fresh ).toBe( false );
    expect( R.getc('mj').getValue() ).toBe( 400 );
    expect( R.getc('mj').computeCount ).toBe( 4 );
    expect( R.getc('mj').fresh ).toBe( true );
    expect( R.getc('j').getValue() ).toBe( 4 );
});

