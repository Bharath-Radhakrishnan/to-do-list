//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/itemsDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});
const Item = mongoose.model("Item", itemSchema);
const wakeUp = new Item({
  name: "wakeUp"
});
const eat = new Item({
  name: "eat"
});
const sleep = new Item({
  name: "sleep"
});
const defaultItems = [wakeUp, eat, sleep];
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});
const List = mongoose.model("CustomList", listSchema);
app.get("/", function(req, res) {

  //const day = date.getDate();
  Item.find(function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("succesfully added items to itemsDB");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
      // mongoose.connection.close();
    }



  });
});
app.post("",function(req,res){
  const listName=req.body.list;
  const newItem=req.body.newItem;
  const item = new Item({
    name:newItem
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});
app.post("/delete", function(req, res) {
  const delItemName = req.body.checkbox;
  Item.deleteOne({
    name: delItemName
  }, function(err) {
    if (err) return handleError(err);
    else res.redirect("/");
  });

});

app.get("/about", function(req, res) {
  res.render("about");
});

app.get("/:route", function(req, res) {
  const customListName = req.params.route;
  List.findOne({
    name: customListName
  }, function(err, foundItems) {
    if (!err) {

      if (foundItems) {
        console.log("list allready exists");
        res.render("list", {
          listTitle: foundItems.name,
          newListItems: foundItems.items
        });
      } else {
        console.log("df ====" + defaultItems);
        const list = new List({
          name: customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/" + customListName);

        console.log("adding new list");
      }
    }
  });

});
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
