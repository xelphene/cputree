
'use strict';

const {build, unwrap, input, nget, nset, predFunc} = require('../');

beforeEach(() => { global.console = require('console'); });

function getWidthBranch(unit) {
    var T = build();
    
    T.input = input.any();

    T.value[nget] = t => {
        if( t.input===undefined )
            return t.default;
        else
            return t.input;
    }
    T.value[nset] = (t, value) => {
        if( typeof(value) != 'number' )
            throw new Error(`number required, not ${typeof(value)}`);
        if( value <= 0 )
            throw new Error(`number > 0 required, not ${value}`);
        t.input = value;    
    }

    T.default = predFunc(unit, {
        in: t => 0.375,
        cm: t => 1
    })
    
    T.inc = predFunc(unit, {
        in: t => () => { t.value = t.value + 0.125 },
        cm: t => () => { t.value = t.value + 0.1 }
    });

    T.dec = predFunc(unit, {
        in: t => () => {
            if( t.value > 0.125 )
                t.value = t.value - 0.125
        },
        cm: t => () => {
            if( t.value > 0.1 )
                t.value = t.value - 0.1
        }
    });

    return unwrap(T);
}

test('basic', () => {
    var T = build();
    T.unit = input.string();
    T.width = getWidthBranch( T.unit );
    T.p = () => 10;
    T.q = t => t.p + t.width.value;
    
    T = unwrap(T);
    T.init({unit: 'in'});
    var t = T.rawObject;
    
    expect( t.q ).toBe( 10.375 );
    t.width.inc();
    expect( t.q ).toBe( 10.5 );
    t.width.dec();
    t.width.dec();
    t.width.dec();
    expect( t.q ).toBe( 10.125 );
    t.width.dec();
    expect( t.q ).toBe( 10.125 );

    t.unit = 'cm';
    t.width.inc();
    expect( t.q ).toBe( 10.225 );    
});
