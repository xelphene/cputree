
'use strict';

const {
    constructorize, input, subobj, CTL, PROXY, reflectParent
} = require('../../');


function getA1Proxy(o) {
    var handler = {
        get: function(obj,prop) {
            
            if( prop===PROXY ) return { getProxy: getA1Proxy };
            
            var value = obj[prop];
            if( typeof(value)=='number' ) {
                return value+1;
            } else if( typeof(value)=='object' && CTL in value ) {
                return getA1Proxy(value);
            } else {
                return Reflect.get(obj, prop);
            }
        }
    };
    return new Proxy(o, handler);
}

function getAXProxy(o, inc) {
    var handler = {
        get: function(obj,prop) {
            
            if( prop===PROXY ) return { getProxy: o => getAXProxy(o,inc) };
            
            var value = obj[prop];
            if( typeof(value)=='number' ) {
                return value+inc;
            } else if( typeof(value)=='object' && CTL in value ) {
                return getAXProxy(value, inc);
            } else {
                return Reflect.get(obj, prop);
            }
        }
    };
    return new Proxy(o, handler);
}

//////////////////////////////////////////////////////////

var FrontSideUpper = {
    _front: input(),
    incAmountI: input(),
    incAmount: function ()   {
        if( this.incAmountI === undefined ) {
            return 1000 
        } else{
            return this.incAmountI;
        }
    },
    _front1:   function ()   { return getA1Proxy(this._front) },
    _frontAX: function ()    { return getAXProxy(this._front, this.incAmount) },
    fsuComputeX: function () {
        return this._front1.thingInFrontAbsXXX+1;
    },
    fsuComputeY: function () {
        //return this._front.otherFrontAbsYYY+1;
        return this._frontAX.otherFrontAbsYYY;
    },
};

var Products = {
    _front: input(),
    frontSideUpper:  subobj(FrontSideUpper,  {_front: '_front' }),
};

////////////////////////////////////////////////////////

var FrontAbstract = {
    x: input(),
    y: input(),
    thingInFrontAbsXXX: function () { return this.x*10 },
    otherFrontAbsYYY:   function () { return this.y*100 },
};

var Abstracts = {
    x: input(),
    y: input(),
    front: subobj(FrontAbstract, {reflectParent}),
};

var Root = {
    x: input(),
    y: input(),
    abstracts: subobj(Abstracts, {reflectParent}),
    products: subobj(Products, {
        _front: function () { return this.abstracts.front },  // ☉.[anon:☉.products._front](cpa)
    })
};

