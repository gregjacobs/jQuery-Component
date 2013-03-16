/*global define */
define( [
	'jquery',
	'lodash',
	'Class',
	'ui/UI',
	'Observable',
	'ui/ComponentManager',
	'ui/Css',
	'ui/Mask',
	'ui/anim/Animation',
	'ui/plugin/Plugin',
	'ui/util/LoDashTpl'
],
function( jQuery, _, Class, UI, Observable, ComponentManager, Css, Mask, Animation, Plugin, LoDashTpl ) {

	/**
	 * @class ui.Component
	 * @extends Observable
	 * 
	 * Generalized component that defines a displayable item that can be placed onto a page. Provides a base element (by default, a div),
	 * and a framework for the instantiation, rendering, and (eventually) the destruction process, with events that can be listened to
	 * each step of the way.
	 * 
	 * Components can be constructed via anonymous config objects, based on their `type` property. This is useful for defining components in
	 * an anonymous object, when added as items of a {@link ui.Container}.
	 * 
	 * Some other things to note about Component and its subclasses are:
	 * 
	 * - Any configuration options that are provided to its constructor are automatically applied (copied) onto the new Component object. This
	 *   makes them available as properties, and allows them to be referenced in subclasses as `this.configName`.  However, unless the
	 *   configuration options are also listed as public properties, they should not be used externally.
	 * - Components directly support masking and un-masking their viewable area.  See the {@link #maskConfig} configuration option, and the {@link #mask} and
	 *   {@link #unMask} methods.
	 * - When a Component is {@link #method-destroy} destroyed, a number of automatic cleanup mechanisms are executed. See {@link #method-destroy} for details.
	 */
	var Component = Class.extend( Observable, { 
		
		/**
		 * @cfg {String} id 
		 * The id that identifies this Component, in a given hierarchy of {@link ui.Container Containers}/Components. 
		 * Defaults to a unique id, and may be retrieved by {@link #getId}. This component is retrievable from a 
		 * {@link ui.Container} via {@link ui.Container#findById}.
		 */
		 
		/**
		 * @cfg {String} elId
		 * The id that should be used for the Component's element. Defaults to a unique id.
		 * If this config is not provided, the unique id is generated when the Component is {@link #method-render rendered}.
		 */
		
		/**
		 * @cfg {String} elType
		 * The element type that should be created as the Component's HTML element. For example, the string
		 * 'div' will create a &lt;div&gt; element for the Component. Any HTML element type can be used,
		 * and subclasses may override the default for a different implementation.
		 */
		elType : 'div',
		 
		/**
		 * @cfg {jQuery/HTMLElement} renderTo The HTML element to render this component to. If specified, 
		 * the component will be rendered immediately upon creation.
		 */
		
		/**
		 * @cfg {Boolean} hidden True to initially render the Component hidden.
		 */
		hidden : false,
		
		/**
		 * @cfg {Object} attr
		 * Any additional html attributes to apply to the outer div element. Should be an object where the keys are the attribute names, and the values are the 
		 * attribute values. Attribute values should be strings.
		 */
		
		/**
		 * @cfg {String} cls
		 * Any additional CSS class(es) to add to this component's element. If multiple, they should be separated by a space. 
		 * Useful for styling Components and their inner elements (if any) based on regular CSS rules.
		 * (Note that this is named 'cls' instead of 'class', as 'class' is a JavaScript reserved word.)
		 */
		cls: '',
		
		/**
		 * @cfg {Object} style
		 * Any additional CSS style(s) to apply to the outer div element. Should be an object where the keys are the css property names, and the 
		 * values are the CSS values.
		 */
		
		
		/**
		 * @cfg {String} html
		 * Any explicit HTML to attach to the Component at render time.
		 * 
		 * Note that this config, in the end, has the same effect as the {@link #contentEl} config, but is more clear 
		 * from the client code's side for adding explict HTML to the Component.
		 */
		
		/**
		 * @cfg {HTMLElement/jQuery} contentEl
		 * An existing element or jQuery wrapped set to place into the Component when it is rendered, which will become
		 * the "content" of the Component.  The element will be moved from its current location in the DOM to inside this
		 * Component's element.
		 * 
		 * Note that this config, in the end, has the same effect as the {@link #html} config, but is more clear from the
		 * client code's side for adding DOM elements to the Component.
		 */
		
		
		/**
		 * @cfg {Number/String} height
		 * A height to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
		 */
		
		/**
		 * @cfg {Number/String} width
		 * A width to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
		 */
		
		/**
		 * @cfg {Number/String} minHeight
		 * A minimum height to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
		 */
		
		/**
		 * @cfg {Number/String} minWidth
		 * A minimum width to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
		 */
		
		/**
		 * @cfg {Number/String} maxHeight
		 * A maximum height to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
		 */
		
		/**
		 * @cfg {Number/String} maxWidth
		 * A maximum width to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
		 */
		
		
		/**
		 * @cfg {Object} maskConfig A configuration object for the default mask that will be shown when the {@link #mask} method is called (if {@link #mask mask's}
		 * argument is omitted), or if the {@link #cfg-masked} configuration option is true (in which a mask will be shown over the Component, using this maskConfig, 
		 * when it is first rendered).  This default maskConfig can be overrided when calling {@link #mask} by passing a configuration object for its argument.<br><br>
		 * 
		 * Masks are shown and hidden using the {@link #mask} and {@link #unMask} methods. If this configuration option is not provided, the configuration
		 * options default to the default values of the configuration options for {@link ui.Mask}.
		 */
		
		/**
		 * @cfg {Boolean} masked True to instantiate the Component with its mask shown (the {@link #mask} method is automatically run when the Component
		 * is rendered).
		 */
		masked : false,
		
		
		/**
		 * @cfg {String/String[]/Function/ui.util.LoDashTpl} tpl
		 * 
		 * The Lo-Dash template to use as the HTML template of the Component. This can be a string, an array of strings, 
		 * a compiled Lo-Dash template function, or a {@link ui.util.LoDashTpl} instance. When the Component is rendered,
		 * it will be turned into a {@link ui.util.LoDashTpl LoDashTpl} instance.
		 * 
		 * Used in conjunction with the {@link #tplData} config (which will be the data that is provided to the template
		 * function), this template can be used as the component's markup. Its output is injected into the element specified by
		 * the {@link #getContentTarget content target}, after the {@link #onRender} method has been executed. 
		 * 
		 * If this config is specified, it will override the {@link #html} and {@link #contentEl} configs. The markup that it 
		 * outputs can be updated with new data by using the {@link #update} method, and providing an Object as its first argument.
		 * 
		 * For more information on Lo-Dash templates, see: [http://lodash.com/docs#template](http://lodash.com/docs#template)
		 */
		
		/**
		 * @cfg {Object} tplData
		 * 
		 * The data to provide to the {@link #tpl} when initially rendering the Component. If this config is not
		 * specified, but a {@link #tpl} config is, then the {@link #tpl} will simply be provided an empty object as its data.
		 * 
		 * Note that the template data can be provided after {@link #method-render} time to update the markup of the Component using 
		 * the {@link #update} method. However, if initial data is available, it should be provided with this config so that the 
		 * template is run with the correct initial data the first time, and doesn't need to be run again unless the data has 
		 * changed.
		 */
		
		
		/**
		 * @cfg {ui.plugin.Plugin/ui.plugin.Plugin[]} plugins
		 * A single plugin or array of plugins to attach to the Component. Plugins must extend the class {@link ui.plugin.Plugin}.
		 * See {@link ui.plugin.Plugin} for details on creating plugins.
		 * 
		 * Note that Component will normalize this config into an array, converting a single plugin into a one-element array, or creating
		 * an empty array if no plugins were provided.  This is done so that subclasses may add plugins by pushing them directly
		 * onto the plugins array in their implementation of {@link #initComponent}. 
		 */
		
		
		
		/**
		 * @private
		 * @property {Number} uuid
		 * 
		 * A globally unique identifier for the Component, which is different between all {@link ui.Container} heirarchies.
		 */
		
		/**
		 * @private
		 * @cfg {ui.Container} parentContainer
		 * 
		 * The parent {@link ui.Container Container} of this Component (if any). This is set by the {@link ui.Container} that is adding this Component
		 * as a child, and should not be supplied directly.
		 */
		parentContainer: null,
	 
		/**
		 * @protected
		 * @property {Boolean} rendered
		 * 
		 * Property that can be used to determine if the Component has been rendered.  
		 * Will be set to true after the render method has been executed.
		 */
		rendered: false,
		
		/**
		 * @private
		 * @property {Boolean} hidden
		 * 
		 * Property that stores the 'hidden' state of the Component. Note that the component may be 
		 * considered "hidden" by its element's visibility (i.e. it will be considered hidden if its parent
		 * element is hidden), in which case the {@link #isHidden} method will return true. But this property
		 * stores the state of if the Component is supposed to be still hidden when its parent element is shown.
		 */
		
		/**
		 * @protected
		 * @property {Boolean} masked
		 * 
		 * Flag to store the current state of if the Component is masked or not. This is also a config option.
		 */
		
		/**
		 * @private
		 * @property {Boolean} deferMaskShow
		 * 
		 * Flag that is set to true if the {@link #mask} method is run, but the Component is currently hidden.
		 * The Component must be in a visible state to show the mask, as the ui.Mask class makes a calculation of 
		 * the height of the mask target element.  When the Component's {@link #method-show} method runs, this flag will be
		 * tested to see if it is true, and if so, will run the {@link #mask} method at that time.
		 */
		deferMaskShow : false,
		
		/**
		 * @private
		 * @property {ui.Mask} _mask
		 * 
		 * The ui.Mask instance that the Component is currently using to mask over the Component. This will be null
		 * if no ui.Mask has been created (i.e. the {@link #mask} method has never been called). 
		 */
		
		/**
		 * @private
		 * @property {Object} deferredMaskConfig
		 * 
		 * If the masking of the Component needs to be deferred (either because the Component is not yet rendered, or because
		 * the Component is currently hidden), then the configuration options to show the mask with are stored in this property,
		 * for when the mask does in fact get shown.
		 */
		
		/**
		 * @protected
		 * @property {Boolean} updateCalledWithContent
		 * 
		 * This special flag is for if a {@link #tpl} exists, but the {@link #update} method was called with direct HTML content
		 * (instead of {@link #tplData}). This only matters while the Component is in its {@link #rendered unrendered} state. A 
		 * value of `true` tells the {@link #method-render} method to skip rendering the {@link #tpl}, and instead use the direct 
		 * {@link #html} content that was provided to the call to {@link #update}.
		 */
		
		
		/**
		 * @protected
		 * @property {Boolean} destroyed
		 * 
		 * Initially false, and will be set to true after the {@link #method-destroy} method executes.
		 */
		destroyed: false,
		
		/**
		 * @protected
		 * @property {jQuery} $el
		 * 
		 * The main element that is created for the Component (determined by the {@link #elType} config). 
		 * This will be available after the Component is rendered, and may be retrieved using {@link #getEl}
		 */	
		
		
		/**
		 * @constructor
		 * @param {Object} config The configuration options for this Component, specified in an object (hash).
		 */
		constructor : function( config ) {
			// Apply the properties of the configuration object onto this object
			_.assign( this, config );
			
			
			// Call superclass (observable) constructor. Must be done after config has been applied.
			this._super( arguments );
			
	        
			// Add events that this class will fire
			this.addEvents( 
				/**
				 * Fires when this component has been {@link #method-render rendered}.
				 * 
				 * @event render
				 * @param {ui.Component} component This component.
				 */
				'render',
				
				/**
				 * Fires when the component has been shown, using the {@link #method-show} method. Only fires
				 * if the Component has been {@link #method-render rendered}.
				 * 
				 * @event show
				 * @param {ui.Component} component This component.
				 */
				'show',
				
				/**
				 * Fires when the component has been hidden, using the {@link #method-hide} method. Only fires
				 * if the Component has been {@link #method-render rendered}.
				 * 
				 * @event hide
				 * @param {ui.Component} component This component.
				 */
				'hide',
				
				/**
				 * Fires just before this component is destroyed. A handler of this event may return false to cancel 
				 * the destruction process for the Component.
				 * 
				 * @event beforedestroy
				 * @param {ui.Component} component This component. 
				 */
				'beforedestroy',
				
				/**
				 * Fires when this component has been destroyed.
				 * 
				 * @event destroy
				 * @param {ui.Component} component This component.
				 */
				'destroy'
			);
			
			
			// Generate a globally unique identifier for the Component, which is unique between all Container hierarchies on the page
			this.uuid = _.uniqueId();
			
			
			// Generate a unique ID for this component (which is the ID for a component in a given Container hierarchy). A unique element 
			// ID for the component's div element will be created (if not provided) in render().
			this.id = this.id || 'ui-cmp-' + _.uniqueId();
			
			// Normalize the 'plugins' config into an array before calling initComponent, so that subclasses may just push any
			// plugins that they wish directly onto the array without extra processing.
			this.plugins = this.plugins || [];
			if( !_.isArray( this.plugins ) ) {
				this.plugins = [ this.plugins ];
			}
	        
			
			// Call template method for the initialization of subclasses of this Component
			this.initComponent();
			
			
			// Initialize any plugins provided to the Component
			if( this.plugins.length > 0 ) {
				this.initPlugins( this.plugins );
			}
			
			// Render the component immediately if a 'renderTo' element is specified
			if( this.renderTo ) {
				this.render( this.renderTo );
				delete this.renderTo;   // no longer needed
			}
		},
		
		
		/**
		 * Hook method for initialization. This method should replace constructor for subclasses
		 * of Component.
		 * 
		 * @protected
		 * @method initComponent
		 */
		initComponent : UI.emptyFn,
		
		
		/**
		 * Initializes the plugins for the Component.
		 * 
		 * @private
		 * @method initPlugins
		 * @param {ui.plugin.Plugin/ui.plugin.Plugin[]} plugin A single plugin, or array of plugins to initialize.
		 */
		initPlugins : function( plugin ) {
			if( _.isArray( plugin ) ) {
				for( var i = 0, len = plugin.length; i < len; i++ ) {
					this.initPlugins( plugin[ i ] ); 
				}
				return;  // array has been processed, return
			}
			
			if( !( plugin instanceof Plugin ) ) {
				throw new Error( "error: a plugin provided to this Component was not of type ui.plugin.Plugin" );
			}
			
			// Initialize the plugin, passing a reference to this Component into it.
			plugin.init( this );
		},
		
		
		/**
		 * Renders the component into a containing HTML element.  Starts by creating the base div element for this component, and then 
		 * calls the hook method {@link #onRender} to allow subclasses to add their own functionality/elements into the rendering process.
		 * When fully complete, the {@link #event-render render event is fired}, and then {@link #doLayout} is executed (if the `deferLayout` 
		 * option is not provided as `true`).
		 *
		 * @method render
		 * @param {HTMLElement/jQuery} containerEl The HTML element to render this component into.
		 * @param {Object} [options] Any of the following options. (Note: for backward compatibility, this argument may be the `position` option below.)
		 * @param {String/Number/HTMLElement/jQuery} [options.position] The index, element id, or element that the component should be inserted before.
		 *   This element should exist within the `containerEl`.
		 * @param {Boolean} [options.deferLayout=false] True to defer the execution of {@link #doLayout} during the rendering
		 *   process until manually called.
		 */
		render : function( containerEl, options ) {
			// Destroyed components can't be re-rendered. Return out.
			if( this.destroyed ) {
				return;
			}
			
			// Maintain backward compatibility where the `options` argument was the `position` option
			var position;
			if( _.isNumber( options ) || _.isString( options ) || _.isElement( options ) || options instanceof jQuery ) {
				position = options;
				options = { position: position };  // store it in there for when it is provided to hook methods
			} else {
				options = options || {};
				position = options.position;
			}
			
			
			var $containerEl = jQuery( containerEl );
			
			// Normalize position to the element where the Component is to be placed before (if provided)
			if( typeof position !== 'undefined' ) {
				if( typeof position === 'number' ) {
					// note: If the numeric `position` doesn't resolve to an element to insert before, it will become `undefined`, causing the code later to just append it instead. 
					// This is desired behavior, as inserting into an element at a position greater than the number of elements in the container, would make sense to simply append.
					position = $containerEl.children().get( position );   // get() will return undefined if there is no element at that position
				} else {
					position = $containerEl.find( position );  // if an element was provided, make sure that the element exists in the container element provided as well
				}
			}
			
			// Make sure the `tpl` has been created into a LoDashTpl instance
			if( this.tpl ) {
				this.tpl = new LoDashTpl( this.tpl );
			}
			
			
			if( this.rendered ) {
				// Component is already rendered, just append it to the supplied container element
				if( position ) {
					// If the element where this Component is to be positioned before happens to already be this Component's element,
					// jQuery's insertBefore() has the effect of removing the element from the DOM... Hence, only move the Component's
					// element if it is not to be placed "before itself" (in which otherwise, it is already in the correct position, 
					// and we don't need to do anything anyway) 
					if( position[ 0 ] !== this.$el[ 0 ] ) {
						this.$el.insertBefore( position );
					}
				} else {
					this.$el.appendTo( $containerEl );
				}
				
			} else {
				// First, generate an element ID for the component's element, if one has not been provided as a config
				this.elId = this.elId || 'ui-cmp-' + _.uniqueId();
				
				// Handle any additional attributes (the 'attr' config) that were specified to add
				var additionalAttributes = [], 
				    attr = this.attr;
				if( attr ) {
					for( var attribute in attr ) {
						if( attr.hasOwnProperty( attribute ) ) {
							additionalAttributes.push( attribute + '="' + attr[ attribute ] + '"' );
						}
					}
					delete this.attr;  // no longer needed
				}
				
				
				// Create a CSS string of any specified styles (the 'style' config)
				var styles = "";
				if( this.style ) {
					styles = Css.hashToString( this.style );
					delete this.style;  // no longer needed
				}
				
				// Create the main (outermost) element for the Component. By default, creates a div element, such as:
				// <div id="someID" />
				this.$el = jQuery( '<' + this.elType + ' id="' + this.elId + '" class="' + this.cls + '" style="' + styles + '" ' + additionalAttributes.join( " " ) + ' />' );
				
				
				// Appending the element to the container before the call to onRender. It is necessary to do things in this order (and not rendering children and then appending)
				// for things like the jQuery UI tabs, which requires that their wrapping elements be attached to the DOM when they are instantiated.
				// Otherwise, those items require their instantiation to be placed into a setTimeout(), which causes a flicker on the screen (especially for the jQuery UI tabs). 
				if( position ) {
					this.$el.insertBefore( position );
				} else {
					this.$el.appendTo( $containerEl );
				}
				
				// Setting the render flag before the call to onRender so that onRender implementations can call methods that check this flag (such as setters
				// that handle the case of the Component not yet being rendered).
				this.rendered = true;
				
				// Call onRender hook method for subclasses to add their own elements, and whatever else they need 
				this.onRender( $containerEl, options );
				
				
				
				
				// Attach the output of the `tpl` config (if provided) or any specified HTML or content element to the Component's content 
				// target. The content target is by default, the Component's element, but may be overridden by subclasses that generate a 
				// more complex HTML structure.
				var $contentTarget = this.getContentTarget();
				if( this.tpl && !this.updateCalledWithContent ) {  // tpl config takes precedence over html/contentEl configs, *unless* update() has been called with HTML content
					$contentTarget.append( this.tpl.apply( this.tplData ) );
					delete this.tplData;  // no longer needed
					
				} else {
					if( this.html ) {
						$contentTarget.append( this.html );
					}
					if( this.contentEl ) {
						$contentTarget.append( this.contentEl );
					}
				}
				delete this.updateCalledWithContent;  // no longer needed
				delete this.html;                     // no longer needed
				delete this.contentEl;                // no longer needed
				
				// Apply any custom sizing
				if( typeof this.height !== 'undefined' )    { this.$el.height( this.height ); }
				if( typeof this.width !== 'undefined' )     { this.$el.width( this.width ); }
				if( typeof this.minHeight !== 'undefined' ) { this.$el.css( { minHeight: this.minHeight } ); }
				if( typeof this.minWidth !== 'undefined' )  { this.$el.css( { minWidth: this.minWidth } ); }
				if( typeof this.maxHeight !== 'undefined' ) { this.$el.css( { maxHeight: this.maxHeight } ); }
				if( typeof this.maxWidth !== 'undefined' )  { this.$el.css( { maxWidth: this.maxWidth } ); }
				
				
				// If the Component was configured with hidden = true, hide it now. This must be done after onRender,
				// because some onRender methods change the 'display' style of the outer element.
				if( this.hidden ) {
					this.$el.hide();
				}
				
				// If the Component was configured with masked = true, show the mask now.
				if( this.masked ) {
					this.mask( this.deferredMaskConfig );  // deferredMaskConfig will be defined if a call to mask() has been made before the Component has been rendered. Otherwise, it will be undefined.
				}
				
				// Call the afterRender hook method, and fire the 'render' event
				this.afterRender( $containerEl, options );
				this.fireEvent( 'render', this );
				
				// Finally, if the deferLayout option was not provided as true, run the layout on the Component (or Container, 
				// if it's a ui.Container subclass!)
				if( !options.deferLayout ) {
					this.doLayout();
				}
			}
		},
		
		
		/**
		 * Determines if the Component is currently {@link #rendered}.
		 * 
		 * @method isRendered
		 * @return {Boolean} True if the Component is rendered, false otherwise.
		 */
		isRendered : function() {
			return this.rendered;
		},
		
		
		/**
		 * Hook method that runs when a Component is being rendered, after the Component's base element has been created and appended
		 * to its parent element.
		 * 
		 * @protected
		 * @method onRender
		 * @param {jQuery} $containerEl The HTML element wrapped in a jQuery set that the component is being rendered into.
		 * @param {Object} options The options provided to {@link #method-render}.
		 */
		onRender : UI.emptyFn,
		
		
		/**
		 * Hook method that runs when a Component has been completely rendered (i.e. the base element has been created,
		 * the {@link #onRender} template method has run, the content/html has been appended, the sizing configs have been set,
		 * and the element has had its initial {@link #cfg-hidden} state set).
		 * 
		 * @protected
		 * @method afterRender
		 * @param {jQuery} $containerEl The HTML element wrapped in a jQuery set that the component has been rendered into.
		 * @param {Object} options The options provided to {@link #method-render}.
		 */
		afterRender : UI.emptyFn,
		
		
		/**
		 * Updates the HTML of the component directly, or re-runs the {@link #tpl} to update the HTML if {@link #tplData template data}
		 * (an Object) is provided. Will handle the unrendered and rendered states of the Component.
		 *
		 * @param {String/HTMLElement/jQuery/Object} contentOrTplData The HTML content as a string, an HTML element, or a jQuery 
		 *   wrapped set of elements to update the component's {@link #getContentTarget content target} with. If an Object is provided, 
		 *   it is taken as the {@link #tplData data} that the {@link #tpl} should be executed with, allowing this method to update the 
		 *   Component's markup via its {@link #tpl}.
		 */
		update : function( content ) {
			var isTplData = _.isPlainObject( content );  // will be true if it is a plain JavaScript Object, meaning template data is being provided
			
			if( !this.rendered ) {
				if( isTplData ) {
					this.tplData = content;
					
				} else {  // Not a plain JavaScript Object, must be HTML content
					// Remove this config, just in case it was specified. Setting the 'html' config (next) has the same effect as 'contentEl'.
					delete this.contentEl;
					
					// Set the 'html' config, for when the Component is rendered.
					this.html = content;
					this.updateCalledWithContent = true;  // in case there is a `tpl` config, this flag tells render() to use the `html` config instead 
                                                          // of `tpl` when it renders. We don't want to delete the `tpl` config, since it may be used with
                                                          // data provided to this method at a later time.
				}
			} else {
				this.getContentTarget()
					.empty()
					.append( isTplData ? this.tpl.apply( content ) : content );
			}
		},
		
		
		
		// Layout Functionality
		
		/**
		 * This method was initially intended to bring Component layouts into the mix (instead of only having {@link ui.Container Container}
		 * layouts, which lay out {@link ui.Container#items child components}). A Component layout was going to size and position the HTML 
		 * elements that a particular Component had created in its {@link #onRender} method.
		 * 
		 * However, at the time of this writing, we never got around to implementing this feature, and {@link ui.Container} extends
		 * this method for its {@link ui.Container#layout layout} of {@link ui.Container#items child components}. This method was added into 
		 * the Component class (this class) later though, in an effort to allow Components to respond to being laid out by their {@link #parentContainer}.
		 * When the Component's {@link #parentContainer} runs its {@link ui.Container#layout layout}, this method is executed from it. A 
		 * Component author may implement an extension of the {@link #onComponentLayout} hook method to respond to the Component being laid 
		 * out by its {@link #parentContainer}, such as to implement updating the size or positioning of its child elements upon being laid out.
		 * Note that {@link #onComponentLayout} will eventually be called just from the Component's initial {@link #method-render rendering} 
		 * process as well, if the Component is not being rendered by a {@link #parentContainer} layout (i.e. it is a standalone Component,
		 * not part of a {@link ui.Container Container}/Component hierarchy).
		 * 
		 * So, bottom line, if you wish for your Component to do something when it is laid out by its {@link #parentContainer},
		 * implement the {@link #onComponentLayout} method. See {@link #onComponentLayout} for details.
		 * 
		 * @method doLayout
		 */
		doLayout : function() {
			// Note: this method is extended in the ui.Container subclass. Keep this in mind if ever implementing Component
			// layouts properly, which should both run both the Component's layout, *and* the Container's layout (in that order).
			
			// Simply call the hook method to allow subclasses to participate in the Component being laid out, and fire the event.
			this.onComponentLayout();
		},
		
		
		/**
		 * Hook method that is executed when {@link #doLayout} has executed. Extend this method (calling the superclass method first)
		 * to implement any logic that the Component subclass should perform when it is either: 
		 * 
		 * a) Initially rendered (as a standalone component, not part of a {@link ui.Container Container}/Component hierarchy), or
		 * b) Has been laid out by its {@link #parentContainer}. If initially rendered by its {@link #parentContainer parent container's}
		 * layout, then this will be the same event.
		 * 
		 * For example, a Component could resize its inner elements for new dimensions set on the Component by its 
		 * {@link #parentContainer parentContainer's} {@link ui.Container#layout layout} algorithm. The layout may size the Component
		 * upon its initial rendering, an update to the child components of the {@link #parentContainer}, or from say, a browser resize
		 * where the layout runs again.
		 *
		 * @protected
		 * @template
		 * @method onComponentLayout
		 */
		onComponentLayout : UI.emptyFn,
		
		
		/**
		 * When called on the Component, this method bubbles up to the top of the {@link ui.Container Container}/Component hierarchy,
		 * and runs {@link #doLayout} on the top-most component. This has the effect of re-doing the layout for all Containers/Components
		 * in that particular hierarchy. As such, this may be an expensive operation; use with care. This may be useful however for components
		 * that are sized based on their content, and when their content size changes, they should force a layout to adjust for the new
		 * content size.
		 * 
		 * @method updateLayout
		 */
		updateLayout : function() {
			// Bubble up to the top level parent container of this Component's hierarchy, and then call doLayout() on it
			var p = this;
			while( p.parentContainer ) {
				p = p.parentContainer;
			}
			p.doLayout();
		},
		
		
		// ----------------------------
		
		// Attribute, CSS Class, and Element Style related functionality
		
		/**
		 * Sets an attribute on the Component's {@link #$el element}.
		 * 
		 * @method setAttr
		 * @param {String/Object} name The attribute name. This first argument may also be provided as an Object of key/value
		 *   pairs for attribute names/values to apply to the Component's {@link #$el element}.
		 * @param {String} value The value for the attribute. Optional if the first argument is an Object.
		 * @return {ui.Component} This Component, to allow method chaining.
		 */
		setAttr : function( name, value ) {
			if( !this.rendered ) {
				this.attr = this.attr || {};
				
				if( typeof name === 'object' ) {
					_.assign( this.attr, name );  // apply each of the properties on the provided 'attrs' object onto the component's attributes
				} else {
					this.attr[ name ] = value;
				}
				
			} else {
				this.$el.attr( name, value );  // will work for both method signatures
			}
			return this;
		},
		
		
		/**
		 * Adds a CSS class to the Component's {@link #$el element}.
		 * 
		 * @method addCls
		 * @param {String} cssClass One or more CSS classes to add to the Component's element. If specifying multiple CSS classes,
		 *   they should be separated with a space. Ex: "class1 class2"
		 * @return {ui.Component} This Component, to allow method chaining.
		 */
		addCls : function( cssClass ) {
			if( !this.rendered ) {
				var cssClasses = cssClass.split( ' ' );
				for( var i = 0, len = cssClasses.length; i < len; i++ ) {
					var cls = cssClasses[ i ],
					    regex = new RegExp( '(^| )' + cls + '( |$)' );
					    
					if( !regex.test( this.cls ) ) {
						this.cls += ' ' + cls;
					}
				}
				this.cls = jQuery.trim( this.cls );
				
			} else {
				this.$el.addClass( cssClass ); // delegate to jQuery in this case
			}
			return this;
		},
		
		
		/**
		 * Removes a CSS class from the Component's {@link #$el element}.
		 * 
		 * @method removeCls
		 * @param {String} cssClass One or more CSS classes to remove from the Component's element. If specifying multiple CSS classes,
		 *   they should be separated with a space. Ex: "class1 class2"
		 * @return {ui.Component} This Component, to allow method chaining.
		 */
		removeCls : function( cssClass ) {
			if( !this.rendered ) {
				var cssClasses = cssClass.split( ' ' );
				var replaceFn = function( match, $1, $2 ) {
					return ( $1 === " " && $2 === " " ) ? " " : "";  // if the css class was padded with spaces on both sides, replace with a single space. Otherwise, we can replace with nothing.
				};
				
				for( var i = 0, len = cssClasses.length; i < len; i++ ) {
					var cls = cssClasses[ i ],
					    regex = new RegExp( '(^| )' + cls + '( |$)', 'g' );
									
					this.cls = this.cls.replace( regex, replaceFn );
				}
				
			} else {
				this.$el.removeClass( cssClass ); // delegate to jQuery in this case
			}
			return this;
		},
	
	
		/**
		 * Adds or removes a CSS class from the Component's {@link #$el element}, based on if the CSS class already exists on the element
		 * or not. If providing the `flag` argument, the `cssClass` will be added or removed based on if `flag` is true or false.
		 * 
		 * @method toggleCls
		 * @param {String} cssClass One or more CSS classes to remove from the Component's element. If specifying multiple CSS classes,
		 *   they should be separated with a space. Ex: "class1 class2"
		 * @param {Boolean} [flag] True if the class(es) should be added, false if they should be removed. This argument is optional,
		 *   and if provided, determines if the class should be added or removed.
		 * @return {ui.Component} This Component, to allow method chaining.
		 */
		toggleCls : function( cssClass, flag ) {
			if( typeof flag === 'undefined' ) {
				this[ !this.hasCls( cssClass ) ? 'addCls' : 'removeCls' ]( cssClass );
			} else {
				this[ flag ? 'addCls' : 'removeCls' ]( cssClass );
			}
			return this;
		},
		
		
		/**
		 * Determines if the Component's {@link #$el element} has the given `cssClass`.
		 * 
		 * @method hasCls
		 * @param {String} cssClass The CSS class to test for.
		 * @return {Boolean} True if the {@link #$el element} has the given `cssClass`, false otherwise.
		 */
		hasCls : function( cssClass ) {
			if( !this.rendered ) {
				var regex = new RegExp( '(^| )' + cssClass + '( |$)', 'g' );
				return regex.test( this.cls );
				
			} else {
				return this.$el.hasClass( cssClass );
			}
		},
		
		
		/**
		 * Sets a CSS style property on the Component's {@link #$el element}.
		 * 
		 * @method setStyle
		 * @param {String/Object} name The CSS property name. This first argument may also be provided as an Object of key/value
		 *   pairs for CSS property names/values to apply to the Component's {@link #$el element}.
		 * @param {String} value The value for the CSS property. Optional if the first argument is an Object.
		 * @return {ui.Component} This Component, to allow method chaining.
		 */
		setStyle : function( name, value ) {
			if( !this.rendered ) {
				this.style = this.style || {};
				
				if( typeof name === 'object' ) {
					_.assign( this.style, name );  // apply each of the properties on the provided 'styles' object onto the component's style
				} else {
					this.style[ name ] = value;
				}
				
			} else {
				this.$el.css( name, value );  // will work for both method signatures (i.e. when `name` is an object, and when provided both name / value)
			}
			return this;
		},
		
		
		// ----------------------------
		
		
		/**
		 * Retrieves the element that should be the target for the Component's content (html).  For ui.Component, this is just the Component's
		 * base element (see {@link #$el}), but this method can be overridden in subclasses that define a more complex structure, where their
		 * content should be placed elsewhere. 
		 * 
		 * @method getContentTarget
		 * @return {jQuery} The element (jQuery wrapped set) where HTML content should be placed. The {@link #html} and {@link #contentEl} 
		 *   configs will be attached to this element.
		 */
		getContentTarget : function() {
			return this.getEl();
		},
		
		
		/**
		 * Returns the globally unique {@link #uuid} of this Component.
		 * 
		 * @method getUuid
		 * @return {Number}
		 */
		getUuid : function() {
			return this.uuid;
		},
		
		
		/**
		 * Returns the {@link #id} of this Component.
		 * 
		 * @method getId
		 * @return {String}
		 */
		getId : function() {
			return this.id;
		},
		
		
		/**
		 * Returns the container element for this component, wrapped in a jQuery object.  This element will only
		 * be available after the component has been rendered by {@link #method-render}.  The element that will be returned
		 * will be the one created for the Component in the {@link #method-render} method, and its type is dependent on the
		 * {@link #elType} config.
		 * 
		 * @method getEl
		 * @return {jQuery}
		 */
		getEl : function() {
			return this.$el;
		},
		
		
		/**
		 * Sets the size of the element.
		 * 
		 * @method setSize
		 * @param {Number} width The width, in pixels, for the Component. If undefined, no width will be set.
		 * @param {Number} height The height, in pixels, for the Component. If undefined, no height will be set.
		 */
		setSize : function( width, height ) {
			if( typeof width !== 'undefined' ) {
				this.width = width;
				
				if( this.rendered ) {
					this.$el.width( width );
				}
			}
			if( typeof height !== 'undefined' ) {
				this.height = height;
				
				if( this.rendered ) {
					this.$el.height( height );
				}
			}
		},
		
		
		/**
		 * Sets the width of the element.
		 *
		 * @method setWidth
		 * @param {Number/String} width The width. If a number, assumes pixels, otherwise uses the exact string.
		 */
		setWidth : function( width ) {
			this.setSize( width, undefined );
		},
	
		
		/**
		 * Sets the height of the element.
		 *
		 * @method setHeight
		 * @param {Number/String} height The height. If a number, assumes pixels, otherwise uses the exact string.
		 */
		setHeight : function( height ) {
			this.setSize( undefined, height );
		},
		
		
		/**
		 * Returns the width of the Component. 
		 * 
		 * Note: this may only be called after the component has been {@link #method-render rendered}.
		 *
		 * @method getWidth
		 * @return {Number}
		 */
		getWidth : function() {
			return this.$el.width();
		},
		
		
		/** 
		 * Returns the inner width of the Component. The inner width of the Component is the Component's width, plus
		 * its padding.
		 * 
		 * Note: this may only be called after the component has been {@link #method-render rendered}.
		 * 
		 * @method getInnerWidth
		 * @return {Number}
		 */
		getInnerWidth : function() {
			return this.$el.innerWidth();
		},
		
		
		/** 
		 * Returns the outer width of the Component. The outer width of the Component is the Component's width, plus
		 * its padding, plus its border width. Provide the optional argument `includeMargin` as true to include the margin
		 * as well.
		 * 
		 * Note: this may only be called after the component has been {@link #method-render rendered}.
		 * 
		 * @method getOuterWidth
		 * @param {Boolean} [includeMargin=false]
		 * @return {Number}
		 */
		getOuterWidth : function( includeMargin ) {
			return this.$el.outerWidth( includeMargin );
		},
		
	
		/**
		 * Returns the height of the Component. 
		 * 
		 * Note: this may only be called after the component has been {@link #method-render rendered}.
		 *
		 * @method getHeight
		 * @return {Number}
		 */
		getHeight : function() {
			return this.$el.height();
		},
		
		
		/** 
		 * Returns the inner height of the Component. The inner height of the Component is the Component's height, plus
		 * its padding.
		 * 
		 * Note: this may only be called after the component has been {@link #method-render rendered}.
		 * 
		 * @method getInnerHeight
		 * @return {Number}
		 */
		getInnerHeight : function() {
			return this.$el.innerHeight();
		},
		
		
		/** 
		 * Returns the outer height of the Component. The outer height of the Component is the Component's height, plus
		 * its padding, plus its border width. Provide the optional argument `includeMargin` as true to include the margin
		 * as well.
		 * 
		 * Note: this may only be called after the component has been {@link #method-render rendered}.
		 * 
		 * @method getOuterHeight
		 * @param {Boolean} [includeMargin=false]
		 * @return {Number}
		 */
		getOuterHeight : function( includeMargin ) {
			return this.$el.outerHeight( includeMargin );
		},
	
		
		/**
		 * Returns the configured width of the component.
		 *
		 * @method getConfiguredWidth
		 * @return {Number}
		 */
		getConfiguredWidth : function() {
			return this.width;
		},
	
		
		/**
		 * Returns the configured height of the component.
		 *
		 * @method getConfiguredHeight
		 * @return {Number}
		 */
		getConfiguredHeight : function() {
			return this.height;
		},
		
		
		/**
		 * Retrieves the width of the padding for the given `sides` of the component's {@link #$el element}. 
		 * `sides` can be either 't', 'r', 'b', 'l' for "top", "right", "bottom", or "left", *or* it can be a 
		 * combination of more than one to add the widths together. Ex: 'lr' would add the left and right padding 
		 * together and return that number.
		 * 
		 * Note: This method can only be run after the Component has been {@link #rendered}.
		 * 
		 * @method getPadding
		 * @param {String} sides 't', 'r', 'b', 'l', or a combination of multiple sides put together. Ex: 'lr'. 
		 *   See the description in this method.
		 * @return {Number} The width of the padding for the given `sides`.
		 */
		getPadding : function( sides ) {
			return Css.getPadding( this.$el, sides );
		},	
		
		
		/**
		 * Retrieves the width of the margin for the given `sides` of the component's {@link #$el element}. 
		 * `sides` can be either 't', 'r', 'b', 'l' for "top", "right", "bottom", or "left", *or* it can be a 
		 * combination of more than one to add the widths together. Ex: 'lr' would add the left and right margin 
		 * together and return that number.
		 * 
		 * Note: This method can only be run after the Component has been {@link #rendered}.
		 * 
		 * @method getMargin
		 * @param {String} sides 't', 'r', 'b', 'l', or a combination of multiple sides put together. Ex: 'lr'. 
		 *   See the description in this method.
		 * @return {Number} The width of the margin for the given `sides`.
		 */
		getMargin : function( sides ) {
			return Css.getMargin( this.$el, sides );
		},
		
		
		/**
		 * Retrieves the width of the border for the given `sides` of the component's {@link #$el element}. 
		 * `sides` can be either 't', 'r', 'b', 'l' for "top", "right", "bottom", or "left", *or* it can be a 
		 * combination of more than one to add the widths together. Ex: 'lr' would add the left and right border 
		 * together and return that number.
		 * 
		 * Note: This method can only be run after the Component has been {@link #rendered}.
		 * 
		 * @method getBorderWidth
		 * @param {String} sides 't', 'r', 'b', 'l', or a combination of multiple sides put together. Ex: 'lr'. 
		 *   See the description in this method.
		 * @return {Number} The width of the border for the given `sides`.
		 */
		getBorderWidth : function( sides ) {
			return Css.getBorderWidth( this.$el, sides );
		},
		
		
		/**
		 * Retrieves the "frame" size of the component's {@link #$el element}, which is the sum of the width of the padding, margin, and border, 
		 * for the given `sides` of the `element`. `sides` can be either 't', 'r', 'b', or 'l' (for "top", "right", "bottom", or "left"), *or* 
		 * it can be a combination of more than one to add the padding widths together. Ex: 'rl' would add the right and left padding/border/margin 
		 * together and return that number.
		 * 
		 * @method getFrameSize
		 * @param {String} sides 't', 'r', 'b', 'l', or a combination of multiple sides put together. Ex: 'lr'. 
		 *   See the description in this method.
		 * @return {Number} The sum total of the width of the border, plus padding, plus margin, for the given `sides`.
		 */
		getFrameSize : function( sides ) {
			return Css.getFrameSize( this.$el, sides );
		},
	
		
		// ------------------------------------
		
		
		/**
		 * Convenience method to show or hide the Component using a boolean.
		 * 
		 * @method setVisible
		 * @param {Boolean} visible True to show the Component, false to hide it.
		 * @return {ui.Component} This Component, to allow method chaining.
		 */
		setVisible : function( visible ) {
			return this[ visible ? 'show' : 'hide' ]();
		},
		
		
		/**
		 * Shows the Component. 
		 *
		 * @method show
		 * @param {Object} [animConfig] A {@link ui.anim.Animation} config object (minus the {@link ui.anim.Animation#target target) property) 
		 *   for animating the showing of the Component. Note that this will only be run if the Component is currently {@link #rendered}.
		 * @return {ui.Component} This Component, to allow method chaining.
		 */
		show : function( animConfig ) {
			this.hidden = false;  // set flag regardless of if the Component is rendered or not. If not yet rendered, this flag will be tested for in the render() method.
			
			if( this.rendered ) {
				// If a show animation was specified, run that now. Otherwise, simply show the element
				if( typeof animConfig === 'object' ) {
					animConfig.target = this;
					
					this.currentAnimation = new Animation( animConfig );    
					//this.currentAnimation.addListener( 'afteranimate', this.showComplete, this );  // adding a listener instead of providing in config, in case there is already a listener in the config
					this.currentAnimation.start();
				} else {
					this.$el.show();
				}
				
				// Call template method, and fire the event
				this.onShow();
				this.fireEvent( 'show', this );
			}
			
			return this;
		},
		
		
		/**
		 * Hook method for handling the component being shown. This will only be called when the 
		 * Component is shown after it is rendered. Note that this method is called immediately after
		 * any animation is started by providing the `animConfig` argument to {@link #method-show}.
		 * 
		 * @protected
		 * @method onShow
		 */
		onShow : function() {
			// If a mask show request has been made while the Component was hidden, show the mask now, with the configuration requested when the call to mask() was made (if any).
			if( this.deferMaskShow ) {
				this.mask( this.deferredMaskConfig );
			}
		},
		
		
		/**
		 * Hides the Component.
		 *
		 * @method hide
		 * @param {Object} [animConfig] A {@link ui.anim.Animation} config object (minus the {@link ui.anim.Animation#target target) property) 
		 *   for animating the hiding of the Component. Note that this will only be run if the Component is currently {@link #rendered}.
		 * @return {ui.Component} This Component, to allow method chaining.
		 */
		hide : function( animConfig ) {
			this.hidden = true;  // set flag regardless of if the Component is rendered or not. If not yet rendered, this flag will be tested for in the render() method, and the Component will be hidden.
			
			if( this.rendered ) {
				// If a show animation was specified, run that now. Otherwise, simply show the element
				if( typeof animConfig === 'object' ) {
					animConfig.target = this;
					
					this.currentAnimation = new Animation( animConfig );    
					//this.currentAnimation.addListener( 'afteranimate', this.hideComplete, this );  // adding a listener instead of providing in config, in case there is already a listener in the config
					this.currentAnimation.start();
				} else {
					this.$el.hide();
				}
				
				this.onHide();
				this.fireEvent( 'hide', this );
			}
			
			return this;
		},
		
		
		/**
		 * Hook method for handling the component being hidden. This will only be called when the 
		 * Component is hidden after it is rendered. Note that this method is called immediately after
		 * any animation is started by providing the `animConfig` argument to {@link #method-hide}.
		 * 
		 * @protected
		 * @method onHide
		 */
		onHide : UI.emptyFn,
		
		
		/**
		 * Tests to see if the Component is hidden. Note that this method tests for the Component's element visibility
		 * (after it has been rendered), and will return true if 1) the element itself is set as "display: none", 2) a parent 
		 * element of the Component is set to "display: none", or 3) the element is not attached to the document.  To determine 
		 * if the Component's element itself is set as hidden, regardless of the visibility of parent elements or being attached
		 * to the document, check the {@link #property-hidden} property.
		 * 
		 * @method isHidden
		 * @return {Boolean}
		 */
		isHidden : function() {
			if( !this.rendered ) {
				return this.hidden;  // not yet rendered, return the current state of the 'hidden' config
				
			} else {
				// NOTE: Cannot simply use the jQuery :hidden selector. jQuery determines if an element is hidden by if it
				// has any computed height or width > 0. The Component's element can be shown, but if it's not taking up 
				// any space because it has no content, it would still be considered hidden by jQuery. We instead want to see
				// if the Component, or any of its ancestor elements are hidden via "display: none", to determine if it's hidden.
				// The Component must also be attached to the document to be considered "shown".
				//return this.$el.is( ':hidden' );  -- intentionally left here as a reminder not to use
				
				// Find out if the component itself, or any of its ancestor elements has "display: none".
				if( this.$el.css( 'display' ) === 'none' ) {    // slight optimization by testing the Component's element itself first, before grabbing parent elements to test
					return true;
					
				} else {
					var $parents = this.$el.parents(),
					    numParents = $parents.length;
					
					
					// If the element is not attached to the document (it has no parents, or the top level ancestor is not the <html> tag), then it must be hidden
					if( numParents === 0 || $parents[ numParents - 1 ].tagName.toLowerCase() !== 'html' ) {
						return true;
					}
	
					// Element is attached to the DOM, check all parents for one that is not displayed
					for( var i = 0, len = $parents.length; i < len; i++ ) {
						if( jQuery( $parents[ i ] ).css( 'display' ) === 'none' ) {
							return true;
						}
					}
				}
				
				// Passed checks, element must not be hidden
				return false;
			}
		},
		
		
		/**
		 * Detaches the Component from the DOM, if it is currently rendered and in the DOM. This method can be used
		 * for performance reasons, to completely remove the element from the DOM when it is unnecessary for the 
		 * Component to be in it.
		 * 
		 * The Component may be re-attached to the DOM by calling {@link #method-render} again on it (with the new container
		 * element to append/insert it into). 
		 * 
		 * @method detach
		 */
		detach : function() {
			if( this.rendered ) {
				this.$el.detach();
			}
		},
		
		
		// -------------------------------------
		
		
		/**
		 * Masks the component with a {@link ui.Mask}. Uses the default mask configuration provided by the {@link #maskConfig} configuration object,
		 * or optionally, the provided `maskConfig` argument.
		 * 
		 * @method mask
		 * @param {Object} maskConfig (optional) The explicit configuration options to set the {@link ui.Mask} that will mask over the Component.
		 *   If not provided, will use the default options provided by the {@link #maskConfig} configuration option.
		 */
		mask : function( maskConfig ) {
			maskConfig = maskConfig || this.maskConfig;  // use the provided argument if it exists, or the defaults provided by the config option otherwise
			
			// Set the flag for the isMasked method. Also, if the Component is not rendered, this is updated so that the mask will show on render time.
			this.masked = true;   
			
			if( !this.rendered ) {
				this.deferredMaskConfig = maskConfig;  // set the maskConfig to use when the Component is rendered
				
			} else {
				// If the Component is currently hidden when the mask() request is made, we need to defer
				// it to when the Component's show() method is run. This is because ui.Mask has to make a calculation
				// of the mask target's height. 
				if( this.isHidden() ) {
					this.deferMaskShow = true;
					this.deferredMaskConfig = maskConfig;  // set the maskConfig to use when the Component is shown
					
				} else {
					// Component is rendered and is shown (i.e. not hidden), then we can show the mask
					
					// If there is not yet a mask instance for this Component, create one now.
					// Otherwise, just update its config.
					if( !this._mask ) {
						this._mask = new Mask( this.getMaskTarget(), maskConfig );
					} else {
						this._mask.updateConfig( maskConfig );
					}
					this._mask.show();
					
					// mask has been shown, make sure deferMaskShow flag is set back to false
					this.deferMaskShow = false;
					delete this.deferredMaskConfig;  // in case this exists from a previous deferred mask, remove it now
				}
			}
		},
		
		
		/**
		 * Hides the mask (shown with the {@link #mask} method) from the Component's element.
		 * 
		 * @method unMask
		 */
		unMask : function() {
			this.masked = false;
			
			// in case there was a show request while hidden: set deferMaskShow back to false, and remove the deferredMaskConfig (as we're now hiding the mask)
			this.deferMaskShow = false;  
			delete this.deferredMaskConfig;
			
			if( this.rendered && this._mask ) {
				this._mask.hide();
			}
		},
		
		
		/**
		 * Determines if the Component is currently masked.  See the {@link #mask} method for details on showing the Component's mask.
		 * 
		 * @method isMasked
		 * @return {Boolean}
		 */
		isMasked : function() {
			return this.masked;
		},
		
		
		/**
		 * Method that defines which element the Component's mask should be shown over. For ui.Component,
		 * this is the Component's base {@link #$el element}, but this may be redefined by subclasses.
		 * 
		 * @protected
		 * @method getMaskTarget
		 * @return {jQuery}
		 */
		getMaskTarget : function() {
			return this.getEl();
		},
		
		
		// -------------------------------------
		
		
		/**
		 * Sets the Container that owns (i.e. is a parent of) this Component.
		 * 
		 * @method setParentContainer
		 * @param {ui.Container} container
		 */
		setParentContainer : function( container ) {
			this.parentContainer = container;
		},
		
		
		/**
		 * Gets the Container that owns (i.e. is a parent of) this Component.
		 * 
		 * @method getParentContainer
		 * @return {ui.Container} The Container that owns this Component, or null if there is none.
		 */
		getParentContainer : function() {
			return this.parentContainer;
		},
		
		
		// -------------------------------------
		
		
		/**
		 * Bubbles up the Component/Container heirarchy, calling the specified function with each parent Container, starting
		 * with this Component. The scope (this) of function call will be the scope provided or the current Component. The arguments 
		 * to the function will be the `args` provided or the current component. If the function returns false at any point,
		 * the bubble is stopped.
		 * 
		 * @method bubble
		 * @param {Function} fn The function to call.
		 * @param {Object} scope (optional) The scope of the function (defaults to current node)
		 * @param {Array} args (optional) The args to call the function with (default to passing the current component)
		 */
		bubble : function( fn, scope, args ) {
			var p = this;
			while( p ) {
				if( fn.apply( scope || p, args || [p] ) === false) {
					break;
				}
				p = p.parentContainer;
			}
		},
		
		
		/**
		 * Finds a {@link ui.Container Container} above this Component at any level by a custom function. If the passed function returns
		 * true, the {@link ui.Container Container} will be returned.
		 * 
		 * @method findParentBy
		 * @param {Function} fn The custom function to call with the arguments (Container, this Component).
		 * @return {ui.Container} The first Container for which the custom function returns true.
		 */
		findParentBy : function( fn ) {
			for( var p = this.parentContainer; (p !== null) && !fn( p, this ); p = p.parentContainer );  // intentional semicolon, loop does the work
			return p || null;
		},
		
		
		/**
		 * Finds a {@link ui.Container Container} above this Component at any level by {@link #id}.  If there is no parent Container
		 * with the supplied `id`, this method returns null.
		 * 
		 * @method findParentById
		 * @param {String} id The {@link #id} of the parent Container to look for.
		 * @return {ui.Container} The first Container which matches the supplied {@link #id}.
		 *   If no Container for the supplied {@link #id} is found, this method returns null.
		 */
		findParentById : function( id ) {
			for( var p = this.parentContainer; p && p.id !== id; p = p.parentContainer );  // intentional semicolon, loop does the work
			return p || null;
		},
		
		
		/**
		 * Finds the closest {@link ui.Container Container} above this Component by Container `type`.  The Container `type` can be either
		 * the type name that is registered to the {@link ui.ComponentManager ComponentManager} (see the description of this class), or the JavaScript
		 * class (constructor function) of the Container.
		 * 
		 * @method findParentByType
		 * @param {Function} type The type name registered with the {@link ui.ComponentManager ComponentManager}, or the constructor function (class) of the Container.
		 * @return {ui.Container} The first Container which is an instance of the supplied type. 
		 */
		findParentByType : function( type ) {
			if( typeof type === 'string' ) {
				type = ComponentManager.getType( type );
				
				// No type found for the given type name, return null immediately
				if( !type ) {
					return null;
				}
			}
			
			// Find the parent by type (js class / constructor function)
			for( var p = this.parentContainer; p && !(p instanceof type); p = p.parentContainer );  // intentional semicolon, loop does the work
			return p || null;
		},
		
		
		/**
		 * Destroys the Component. Frees (i.e. deletes) all references that the Component held to HTMLElements or jQuery wrapped sets
		 * (so as to prevent memory leaks) and removes them from the DOM, removes the Component's {@link #mask} if it has one, purges 
		 * all event {@link #listeners} from the object, and removes the Component's element ({@link #$el}) from the DOM, if the Component 
		 * is rendered.<br><br>
		 *
		 * Fires the {@link #beforedestroy} event, which a handler can return false from to cancel the destruction process,
		 * and the {@link #event-destroy} event.
		 * 
		 * @method destroy
		 */
		destroy : function() {
			if( !this.destroyed ) {
				if( this.fireEvent( 'beforedestroy', this ) !== false ) {
					// Run template method for subclasses first, to allow them to handle their processing
					// before the Component's element is removed
					this.onDestroy();
					
					// Destroy the mask, if it is an instantiated ui.Mask object (it may not be if the mask was never used)
					if( this._mask instanceof Mask ) {
						this._mask.destroy();
					}
					
					// Remove any HTMLElement or jQuery wrapped sets used by the Component from the DOM, and free 
					// the references so that we prevent memory leaks.
					// Note: This includes the Component's $el reference (if it has been created by the Component being rendered).
					for( var prop in this ) {
						if( this.hasOwnProperty( prop ) ) {
							var propValue = this[ prop ];
							
							if( _.isElement( propValue ) ) {
								// First, wrap the raw HTMLElement in a jQuery object, for easy removal. Then delete the reference.
								jQuery( propValue ).remove();
								delete this[ prop ];
							} else if( propValue instanceof jQuery ) {
								propValue.remove();
								delete this[ prop ];
							}
						}
					}
					
					this.rendered = false;  // the Component is no longer rendered; it's $el has been removed (above)
					this.destroyed = true;
					this.fireEvent( 'destroy', this );
					this.purgeListeners();  // Note: Purge listeners must be called after 'destroy' event fires!
				}
			}
		},
		
		
		/**
		 * Template method for subclasses to extend that is called during the Component's destruction process.
		 * 
		 * @protected
		 * @method onDestroy
		 */
		onDestroy : UI.emptyFn
	
	} );
	
	
	// Register the type so it can be created by the string 'component' in an anonymous config object
	ComponentManager.registerType( 'component', Component );

	return Component;
	
} );