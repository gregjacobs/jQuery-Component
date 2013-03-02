/*global define, describe, it, beforeEach, afterEach, expect */
define( [
	'Class',
	'ui/ComponentManager',
	'ui/Component'
], function( Class, ComponentManager, Component ) {
	
	describe( 'ui.ComponentManager', function() {
		var componentClasses;   // for restoring the previous list of component classes that have been registered, after the tests
		
		
		beforeEach( function() {
			// first, store the current componentClasses hash to play nice with other tests
			componentClasses = ComponentManager.componentClasses;
			
			// then, reset the componentClasses hash for tests
			ComponentManager.componentClasses = {};
		} );
		
		afterEach( function() {
			// restore the componentClasses hash
			ComponentManager.componentClasses = componentClasses;
		} );
		
		
		// ---------------------------------------------------------
	
		describe( 'registerType()', function() {
			it( "should register a component subclass", function() {
				// Test initial state
				expect( ComponentManager.hasType( 'someClass' ) ).toBe( false );  // ComponentManager should not initially have type 'someClass'.
				
				// Test registering a new type, and that its type name is stored in all lower case (for case-insensitivity)
				var someClass = function() {};
				ComponentManager.registerType( 'someClass', someClass );
				expect( ComponentManager.hasType( 'someClass' ) ).toBe( true );  // ComponentManager should now have type 'someClass'.
				expect( someClass ).toBe( ComponentManager.componentClasses[ 'someclass' ] );  // registerType did not add type name in all lowercase characters.  // directly access the 'componentClasses' object for this test to make sure
			} );
		
		
			it( "should throw an error when trying to register a type name that is already registered", function() {
				var class1 = function() {},
				    class2 = function() {};
					
				ComponentManager.registerType( 'someClass', class1 );  // register the first class
				
				expect( function() {
					ComponentManager.registerType( 'someClass', class2 );  // try to register the second class under the same "type" name. This should throw an error
					
				} ).toThrow( "Error: ui.ComponentManager already has a type 'someclass'" );
			} );
		
		} );
		
		
		describe( 'getType()', function() {
			it( "should retrieve a Component subclass based on its type name", function() {
				var someClass = function() { this.value = 1; };
				ComponentManager.registerType( 'someClass', someClass );
				expect( ComponentManager.hasType( 'someClass' ) ).toBe( true );  // ComponentManager should now have type 'someClass'.
				expect( ComponentManager.getType( 'someClass' ) ).toBe( someClass );  // getType() not returning the constructor function for 'someClass'
			} );
		} );
		
		
		describe( 'hasType()', function() {
			it( "should determine if a class with the given type name is registered or not", function() {
				// Test initial state
				expect( ComponentManager.hasType( 'someClass' ) ).toBe( false );  // ComponentManager should not initially have type 'someClass'.
				
				// Test adding a class
				var someClass = function() { this.value = 1; };
				ComponentManager.registerType( 'someClass', someClass );
				expect( ComponentManager.hasType( 'someClass' ) ).toBe( true );  // ComponentManager should now have type 'someClass'.
				
				// Make sure that hasType returns true, regardless of the casing of the type name
				expect( ComponentManager.hasType( 'SomeClass' ) ).toBe( true );  // hasType should have returned true for case-insensitive type name (1).
				expect( ComponentManager.hasType( 'someclass' ) ).toBe( true );  // hasType should have returned true for case-insensitive type name (2).
				expect( ComponentManager.hasType( 'sOmEClAsS' ) ).toBe( true );  // hasType should have returned true for case-insensitive type name (3).		
				
				// Make sure the following falsy values return false, in the case of an undefined property and such
				expect( ComponentManager.hasType( undefined ) ).toBe( false );  // hasType should have returned false for undefined type name.
				expect( ComponentManager.hasType( null ) ).toBe( false );  // hasType should have returned false for null type name.
				expect( ComponentManager.hasType( false ) ).toBe( false );  // hasType should have returned false for boolean false type name.
				expect( ComponentManager.hasType( "" ) ).toBe( false );  // hasType should have returned false for an empty string type name.
			} );
		} );
			
			
		describe( 'create()', function() {
			it( "should simply return an already-instantiated component", function() { 
				// Test that already-instantiated components are returned directly
				var myComponent = new Component();
				var cmp = ComponentManager.create( myComponent );
				expect( cmp ).toBe( myComponent );  // create() did not return already-instantiated Component directly.
			} );
			
			it( "should simply return an already-instantiated component, if the component is a subclass of ui.Component", function() {
				// Test that subclasses of Component are returned directly
				var MyComponentSubclass = Class.extend( Component, {
					init : function() {}
				} );
				ComponentManager.registerType( 'myComponentSubclass', MyComponentSubclass );
				
				var myComponentSubclass = new MyComponentSubclass();
				var cmp = ComponentManager.create( myComponentSubclass );
				expect( cmp ).toBe( myComponentSubclass );  // create() did not return already-instantiated subclass of Component directly.
			} );
			
			
			it( "should create an instance of a component from an anonymous config object with a given type name", function() {
				var SomeClass = Class.extend( Component, { 
					constructor : function() { this.value = 1; }
				} );
				ComponentManager.registerType( 'someClass', SomeClass );
				
				var cmp = ComponentManager.create( {
					type : 'someClass'
				} );
				expect( cmp instanceof Component ).toBe( true );  // create() did not instantiate 'someClass' via config object.
			} );
			
			/* NEED TO ADD THIS TEST BACK WHEN UI.CONTAINER IS CONVERTED TO USE REQUIREJS
			it( "should create the type `ui.Container` when no 'type' config is specified in the anonymous config object", function() { 
				ComponentManager.registerType( 'Container', Container );  // need to re-register the Container class for this test.
				var cmp = ComponentManager.create( {} );
				expect( cmp instanceof Container ).toBe( true );  // create() did not instantiate a Container via config object with no type property.
			} );
			*/
		
			it( "should throw an error for an unknown type name", function() {
				expect( function() {
					var cmp = ComponentManager.create( {
						type : 'non-existent-type'
					} );
					
				} ).toThrow( "ComponentManager.create(): Unknown type: 'non-existent-type'" );
			} );
		} );
	} );
} );