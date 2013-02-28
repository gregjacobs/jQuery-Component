/**
 * @class ui.Image
 * @extends ui.Component
 *
 * A simple component which is an image.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Class, _, jQuery, Jux, ui */
ui.Image = Class.extend( ui.Component, {
	
	/**
	 * @cfg {String} src
	 * The initial src (url) for the image.
	 */
	src : "",
	
	/**
	 * @hide
	 * @cfg {String} elType
	 * @inheritdoc
	 */
	elType : 'img',
	
	
	/**
	 * @private
	 * @property {Boolean} loaded
	 * 
	 * Flag to store the state of if the image is loaded or not. If a new image is requested
	 * via {@link #setSrc}, this flag is set back to false until the new image is loaded.
	 */
	loaded : false,
	
	/**
	 * @private
	 * @property {Boolean} errored
	 * 
	 * Flag to store the state of if it has been attempted to load the image, but it has failed to load. If a new
	 * image is requested via {@link #setSrc}, this flag is set back to false until the new image either loads or errors.
	 */
	errored : false,
	
	
	/**
	 * @private
	 * @property {String} blankImg
	 * 
	 * A blank image which is used to swap into the underlying image (if not using {@link #fillmore})
	 * before placing a new image src in. This is a webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f,
	 * where the 'load' event wouldn't be fired again if setting to the same image src. Using this data uri bypasses a webkit log warning.
	 */
	blankImg : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",

	


	// protected
	initComponent : function() {
		this.addEvents(
			/**
			 * Fires when the underlying image has loaded successfully.
			 * 
			 * @event load
			 * @param {ui.Image} image This Image instance.
			 */
			'load',
			
			/**
			 * Fires when the underlying image has failed to load.
			 * 
			 * @event error
			 * @param {ui.Image} image This Image instance.
			 */
			'error'
		);
		
		this.cls += ' ui-image';
		
		this._super( arguments );
	},

	
	// protected
	onRender : function() {
		this._super( arguments );
		
		if( this.src ) {
			this.setSrc( this.src );
		}
	},


	// -------------------------------------
	
	
	/**
	 * Sets the {@link #src} (url) of the Image.
	 * 
	 * @method setSrc
	 * @param {String} src The new src (url) for the image.
	 */
	setSrc : function( src ) {
		this.src = src;
		
		if( this.rendered ) {
			this.loaded = false;
			this.errored = false;
			
			// Unbind load and error events before switching in the blankImg, as we don't want these events from the switch to the blankImg
			this.$el.unbind( '.uiImage' );  // unbind all events in the 'uiImage' namespace
			this.$el.attr( 'src', this.blankImg );  // see description of `blankImg` property in this class for why we set this here before the new src
			
			// Now bind the load and error events for when we set the new src
			this.$el.bind( {
				'load.uiImage'  : this.onImageLoad.createDelegate( this ),
				'error.uiImage' : this.onImageError.createDelegate( this )
			} );
			this.$el.attr( 'src', this.src );
		}
	},
	
	
	/**
	 * Retrieves the {@link #src} (url) of the Image. If no {@link #src} has been provided (either by the configuration
	 * option, or by {@link #setSrc}), will return an empty string.
	 * 
	 * @method getSrc
	 * @return {String} The current {@link #src} of the image.
	 */
	getSrc : function() {
		return this.src;
	},
	
	
	/**
	 * Determines if the image has loaded successfully.
	 * 
	 * @method isLoaded
	 * @return {Boolean}
	 */
	isLoaded : function() {
		return this.loaded;
	},
	
	
	/**
	 * Determines if the image has failed to load.
	 * 
	 * @method isErrored
	 * @return {Boolean}
	 */
	isErrored : function() {
		return this.errored;
	},
	
	
	/**
	 * Called when the underlying image has loaded successfully.
	 * 
	 * @protected
	 * @method onImageLoad
	 */
	onImageLoad : function() {
		this.loaded = true;
		this.fireEvent( 'load', this );
	},
	
	
	/**
	 * Called when the underlying image has failed to load.
	 * 
	 * @protected
	 * @method onImageError
	 */
	onImageError : function() {
		this.errored = true;
		this.fireEvent( 'error', this );
	}

} );


// Register the type so it can be created by the type string 'Image'
ui.ComponentManager.registerType( 'Image', ui.Image );
