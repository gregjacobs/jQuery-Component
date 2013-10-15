/*global define, describe, it, xit, expect, JsMockito */
define( [
	'gui/Viewport'
], function( Viewport ) {
	
	describe( 'gui.Viewport', function() {
		
		describe( "sanity", function() {
			
			it( "should be able to be instantiated, rendered, and destroyed (test should simply not error)", function() {
				var viewport = new Viewport( {
					renderTo : 'body'
				} );
				
				viewport.destroy();
			} );
			
		} );
		
	} );
	
} );