
'use strict';

const {ObjNode} = require('../node/objnode');
const {TInputNode} = require('./tinput');
const validate = require('../validate');

var R;

beforeEach( () => {
    R = new ObjNode({});
});

test('bad_default', () => {
    R.addc('i', new TInputNode({
        defaultValue: 'x',
        validate: validate.number
    }));
    
    //R.init({});
    expect( () => R.init({}) ).toThrow( 'failure initializing ☉.i to x (the default)' );
});

test('bad_init', () => {
    R.addc('i', new TInputNode({
        defaultValue: 1,
        validate: validate.number
    }));
    
    expect( () => R.init({i:'x'}) ).toThrow( 'failure initializing ☉.i to x (specified)' );
});

test('bad_assign', () => {
    R.addc('i', new TInputNode({
        defaultValue: 1,
        validate: validate.number
    }));
    R.init({});
    R.getc('i').getValue();
    expect( () => R.getc('i').setValue('x') ).toThrow( 'failure setting ☉.i to x:' );
});

test('validate_cast', () => {
    R.addc('i', new TInputNode({
        defaultValue: '1',
        validate: validate.number
    }));
    R.init({});
    expect( R.getc('i').getValue() ).toBe(1);
});
