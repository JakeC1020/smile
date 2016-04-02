// ***** Mongo Collections *****
SmileList = new Mongo.Collection('smiles');

// ***** Routes *****
Router.route('/', function () {
  this.render('dashboard');
});

Router.route('/dashboard', function () {
  this.render('dashboard');
});

Router.route('/smile', function () {
  this.render('smile');
});
Router.route('/input', function () {
  var queryVars = Router.current().params.query;
  var timeVar = Date.now();
  var descriptionVar = "No description";
  if (queryVars.lat && queryVars.long) {
    SmileList.insert({
     time: timeVar,
     lat: queryVars.lat,
     long: queryVars.long,
     description: descriptionVar,
    });
  }
}, {where: 'server'});
Router.route('/add', function () {
  this.render('addSmileForm');
});

// ***** Start Meteor Location Conditionals *****
if (Meteor.isClient) {

  Template.listSmiles.helpers({
    smiles: function () {
      return SmileList.find({}).fetch();
    }
  });

  Template.addSmileForm.onRendered(function () {
    this.autorun(function () {
      var currentLocation = Geolocation.latLng();
      if (currentLocation != "null") {
        Session.set("location", currentLocation);
      }
      console.log(currentLocation);
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

  /*Template.input.onCreated(function () {
    this.autorun(function () {
      var queryVars = Router.current().params.query;
      console.log(queryVars);
      var timeVar = Date.now();
      var descriptionVar = "No description";
      if (queryVars.lat && queryVars.long) {
        SmileList.insert({
         time: timeVar,
         lat: queryVars.lat,
         long: queryVars.long,
         description: descriptionVar,
        });
      }
    });
  });*/
  // - HISTOGRAM
  google.charts.load("current", {packages:["corechart"]});
  google.charts.setOnLoadCallback(drawChart);
  function drawChart() {
    var data = google.visualization.arrayToDataTable([]);//pass array of data here

    var options = {
      title: 'Lengths of dinosaurs, in meters',
      legend: { position: 'none' },
    };

    var chart = new google.visualization.Histogram(document.getElementById('chart_div'));
    chart.draw(data, options);
  }
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
