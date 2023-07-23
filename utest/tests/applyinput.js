
'use strict';

const {
    ObjNode, MapObjNode, ComputeNode, InputNode,
    parent, bmap, bfunc, inpn,
} = require('../../');
const {allOwnKeys} = require('../../util');

function test(t)
{
    var SYM = Symbol('SYM');
    
    var root = new ObjNode({});
    var p = root.getConProxy();
    
    p.n2 = inpn.number();
    p[SYM] = inpn.number();
    p.s = new ObjNode({});
    p.s.x = inpn.number();
    p.s[SYM] = inpn.number();
    
    var input1 = {
        n2: 1,
        [SYM]: 2,
        s: {
            x: 9,
            [SYM]: 8,
        }
    };
    var input2 = {
        n2: 11,
        [SYM]: 22,
        s: {
            x: 99,
            [SYM]: 88,
            junk: -1
        }
    };
    var input3 = {
        n2: 111,
        //[SYM]: 222,
        s: {
            //x: 999,
            [SYM]: 888,
            junk1: -1
        },
        junk2: -2
    };

    root.finalizeEntireTree();
    root.logStruct();
    
    var ui = root.applyInput(input1);

    t.callTrue( () => allOwnKeys(ui).length==0 );
    
    t.callEq( () => root.getProp('n2').value, 1 );
    t.callEq( () => root.getProp(SYM).value, 2 );
    t.callEq( () => root.getProp('s').getProp('x').value, 9 );
    t.callEq( () => root.getProp('s').getProp(SYM).value, 8 );


    ui = root.applyInput(input2);

    t.callEq( () => ui.s.junk, -1 );
    
    t.callEq( () => root.getProp('n2').value, 11 );
    t.callEq( () => root.getProp(SYM).value, 22 );
    t.callEq( () => root.getProp('s').getProp('x').value, 99 );
    t.callEq( () => root.getProp('s').getProp(SYM).value, 88 );


    ui = root.applyInput(input3);

    t.callEq( () => ui.s.junk1, -1 );
    t.callEq( () => ui.junk2, -2 );

    t.callEq( () => root.getProp('n2').value, 111 );
    t.callEq( () => root.getProp(SYM).value, 22 );
    t.callEq( () => root.getProp('s').getProp('x').value, 99 );
    t.callEq( () => root.getProp('s').getProp(SYM).value, 888 );
        
    root.logStruct();
}

function main () {
    const Tester = require('../tester').Tester;
    var t = new Tester();

    test(t);

    console.log('');
    console.log('='.repeat(40));
    console.log('test results:');
    t.logResults();
}

if( require.main === module ) {
    main();
}

