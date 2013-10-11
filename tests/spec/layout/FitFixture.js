/*global define, spyOn */
define( [
	'jquery',
	'jqg/Component',
	'jqg/layout/Fit',
	'spec/layout/LayoutFixture'
], function( jQuery, Component, FitLayout, LayoutFixture ) {
	
	/**
	 * @class spec.layout.FitFixture
	 * @extends spec.layout.LayoutFixture
	 * 
	 * Fixture class for the {@link jqg.layout.Fit Fit} layout's tests.
	 */
	var FitLayoutFixture = LayoutFixture.extend( {
		
		/**
		 * @protected
		 * @property {jqg.Component} childCmp
		 * 
		 * A mock {@link jqg.Component} instance which is set up for tests. It defaults to having
		 * zero margin/border/padding, but may be overridden in tests.
		 */
		
		
		/**
		 * @constructor
		 */
		constructor : function() {
			this._super( arguments );
			
			this.childCmp = new Component();
			spyOn( this.childCmp, 'getPadding' ).andReturn( 0 );       // default implementation, can be overridden
			spyOn( this.childCmp, 'getMargin' ).andReturn( 0 );        // default implementation, can be overridden
			spyOn( this.childCmp, 'getBorderWidth' ).andReturn( 0 );   // default implementation, can be overridden
		},
		
		
		/**
		 * Overridden method to create the {@link jqg.layout.Fit Fit} layout.
		 * 
		 * @return {jqg.layout.Fit}
		 */
		createLayout : function() {
			return new FitLayout();
		},
		
		
		/**
		 * Retrieves the {@link #childCmp}.
		 * 
		 * @return {jqg.Component} The child component mocked for tests.
		 */
		getChildCmp : function() {
			return this.childCmp;
		}
		
	} );
	
	return FitLayoutFixture;
	
} );