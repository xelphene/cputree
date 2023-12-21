
'use strict';

const {C, N, O, ObjNode, InputNode, GetSetNode, inpn, parent, errors} = require('../../');

var root;

beforeEach( () => {
    root = new ObjNode({});
    root.add('a', inpn.number());
});

test('normal', () => {
    root.init({ a:1 });
    expect( root.nav('a').value ).toBe( 1 );
});

test('convert', () => {
    root.init({ a:'1' });
    expect( root.nav('a').value ).toBe( 1 );
});

test('undefined default fail exception class', () => {
    expect( () => root.init() ).toThrow( errors.InputValidationError );
});

test('undefined default fail exception string', () => {
    expect( () => root.init() ).toThrow( 'failure initializing ☉.a to undefined (the default):' );
});

