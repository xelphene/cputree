
'use strict';

const {C, N, O, ObjNode, InputNode, inpn, excOriginNode, errors} = require('../../');

test('NavError exception thrown and have no extraneous props', () => 
{
    var root = new ObjNode({});
    var exc;

    try {
        root.init({});
        root.nav('x.y.z');
    } catch(e) {
        exc=e;
    }
    
    expect( exc ).toBeInstanceOf( errors.NavError );
    expect( Object.keys({...exc}) ).toHaveLength( 0 );
});


test('InputValidationError thrown and have no extraneous props', () =>
{
    var root = new ObjNode({});
    var exc;
    var P = root[C];

    P.x.y = inpn.number();
    P.x.f = function () {
        return this.y + 2;
    }

    try {
        root.init({});
    } catch(e) {
        exc=e;
    }
    
    expect( exc ).toBeInstanceOf( errors.InputValidationError );
    expect( Object.keys({...exc}) ).toHaveLength( 0 );
});


test('Errors thrown from compute funcs have correct excOriginNode', () =>
{
    var root = new ObjNode({});
    var exc;
    var P = root[C];

    P.x.fail = function () {
        return this.nestedFail + 100;
    }
    P.x.nestedFail = function () {
        throw new Error('blah');
    }

    try {
        root.init({});
    } catch(e) {
        exc=e;
    }
    
    expect( exc ).toBeInstanceOf( Error );
    expect( exc[excOriginNode] ).toBe( root.nav('x.nestedFail') );
});
