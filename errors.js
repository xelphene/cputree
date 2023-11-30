
'use strict';

class MapComputeError extends Error {
    constructor(mapNode, error) {
        var msg = `Exception in map node at ${mapNode.fullName} with source ${mapNode.srcNodeStr}: ${error}`;
        super(msg);
    }
}
exports.MapComputeError = MapComputeError;

class NavError extends Error {
    constructor({nodeAtError, originNode, pathFromOrigin, msg}) {
        var m = `Navigation error from ${originNode.fullName} on path ${pathFromOrigin} at ${nodeAtError.fullName}: ${msg}`;
        super(m);

        // make these non-enumerable, otherwise the error report will be
        // extremely long trying to prettyprint the entirey of these props
        //this.nodeAtError = nodeAtError;
        //this.originNode = originNode;
        //this.pathFromOrigin = pathFromOrigin;
        //this.nodeAtErrorMsg = msg;
        Object.defineProperty(this, 'nodeAtError',    {enumerable:false, value: nodeAtError    });
        Object.defineProperty(this, 'originNode',     {enumerable:false, value: originNode     });
        Object.defineProperty(this, 'pathFromOrigin', {enumerable:false, value: pathFromOrigin });
        Object.defineProperty(this, 'nodeAtErrorMsg', {enumerable:false, value: msg            });
    }
}
exports.NavError = NavError;


class InputValidationError extends Error {
    constructor(node, value, error, onAssign) {
        //var escValue = JSON.stringify(value.toString());
        if( onAssign ) {
            var msg = `Input validation failure setting ${node.fullName} to ${value}: ${error}`;
        } else {
            var msg = `No value ever assigned to input ${node.fullName} and the default, ${JSON.stringify(value)}, is invalid: ${error}`;
        }
        
        super(msg);
        
        // make these non-enumerable, otherwise the error report will be
        // extremely long trying to prettyprint the entirey of these props
        //this.node = node
        //this.value = value
        //this.error = error
        Object.defineProperty(this, 'node', {
            enumerable: false,
            value: node
        });
        Object.defineProperty(this, 'value', {
            enumerable: false,
            value: value
        });
        Object.defineProperty(this, error, {
            enumerable: false,
            value: error
        });

        //this.originInputNode = undefined;
    }
    
    toString () {
        return this.msg;
    }
}
exports.InputValidationError = InputValidationError;

class InputLinkFinalizeError extends Error {
    constructor(navError) {
        var msg = `Error finalizing linked input node ${navError.originNode.fullName} referencing source from ${navError.pathFromOrigin}: node at ${navError.nodeAtError.fullName}: ${navError.nodeAtErrorMsg}`;
        super(msg);
    }
}
exports.InputLinkFinalizeError = InputLinkFinalizeError;

class InputLinkValidationError extends Error {
    constructor({node, srcNode, value, error}) {
        var msg = `InputNode ${node.fullName} received value ${value} from ${srcNode.fullName} but this is invalid for this InputNode: ${error}`;
        super(msg);
    }
};
exports.InputLinkValidationError = InputLinkValidationError;
