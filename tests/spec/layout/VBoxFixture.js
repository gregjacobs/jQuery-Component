/*global define */
define( [
	'jqGui/layout/VBox',
	'spec/layout/LayoutFixture'
], function( VBoxLayout, LayoutFixture ) {
	
	/**
	 * @class spec.layout.VBoxFixture
	 * @extends spec.layout.LayoutFixture
	 * 
	 * Fixture class for the {@link jqGui.layout.VBox VBox} layout's tests.
	 */
	var VBoxLayoutFixture = LayoutFixture.extend( {		
		
		/**
		 * @constructor
		 */
		constructor : function() {
			this._super( arguments );
			
			// No specific implementation, yet
		},
		
		
		/**
		 * Overridden method to create the {@link jqGui.layout.VBox VBox} layout.
		 * 
		 * @return {jqGui.layout.VBox}
		 */
		createLayout : function() {
			return new VBoxLayout();
		}
		
	} );
	
	return VBoxLayoutFixture;
	
} );