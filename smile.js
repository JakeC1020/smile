SmileList = new Mongo.Collection('smiles');

if (Meteor.isClient) {

  Template.listSmiles.helpers({
    smiles: function () {
      return SmileList.find({}).fetch();
    }
  });

  Template.addSmileForm.onCreated(function () { 
    this.autorun(function () {
      var currentLocation = Geolocation.latLng();
      Session.set("location", currentLocation);
    });
  });
  
  Template.addSmileForm.events({
    'submit .addSmile': function (event) {
      event.preventDefault();
      var timeVar = Date.now();
      var location = Session.get("location");
      var descriptionVar = event.target.smileDescription.value;

      SmileList.insert({
       time: timeVar,
       lat: location.lat,
       long: location.lng,
       description: descriptionVar,
      });
      event.target.smileDescription.value = "";
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
