
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
        this.nodeAtError = nodeAtError;
        this.originNode = originNode;
        this.pathFromOrigin = pathFromOrigin;
        this.nodeAtErrorMsg = msg;
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
        
        this.msg = msg
        this.node = node
        this.value = value
        this.error = error

        this.originInputNode = undefined;
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
