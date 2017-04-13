var express=require('express');
var app=express();
var mongojs = require('mongojs');
var db = mongojs('trees', ['trees']);
var bodyParser = require('body-parser');
var port = 8081;//Port to be used to serve the application


app.use(express.static(__dirname+"/public")); // To Serve Static files like css/js/html inside the public folder
app.use(bodyParser.json()); // To get the post data

//To Get/POST Duplicate Trees Data from the Database
app.get('/dupTrees', function (req, res) {
  db.trees.aggregate(// Using MongoDB Aggregation operator to get the duplicated data
    [ 
      { 
    $group: {
    _id: { Address: "$Address",
              Street:"$Street",
              Side:"$Side",
              Site:"$Site",
            }, 
            Id:{$last:'$Id'},
            Condition:{$first:'$Condition'},
            Species:{$first:'$Species'},
            Dbh:{$first:'$Dbh'},     
            uniqueIds: 
            { 
              $addToSet: "$_id" 
            },     
            count: 
            { $sum: 1 }    } 
            },    
            { $match: { 
            count: { $gt: 1 } 
            } },   
            { $sort : { count : -1} },  
             { $limit : 10 },  
             {$project:{count:0}}
  ],
    function(err,result) {
      res.json(result);
    }
);

});


app.get('/dupTrees/:id', function (req, res) {
  var id = req.params.id;
  db.trees.findOne({_id: mongojs.ObjectId(id)}, function (err, doc) {
    res.json(doc);
  });
});


app.put('/dupTrees/:id', function (req, res) {
  var id = req.params.id;
  db.trees.findAndModify({
  query: {_id: mongojs.ObjectId(id)},
  update: {$set: {Id: req.body.Id, Address: req.body.Address, Street: req.body.Street,Side:req.body.Side,Site:req.body.Site,Condition:req.body.Condition,Dbh:req.body.Dbh  }},
  new: true}, function (err, doc) {
  res.json(doc);
   }
  );
})


// To Get/POST Trees Data
app.get('/trees', function (req, res) {
    db.trees.find(function (err, docs) {
        res.json(docs);
    });

});
 app.put('/trees/:id', function (req, res) {
   var id = req.params.id;
    var cols=req.body.Col;
    var value=req.body.Val;

   db.trees.findAndModify({
     query: {_id: mongojs.ObjectId(id)},
     update: {$set: {[cols]:value}},
     new: true
   }, function (err, doc) {
       console.log(doc);
       res.json(doc);
     }
   );
 });


 app.listen(port);
//To show the status of server running on the port
console.log("Server is listening on "+port);

