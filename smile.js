// ***** Mongo Collections *****
SmileList = new Mongo.Collection('smiles');
// ***** Routes *****
Router.route('/', function () {
  this.render('about');
});
Router.route('/about'), function () {
    this.render('about');
}
Router.route('/dashboard', function () {
  this.render('dashboard');
  //alreadyRan = false;
    google.charts.load('current', {'packages':['bar']});
      console.log("test");
      // ***** Histogram *****
  google.charts.setOnLoadCallback(drawChart);
  function drawChart() {
      timeArray = [];
      SmileList.find().forEach(function(obj){
          date = new Date(obj.time);
          hours = date.getHours()+7;
          found = false;
          for (var i=0; i<timeArray.length; i++) {
              if (timeArray[i][0][0] == hours) {
                  timeArray[i][1] += 1;
                  found = true;
              }
          }
          if (!found) {
              timeArray.push([[hours,0,0],1]);
          }
      });
        data = new google.visualization.DataTable();
        data.addColumn('timeofday', 'Time of Day');
        data.addColumn('number', 'Number of smiles');
        data.addRows(timeArray);
        options = google.charts.Bar.convertOptions({
          title: 'Number of smiles at each hour',
          height: 450,
          legend: { position: 'none' },
          colors: ['#80DEEA']
        });
        chart = new google.charts.Bar(document.getElementById('chart_div'));
        chart.draw(data, options);
    }
});

Router.route('/smile', function () {
  this.render('smile');
});

Router.route('/input', {
  where: 'server',
  action: function () {
    var lat = this.request.query.lat;
    var long = this.request.query.long;
    var resp = {'recieved' : "true"};
    var timeVar = Date.now();
    var descriptionVar = "No description";
    this.response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    this.response.end(JSON.stringify(resp));
    console.log(lat + " " + long);
    if (lat && long) {
      SmileList.insert({
        time: timeVar,
        lat: lat,
        long: long,
        description: descriptionVar
      });
    }
  }
});

Router.route('/add', function () {
  this.render('addSmileForm');
});
Router.route('/edit', function() {
    this.render('editSmiles');
});

// ***** Start Meteor Location Conditionals *****
if (Meteor.isClient) {
  Template.editSmiles.helpers({
      'smiles': function () {
        var smiles = SmileList.find({}, {sort: {time: -1}}).fetch();
        smiles.forEach(function(obj){
           var time = obj.time-3600*1000*6;
           var date = new Date(time).toGMTString();
           obj.realTime = date.substr(0,22);
       });
       return smiles;
      }
  });
    Template.dashboard.events({
        'click #dashboard': function() {
            document.location.reload(true);
        }
    });
  Template.editSmiles.events({
     'keyup [name=smileDescrip]': function (event) {
         var documentId = this._id;
         var smileDescrip = $(event.target).val();
         SmileList.update({_id: documentId}, {$set: {description: smileDescrip}});
         console.log('Description changed to: ' + smileDescrip);
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
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
