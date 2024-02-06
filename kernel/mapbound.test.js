
'use strict';

const {ObjNode} = require('../node/objnode');
const {TNode} = require('../node/tnode');
const {InputKernel} = require('./input');
const {GetKernel} = require('./get');
const {GetSetKernel} = require('./getset');
const {MapBoundKernel} = require('./mapbound.js');

var R;

beforeEach( () => {
    R = new ObjNode({});

    R.addc('i', new TNode( new InputKernel({defaultValue: 1}) ) );
    R.addc('j', new TNode( new InputKernel({defaultValue: 2}) ) );
    
    R.addc('mul', new TNode( new InputKernel({defaultValue: 10}) ) );
    
    R.addc('c', new TNode( new GetKernel({
        bindings: [R],
        getFunc: t => t.i + t.j,
    })));
});

test('bind_obj_src_cpu', () =>
{
    R.addc('mc', new TNode( new MapBoundKernel({
        bindings:   [R],
        mapGetFunc: (t, v) => v * t.mul,
        mapSetFunc: (t, v) => v / t.mul,
        srcNode:    R.getc('c')
    }) ));

    R.init({});
    
    expect( R.getc('mc').kernel.computeCount ).toBe( 1 );
    expect( R.getc('mc').kernel.fresh ).toBe( true );
    expect( R.getc('mc').getValue() ).toBe( 30 );
    expect( R.getc('mc').settable ).toBe( false );

    R.getc('mul').setValue(100);

    expect( R.getc('mc').kernel.computeCount ).toBe( 1 );
    expect( R.getc('mc').kernel.fresh ).toBe( false );
    expect( R.getc('mc').getValue() ).toBe( 300 );
    expect( R.getc('mc').kernel.computeCount ).toBe( 2 );
    expect( R.getc('mc').kernel.fresh ).toBe( true );
    
    R.getc('j').setValue(3);

    expect( R.getc('mc').kernel.computeCount ).toBe( 2 );
    expect( R.getc('mc').kernel.fresh ).toBe( false );
    expect( R.getc('mc').getValue() ).toBe( 400 );
    expect( R.getc('mc').kernel.computeCount ).toBe( 3 );
    expect( R.getc('mc').kernel.fresh ).toBe( true );
});

test('bind_leaf_src_cpu', () =>
{
    R.addc('mc', new TNode( new MapBoundKernel({
        bindings:   [R.getc('mul')],
        mapGetFunc: (mul, v) => v * mul,
        mapSetFunc: (mul, v) => v / mul,
        srcNode:    R.getc('c')
    }) ));

    R.init({});
    
    expect( R.getc('mc').kernel.computeCount ).toBe( 1 );
    expect( R.getc('mc').kernel.fresh ).toBe( true );
    expect( R.getc('mc').getValue() ).toBe( 30 );
    expect( R.getc('mc').settable ).toBe( false );

    R.getc('mul').setValue(100);

    expect( R.getc('mc').kernel.computeCount ).toBe( 1 );
    expect( R.getc('mc').kernel.fresh ).toBe( false );
    expect( R.getc('mc').getValue() ).toBe( 300 );
    expect( R.getc('mc').kernel.computeCount ).toBe( 2 );
    expect( R.getc('mc').kernel.fresh ).toBe( true );
    
    R.getc('j').setValue(3);

    expect( R.getc('mc').kernel.computeCount ).toBe( 2 );
    expect( R.getc('mc').kernel.fresh ).toBe( false );
    expect( R.getc('mc').getValue() ).toBe( 400 );
    expect( R.getc('mc').kernel.computeCount ).toBe( 3 );
    expect( R.getc('mc').kernel.fresh ).toBe( true );
});

test('bind_obj_src_inp', () =>
{
    R.addc('mj', new TNode( new MapBoundKernel({
        bindings:   [R],
        mapGetFunc: (t, v) => v * t.mul,
        mapSetFunc: (t, v) => v / t.mul,
        srcNode:    R.getc('j')
    }) ));

    R.init({});
    
    expect( R.getc('mj').kernel.computeCount ).toBe( 1 );
    expect( R.getc('mj').kernel.fresh ).toBe( true );
    expect( R.getc('mj').getValue() ).toBe( 20 );
    expect( R.getc('mj').settable ).toBe( true );

    R.getc('mul').setValue(100);

    expect( R.getc('mj').kernel.computeCount ).toBe( 1 );
    expect( R.getc('mj').kernel.fresh ).toBe( false );
    expect( R.getc('mj').getValue() ).toBe( 200 );
    expect( R.getc('mj').kernel.computeCount ).toBe( 2 );
    expect( R.getc('mj').kernel.fresh ).toBe( true );
    
    R.getc('j').setValue(3);

    expect( R.getc('mj').kernel.computeCount ).toBe( 2 );
    expect( R.getc('mj').kernel.fresh ).toBe( false );
    expect( R.getc('mj').getValue() ).toBe( 300 );
    expect( R.getc('mj').kernel.computeCount ).toBe( 3 );
    expect( R.getc('mj').kernel.fresh ).toBe( true );
    
    R.getc('mj').setValue(400);

    expect( R.getc('mj').kernel.computeCount ).toBe( 3 );
    expect( R.getc('mj').kernel.fresh ).toBe( false );
    expect( R.getc('mj').getValue() ).toBe( 400 );
    expect( R.getc('mj').kernel.computeCount ).toBe( 4 );
    expect( R.getc('mj').kernel.fresh ).toBe( true );
    expect( R.getc('j').getValue() ).toBe( 4 );
});

test('bind_leaf_src_inp', () =>
{
    R.addc('mj', new TNode( new MapBoundKernel({
        bindings:   [R.getc('mul')],
        mapGetFunc: (mul, v) => v * mul,
        mapSetFunc: (mul, v) => v / mul,
        srcNode:    R.getc('j')
    }) ));

    R.init({});
    
    expect( R.getc('mj').kernel.computeCount ).toBe( 1 );
    expect( R.getc('mj').kernel.fresh ).toBe( true );
    expect( R.getc('mj').getValue() ).toBe( 20 );
    expect( R.getc('mj').settable ).toBe( true );

    R.getc('mul').setValue(100);

    expect( R.getc('mj').kernel.computeCount ).toBe( 1 );
    expect( R.getc('mj').kernel.fresh ).toBe( false );
    expect( R.getc('mj').getValue() ).toBe( 200 );
    expect( R.getc('mj').kernel.computeCount ).toBe( 2 );
    expect( R.getc('mj').kernel.fresh ).toBe( true );
    
    R.getc('j').setValue(3);

    expect( R.getc('mj').kernel.computeCount ).toBe( 2 );
    expect( R.getc('mj').kernel.fresh ).toBe( false );
    expect( R.getc('mj').getValue() ).toBe( 300 );
    expect( R.getc('mj').kernel.computeCount ).toBe( 3 );
    expect( R.getc('mj').kernel.fresh ).toBe( true );
    
    R.getc('mj').setValue(400);

    expect( R.getc('mj').kernel.computeCount ).toBe( 3 );
    expect( R.getc('mj').kernel.fresh ).toBe( false );
    expect( R.getc('mj').getValue() ).toBe( 400 );
    expect( R.getc('mj').kernel.computeCount ).toBe( 4 );
    expect( R.getc('mj').kernel.fresh ).toBe( true );
    expect( R.getc('j').getValue() ).toBe( 4 );
});

