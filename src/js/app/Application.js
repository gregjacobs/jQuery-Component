/*global define */
define( [
	'jquery',
	'lodash',
	'Class',
	'Observable'
], function( jQuery, _, Class, Observable ) {
	
	/**
	 * @abstract
	 * @class gui.app.Application
	 * @extends Observable
	 * 
	 * Represents a single Application that uses a {@link gui.Viewport} for its display components. The purpose of this 
	 * class is to give some structure to Application initialization, and to facilitate inter-controller communication
	 * for a given application. 
	 * 
	 * Note that it is certainly possible to initialize a given application by manually instantiating a Viewport, and one or
	 * more Controller(s) for it from an HTML page. However, this class seeks to provide a common skeleton for initialization, 
	 * and the ability to test the initialization code, which includes substituting mock objects by overriding the "create" 
	 * methods in tests.
	 * 
	 * 
	 * ## Details
	 * 
	 * This class implements the initial set up for an Application as the page loads. It instantiates any data containers
	 * ({@link data.Model Models} or {@link data.Collection Collections}) that the app may need from the 
	 * {@link #createDataContainers} method, a {@link gui.Viewport Viewport} from the {@link #createViewport} method, and 
	 * one or more {@link gui.app.Controller Controllers} from the {@link #createControllers} method, which will manage 
	 * interactions with the data containers and components in the Viewport. When the page (document) is ready, the 
	 * {@link #onDocumentReady} method is called to automatically render the Viewport at the appropriate time.
	 * 
	 * Subclasses must implement the {@link #createViewport} method. They may also override the {@link #createDataContainers}, 
	 * {@link #createControllers}, and the {@link #init} method for any subclass-specific initialization. The {@link #init} 
	 * method is called after the Data Containers, Viewport, and the Controllers have been instantiated, but before the document 
	 * is ready.
	 * 
	 * The hook methods are called in the following order:
	 * 
	 * 1. {@link #createDataContainers} - For initializing {@link data.Model Models} and {@link data.Collection Collections}
	 *    for the app.
	 * 2. {@link #createViewport} - For creating the {@link gui.Viewport Viewport} instance for the app.
	 * 3. {@link #createControllers} - For creating the {@link gui.app.Controller Controller(s)} to manage the app.
	 * 4. {@link #init} - For setting up interactions between {@link gui.app.Controller Controllers} via event listeners, 
	 *    and any other application-specific initialization that might be needed.
	 * 
	 * 
	 * ## Example Implementation
	 * 
	 * my/app/Application.js
	 * 
	 *     define( [
	 *         'gui/app/Application',
	 *         
	 *         'my/app/view/Viewport',
	 *         'my/app/controller/Filters',
	 *         'my/app/controller/MainDisplay',
	 *         'my/app/collection/Users'
	 *     ], function( Application, AppViewport, FiltersController, MainDisplayController, UsersCollection ) {
	 *         
	 *         var MyApplication = Application.extend( {
	 *         
	 *             createDataContainers : function() {
	 *                 this.usersCollection = new UsersCollection();
	 *             },
	 *             
	 *             createViewport : function() {
	 *                 return new AppViewport( {
	 *                     usersCollection: this.usersCollection  // this would be passed to the view component(s) which will be bound to it by the AppViewport class
	 *                 } );
	 *             },
	 *             
	 *             createControllers : function( viewport ) {
	 *                 return {
	 *                     filters : new FiltersController( { view: viewport } ),
	 *                     
	 *                     mainDisplay : new MainDisplayController( {
	 *                         view: viewport, 
	 *                         usersCollection: this.usersCollection  // so the MainDisplayController can re-load this collection when a filter changes
	 *                     } )
	 *                 } );
	 *             },
	 *             
	 *             
	 *             init : function() {
	 *                 this._super( arguments );
	 *                 
	 *                 this.getController( 'filters' ).on( 'filterselect', this.onFilterSelect, this );
	 *             },
	 *             
	 *             
	 *             onFilterSelect : function() {
	 *                 var selectedFilters = this.getController( 'filters' ).getSelectedFilters();
	 *                 this.getController( 'mainDisplay' ).update( selectedFilters );
	 *             }
	 *             
	 *         } );
	 *         
	 *         return MyApplication;
	 *         
	 *     } );
	 * 
	 * 
	 * ## Example Usage from HTML Page
	 * 
	 *     <html>
	 *         <head>
	 *             <script src="path/to/require.js"></script>
	 *             <script src="path/to/jQuery-GUI/dist/js/gui-all.js"></script>
	 *             
	 *             <script>
	 *                 require( [
	 *                     'my/app/Application'  // our subclass of gui.app.Application
	 *                 ], function( MyApplication ) {
	 *                     
	 *                     // will instantiate Viewport/Controllers and render the Viewport when the document is ready
	 *                     var app = new MyApplication();
	 *                     
	 *                 } );
	 *             </script>
	 *         </head>
	 *     
	 *         <body></body>
	 *     </html>
	 */
	var Application = Observable.extend( {
		abstractClass: true,
		
		/**
		 * @cfg {String/HTMLElement/jQuery} renderTo
		 * 
		 * A selector, HTMLElement, or jQuery wrapped set of where to render the {@link #viewport} when 
		 * the document is ready.
		 * 
		 * By default, the {@link #viewport} is rendered to the document body, but it may be useful to render
		 * an entire application into say, a {@link gui.window.Window}.
		 */
		renderTo : 'body',  // renders to the document body
		
		
		/**
		 * @protected
		 * @property {gui.Viewport} viewport
		 * 
		 * The viewport that was instantiated for the Application via {@link #createViewport}.
		 */
		
		/**
		 * @private
		 * @property {Object} controllers
		 * 
		 * An Object (map) of the {@link gui.app.Controller Controllers} instantiated for the Application
		 * from {@link #createControllers}. The keys are the controller names, and the values are the 
		 * {@link gui.app.Controller} instances.
		 * 
		 * Individual controllers should be referenced by name via {@link #getController}.
		 */
		
		/**
		 * @private
		 * @property {Boolean} destroyed
		 * 
		 * Flag which is set to `true` once the Application has been destroyed.
		 */
		
		
		/**
		 * @constructor
		 * @param {Object} [cfg] The configuration options for this class, specified in an Object (map).
		 */
		constructor : function( cfg ) {
			_.assign( this, cfg );     // assign the configuration options onto this object
			this._super( arguments );  // call the superclass constructor (Observable)

			this.addEvents(
				/**
				 * Fires when the Application has been {@link #method-destroy destroyed}.
				 * 
				 * @event destroy
				 * @param {gui.app.Application} application This Application instance.
				 */
				'destroy'
			);
			
			this.createDataContainers();
			
			var viewport = this.viewport = this.createViewport();
			// <debug>
			if( !viewport ) throw new Error( "Error: No viewport returned by createViewport() method" );
			// </debug>
			
			var controllers = this.controllers = this.createControllers( viewport );
			// <debug>
			if( !controllers ) throw new Error( "Error: No Object (map) returned by the createControllers() method" );
			// </debug>
			
			this.init();
			
			jQuery( document ).ready( _.bind( this.onDocumentReady, this ) );
		},
		
		
		/**
		 * Method which may be overridden by subclasses to instantiate one or more {@link data.Model Models} and/or
		 * {@link data.Collection Collections} that will be used by the application. References to these data containers 
		 * may be saved to this Application object from this method.
		 * 
		 * ## Example
		 * 
		 *     createDataContainers : function() {
		 *         this.usersCollection = new UsersCollection();
		 *     }
		 *     
		 *     // ...
		 *     
		 *     createViewport : function() {
		 *         return new AppViewport( {
		 *             usersCollection : this.usersCollection  // so this collection can be bound to one or more view components
		 *         } );
		 *     }
		 *     
		 *     createControllers : function( viewport ) {
		 *         return {
		 *             users: new UsersController( {
		 *                 view : viewport,
		 *                 usersCollection : this.usersCollection  // so this collection can be managed by the UsersController
		 *             } )
		 *         };
		 *     }
		 * 
		 * @protected
		 */
		createDataContainers : _.noop,
		
		
		/**
		 * Method which must be overridden by subclasses to instantiate and return a {@link gui.Viewport}.
		 * 
		 * @protected
		 * @abstract
		 * @return {gui.Viewport}
		 */
		createViewport : Class.abstractMethod,
		
		
		/**
		 * Method which may be overridden by subclasses to instantiate and return one or more 
		 * {@link gui.app.Controller Controllers}. 
		 * 
		 * The return value from this method is an Object (map) where the keys are the names to reference the controller(s) by, 
		 * and the values are the {@link gui.app.Controller} instances. Controllers are then later referenced via
		 * {@link #getController}. 
		 * 
		 * The reason that controllers are returned from this method instead of simply creating direct references to them is 
		 * so that the Application instance can manage them, and destroy them if the Application itself is 
		 * {@link #method-destroy destroyed}.
		 * 
		 * ## Examples
		 * 
		 * A few examples for this method may look something like the following.
		 * 
		 * Single controller:
		 * 
		 *     createControllers : function( viewport ) {
		 *         return {
		 *             appController: new AppController( { view: viewport } )
		 *         };
		 *     }
		 *     
		 * Multiple controllers:
		 * 
		 *     createControllers : function( viewport ) {
		 *         return {
		 *             filters: new FiltersController( { view: viewport } ),
		 *             display: new DisplayController( { view: viewport } )
		 *         };
		 *     }
		 *     
		 * You may also choose to implement factory methods for each controller, either for use with unit tests (where
		 * mock controllers can be substituted), or for subclasses to return different Controller types. For example:
		 * 
		 *     createControllers : function( viewport ) {
		 *         return {
		 *             filters: this.createFiltersController( viewport ),
		 *             display: this.createDisplayController( viewport )
		 *         };
		 *     },
		 *     
		 *     createFiltersController : function( viewport ) {
		 *         return new FiltersController( { view: viewport } );
		 *     },
		 *     
		 *     createDisplayController : function( viewport ) {
		 *         return new DisplayController( { view: viewport } );
		 *     }
		 * 
		 * And finally, when subclassing `createControllers`, one may add controllers to the return map in the following
		 * fashion:
		 * 
		 *     // in superclass
		 *     createControllers : function( viewport ) {
		 *         return {
		 *             filters: new FiltersController( { view: viewport } )
		 *         };
		 *     }
		 * 
		 * 
		 *     // in subclass
		 *     createControllers : function( viewport ) {
		 *         var controllers = this._super( arguments );
		 *         
		 *         // Add controller(s) for this subclass
		 *         controllers.display = new DisplayController( { view: viewport } );
		 *         
		 *         return controllers;
		 *     }
		 * 
		 * @protected
		 * @param {gui.Viewport} viewport A reference to the Viewport created from {@link #createViewport}. This is
		 *   usually passed to a Controller as the {@link gui.app.Controller#view view} config.
		 * @return {Object} An Object (map) of the controllers, where the key names are the controller names, and the
		 *   values are {@link gui.app.Controller} instances.
		 */
		createControllers : function() {
			return {};  // empty map by default
		},
		
		
		/**
		 * Hook method which may be overridden in subclasses to provide any subclass-specific initialization.
		 * For maintainability purposes, this superclass method should be called first from any implementation.
		 * 
		 * This method is called after the {@link #viewport} has been instantiated by the {@link #createViewport}
		 * method, and the {@link #controllers} have been instantiated by the {@link #createControllers} method.
		 * 
		 * ## Example
		 * 
		 *     init : function() {
		 *         this._super( arguments );
		 *         
		 *         this.viewport.on( 'render', function() { ... } );  // assuming we want to listen for this event (probably don't need to)
		 *         
		 *         this.getController( 'myController').doSomething();  // `myController` would have been a controller set up in {@link #createControllers}
		 *     }
		 * 
		 * @protected
		 * @template
		 */
		init : _.noop,
		
		
		/**
		 * Handles when the page (document) is ready by rendering the Viewport.
		 * 
		 * @protected
		 */
		onDocumentReady : function() {
			this.viewport.render( this.renderTo );
		},
		
		
		// ------------------------------------
		
		
		/**
		 * Retrieves a controller by name. Controllers are set up from the {@link #createControllers} method.
		 * 
		 * Example:
		 * 
		 *     // set up a controller in this method
		 *     createControllers : function() {
		 *         return {
		 *             mainDisplay: new MainDisplayController()
		 *         };
		 *     },
		 *     
		 *     ...
		 *     
		 *     // Retrieve the controller from another method
		 *     init : function() {
		 *         this._super( arguments );
		 *         
		 *         var mainDisplayController = this.getController( 'mainDisplay' );
		 *         mainDisplayController.doSomething();
		 *     }
		 * 
		 * @protected
		 * @param {String} `name`
		 * @return {gui.app.Controller} The controller for the given `name`, or `null` if there is no controller
		 *   registered for that name.
		 */
		getController : function( name ) {
			return this.controllers[ name ] || null;
		},
		
		
		// ------------------------------------
		
		// Destruction Functionality
		
		
		/**
		 * Destroys the Application.
		 * 
		 * Note: Subclasses should override the {@link #onDestroy} hook method instead of this method for their
		 * own subclass-specific destruction logic.
		 */
		destroy : function() {
			if( !this.isDestroyed() ) {
				this.onDestroy();  // call hook method
				
				// Destroy controllers first
				_.forOwn( this.controllers, function( controller ) { controller.destroy(); } );
				
				// Destroy the viewport second
				this.viewport.destroy();
				
				this.destroyed = true;
				this.fireEvent( 'destroy', this );  // note: fire 'destroy' event before purging listeners!
				this.purgeListeners();
			}
		},
		
		
		/**
		 * Hook method for the destruction of the Application.
		 * 
		 * Subclasses should call their superclass method after any subclass-specific processing. For example:
		 * 
		 *     onDestroy : function() {
		 *         this.popupWindow.destroy();  // destroy a {@link gui.window.Window} that was created by the subclass
		 *         
		 *         this._super( arguments );    // now call the superclass method
		 *     }
		 * 
		 * @protected
		 * @template
		 */
		onDestroy : _.noop,
		
		
		/**
		 * Determines if the Application has been destroyed.
		 * 
		 * @return {Boolean}
		 */
		isDestroyed : function() {
			return !!this.destroyed;
		}
		
	} );
	
	return Application;
	
} );