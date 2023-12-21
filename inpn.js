
'use strict';

const {InputNode} = require('./node/');

var inputValidators = {};

inputValidators.number = (node, value) => {
    if( typeof(value)=='number' )
        return [true, ''];
    else if( typeof(value)=='string' && !isNaN(Number(value)) )
        return [true, '', Number(value)];
    else {
        return [false, `number required; got ${typeof(value)}`];
    }
};

inputValidators.numberOrUndef = (node, value) => {
    if( value===undefined )
        return [true,''];
    
    if( typeof(value)=='number' ) {
        return [true, ''];
    } else {
        return [false, `number or undefined required; got ${typeof(value)}`];
    }
};

inputValidators.string = (node, value) => {
    if( typeof(value)=='string' ) {
        return [true, ''];
    } else {
        return [false, `string required; got type ${typeof(value)}`];
    }
};

inputValidators.boolean = (node, value) => {
    if( typeof(value)=='boolean' ) {
        return [true, ''];
    } else {
        return [false, `boolean required; got type ${typeof(value)}`];
    }
};

inputValidators.any = (node, value) => [true,''];

exports.number        = () => new InputNode({validate:inputValidators.number});
exports.numberOrUndef = () => new InputNode({validate:inputValidators.numberOrUndef});
exports.string        = () => new InputNode({validate:inputValidators.string});
exports.boolean       = () => new InputNode({validate:inputValidators.boolean});
exports.any           = () => new InputNode({validate:inputValidators.any});
