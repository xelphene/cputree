
'use strict';

const {tbuild, unwrap, tinsert, bexist, tinput} = require('../tbuild');

beforeEach(() => { global.console = require('console'); });

function getTree () {
    var A = tbuild();
    
    A.a = tinput.any(1);
    A.b = t => t.a + 1;
    
    return A;
}

test('handle_listen', () => 
{
    var lastChangedHandle;
    var lastSpoiledHandle;
    const listener = {
        handleValueChanged: handle => {
            //console.log(`handleValueChanged from ${handle.node.debugName}`);
            lastChangedHandle = handle;
        },
        handleValueSpoiled: handle => {
            //console.log(`handleValueSpoiled from ${handle.node.debugName}`);
            lastSpoiledHandle = handle;
        }
    };
    
    var T = unwrap(getTree());
    T.getc('b').handle.addChangeListener(listener)

    T.init({});
    //console.log('--- init complete ---');
    expect( lastChangedHandle ).toBe( T.getc('b').handle );

    T.rawObject.a = 2;
    expect( lastSpoiledHandle ).toBe( T.getc('b').handle );
    T.computeIfNeeded();
    expect( lastChangedHandle ).toBe( T.getc('b').handle );
});
