
'use strict';

const {ObjNode, InputNode, GetSetNode, errors} = require('../../');

var root;
var o;

beforeEach( () =>
{
    root = new ObjNode({});
    root.add('c', new GetSetNode({ getter: () => -9 }));
    root.add('i', new InputNode({}));
    root.add('g', new GetSetNode({
        getter: function() {
            return this.i+1
        }
    }));
    root.add('h', new GetSetNode({
        getter: function () {
            return this.i + this.g;
        },
        setter: function (v) {
            this.i = v+1;
        }
    }));
    
    root.init({i: 100});
    o = root.rawObject;
});

test('basic', () => {
    expect( o.i ).toBe( 100 );
    expect( o.c ).toBe( -9 );
    expect( o.g ).toBe( 101 );
    expect( o.h ).toBe( 201 );
});

test('exceptions', () => {
    expect( () => o.g=3 ).toThrow( TypeError );
    expect( () => root.nav('g').setValue(4) ).toThrow( errors.NoSetterError );
});

test('set', () => {
    o.h = 8;
    expect( o.i ).toBe( 9 );
    expect( o.c ).toBe( -9 );
    expect( o.g ).toBe( 10 );
    expect( o.h ).toBe( 19 );
    
});

test('deps', () =>
{
    expect( root.nav('h').computeCount ).toBe(1);
    expect( root.nav('g').computeCount ).toBe(1);

    o.h = 8;
    root.computeIfNeeded();
    
    expect( root.nav('g').isListeningTo( root.nav('i') ) ).toBe(true);
    expect( root.nav('g').isListeningTo( root.nav('h') ) ).toBe(false);
    expect( root.nav('g').isListeningTo( root.nav('c') ) ).toBe(false);

    expect( root.nav('h').isListeningTo( root.nav('i') ) ).toBe(true);
    expect( root.nav('h').isListeningTo( root.nav('g') ) ).toBe(true);
    expect( root.nav('h').isListeningTo( root.nav('c') ) ).toBe(false);
    
    expect( root.nav('h').computeCount ).toBe(2);
    expect( root.nav('g').computeCount ).toBe(2);
});
