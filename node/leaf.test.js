
'use strict';

const {ObjNode, TInputNode, TGetNode} = require('./');

beforeEach(() => { global.console = require('console'); });

test('replace', () =>
{
    var handlesHeardFrom = [];
    var nodesHeardFrom = [];
    const listener = {
        handleValueChanged: handle => {
            handlesHeardFrom.push(handle);
            nodesHeardFrom.push(handle.node);
        },
        handleValueSpoiled: handle => {
            handlesHeardFrom.push(handle);
            nodesHeardFrom.push(handle.node);
        },
    };

    var root = new ObjNode({});
    root.addc( 'n', new TInputNode({defaultValue:1}) );
    const n1 = root.getc('n');
    const h1 = root.getc('n').handle;
    n1.handle.addChangeListener(listener);
    
    root.getc('n').replace( new TGetNode({
        bindings: [],
        getFunc:  () => 2
    }));
    const n2 = root.getc('n');
    const h2 = root.getc('n').handle;
    n2.handle.addChangeListener(listener);
    
    root.getc('n').replace( new TGetNode({
        bindings: [],
        getFunc:  () => 3
    }));
    const n3 = root.getc('n');
    const h3 = root.getc('n').handle;
    n3.handle.addChangeListener(listener);
    
    root.init({});
    //root.logDebug();
    expect( root.getc('n').getValue() ).toBe( 3 );

    expect( n1.isRoot ).toBe( true );
    expect( n2.isRoot ).toBe( true );
    expect( n3.isRoot ).toBe( false );
    
    expect( n1.handles.length ).toBe( 0 );
    expect( n2.handles.length ).toBe( 0 );
    expect( n3.handles.length ).toBe( 3 );
    
    expect( h1.node ).toBe( n3 );
    expect( h2.node ).toBe( n3 );
    expect( h3.node ).toBe( n3 );
    
    expect( nodesHeardFrom.length ).toBe( 3 );
    expect( nodesHeardFrom[0] ).toBe( n3 );
    expect( nodesHeardFrom[1] ).toBe( n3 );
    expect( nodesHeardFrom[2] ).toBe( n3 );

    expect( handlesHeardFrom.length ).toBe( 3 );
    for( let h of handlesHeardFrom )
        expect( h===h1 || h===h2 || h===h3 ).toBe( true );
});
