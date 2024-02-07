
'use strict';

exports.number = (node, value) => {
    if( typeof(value)=='number' )
        return [true, ''];
    else if( typeof(value)=='string' && !isNaN(Number(value)) )
        return [true, '', Number(value)];
    else {
        return [false, `number required; got ${typeof(value)}`];
    }
};

exports.numberOrUndef = (node, value) => {
    if( value===undefined )
        return [true,''];
    
    if( typeof(value)=='number' ) {
        return [true, ''];
    } else {
        return [false, `number or undefined required; got ${typeof(value)}`];
    }
};

exports.string = (node, value) => {
    if( typeof(value)=='string' ) {
        return [true, ''];
    } else {
        return [false, `string required; got type ${typeof(value)}`];
    }
};

exports.stringOrUndef = (node, value) => {
    if( value===undefined )
        return [true,''];
    if( typeof(value)=='string' ) {
        return [true, ''];
    } else {
        return [false, `string required; got type ${typeof(value)}`];
    }
};

exports.boolean = (node, value) => {
    if( typeof(value)=='boolean' ) {
        return [true, ''];
    } else {
        return [false, `boolean required; got type ${typeof(value)}`];
    }
};
exports.booleanOrUndef = (node, value) => {
    if( value===undefined )
        return [true,''];
    if( typeof(value)=='boolean' ) {
        return [true, ''];
    } else {
        return [false, `boolean required; got type ${typeof(value)}`];
    }
};

exports.any = (node, value) => [true,''];
