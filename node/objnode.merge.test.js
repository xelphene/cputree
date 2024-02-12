
'use strict';

const {tbuild, unwrap, tinsert, bexist, tinput} = require('../tbuild');

beforeEach(() => {
    global.console = require('console');
});

function getTreeA () {
    var A = tbuild();
    
    A.k = tinput.any('A.k');
    A.l = t => 'A.l';
    
    A.v = tinput.number('A.v');
    A.v_dep = t => t.v + ' + A.v_dep'
    
    A.s.a = t => t.v + ' + A.s.a';
    A.s.b = tinput.any('A.s.b');

    A.a_only_k = t => t.k + ' + a_only';
    A.a_only_l = t => t.l + ' + a_only';
    
    return A;
}

test('merge_tnodes_get_input', () =>
{
    var B = tbuild();
    
    B.k = t => 'B.k';
    B.l = tinput.any('B.l');
    
    B.v = tinput.any('B.v');

    B.s.a = tinput.any('B.s.a');
    B.s.b = t => t.v + ' + B.s.B';

    B.b_only_k = t => t.k + ' + b_only';
    B.b_only_l = t => t.l + ' + b_only';

    
    const A = unwrap(getTreeA());
    B = unwrap(B);

    const nodeRefs = {
        A: {
            k: A.getc('k'),
            l: A.getc('l'),
        },
        B: {
            k: B.getc('k'),
            l: B.getc('l'),
        }
    };
    
    B.merge( A );
    B.init({});
    
    //B.logDebug();

    expect( B.nav('s.b').getValue()      ).toBe( 'B.v + B.s.B' )
    expect( B.nav('s.a').getValue()      ).toBe( 'B.v + A.s.a' )
    expect( B.nav('k').getValue()        ).toBe( 'B.k' )
    expect( B.nav('v').getValue()        ).toBe( 'B.v' )
    expect( B.nav('b_only_k').getValue() ).toBe( 'B.k + b_only' )
    expect( B.nav('b_only_l').getValue() ).toBe( 'A.l + b_only' )
    expect( B.nav('l').getValue()        ).toBe( 'A.l' )
    expect( B.nav('v_dep').getValue()    ).toBe( 'B.v + A.v_dep' )
    expect( B.nav('a_only_k').getValue() ).toBe( 'B.k + a_only' )
    expect( B.nav('a_only_l').getValue() ).toBe( 'A.l + a_only' )

    //console.log('='.repeat(80));
    B.nav('v').setValue('new_v');
    B.computeIfNeeded();
    
    expect( B.nav('s.b').getValue()      ).toBe( 'new_v + B.s.B' )
    expect( B.nav('s.a').getValue()      ).toBe( 'new_v + A.s.a' )
    expect( B.nav('v').getValue()        ).toBe( 'new_v' )
    expect( B.nav('v_dep').getValue()    ).toBe( 'new_v + A.v_dep' )
    
    console.log( nodeRefs.A.k.isRoot );
    console.log( nodeRefs.A.k.kernel );
    
    console.log( nodeRefs.A.l.parent === B ); // true
    //B.logDebug();
    
});
