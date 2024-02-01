
'use strict';

const {ObjNode, makeNode} = require('../');

var R;

beforeEach( () => {
    R = new ObjNode({});
    //R.addc('i', new TNode( new InputKernel(0.1)  ));
    R.addc('i', makeNode('Input', 1) );
    R.addc('j', makeNode('Input', 2)  );
    R.addc('c', makeNode('Get', 
        [R.getc('i'), R.getc('j')], (i,j) => (i+j) * 10
    ));
    
    R.init();
});

test('input', () => {
    
    expect( R.nav('i').value ).toBe( 1 );
    expect( R.nav('c').value ).toBe( 30 );
    
});
