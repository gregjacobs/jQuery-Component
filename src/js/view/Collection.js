/*global define */
define( [
	'jquery',
	'lodash',
	'jqc/ComponentManager',
	'jqc/Component'
], function( jQuery, _, ComponentManager, Component ) {
	
	/**
	 * @class jqc.view.Collection
	 * @extends jqc.Component
	 * @alias type.collectionview
	 * 
	 * A view of the {@link data.Model Models} in a {@link data.Collection}. The view uses the {@link #tpl} config, which 
	 * is automatically passed the {@link #collection collection's} models to populate the template. When the 
	 * {@link #collection} changes, or any of its {@link data.Model Models} change, the Collection View is 
	 * automatically refreshed to reflect the change.  
	 * 
	 * This view is similar to the {@link jqc.view.Model Model View}, but instead of showing a single {@link data.Model Model},
	 * it shows a {@link data.Collection Collection} of them.
	 */
	var CollectionView = Component.extend( {
		
		/**
		 * @cfg {data.Collection} collection (required)
		 * 
		 * The Collection to work with. This is required to populate the Component's {@link #tpl}, but
		 * does not need to be provided upon instantiation. It may be provided at a later time with the
		 * {@link #bindCollection} method.
		 * 
		 * The Collection is monitored for changes, and the view is refreshed when they occur.
		 */
		
		/**
		 * @cfg {String/String[]/Function/jqc.template.Template} tpl (required)
		 * 
		 * The template which will be used to populate the Collection View. By default, this template will be provided
		 * the variable `models`, which is an array of the {@link data.Model Models} that should be rendered
		 * from the currently-bound {@link #collection}. This array may be the full array of models that exist
		 * in the {@link #collection}, or it may just be a particular range of models that the Collection View
		 * needs to render or re-render due to a change. The name of the variable provided to the {@link #tpl}
		 * that holds the models may be configured using the {@link #modelsVar} config.
		 * 
		 * For example, if we had a "User" model, which had fields `id`, `firstName`, and `lastName`, then we
		 * might want to display this information in a template as such: (using a {@link jqc.template.LoDash Lo-Dash template}
		 * in this case)
		 * 
		 *     tpl : new LoDashTpl( [
		 *         '<% _.forEach( models, function( model ) { %>',
		 *             '<div>',
		 *                 'User: <%= model.get( "lastName" ) %>, <%= model.get( "firstName" ) %> (<%= model.get( "id" ) %>)',
		 *             '</div>'
		 *         '<% } ) %>'
		 *     ] )
		 *     
		 * If we wanted to convert all of the {@link data.Model Model} attributes to a plain JavaScript Object (map)
		 * before working with them, we can call {@link data.Model#getData getData} on each beforehand. For example:
		 * 
		 *     tpl : new LoDashTpl( [
		 *         '<% _.forEach( models, function( model ) { %>',
		 *             '<% var data = model.getData() %>
		 *             '<div>',
		 *                 'User: <%= data.lastName %>, <%= data.firstName %> (<%= data.id %>)',
		 *             '</div>'
		 *         '<% } ) %>'
		 *     ] )
		 * 
		 * While the above example may be more readable than the example before it, it may involve more processing and
		 * conversions being executed behind the scenes for attribute retrieval than are needed by the template. If only 
		 * a subset of the attributes in a {@link data.Model Model} are needed for the template, it would be more efficient 
		 * to only retrieve those particular attributes using {@link data.Model#get}.
		 * 
		 * ### Notes
		 * 
		 * Some notes to keep in mind when writing the tpl:
		 * 
		 * 1. The models should always be looped over in the order that they are given. This is because the Collection View
		 *    needs to match up the elements that are created for the models, with the models themselves. It can only do this
		 *    after the models' markup is generated, and by element position.
		 * 2. Following on the first point, all models that are provided to the template should be rendered by the template.
		 *    That is, do not use `if` statements to filter out certain models. If this needs to be done, do so in an overridden
		 *    {@link #collectModels} method instead, so the Collection View knows what it's working with.
		 * 
		 * For more information on templates themselves, see the {@link jqc.Component#tpl tpl} config in the superclass, 
		 * {@link jqc.Component Component}.
		 */
		
		/**
		 * @cfg {String} modelSelector (required)
		 * 
		 * The CSS selector string used by the Collection View to determine which elements (created by the {@link #tpl})
		 * wrap the models of the {@link #collection}.
		 * 
		 * This is needed so that the corresponding HTML element may be found, given a {@link data.Model Model} instance,
		 * and vice-versa.
		 * 
		 * For example:
		 * 
		 *     tpl : new LoDashTpl( [
		 *         '<% _.forEach( users, function( user ) { %>',
		 *             '<div data-elem="userEl">',
		 *                 'User: <%= user.get( "lastName" ) %>, <%= user.get( "firstName" ) %>',
		 *             '</div>'
		 *         '<% } ) %>'
		 *     ] ),
		 *     modelsVar : 'users',
		 *     
		 *     modelSelector: 'div[data-elem="userEl"]'
		 * 
		 * This would specify to the Collection View that each div element with a `data-elem` attribute of "userEl" wraps
		 * a User model. The corresponding User model can be found given the "userEl" or one of its descendant elements 
		 * using {@link #getModelFromElement}, and the "userEl" element can be found given its model instance using
		 * {@link #getElementFromModel}.
		 */
		
		/**
		 * @cfg {String} modelsVar
		 * 
		 * The name of the variable that will be provided to the {@link #tpl} that holds the {@link data.Model models}
		 * that are to be rendered by it. 
		 * 
		 * This may be used to provide a variable name that makes more sense inside the template for the type of models 
		 * being used. For example, if the Collection View is working with "User" models, one might want to
		 * set this config to `users`. Example: (using a {@link jqc.template.LoDash Lo-Dash template} in this case)
		 * 
		 *     modelsVar : 'users',
		 *     tpl : new LoDashTpl( [
		 *         '<% _.forEach( users, function( user ) {',
		 *             '<span>The current user is: <%= user.get( "name" ) %></span>',
		 *         '<% } ) %>'
		 *     ] )
		 */
		modelsVar : 'models',
		
		/**
		 * @cfg {Boolean} maskOnLoad
		 * 
		 * True to automatically mask the Collection View while the backing {@link #collection} is loading. The mask that is shown
		 * can be configured with the {@link #maskConfig} configuration option, or defaults to showing the message "Loading..."
		 */
		maskOnLoad : true,
		
		
		
		/**
		 * @private
		 * @property {Boolean} firstBindComplete
		 * 
		 * Property which is set to true when the initial bind (called from {@link #initComponent} is complete.
		 */
		
		/**
		 * @private
		 * @property {Object} collectionListeners
		 * 
		 * The listeners that were bound to the current {@link #collection} in the {@link #bindCollectionListeners} method. 
		 * If there has been no Collection bound to this view yet, this will be `undefined`.
		 */
		
		/**
		 * @protected
		 * @property {Object} modelElCache
		 * 
		 * An Object (map) which is keyed by models' {@link data.Model#getClientId clientId}, and which stores the
		 * HTML element (wrapped in a jQuery set) which relates to it in the view. Ex:
		 * 
		 *     {
		 *         1 : jQuery,   // inside is the element which encapsulates the model
		 *         2 : jQuery
		 *     }
		 * 
		 * Where `1` and `2` are the models' clientIds, and the values are jQuery instances, each which wrap the HTMLElement
		 * that corresponds to that model.
		 */
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this._super( arguments );
			
			// <debug>
			if( !this.tpl ) throw new Error( "`tpl` config required" );
			if( !this.modelSelector ) throw new Error( "`modelSelector` config required" );
			// </debug>
			
			this.modelElCache = {};
			this.bindCollection( this.collection || null );
			
			// Set up the maskConfig if there is not a user-defined one. This is for masking the component
			// while the collection is loading.
			this.maskConfig = this.maskConfig || { msg: "Loading..." };
		},
		
		
		/**
		 * @inheritdoc
		 */
		onAfterRender : function() {
			this._super( arguments );
			
			var collection = this.collection;
			if( collection ) {
				this.collectModelElements( this.collectModels() );  // need to determine the initial set of models that were rendered (if any)
				
				// Mask the view if the Collection is currently loading when the view is rendered
				if( this.maskOnLoad && collection.isLoading() ) {
					this.mask();
				}
			}
		},
		
		
		// -----------------------------------
		
		// Collection binding methods
		
		
		/**
		 * Binds a {@link data.Collection} to the view. The Collection will be used to populate the {@link #tpl},
		 * and will also be monitored for changes to refresh the view as well.
		 * 
		 * Any previous {@link #collection} will be unbound from the view.
		 * 
		 * @param {data.Collection} collection The Collection to bind. To unbind the currently-bound Collection,
		 *   pass `null`.
		 */
		bindCollection : function( collection ) {
			if( this.collection !== collection || !this.firstBindComplete ) {
				// If there is a current collection, and there have been listeners bound to it (i.e. it is not the initial bind
				// call from having a `collection` config), then unbind its listeners in preparation to bind a new Collection
				if( this.collection ) {
					this.unbindCollectionListeners();
				}
				
				this.collection = collection;
				if( collection ) {
					this.bindCollectionListeners();
				}
				this.firstBindComplete = true;
				
				this.refresh();
			}
		},
		
		
		/**
		 * Binds listeners to the current {@link #collection}, so that the view can refresh itself upon
		 * changes. The listeners that are set up are created by the {@link #getCollectionListeners} method,
		 * which may be overridden to listen to other events that a particular {@link data.Collection} subclass
		 * may fire.
		 * 
		 * @private
		 */
		bindCollectionListeners : function() {
			var collection = this.collection,
			    listeners = _.clone( this.getCollectionListeners( collection ) );  // shallow copy of the listeners
			
			collection.on( listeners );
			this.collectionListeners = listeners;
		},
		
		
		/**
		 * Retrieves an Object (map) of the listeners that should be set up on the {@link #collection}, when 
		 * a {@link data.Collection} is bound to the view. This method may be overridden in a subclass to add 
		 * events that should be listened for.
		 * 
		 * @protected
		 * @param {data.Collection} collection The Collection being bound.
		 * @return {Object} An {@link Observable#addListener addListener} config object for the listeners.
		 */
		getCollectionListeners : function( collection ) {
			return {
				'loadbegin' : this.onLoadBegin,
				'load'      : this.onLoadComplete,
				'addset'    : this.refresh,
				'removeset' : this.refresh,
				'reorder'   : this.refresh,
				'changeset' : this.refresh,
				scope : this
			};
		},
		
		
		/**
		 * Unbinds the current {@link #collection collection's} listeners, which were bound by
		 * {@link #bindCollectionListeners}.
		 * 
		 * @private
		 */
		unbindCollectionListeners : function() {
			if( this.collection && this.collectionListeners ) {
				this.collection.un( this.collectionListeners );  // the Collection listener's set up in bindCollectionListeners()
			}
		},
		
		
		// -----------------------------------
		
		
		/**
		 * Handles the {@link #collection} starting to load, by displaying the "loading" mask over the Collection View
		 * if the {@link #maskOnLoad} config is true.
		 * 
		 * @protected
		 */
		onLoadBegin : function() {
			if( this.maskOnLoad ) {
				this.mask();
			}
		},
		
		
		/**
		 * Handles the {@link #collection} completing its load, by removing the "loading" mask from the Collection View,
		 * which was shown by {@link #onLoadBegin} if the {@link #maskOnLoad} config was true.
		 * 
		 * Note: The view will be refreshed due to the addition/removal of models, and doesn't need to be refreshed
		 * from this method.
		 * 
		 * @protected
		 */
		onLoadComplete : function() {
			if( this.maskOnLoad ) {
				this.unMask();
			}
		},
		
		
		/**
		 * Refreshes the view by {@link #update updating} the Component's markup, based on the {@link #tpl}
		 * and the current state of the {@link #collection}. This method should normally not need to be called 
		 * directly, as the view will automatically be updated when changes are detected on the {@link #collection}.
		 */
		refresh : function() {
			if( !this.collection ) {
				this.update( "" );  // don't display anything
				
			} else {
				var models = this.collectModels();
				this.update( this.prepareTplData( models ) );
				
				if( this.rendered ) {
					this.collectModelElements( models );
				}
			}
		},
		
		
		/**
		 * Retrieves the data that will be {@link jqc.template.Template#apply applied} to the {@link #tpl} upon 
		 * {@link #refresh}. 
		 * 
		 * This method may be overridden by subclasses to add additional properties which will be provided
		 * to the {@link #tpl}.
		 * 
		 * @protected
		 * @param {data.Model[]} models The models that are to be rendered by the {@link #tpl} (collected from 
		 *   {@link #collectModels}).
		 * @return {Object} An Object (map) of the properties which will be {@link jqc.template.Template#apply applied}
		 *   to the {@link #tpl}, to produce the output.
		 */
		prepareTplData : function( models ) {
			var data = {};
			data[ this.modelsVar ] = models;
			
			return data;
		},
		
		
		/**
		 * Returns the array of {@link data.Model Models} which will be provided to the {@link #tpl}. This method
		 * may be overridden in subclasses for different implementations (such as to support paging).
		 * 
		 * @protected
		 * @return {data.Model[]} The array of models which will be processed by the {@link #tpl}.
		 */
		collectModels : function() {
			return ( this.collection ) ? this.collection.getModels() : [];
		},
		
		
		/**
		 * Collects the rendered elements that hold the markup for models, and stores them in the {@link #modelElCache}. 
		 * These elements are determined from the rendered markup by the {@link #modelSelector}.
		 * 
		 * This method also attaches a data attribute which holds the corresponding {@link data.Model Model's}
		 * {@link data.Model#getClientId clientId}. 
		 * 
		 * @private
		 * @param {data.Model[]} models The models that were rendered by the {@link #tpl} (collected from 
		 *   {@link #collectModels}).
		 */
		collectModelElements : function( models ) {
			var modelElCache = this.modelElCache = {};    // clear the modelElCache to start
			
			var $els = this.getContentTarget().find( this.modelSelector );
			for( var i = 0, len = $els.length; i < len; i++ ) {
				var $el = $els.eq( i ),
				    clientId = models[ i ].getClientId();
				
				$el.attr( 'data-CollectionView-clientId', clientId );
				modelElCache[ clientId ] = $el;
			}
		},
		
		
		// -----------------------------------
		
		
		/**
		 * Retrieves the corresponding {@link data.Model Model} for the given HTMLElement, or descendant HTMLElement,
		 * of the element that is presenting the Model in the markup. This is the element that wraps the Model's
		 * display, and matches the {@link #modelSelector}.
		 * 
		 * @protected
		 * @param {HTMLElement/jQuery} element The HTMLElement or jQuery set which wraps the HTMLElement in the
		 *   model's markup. If a descendant element of the model's element is provided, the DOM tree will be walked
		 *   up until a model's element is found. If the element provided is *not* a model-encapsulating element or
		 *   one of its descendant elements, the method returns null.
		 * @return {data.Model} The Model that corresponds to the `element` provided, or `null` if there was no
		 *   model-encapsulating element for the `element` provided.
		 */
		getModelFromElement : function( element ) {
			var $modelEl = this.getModelParentElement( element );
			return this.collection.getByClientId( $modelEl ? $modelEl.attr( 'data-CollectionView-clientId' ) : -1 );
		},
		
		
		/**
		 * Retrieves the HTMLElement that represents a {@link data.Model} in the markup, given a child element. The 
		 * DOM tree will be walked up until the model's encapsulating element is found. If the model's element
		 * itself is provided, it will simply be returned.
		 * 
		 * @protected
		 * @param {HTMLElement/jQuery} childEl The child element to find its encapsulating model element from.
		 * @return {jQuery} The HTMLElement for the model, wrapped in a jQuery set, of `null` if the `childEl`
		 *   was not a child element of a model-encapsulating element.
		 */
		getModelParentElement : function( childEl ) {
			var $modelEl = jQuery( childEl ).closest( this.modelSelector );
			return ( $modelEl.length > 0 ) ? $modelEl : null;
		},
		
		
		/**
		 * Retrieves the element which encapsulates a {@link data.Model Model's} data, given the {@link data.Model Model}.
		 * 
		 * @protected
		 * @param {data.Model} model The Model to retrieve the corresponding element for.
		 * @return {jQuery} The HTMLElement, wrapped in a jQuery set, which encapsulates the model's display. Returns
		 *   null if there was no such HTMLElement for the given `model` (or the Collection View is not yet rendered).
		 */
		getElementFromModel : function( model ) {
			return ( !this.rendered ) ? null : this.modelElCache[ model.getClientId() ] || null;
		},
		
		
		// ---------------------------------------
		
		
		/**
		 * @inheritdoc
		 */
		onDestroy : function() {
			if( this.collection ) {
				this.unbindCollectionListeners();
				delete this.collection;
			}
			
			this._super( arguments );
		}
		
	} );
	
	
	ComponentManager.registerType( 'collectionview', CollectionView );
	
	return CollectionView;
	
} );