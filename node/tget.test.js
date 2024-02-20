
'use strict';

const {ObjNode} = require('../node/objnode');
const {TInputNode} = require('./tinput');
const {TGetNode} = require('./tget');

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
