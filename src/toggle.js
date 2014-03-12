(function () {
  /** setScope: DOM element

  Given an x-toggle element:
  - autoupdates the xtag.scope property of the toggle with the current form
    it is in, if any;
  - Otherwise set scope as the current document and add a 'x-toggle-no-form'
    attribute, if a document exists
  - Otherwise set as null
  **/
  function setScope(toggle) {
    var form = toggle.xtag.input.form;
    if (form) toggle.removeAttribute('x-toggle-no-form');
    else toggle.setAttribute('x-toggle-no-form', '');
    toggle.xtag.scope = (toggle.parentNode) ? (form || document) : null;
  }

  /** updateScope: DOM element

  given a scope (ie: a form or the document), searches for all toggles belonging
  to the scope and updates their checkbox/radio type
  **/
  function updateScope(scope) {
    var names = {};
    // specify a special no-form selector if scope is document to prevent
    // looking into toggles belonging to a child form
    var docSelector = (scope == document) ? '[x-toggle-no-form]' : '';
    // search the scope for the named toggles belonging to it
    xtag.query(scope, 'x-toggle[name]' + docSelector).forEach(function (toggle) {
      var name = toggle.name;
      if (name && !names[name]) {
        // update the checkbox/radio type of all toggles with the same name
        var named = xtag.query(scope, 'x-toggle[name="'+name +'"]'+docSelector);
        var type = named.length > 1 ? 'radio' : 'checkbox';
        named.forEach(function (toggle) {
          if (toggle.xtag && toggle.xtag.input) {
            toggle.type = type;
          }
        });
        // cache the name to prevent repeating update for same named toggles
        names[name] = true;
      }
    });
  }

  function toggleGroup(toggle){
      if (shifted && toggle.group && toggle.type != 'radio') {
        var toggles = toggle.groupToggles;
        var selector = 'x-toggle[group="' + toggle.group + '"][active]';
        var active = toggle.xtag.scope.querySelector(selector);
        if (active && toggle != active) {
          toggle.checked = active.checked;
          var state = active.checked;
          var index = toggles.indexOf(toggle);
          var activeIndex = toggles.indexOf(active);
          var minIndex = Math.min(index, activeIndex);
          var maxIndex = Math.max(index, activeIndex);
          toggles.slice(minIndex, maxIndex + 1).forEach(function(toggle){
            if (toggle != active) toggle.checked = state;
          });
          return true;
        }
      }
  }

  function activateToggle(toggle){
    if (inTogglebar(toggle)) return;
    toggle.groupToggles.forEach(function (node) {
      node.active = false;
    });
    toggle.active = true;
  }

  function inTogglebar(toggle){
    return toggle.parentNode && toggle.parentNode.nodeName.toLowerCase() == 'x-togglebar';
  }

  var shifted = false;
  xtag.addEvents(document, {
    'DOMComponentsLoaded': function () {
      updateScope(document);
      xtag.toArray(document.forms).forEach(updateScope);
    },
    'WebComponentsReady': function () {
      updateScope(document);
      xtag.toArray(document.forms).forEach(updateScope);
    },
    'keydown': function (e) {
      shifted = e.shiftKey;
    },
    'keyup': function (e) {
      shifted = e.shiftKey;
    },
    'focus:delegate(x-toggle)': function (e) {
      this.focus = true;
      this.xtag.input.focus();
    },
    'blur:delegate(x-toggle)': function (e) {
      this.focus = false;
    },
    'tap:delegate(x-toggle)': function (e) {
      var input = this.xtag.input;
      if (input.type == 'radio' ? !this.checked : true) {
      input.checked = !input.checked;
      var change = document.createEvent('Event');
    change.initEvent('change', true, false);
    input.dispatchEvent(change);
    }
    input.focus();
    },
    'change:delegate(x-toggle)': function (e) {
      // manage the active state of any group toggles
      this.xtag.input.focus();
      if (inTogglebar(this) || (!toggleGroup(this) && this.type != 'radio')) this.checked = this.xtag.input.checked;
      activateToggle(this);
    }
  });

  var template = xtag.createFragment('<input /><div class="x-toggle-check"></div>');

  xtag.register('x-toggle', {
    lifecycle: {
      created: function () {
        this.appendChild(template.cloneNode(true));
        this.xtag.input = this.querySelector('input');
        this.xtag.checkEl = this.querySelector(".x-toggle-check");
        this.type = 'checkbox';
        setScope(this);

        var name = this.getAttribute('name');
        if (name) {
          this.xtag.input.name = this.getAttribute('name');
        }
        if (this.hasAttribute('checked')) {
          this.checked = true;
        }
      },
      inserted: function () {
        setScope(this);
        if (this.name) {
          updateScope(this.xtag.scope);
        }
      },
      removed: function () {
        updateScope(this.xtag.scope);
        setScope(this);
      }
    },
    accessors: {
      noBox: {
        attribute: {
          name: 'no-box',
          boolean: true
        }
      },
      type: {
        attribute: {},
        set: function (type) {
          this.xtag.input.type = type;
        }
      },
      label: { attribute: {} },
      focus: { attribute: { boolean: true } },
      active: { attribute: { boolean: true } },
      group: { attribute: {} },
      groupToggles: {
        get: function () {
          return xtag.query(this.xtag.scope, 'x-toggle[group="' + this.group + '"]');
        }
      },
      name: {
        attribute: {
          skip: true // to prevent recursion when needing to remove attribute
        },
        set: function (name) {
          if (name === null) {
            this.removeAttribute("name");
            this.type = 'checkbox';
          }
          else {
            this.setAttribute("name", name);
          }
          this.xtag.input.name = name;
          updateScope(this.xtag.scope);
        }
      },
      checked: {
        get: function () {
          return this.xtag.input.checked;
        },
        set: function (value) {
          var name = this.name,
              state = (value === 'true' || value === true);
          if (name) {
            var scopeSelector = (this.xtag.scope == document) ?
                                '[x-toggle-no-form]' : '';
            var selector = 'x-toggle[checked][name="'+name+'"]' + scopeSelector;
            // get previously checked toggle and untoggle it
            var previous = this.xtag.scope.querySelector(selector);
            if (previous) {
              previous.removeAttribute('checked');
            }
          }
          this.xtag.input.checked = state;
          if (state) {
            this.setAttribute('checked', '');
          } else {
            this.removeAttribute('checked');
          }
        }
      },
      value: {
        attribute: {},
        get: function () {
          return this.xtag.input.value;
        },
        set: function (value) {
          this.xtag.input.value = value;
        }
      }
    }
  });

  xtag.register('x-togglebar', {
    events: {

    }
  });


})();
