/**
 * The constructor.
 * See Mivhal.defaults for available options.
 * 
 * @param {DOMElement} selection
 * @param {Object} options
 */
function Mivhak( selection, options )
{   
    // Bail if there are no resources
    if(!selection.getElementsByTagName('PRE').length) return;
    
    this.$selection = $( selection );
    this.setOptions( options );
    this.init();
}

/**
 * Check if a given string represents a supported method
 * @param {string} method
 */
Mivhak.methodExists = function( method )
{
    return typeof method === 'string' && Mivhak.methods[method];
};

/**
 * Initiate Mivhak.
 */
Mivhak.prototype.init = function() 
{
    this.initState();
    this.parseResources();
    this.createUI();
    this.applyOptions();
    this.callMethod('showTab',0); // Show first tab initially
};

/**
 * Apply the options that were set by the user. This function is called when
 * Mivhak is initiated, and every time the options are updated.
 */
Mivhak.prototype.applyOptions = function() 
{
    this.callMethod('setHeight', this.options.height);
    this.callMethod('setAccentColor', this.options.accentColor);
    if(this.options.collapsed) this.callMethod('collapse');
    if(!this.options.topbar) this.$selection.addClass('mivhak-no-topbar');
    else this.$selection.removeClass('mivhak-no-topbar');
    
    // If the theme option was set through jQuery, set the attribute
    this.$selection.attr('miv-theme',this.options.theme);
    
    this.createCaption();
    this.createLivePreview();
};

/**
 * Initiate this instance's state.
 */
Mivhak.prototype.initState = function() 
{
    this.state = {
        lineWrap:   true,
        collapsed:  false,
        height:     0,
        activeTab:  null,   // Updated by tabs.showTab
        resources:  []    // Generated by parseResources()
    };
};

/**
 * Set or update this instance's options.
 * @param {object} options
 */
Mivhak.prototype.setOptions = function( options ) 
{
    // If options were already set, update them
    if( typeof this.options !== 'undefined' )
        this.options = $.extend(true, {}, this.options, options, readAttributes(this.$selection[0]));
    
    // Otherwise, merge them with the defaults
    else this.options = $.extend(true, {}, Mivhak.defaults, options, readAttributes(this.$selection[0]));
};

/**
 * Call one of Mivhak's methods. See Mivhak.methods for available methods.
 * To apply additional arguments, simply pass the arguments after the methodName
 * i.e. callMethod('methodName', arg1, arg2).
 * This method is also called internally when making a method call through jQuery
 * i.e. $('#el').mivhak('methodName', arg1, arg2);
 * 
 * @param {string} methodName
 */
Mivhak.prototype.callMethod = function( methodName )
{
    if(Mivhak.methodExists(methodName))
    {
        // Call the method with the original arguments, removing the method's name from the list
        var args = [];
        Array.prototype.push.apply( args, arguments );
        args.shift();
        Mivhak.methods[methodName].apply(this, args);
    }
};

/**
 * Create the user interface.
 */
Mivhak.prototype.createUI = function() 
{
    this.tabs = Mivhak.render('tabs',{mivhakInstance: this});
    this.topbar = Mivhak.render('top-bar',{mivhakInstance: this});
    this.notifier = Mivhak.render('notifier');
    
    this.$selection.prepend(this.tabs.$el);
    this.$selection.prepend(this.topbar.$el);
    this.tabs.$el.prepend(this.notifier.$el);
};

/**
 * Calculate the height in pixels.
 * 
 * auto: Automatically calculate the height based on the number of lines.
 * min: Calculate the height based on the height of the tab with the maximum number of lines
 * max: Calculate the height based on the height of the tab with the minimum number of lines
 * average: Calculate the height based on the average height of all tabs
 * 
 * @param {string|number} h One of (auto|min|max|average) or a custom number
 * @returns {Number}
 */
Mivhak.prototype.calculateHeight = function(h)
{
    var heights = [],
        padding = this.options.padding*2,
        i = this.tabs.tabs.length;

    while(i--)
        heights.unshift(getEditorHeight($(this.tabs.tabs[i].resource.pre))+padding);

    if('average' === h) return average(heights);
    if('min' === h) return min(heights);
    if('max' === h) return max(heights);
    if('auto' === h) return getEditorHeight($(this.activeTab.resource.pre))+padding;
    if(!isNaN(h)) return parseInt(h);
    return heights[0];
};

/**
 * Loop through each PRE element inside this.$selection and store it's options
 * in this.resources, merging it with the default option values.
 */
Mivhak.prototype.parseResources = function()
{
    var $this = this;
    
    this.resources = new Resources();
    this.$selection.find('pre').each(function(){
        $this.resources.add(this);
    });
};

Mivhak.prototype.createCaption = function()
{
    if(this.options.caption)
    {
        if(!this.caption)
        {
            this.caption = Mivhak.render('caption',{text: this.options.caption});
            this.$selection.append(this.caption.$el);
        }
        else this.caption.setText(this.options.caption);
    }
    else this.$selection.addClass('mivhak-no-caption');
};

/**
 * Create the live preview iframe window
 */
Mivhak.prototype.createLivePreview = function()
{
    if(this.options.runnable && typeof this.preview === 'undefined')
    {
        this.preview = Mivhak.render('live-preview',{resources: this.resources});
        this.tabs.$el.append(this.preview.$el);
    }
};

/**
 * Remove all generated elements, data and events.
 * 
 * TODO: keep initial HTML
 */
Mivhak.prototype.destroy = function() 
{
    this.$selection.empty();
};

/* test-code */
testapi.mivhak = Mivhak;
/* end-test-code */