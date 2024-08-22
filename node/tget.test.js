
'use strict';

const {ObjNode} = require('../node/objnode');
const {TInputNode} = require('./tinput');
const {TGetNode} = require('./tget');
const {nodeOf} = require('../util');

var R;

beforeEach(() => {
    global.console = require('console');
});

beforeEach( () => {
    R = new ObjNode({});
});

test('bind_leaf', () => {
    R.addc('i', new TInputNode({defaultValue: 1}) );
    R.addc('j', new TInputNode({defaultValue: 100}) );
    R.addc('c', new TGetNode({
        bindings: [R.getc('i')],
        getFunc: i => i+1
    }));
    
    R.init({});
    rest();
});

test('bind_obj', () => {
    R.addc('i', new TInputNode({defaultValue: 1}) );
    R.addc('j', new TInputNode({defaultValue: 100}) );
    R.addc('c', new TGetNode({
        bindings: [R],
        getFunc: t => t.i + 1
    }));
    
    R.init({});
    rest();
});

function rest() {
    expect( R.getc('c').fresh ).toBe( true );
    expect( R.getc('c').getValue() ).toBe( 2 );
    expect( R.getc('c').fresh ).toBe( true );
    expect( R.getc('c').computeCount ).toBe( 1 );
    
    R.getc('i').setValue(10);
    expect( R.getc('c').fresh ).toBe( false );
    expect( R.getc('c').getValue() ).toBe( 11 );
    expect( R.getc('c').computeCount ).toBe( 2 );
    expect( R.getc('c').fresh ).toBe( true );

    expect( R.getc('c').getValue() ).toBe( 11 );
    expect( R.getc('c').computeCount ).toBe( 2 );

    R.getc('j').setValue(200);
    expect( R.getc('c').getValue() ).toBe( 11 );
    expect( R.getc('c').computeCount ).toBe( 2 );
    
}

test('value_is_branch', () => {
    /*
    R.addBranch('s');
    R.nav('s').addc('a', new TGetNode({
        bindings: [],
        getFunc: () => 222
    }));
    R.nav('s').addBranch('s2');
    R.nav('s').addc('a', new TGetNode({
        bindings: [],
        getFunc: () => 222
    }));
    R.nav('s').addc('b', new TInputNode({defaultValue: 0}) );
    R.nav('s.s2').addc('c', new TGetNode({
        bindings: [],
        getFunc: () => 0.1
    }));
    */
    R.addp('s.a', new TGetNode({
        getFunc: () => 222
    }));
    R.addp('s.b', new TInputNode({defaultValue: 0}) );
    R.addp('s.s2.c', new TGetNode({
        getFunc: () => 0.1
    }));
    
    R.addp('r', new TGetNode({
        bindings: [R],
        getFunc:  t => t.s
    }));
    
    R.addp('p.x', new TGetNode({
        bindings: [R],
        getFunc:  t => t.r.a + t.r.b
    }));
    R.addp('p.y', new TGetNode({
        bindings: [R],
        getFunc:  t => t.r.a + t.r.b + t.r.s2.c
    }));

    R.init({ s: { b: 10 }});
    
    //R.logDebug();
    
    expect( R.nav('p.x').value ).toBe( 232 );
    expect( R.nav('p.y').value ).toBe( 232.1 );

    expect( R.nav('p.x').isListeningTo( R.nav('s.a') ) ).toBe( true );
    expect( R.nav('p.x').isListeningTo( R.nav('s.b') ) ).toBe( true );
    expect( R.nav('p.x').isListeningTo( R.nav('s.s2.c') ) ). toBe( false );
    expect( R.nav('p.x').isListeningTo( R.nav('r') ) ).toBe( false );
    expect( R.nav('p.x').isListeningTo( R.nav('s') ) ).toBe( false );

    expect( R.nav('p.y').isListeningTo( R.nav('s.a') ) ).toBe( true );
    expect( R.nav('p.y').isListeningTo( R.nav('s.b') ) ).toBe( true );
    expect( R.nav('p.y').isListeningTo( R.nav('s.s2.c') ) ). toBe( true );
    expect( R.nav('p.y').isListeningTo( R.nav('r') ) ).toBe( false );
    expect( R.nav('p.y').isListeningTo( R.nav('s') ) ).toBe( false );
});

test('nodeof', () => {
    R.addc('o', new TGetNode({
        bindings: [],
        getFunc:  () => { return {x:222} }
    }));
    R.init();
    expect( nodeOf(R.nav('o').value) ).toBe( R.nav('o') );
});
