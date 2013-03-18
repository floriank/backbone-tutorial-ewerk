(function($) {
    var contacts = [
    {name: "Contact 1", address: "Markt 16, 04109 Leipzig", tel: "0123456789", email: "f.kraft+contact1@it.ewerk.com", type: "family"},
    {name: "Contact 2", address: "Markt 16, 04109 Leipzig", tel: "0123456789", email: "f.kraft+contact2@it.ewerk.com", type: "family"},
    {name: "Contact 3", address: "Markt 16, 04109 Leipzig", tel: "0123456789", email: "f.kraft+contact3@it.ewerk.com", type: "colleague"},
    {name: "Contact 4", address: "Markt 16, 04109 Leipzig", tel: "0123456789", email: "f.kraft+contact4@it.ewerk.com", type: "friend"},
    {name: "Contact 5", address: "Markt 16, 04109 Leipzig", tel: "0123456789", email: "f.kraft+contact5@it.ewerk.com", type: "friend"},
    {name: "Contact 6", address: "Markt 16, 04109 Leipzig", tel: "0123456789", email: "f.kraft+contact6@it.ewerk.com", type: "friend"},
    {name: "Contact 7", address: "Markt 16, 04109 Leipzig", tel: "0123456789", email: "f.kraft+contact7@it.ewerk.com", type: "colleague"},
    {name: "Contact 8", address: "Markt 16, 04109 Leipzig", tel: "0123456789", email: "f.kraft+contact8@it.ewerk.com", type: "family"}
  ];


  var Contact = Backbone.Model.extend({
    defaults: {
      photo: "img/placeholder.png",
      name: "",
      address: "",
      tel: "",
      email: "",
      type: "family"
    }
  });


  var Directory = Backbone.Collection.extend({
    model: Contact
  });

  var ContactView = Backbone.View.extend({
    tagName: "article",
    className: "contact-container",
    template: $('#contactTemplate').html(),

    render: function() {
      var tmpl = _.template(this.template);
      this.$el.html(tmpl(this.model.toJSON()));
      return this;
    },

    events: {
      "click button.delete": "deleteContact"
    },

    deleteContact: function() {
      console.log(this.model);
      this.model.destroy();
    },
  });

  var DirectoryView = Backbone.View.extend({
    el: $('#contacts'),

    initialize: function() {
      this.collection = new Directory(contacts);
      this.render();

      this.$el.find("#filter").append(this.createSelect());

      this.on("change:filterType", this.filterByType, this);
      this.collection.on("reset", this.render, this);
      this.collection.on("add", this.renderContact, this);
      this.collection.on("remove", this.removeContact, this);

    },

    render: function() {
      var that = this;
      var tagName = (new ContactView).tagName;
      this.$el.find(tagName).remove();
      _.each(this.collection.models, function(item) {
        that.renderContact(item);
      }, this);
    },

    renderContact: function(item) {
      var contactView = new ContactView({
        model: item
      });
      this.$el.append(contactView.render().el)
    },

    getTypes: function() {
      return _.uniq(this.collection.pluck("type"), false, function(type) {
        return type.toLowerCase();
      });
    },

    createSelect: function() {
      var select = $("<select/>", {
            html: "<option value=\"all\">All</option>"
          });

      _.each(this.getTypes(), function(item) {
        var option = $("<option/>", {
          value: item.toLowerCase(),
          text: item.toLowerCase()
        }).appendTo(select);
      });

      return select;
    },

    events: {
      "change #filter select": "setFilter",
      "click #add": "addContact",
      "click #showForm": "showForm"
    },

    setFilter: function(e) {
      this.filterType = e.currentTarget.value;
      this.trigger("change:filterType");
    },

    filterByType: function() {
      if (this.filterType == "all") {
        this.collection.reset(contacts);
        contactsRouter.navigate("filter/all");
      } else {
        this.collection.reset(contacts, {silent: true});

        var filterType = this.filterType,
            filtered   = _.filter(this.collection.models, function(item) {
              return item.get("type").toLowerCase() === filterType;
            });

        this.collection.reset(filtered);
        contactsRouter.navigate("filter/" +  filterType);
      };
      this.$el.find('#filter select').val(this.filterType);
    },

    addContact: function(e) {
      e.preventDefault();
      var newModel = {};
      $("#addContact").children("input").each(function(item, el) {
        if ($(el).val() !== "") {
          newModel[el.id] = $(el).val();
        }
      });

      contacts.push(newModel);
      if (_.indexOf(this.getTypes(), newModel.type) !== -1) {
        this.$el.find("#filter select").remove();
        this.$el.find("#filter").append(this.createSelect());
      };
      this.collection.add(new Contact(newModel));
    },

    removeContact: function(removedModel) {
      var removed = removedModel.attributes;
      if (removed.photo === "img/placeholder.png") {
        delete removed.photo;
      };
      _(contacts).each( function(contact) {
        if (_.isEqual(contact, removed)) {
          contacts.splice(_.indexOf(contacts, contact), 1)
        };
      })
    },

    showForm: function() {
      this.$el.find("#addContact").slideToggle();
    }
  });

  var ContactsRouter = Backbone.Router.extend({
    routes: {
        "filter/:type": "urlFilter"
    },
    urlFilter: function (type) {
        directory.filterType = type;
        directory.trigger("change:filterType");
    }
  });

  var directory = new DirectoryView();
  var contactsRouter = new ContactsRouter();
  Backbone.history.start();
}(jQuery))

