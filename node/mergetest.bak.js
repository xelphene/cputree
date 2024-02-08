
'use strict';

const {tbuild, unwrap, tinsert, bexist, tinput} = require('../tbuild');

beforeEach(() => {
    global.console = require('console');
});

function getTreeA () {
    var T = tbuild();
    
    T.a = tinput.any(101);
    T.b = t => t.v + 10;
    T.v = tinput.number(102);
    T.s.a = t => t.v + 100;
    T.s.b = tinput.any(1000);
    T.a_only_b = t => -t.b;
    T.a_only_a = t => -t.a;
    
    return T;
}

test('merge_tnodes_get_input', () =>
{
    var T = tbuild();
    
    T.a = t => 201;
    T.b = tinput.any(212);
    T.v = tinput.any(202);
    T.s.a = tinput.any(200);
    T.s.b = t => t.v + 10;
    
    unwrap(T).merge( unwrap(getTreeA())  ); // TODO: build into merge
    T = unwrap(T);
    T.init({});
    
    expect( T.nav('s.b').getValue() ).toBe( 212 );
    expect( T.nav('s.a').getValue() ).toBe( 302 );
    expect( T.nav('a').getValue()   ).toBe( 201 );
    expect( T.nav('v').getValue()   ).toBe( 202 );
    expect( T.nav('b').getValue()   ).toBe( 212 );
    expect( T.nav('a_only_b').getValue() ).toBe( -212 );
    expect( T.nav('a_only_a').getValue() ).toBe( -201 );
    
    T.logDebug();
    console.log('='.repeat(80));
    
    T.nav('v').setValue(2002);
    T.computeIfNeeded();

    expect( T.nav('s.b').getValue() ).toBe( 2012 );
    expect( T.nav('s.a').getValue() ).toBe( 2102 );
    expect( T.nav('a').getValue()   ).toBe( 201 );
    expect( T.nav('v').getValue()   ).toBe( 2002 );
    expect( T.nav('b').getValue()   ).toBe( 2012 );

    T.logDebug();
    
});
