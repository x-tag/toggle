(function(){
  /** setScope: DOM element 

  Given an x-toggle element:
  - autoupdates the xtag.scope property of the toggle with the current form 
    it is in, if any; 
  - Otherwise set scope as the current document and add a 'x-toggle-no-form'
    attribute, if a document exists
  - Otherwise set as null
  **/
  function setScope(toggle){
    var form = toggle.xtag.inputEl.form;
    if(form) toggle.removeAttribute('x-toggle-no-form');
    else toggle.setAttribute('x-toggle-no-form', '');

    toggle.xtag.scope = (toggle.parentNode) ? (form || document) : null;
  }
  
  /** updateScope: DOM element

  given a scope (ie: a form or the document), searches for all toggles belonging
  to the scope and updates their checkbox/radio type
  **/
  function updateScope(scope){
    var names = {},
        // specify a special no-form selector if scope is document to prevent
        // looking into toggles belonging to a child form
        docSelector = (scope == document) ? '[x-toggle-no-form]' : '';
    // search the scope for the named toggles belonging to it
    xtag.query(scope, 'x-toggle[name]'+docSelector).forEach(function(toggle){
      var name = toggle.name;
      if (name && !names[name]) {
        // update the checkbox/radio type of all toggles with the same name 
        var named = xtag.query(scope, 'x-toggle[name="'+name +'"]'+docSelector),
            type = named.length > 1 ? 'radio' : 'checkbox';
        console.log("name", name, "type", type);
        named.forEach(function(toggle){
          if (toggle.xtag && toggle.xtag.inputEl){
            toggle.type = type;
          }
        });
        // cache the name to prevent repeating update for same named toggles
        names[name] = true;
      } 
    });
  }
  
  var shifted = false;
  xtag.addEvents(document, {
    'DOMComponentsLoaded': function(){
      updateScope(document);
      xtag.toArray(document.forms).forEach(updateScope);
    },
    'WebComponentsReady': function(){
      updateScope(document);
      xtag.toArray(document.forms).forEach(updateScope);
    },
    'keydown': function(e){
      shifted = e.shiftKey;
    },
    'keyup': function(e){
      shifted = e.shiftKey;
    },
    'focus:delegate(x-toggle)': function(e){
      this.setAttribute('focus', '');
    },
    'blur:delegate(x-toggle)': function(e){
      this.removeAttribute('focus');
    },
    'tap:delegate(x-toggle)': function(e){
      // if shift is being held, check all group toggles in between the tapped
      // toggle and the previously tapped toggle
      if (shifted && this.group) {
        var toggles = this.groupToggles,
            active = this.xtag.scope.querySelector('x-toggle[group="'+
                                                   this.group+'"][active]');
        if (active && this != active) {
          var self = this,
              state = active.checked,
              index = toggles.indexOf(this),
              activeIndex = toggles.indexOf(active),
              minIndex = Math.min(index, activeIndex),
              maxIndex = Math.max(index, activeIndex);
          toggles.slice(minIndex, maxIndex).forEach(function(toggler){
            if (toggler != self) toggler.checked = state;
          });
        }
      }
    },
    'change:delegate(x-toggle)': function(e){
      // manage the active state of any group toggles
      var active = this.xtag.scope.querySelector('x-toggle[group="'+ 
                                                 this.group +'"][active]');
      this.checked = (shifted && active && (this != active)) ? 
                          active.checked : this.xtag.inputEl.checked;
      if (this.group) {
        this.groupToggles.forEach(function(toggle){
          toggle.active = false;
        });
        this.active = true;
      }
    }
  });  
  
  xtag.register('x-toggle', {
    lifecycle: {
      created: function(){
        this.innerHTML = '<label class="x-toggle-input-wrap">'+
                             '<input type="checkbox"></input>'+
                         '</label>' +
                         '<div class="x-toggle-check"></div>' +
                         '<div class="x-toggle-content"></div>';

        this.xtag.inputWrapEl = this.querySelector(".x-toggle-input-wrap");
        this.xtag.inputEl = this.xtag.inputWrapEl.querySelector("input");
        this.xtag.contentWrapEl = this.querySelector(".x-toggle-content-wrap");
        this.xtag.checkEl = this.querySelector(".x-toggle-check");
        this.xtag.contentEl = this.querySelector(".x-toggle-content");

        this.type = "checkbox";
        setScope(this);

        var name = this.getAttribute('name');
        if (name) this.xtag.inputEl.name = this.getAttribute('name');
        if (this.hasAttribute('checked')) this.checked = true;
      },
      inserted: function(){
        setScope(this);

        // check if we are inserted into a togglegroup component
        if(this.parentNode && 
           this.parentNode.nodeName.toLowerCase() === "x-togglegroup")
        {
            if(this.parentNode.hasAttribute("name")){
              this.name = this.parentNode.getAttribute("name");
            }
            if(this.parentNode.hasAttribute("group")){
              this.group = this.parentNode.getAttribute("group");
            }
            this.setAttribute("no-box", true);
        }

        if (this.name) updateScope(this.xtag.scope);
      },
      removed: function(){
        updateScope(this.xtag.scope);
        setScope(this);
      }
    },
    accessors: {
      noBox: {
        attribute: {
          name: "no-box",
          boolean: true
        },
        set: function(){}
      },
      type: {
        attribute: {},
        set: function(newType){
          this.xtag.inputEl.type = newType;
        }
      },
      label: { 
        attribute: {},
        get: function(){
          return this.xtag.contentEl.innerHTML;
        },
        set: function(newLabelContent){
          this.xtag.contentEl.innerHTML = newLabelContent;
        }
      },
      active: { attribute: { boolean: true } },
      group: { attribute: {} },
      groupToggles: {
        get: function(){
          return xtag.query(this.xtag.scope, 
                            'x-toggle[group="' + this.group + '"]');
        }
      },
      name: {
        attribute: {
          skip: true // to prevent recursion when needing to remove attribute
        },
        get: function(){
          return this.getAttribute("name");
        },
        set: function(name){
          if (name === null) {
            this.removeAttribute("name");
            this.type = 'checkbox';
          }
          else{
            this.setAttribute("name", name);
          } 
          this.xtag.inputEl.name = name;
          updateScope(this.xtag.scope);
        }
      },
      checked: {
        get: function(){
          return this.xtag.inputEl.checked;
        },
        set: function(value){
          var name = this.name,
              state = (value === 'true' || value === true);
          if (name) {
            var scopeSelector = (this.xtag.scope == document) ? 
                                            '[x-toggle-no-form]' : '';
            var selector = 'x-toggle[checked][name="'+name+'"]' + scopeSelector;
            // get previously checked toggle and untoggle it
            var previous = this.xtag.scope.querySelector(selector);
            if (previous) previous.removeAttribute('checked'); 
          }
          this.xtag.inputEl.checked = state;
          if (state) this.setAttribute('checked', '');
          else this.removeAttribute('checked');
        }
      }
    }
  });
  
})();