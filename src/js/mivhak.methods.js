/**
 * jQuery plugin's methods. 
 * In all methods, the 'this' keyword is pointing to the calling instance of Mivhak.
 * These functions serve as the plugin's public API.
 */
Mivhak.methods = {
    toggleLineWrap: function() {
        var $this = this;
        this.state.lineWrap = !this.state.lineWrap;
        $.each(this.tabs.tabs, function(i,tab) {
            tab.editor.getSession().setUseWrapMode($this.state.lineWrap);
            tab.vscroll.onHeightChange();
            tab.hscroll.onWidthChange();
        });
    },
    copyCode: function() {
        var editor = this.tabs.activeTab.editor;
        editor.selection.selectAll();
        editor.focus();
        if(document.execCommand('copy'))
            editor.selection.clearSelection();
//        else this.notify('Hi there!');
    },
    showTab: function(index) {
        this.tabs.showTab(index);
        this.topbar.activateNavTab(index);
    },
    setHeight: function(height) {
        this.tabs.$el.height(height);
        $.each(this.tabs.tabs, function(i,tab) {
            $(tab.pre).height(height);
            tab.editor.resize();
        });
    },
    update: function(options) {
        // Update options here
    }
};