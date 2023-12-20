
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
        this._value = defaultValue;
        
        this._valueEverSet = false;

        this._needsComputing = false;
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

    _setValue(v) {
        if( this.isLinked )
            throw new Error('_setValue on a linked Inputnode');
        
        var [valid, error] = this.validate(this, v);
        if( ! valid )
            throw new InputValidationError(this, v, error, true);
        
        this._valueEverSet = true;
        this._value = v;
        this._computeCount++;
        this.log(`set to ${v}. will notify my listeners ${this.listenerNamesStr}.`);
        //for( let l of this._changeListeners ) {
        //for( let l of [...this._changeListeners] ) {
        //    l.nodeChanged(this);
        //}
        this.fireNodeValueChanged();
    }

    get settable () { return ! this.isLinked }

    get value ()  {
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
            if( ! this._valueEverSet ) {
                var [valid, error] = this.validate(this, this._value);
                if( ! valid )
                    throw new InputValidationError(this, this._value, error, false);
                // the value is now "set" to undefined, which is now confirmed to 
                // be a valid value for this particular InputNode.
                this._valueEverSet = true;
            }
            return this._value; 
        }
    }

    set value (v) {
        if( this.isLinked )
            throw new Error(`Unable to set a value on a linked input node`);
        this._setValue(v);
        return v;
    }

    setValue(v) {
        this.value = v;
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
    //  we're mapping from an Input node and that Input is set to a new value.
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
        if( ! this.isLinked ) return;
        
        var v = this._linkSrcNode.value;
        var [valid, error] = this._validate(this, v);
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
        
        // not needed because we do fireNodeValueSpoiled() in the nodeValue*() methods.
        //this.fireNodeValueChanged();
    }

}
exports.InputNode = InputNode;

