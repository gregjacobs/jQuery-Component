/**
 * @class Ext.test.TestCase
 * TestCase class.
 * @extends Y.Test.Case
 * @author  Nicolas FERRERO (aka yhwh) for Sylogix
 * @version 1.3
 * @date	June 4, 2010
 */
Ext.test.TestCase = Ext.extend( Y.Test.Case, {
	/**
	 * @cfg {String} name (defaults to undefined) The TestCase name.
	 */
	
	/**
	 * @cfg {Ext.test.Session} testSession (defaults to Ext.test.Session) The 
	 * default instanciated Ext.test.Session where the Ext.test.TestCase register.
	 */
	constructor: function(config) {
		Ext.apply(this, config);
		Ext.test.TestCase.superclass.constructor.apply(this, arguments);
		
		this.testSession = this.testSession || Ext.test.Session;     
		if(!this.parentSuite) {
			this.testSession.registerCase( this );
		}
	},
	
	
	/**
	 * @method getTests
	 * Gets the individual tests for this test case. Test functions are marked by starting
	 * with the word 'test', or have the string 'should' in them.
	 *
	 * @return {Ext.test.Test[]}
	 */
	getTests : function() {
		// Loop over the properties of this object, and find the test functions
		var tests = [];
		for( var prop in this ) {
			if( Ext.isFunction( this[ prop ] ) ) {
				
				// If the property name starts with 'test', or has the word 'should' in it, then it is a test function
				if( prop.indexOf( "test" ) === 0 
					  || ( prop.toLowerCase().indexOf( "should" ) > -1 && prop.indexOf( " " ) > -1 ) ) {
					tests.push( new Ext.test.Test( prop, this, this[ prop ] ) );
				}
				
			}
		}
		return tests;
	},
	
	
	/**
	 * Retrieves the parent {@link Ext.test.TestSuite} of the TestCase.
	 * 
	 * @method getParentSuite
	 * @return {Ext.test.TestSuite}
	 */
	getParentSuite : function() {
		return this.parentSuite;
	}
	
});

// Alias a simpler name
Ext.test.Case = Ext.test.TestCase;

// Ext 3.2.1 Unit Tests Compatibility
Y.Test.Case = Ext.test.TestCase;
