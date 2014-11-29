(function() {
  var Pipedrive, superagent;

  superagent = require('superagent');

  module.exports = Pipedrive = (function() {
    function Pipedrive(formId) {
      this.threshold = 500;
      this.timeout = 5000;
      this.id = null;
      this.version = 0;
      this.proxy = "//pipedrive.partial.io";
      this.data = {};
      this.formId = formId;
      this.form = document.getElementById(this.formId);
      Array.prototype.slice.call(this.form.elements).map(function(el) {
        return el.name;
      }).filter(function(name) {
        return name.length;
      }).map(this.watch.bind(this));
    }

    return Pipedrive;

  })();

  Pipedrive.prototype.watch = function(i, fieldName) {
    var field;
    field = this.form.elements[fieldName];
    field.addEventListener('change', this.touch.bind(this));
    return field.addEventListener('keyup', this.touch.bind(this));
  };

  Pipedrive.prototype.touch = function(evt) {
    var el;
    el = evt.currentTarget;
    this.data[el.name] = el.value;
    this.store();
    this.version++;
  };

  Pipedrive.prototype.store = function() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.id) {
      this.timeoutId = setTimeout(this._update.bind(this), this.threshold);
    } else {
      this.timeoutId = setTimeout(this._create.bind(this), this.threshold);
    }
  };

  Pipedrive.prototype._create = function() {
    var version;
    if (this.req) {
      return false;
    }
    version = this.version;
    this.req = superagent.post(this.proxy + "/persons").send(this.data).withCredentials().timeout(this.timeout).end(this._created(version).bind(this));
  };

  Pipedrive.prototype._created = function(storedVersion) {
    var onPost;
    return onPost = function(err, res) {
      this.req = null;
      if (err) {
        return console.log(err);
      }
      if (res.body.success !== true) {
        return console.log(res);
      }
      this.id = res.body.data.id;
      if (this.version !== storedVersion) {
        this.store();
      }
    };
  };

  Pipedrive.prototype._update = function() {
    var version;
    if (this.req) {
      return false;
    }
    version = this.version;
    this.req = superagent.put(this.proxy + "/persons/" + this.id).send(this.data).withCredentials().timeout(this.timeout).end(this._updated(version).bind(this));
  };

  Pipedrive.prototype._updated = function(storedVersion) {
    var onUpdate;
    return onUpdate = function(err, res) {
      this.req = null;
      if (err) {
        return console.log(err);
      }
      if (res.body.success !== true) {
        return console.log(res);
      }
      if (this.version !== storedVersion) {
        this.store();
      }
    };
  };

}).call(this);