function test(t) {
    var RootC = constructorize(Root);
    var root = new RootC();

    //root[CTL].logStruct();
    
    root.x = 1;
    root.y = 2;
    
    t.callEq( () => root.products.frontSideUpper.fsuComputeX, 12 );
    t.callEq( () => root.products.frontSideUpper.fsuComputeY, 1200 );
    t.callEq( () => root.products.frontSideUpper[CTL].getProp('fsuComputeX').computeCount, 1 );
    t.callEq( () => root.products.frontSideUpper[CTL].getProp('fsuComputeY').computeCount, 1 );

    t.callEq( () => root.abstracts.front.thingInFrontAbsXXX, 10 );
    t.callEq( () => root.abstracts.front.otherFrontAbsYYY, 200 );
    t.callEq( () => root.abstracts.front[CTL].getProp('thingInFrontAbsXXX').computeCount, 1 );
    t.callEq( () => root.abstracts.front[CTL].getProp('otherFrontAbsYYY').computeCount, 1 );

    t.callEq( () => root.products.frontSideUpper[CTL].getProp('_front1').computeCount, 1 );
    t.callEq( () => root.products.frontSideUpper[CTL].getProp('_frontAX').computeCount, 1 );

    t.callEq(
        () => root.abstracts.front[CTL].getProp('thingInFrontAbsXXX').speakingToStr,
        '☉.products.frontSideUpper.fsuComputeX(cpu)'
    );
    t.callEq(
        () => root.abstracts.front[CTL].getProp('thingInFrontAbsXXX').hearingFromStr,
        '☉.abstracts.front.x(rin)'
    );

    t.callEq( 
        () => root.products.frontSideUpper[CTL].getProp('_frontAX').listenerNamesStr, 
        '☉.products.frontSideUpper.fsuComputeY(cpu)'
    );

    t.callEq( 
        () => root.products.frontSideUpper[CTL].getProp('_front').listenerNamesStr, 
        '☉.products.frontSideUpper._front1(cpu), ☉.products.frontSideUpper._frontAX(cpu)'
    );

    //////////////////////////////////////////

    root.y = 3;

    t.callEq( () => root.products.frontSideUpper.fsuComputeX, 12 );
    t.callEq( () => root.products.frontSideUpper.fsuComputeY, 1300 );
    t.callEq( () => root.products.frontSideUpper[CTL].getProp('fsuComputeX').computeCount, 1 );
    t.callEq( () => root.products.frontSideUpper[CTL].getProp('fsuComputeY').computeCount, 2 );
    
    t.callEq( () => root.abstracts.front.thingInFrontAbsXXX, 10 );
    t.callEq( () => root.abstracts.front.otherFrontAbsYYY, 300 );
    t.callEq( () => root.abstracts.front[CTL].getProp('thingInFrontAbsXXX').computeCount, 1 );
    t.callEq( () => root.abstracts.front[CTL].getProp('otherFrontAbsYYY').computeCount, 2 );

    t.callEq( () => root.products.frontSideUpper[CTL].getProp('_front1').computeCount, 1 );
    t.callEq( () => root.products.frontSideUpper[CTL].getProp('_frontAX').computeCount, 1 );

    t.callEq(
        () => root.abstracts.front[CTL].getProp('thingInFrontAbsXXX').speakingToStr,
        '☉.products.frontSideUpper.fsuComputeX(cpu)'
    );
    t.callEq(
        () => root.abstracts.front[CTL].getProp('thingInFrontAbsXXX').hearingFromStr,
        '☉.abstracts.front.x(rin)'
    );

    t.callEq( 
        () => root.products.frontSideUpper[CTL].getProp('_frontAX').listenerNamesStr, 
        '☉.products.frontSideUpper.fsuComputeY(cpu)'
    );

    t.callEq( 
        () => root.products.frontSideUpper[CTL].getProp('_front').listenerNamesStr, 
        '☉.products.frontSideUpper._front1(cpu), ☉.products.frontSideUpper._frontAX(cpu)'
    );

    ////////////////////////////

    root.products.frontSideUpper.incAmountI = 2000;

    t.callEq( () => root.products.frontSideUpper.fsuComputeX, 12 );
    t.callEq( () => root.products.frontSideUpper.fsuComputeY, 2300 );
    t.callEq( () => root.products.frontSideUpper[CTL].getProp('fsuComputeX').computeCount, 1 );
    t.callEq( () => root.products.frontSideUpper[CTL].getProp('fsuComputeY').computeCount, 3 );
    t.callEq( () => root.products.frontSideUpper[CTL].getProp('_front1').computeCount, 1 );
    t.callEq( () => root.products.frontSideUpper[CTL].getProp('_frontAX').computeCount, 2 );

    t.callEq(
        () => root.abstracts.front[CTL].getProp('thingInFrontAbsXXX').speakingToStr,
        '☉.products.frontSideUpper.fsuComputeX(cpu)'
    );
    t.callEq(
        () => root.abstracts.front[CTL].getProp('thingInFrontAbsXXX').hearingFromStr,
        '☉.abstracts.front.x(rin)'
    );

    t.callEq( 
        () => root.products.frontSideUpper[CTL].getProp('_frontAX').listenerNamesStr, 
        '☉.products.frontSideUpper.fsuComputeY(cpu)'
    );

    t.callEq( 
        () => root.products.frontSideUpper[CTL].getProp('_front').listenerNamesStr, 
        '☉.products.frontSideUpper._front1(cpu), ☉.products.frontSideUpper._frontAX(cpu)'
    );

    t.callEq(
        () => root.products.frontSideUpper[CTL].getProp('_front').hearingFromStr,
        '☉.products._front(rin)'
    );
    t.callEq(
        () => root.products.frontSideUpper[CTL].getProp('_front').speakingToStr,
        '☉.products.frontSideUpper._front1(cpu), ☉.products.frontSideUpper._frontAX(cpu)'
    );
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
