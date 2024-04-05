
'use strict';

const {ObjNode} = require('./objnode');
const {TInputNode} = require('./tinput');
const {TGetSetNode} = require('./tgetset');

beforeEach(() => { global.console = require('console'); });

var R;

beforeEach( () => {
    R = new ObjNode({});
});

test('bind_obj', () => {
    R.addc('i', new TInputNode({defaultValue: 1}) );
    R.addc('j', new TInputNode({defaultValue: 100}) );
    R.addc('c', new TGetSetNode({
        bindings: [R],
        getFunc: t => t.i * 10,
        setFunc: (t,v) => {
            //console.log(`in c setFunc. v=${v}. t.i=${t.i}`);
            t.i = v / 10
        }
    }));

    R.init({});
    R.computeIfNeeded();

    expect( R.getc('c').fresh ).toBe( true );
    expect( R.getc('c').computeCount ).toBe( 1 );
    expect( R.getc('c').getValue() ).toBe(10);
    expect( R.getc('c').computeCount ).toBe( 1 );
        
    R.getc('c').setValue(20);

    //R.logDebug();
    
    expect( R.getc('c').fresh ).toBe( false );
    expect( R.getc('c').computeCount ).toBe( 1 );
    expect( R.getc('i').getValue() ).toBe( 2 );

    expect( R.getc('c').getValue() ).toBe( 20 );
    expect( R.getc('c').fresh ).toBe( true );
    expect( R.getc('c').computeCount ).toBe( 2 );
    
    //rest();
});

test('bind_multi', () => {
    R.addc('i', new TInputNode({defaultValue: 1}) );
    R.addc('j', new TInputNode({defaultValue: 10}) );
    R.addc('c', new TGetSetNode({
        bindings: [R, R.getc('j')],
        getFunc: (t,j) => t.i * t.j,
        setFunc: (t,j,v) => { t.i = v /t.j }
    }));

    R.init({});
    
    expect( R.getc('c').fresh ).toBe( true );
    expect( R.getc('c').computeCount ).toBe( 1 );
    expect( R.getc('c').getValue() ).toBe(10);
    expect( R.getc('c').computeCount ).toBe( 1 );
    
    R.getc('c').setValue(20);
    
    expect( R.getc('c').fresh ).toBe( false );
    expect( R.getc('c').computeCount ).toBe( 1 );
    expect( R.getc('i').getValue() ).toBe( 2 );
    expect( R.getc('c').getValue() ).toBe( 20 );
    expect( R.getc('c').fresh ).toBe( true );
    expect( R.getc('c').computeCount ).toBe( 2 );

    R.getc('j').setValue(100);
    R.getc('c').setValue(300);
    
    expect( R.getc('c').fresh ).toBe( false );
    expect( R.getc('c').computeCount ).toBe( 2 );
    expect( R.getc('i').getValue() ).toBe( 3 );
    expect( R.getc('c').getValue() ).toBe( 300 );
    expect( R.getc('c').fresh ).toBe( true );
    expect( R.getc('c').computeCount ).toBe( 3 );
});

test('bind_this', () => {
    R.addc('i', new TInputNode({defaultValue: 1}) );
    R.addc('j', new TInputNode({defaultValue: 10}) );
    R.addc('c', new TGetSetNode({
        bindings: [R],
        getFunc: function ()  { return this.i * this.j },
        setFunc: function (t,v) { this.i = v /this.j }
    }));

    R.init({});

    expect( R.getc('c').fresh ).toBe( true );
    expect( R.getc('c').computeCount ).toBe( 1 );
    expect( R.getc('c').getValue() ).toBe(10);
    expect( R.getc('c').computeCount ).toBe( 1 );
    
    R.getc('c').setValue(20);
    
    expect( R.getc('c').fresh ).toBe( false );
    expect( R.getc('c').computeCount ).toBe( 1 );
    expect( R.getc('i').getValue() ).toBe( 2 );
    expect( R.getc('c').getValue() ).toBe( 20 );
    expect( R.getc('c').fresh ).toBe( true );
    expect( R.getc('c').computeCount ).toBe( 2 );
    
});

test('chain_assign', () => {
    R.addc('i', new TInputNode({defaultValue: 1}) );
    R.addc('c', new TGetSetNode({
        bindings: [R],
        getFunc: function ()  { return this.i+1 },
        setFunc: function (t,v) { this.i = v-1 }
    }));
    R.addc('d', new TGetSetNode({
        bindings: [R],
        getFunc: function ()  { return this.c + 1 },
        setFunc: function (t,v) { this.c = v - 1 }
    }));

    R.init({});

    expect( R.getc('c').fresh ).toBe( true );
    expect( R.getc('c').computeCount ).toBe( 1 );
    expect( R.getc('c').getValue() ).toBe(2);
    expect( R.getc('c').computeCount ).toBe( 1 );

    expect( R.getc('d').fresh ).toBe( true );
    expect( R.getc('d').computeCount ).toBe( 1 );
    expect( R.getc('d').getValue() ).toBe( 3 );
    expect( R.getc('d').computeCount ).toBe( 1 );
    
    R.getc('d').setValue(10);

    expect( R.getc('i').getValue() ).toBe(8);

    expect( R.getc('c').getValue() ).toBe(9);
    expect( R.getc('d').getValue() ).toBe(10);
    expect( R.getc('c').computeCount ).toBe( 2 );
    expect( R.getc('d').computeCount ).toBe( 2 );
});
