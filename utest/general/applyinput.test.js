
'use strict';

const {
    ObjNode, MapObjNode, ComputeNode, InputNode,
    parent, bmap, bfunc, inpn,
} = require('../../');
const {allOwnKeys} = require('../../util');

const SYM = Symbol('SYM');
var root;
const input1 = {
    n2: 1,
    [SYM]: 2,
    s: {
        x: 9,
        [SYM]: 8,
    }
};
const input2 = {
    n2: 11,
    [SYM]: 22,
    s: {
        x: 99,
        [SYM]: 88,
        junk: -1
    }
};
const input3 = {
    n2: 111,
    //[SYM]: 222,
    s: {
        //x: 999,
        [SYM]: 888,
        junk1: -1
    },
    junk2: -2
};

beforeEach( () => {
    root = new ObjNode({});
    var p = root.getConProxy();
    
    p.n2 = inpn.numberOrUndef();
    p[SYM] = inpn.numberOrUndef();
    p.s = new ObjNode({});
    p.s.x = inpn.numberOrUndef();
    p.s[SYM] = inpn.numberOrUndef();
    

    //root.finalizeEntireTree();
    root.init();
    //root.logStruct();
});

test('initial', () => {
    var ui = root.applyInput(input1);

    expect( allOwnKeys(ui).length ).toBe( 0 );
    
    expect( root.getProp('n2').value ).toBe( 1 );
    expect( root.getProp(SYM).value ).toBe( 2 );
    expect( root.getProp('s').getProp('x').value ).toBe( 9 );
    expect( root.getProp('s').getProp(SYM).value ).toBe( 8 );
});

test('round 2', () => {
    root.applyInput(input1);
    var ui = root.applyInput(input2);

    expect( ui.s.junk ).toBe( -1 );
    
    expect( root.getProp('n2').value ).toBe( 11 );
    expect( root.getProp(SYM).value ).toBe( 22 );
    expect( root.getProp('s').getProp('x').value ).toBe( 99 );
    expect( root.getProp('s').getProp(SYM).value ).toBe( 88 );
});

test('round 3', () => {
    root.applyInput(input1);
    root.applyInput(input2);
    var ui = root.applyInput(input3);

    expect( ui.s.junk1 ).toBe( -1 );
    expect( ui.junk2 ).toBe( -2 );

    expect( root.getProp('n2').value ).toBe( 111 );
    expect( root.getProp(SYM).value ).toBe( 22 );
    expect( root.getProp('s').getProp('x').value ).toBe( 99 );
    expect( root.getProp('s').getProp(SYM).value ).toBe( 888 );
        
    //root.logStruct();
});

