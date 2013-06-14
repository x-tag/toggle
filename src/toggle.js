(function(){

  function setScope(toggle){
    var form = toggle.firstChild.form;
    form ? toggle.removeAttribute('x-toggle-no-form') : toggle.setAttribute('x-toggle-no-form', '');
    toggle.xtag.scope = toggle.parentNode ? form || document : null;
  }
  
  function updateScope(scope){
    var names = {},
        docSelector = scope == document ? '[x-toggle-no-form]' : '';
    xtag.query(scope, 'x-toggle[name]' + docSelector).forEach(function(toggle){
      var name = toggle.name;
      if (name && !names[name]) {
        var named = xtag.query(scope, 'x-toggle[name="' + name + '"]' + docSelector),
            type = named.length > 1 ? 'radio' : 'checkbox';
        named.forEach(function(toggle){
          if (toggle.firstChild) toggle.firstChild.type = type;
        });
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
      if (shifted && this.group) {
        var toggles = this.groupToggles,
            active = this.xtag.scope.querySelector('x-toggle[group="'+ this.group +'"][active]');
        if (active && this != active) {
          var self = this,
              state = active.checked,
              index = toggles.indexOf(this),
              activeIndex = toggles.indexOf(active);
          toggles.slice(Math.min(index, activeIndex), Math.max(index, activeIndex)).forEach(function(toggler){
            if (toggler != self) toggler.checked = state;
          });
        }
      }
    },
    'change:delegate(x-toggle)': function(e){
      var active = this.xtag.scope.querySelector('x-toggle[group="'+ this.group +'"][active]');
      this.checked = (shifted && active && (this != active)) ? active.checked : this.firstChild.checked;
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
        this.innerHTML = '<input type="checkbox" /><div class="x-toggle-check"></div>';
        setScope(this);
        var name = this.getAttribute('name');
        if (name) this.firstChild.name = this.getAttribute('name');
        if (this.hasAttribute('checked')) this.checked = true;
      },
      inserted: function(){
        setScope(this);
        if (this.name) updateScope(this.xtag.scope);
      },
      removed: function(){
        updateScope(this.xtag.scope);
        setScope(this);
      }
    },
    accessors: {
      label: { attribute: {} },
      active: { attribute: { boolean: true } },
      group: { attribute: {} },
      groupToggles: {
        get: function(){
          return xtag.query(this.xtag.scope, 'x-toggle[group="' + this.group + '"]');
        }
      },
      name: {
        attribute: {},
        get: function(){
          return this.getAttribute('name');
        },
        set: function(name){
          if (name === null) {
            this.removeAttribute('name');
            this.firstChild.type = 'checkbox';
          }
          else this.firstChild.name = name;
          updateScope(this.xtag.scope);
        }
      },
      checked: {
        get: function(){
          return this.firstChild.checked;
        },
        set: function(value){
          var name = this.name,
              state = (value == 'true' || value === true);
          if (name) {
            var previous = xtag.query(this.xtag.scope, 'x-toggle[checked][name="' + name + '"]' + (this.xtag.scope == document ? '[x-toggle-no-form]' : ''))[0];
            if (previous) previous.removeAttribute('checked'); 
          }
          this.firstChild.checked = state;
          state ? this.setAttribute('checked', '') : this.removeAttribute('checked');
        }
      }
    }
  });
  
})();