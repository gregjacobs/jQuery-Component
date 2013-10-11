/*global define */
define( [
	'jquery',
	'lodash',
	'jqg/ComponentManager',
	'jqg/form/field/Field'
], function( jQuery, _, ComponentManager, Field ) {
	
	/**
	 * @class jqg.form.field.Hidden
	 * @extends jqg.form.field.Field
	 * @alias type.hidden
	 * @alias type.hiddenfield
	 * 
	 * A hidden input. This class does not have any visible display.
	 */
	var HiddenField = Field.extend( {
		
		/**
		 * @hide
		 * @cfg {String} label
		 */
		
		/**
		 * @hide
		 * @cfg {String} extraMsg
		 */
		
		/**
		 * @hide
		 * @cfg {Boolean} hidden
		 */
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			// Make sure there is no label and extraMsg text
			this.label = "";
			this.extraMsg = "";
			
			// Make sure the outer element (created by jqg.Component) is hidden, as there should be no visible indication of the field
			this.hidden = true;
			
			this._super( arguments );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function( container ) { 
			// Call superclass onRender() first, to render this Component's element
			this._super( arguments );
			
			// Create and append the hidden field
			this.$inputEl = jQuery( '<input type="hidden" id="' + this.inputId + '" name="' + this.inputName + '" value="' + ( this.value || "" ) + '" />' )
				.appendTo( this.$inputContainerEl );
		},
		
		
		/**
		 * Implementation of {@link jqg.form.field.Field Field}'s setValue() method, which sets the value to the field.
		 * 
		 * @param {String} value The value of the field.
		 */
		setValue : function( value ) {
			if( !this.rendered ) {
				this.value = value;  // If the Component has not yet been rendered (i.e. the Field has not yet been created), store the value as the initial value to set.	
			} else {
				this.$inputEl.val( value );
			}
		},
		
		
		/**
		 * Implementation of {@link jqg.form.field.Field Field}'s getValue() method, which returns the value of the field.
		 * 
		 * @return {String} The value of the field.
		 */
		getValue : function() {
			if( !this.rendered ) {
				return this.value;  // If the value was set before the Component has been rendered (i.e. before the Field has been created), return that.
			} else {
				return this.$inputEl.val();
			}
		}
		
	} );
	
	
	ComponentManager.registerType( 'hidden', HiddenField );
	ComponentManager.registerType( 'hiddenfield', HiddenField );
	
	return HiddenField;
	
} );