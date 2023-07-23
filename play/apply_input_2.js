
'use strict';

const {ObjNode, inpdef} = require('../');

var SYM = Symbol('S');

function main() 
{
    var root = new ObjNode({});
    var p = root.getConProxy();
    
    p.n2 = inpdef.number();
    p[SYM] = inpdef.number();
    p.s = new ObjNode({});
    p.s.x = inpdef.number();
    p.s[SYM] = inpdef.number();
    
    
    var input = {
        n2: 111,
        [SYM]: 222,
        s: {
            x: 999,
            [SYM]: 888,
            //junk: -1
        }
    };

    root.finalizeEntireTree();
    root.logStruct();
    
    var ui = root.applyInput(input);
    console.log('--- unused:');
    console.log(ui);
    console.log('---');
    root.computeIfNeeded();
    
    console.log('');
    console.log(root.rawObject);
};

main();
