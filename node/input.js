
'use strict';

const LeafNode = require('./leaf').LeafNode;
const {
    NavError,
    InputValidationError, InputLinkFinalizeError, InputLinkValidationError
} = require('../errors');

class InputNode extends LeafNode {
    constructor({parent, validate, defaultValue}) {
        super({parent});
        if( validate===undefined )
            this._validate = (n,v) => [true,''];
        else
            this._validate = validate;
            
        this._defaultValue = defaultValue;
        this._value = undefined;
        this._valueInited = false;

        this._needsComputing = true;
        this._computeCount = 0;
        
        this._linkSrcPath = undefined;
        this._linkSrcNode = undefined;
        this._isLinked = false;
    }

    copyNode () {
        let n = new InputNode({
            validate: this.validate,
            defaultValue: this.defaultValue,
        });
        if( this._directEnumFlag!==undefined )
            n.enumerable = this._directEnumFlag;
        return n;
    }

    get nodeType () { return 'input' }    
    get nodeAbbr () { return 'inp' }

    initValue( haveInitValue, initValue ) {
        if( this._valueInited )
            throw new Error(`${this.fullName} was already initialized`);

        if( haveInitValue )
            this._setValue(initValue, true, false);
        else
            this._setValue(this._defaultValue, true, true);
        
        this.log(`initted to ${this._value}`);
        this._valueInited = true;
    }
    
    get valueInited () { return this._valueInited }

    _setValue(v, onInit, isDefault) {
        let valResult = this.validate(this, v);
        let [valid, error, newValue] = valResult;

        if( ! valid )
            throw new InputValidationError({
                node:this,
                value:v,
                error,
                onInit,
                isDefault
            });
        
        if( valResult.length==3 )
            v = newValue;
        
        this._value = v;
    }

    get settable () { return ! this.isLinked }
    
    get value () { return this.getValue() }
    
    getValue ()  {
        if( this.isLinked ) 
        {
            if( ! this.isFinalized )
                throw new Error(`Unable to get the value of a linked InputNode before finalization`);
            if( this._needsComputing )
                this.recompute();
            return this._value;
        }
        else
        {
            if( ! this._valueInited )
                throw new Error(`Uninitialized InputNode ${this.fullName}`);
            return this._value;
        }
    }

    set value (v) { return this.setValue(v) }

    setValue(v) {
        if( this.isLinked )
            throw new Error(`Unable to set a value on a linked input node`);

        this._setValue(v, false, false);
        this._computeCount++;

        this.log(`set to ${v}. will notify my listeners ${this.listenerNamesStr}.`);
        this.fireNodeValueChanged();
        
        return this._value;
    }

    get defaultValue () { return this._defaultValue }

    get validate() { return this._validate }

    get debugValue() { return this._value }
    
    get debugInfo () {
        if( this.isLinked ) {
            if( this._linkSrcNode !== undefined )
                // we are finalized
                var ls = this._linkSrcNode.fullName;
            else
                // not finalized yet. just use symbolic path.
                var ls = this._linkSrcPath.toString();
            
            return `linkSrc: ${ls}; value: ${this._value}; listensToMe: ${this.listenerNamesStr}`;
        } else
            return `value: ${this._value}; listensToMe: ${this.listenerNamesStr}`;
    }

    get computeCount () { return this._computeCount }

    get isLinked () { return this._isLinked }

    get linkSrcNode () { return this._linkSrcNode }

    get linkSrcOk () {
        if( ! this.isLinked )
            return true;
        return this.hasNodeAtPath(this._linkSrcPath);
    }

    get linkSrcStr () {
        if( this.isLinked ) {
            if( this._linkSrcNode !== undefined )
                // we are finalized
                return this._linkSrcNode.fullName;
            else
                // not finalized yet. just use symbolic path.
                return this._linkSrcPath.toString();
        } else
            return '(unlinked)';
    }

    linkToPath(linkSrcPath) {
        if( this.isFinalized )
            throw new Error(`Unable to link input ${this.fullName} after finalization`);
        this._linkSrcPath = linkSrcPath;
        this._isLinked = true;
    }
    
    linkToNode(linkSrcNode) {
        this.linkToPath( this.pathToNode(linkSrcNode) );
    }
    
    get linkSrcPath () {
        return this._linkSrcPath;
    }

    get ultimateSrc () {
        if( this.isLinked )
            return this.linkSrcNode.ultimateSrc;
        else
            return this;
    }

    finalizeDefinition () {
        if( this._isLinked ) {
            try {
                this._linkSrcNode = this.nav(this._linkSrcPath);
            } catch (e) {
                if( e instanceof NavError )
                    throw new InputLinkFinalizeError(e);
                else
                    throw e;
            }
            this._linkSrcNode.addChangeListener(this);
            this._needsComputing = true;
        }
        this._isFinalized = true;
    }

    // called when:
    //  we're linked to another InputNode and that Input is set to a new value.
    nodeValueChanged(node) {
        if( ! this.isLinked )
            throw new Error(`An unlinked InputNode should never hear nodeValueChanged.`); 
        this.log(`heard nodeValueChanged from ${node.debugName}`);
        this._needsComputing = true;
        this.fireNodeValueSpoiled();
    }
    
    nodeValueSpoiled(node) {
        if( ! this.isLinked )
            throw new Error(`An unlinked InputNode should never hear nodeValueSpoiled.`); 
        if( this._needsComputing ) { return };
        this.log(`heard nodeValueSpoiled from ${node.debugName}`);
        this._needsComputing = true;
        this.fireNodeValueSpoiled();
    }

    computeIfNeeded () {
        if( this._needsComputing )
            this.recompute();
    }

    recompute() {
        if( this.isLinked )
        {
            var v = this._linkSrcNode.value;
            var [valid, error] = this.validate(this, v);
            if( ! valid )
                throw new InputLinkValidationError({
                    node: this,
                    srcNode: this._linkSrcNode,
                    value: v,
                    error
                });
        
            this._value = v;
            this._needsComputing = false;
            this._computeCount++;
            this.log(`RECOMPUTED as ${this._value}`);
        } else {
            if( ! this.valueInited )
                throw new Error(`recompute() on Uninitialized InputNode ${this.fullName}`);
        }
        
        // not needed because we do fireNodeValueSpoiled() in the nodeValue*() methods.
        //this.fireNodeValueChanged();
    }

}
exports.InputNode = InputNode;

