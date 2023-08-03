//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://AYUSHPARAKH007:Ayush%407921@todolist.vg1husj.mongodb.net/?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});
const itemsSchema ={
  name: String

};
const Item= mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Todolist"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item"
});
const allItems =[item1,item2,item3];
// Item.insertMany(allItems)
//       .then(function () {
//         console.log("Successfully saved defult items to DB");
//       })
//       .catch(function (err) {
//         console.log(err);
//       });
const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List= mongoose.model("List", listSchema);



      app.get("/", async (req, res) => {
        const foundItems = await Item.find({});
        
        if (foundItems.length === 0) {
          Item.insertMany(allItems)
            .then(function () {
              console.log("Successfully saved default items to DB");
            })
            .catch(function (err) {
              console.log(err);
            });
          res.redirect("/");
        } else {
          res.render("List", { listTitle: "Today", newListItems: foundItems });
        }
      });
      app.get("/:customListName", async function(req, res) {
        const customListName = _.capitalize(req.params.customListName);
      
        try {
          const foundList = await List.findOne({ name: customListName });
          if (!foundList) {
            // Create a new list
            const list = new List({
              name: customListName,
              items: allItems
            });
            list.save();
            res.redirect("/" + customListName);
          } else {
            // Show an existing list
      
            res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
          }
        } catch (err) {
          console.log(err);
          res.status(500).send("Error finding list");
        }
      });
      
            
           
      

      app.post("/", async function(req, res) {
        const itemName = req.body.newItem;
        const listName = req.body.list;
        const item = new Item({
          name: itemName
        });
      
        if (listName === "Today") {
          await item.save();
          res.redirect("/");
        } else {
          const foundList = await List.findOne({ name: listName });
          foundList.items.push(item);
          await foundList.save();
          res.redirect("/" + listName);
        }
      });
      
      app.post("/delete", async function(req, res) {
        const checkedItemId = req.body.checkbox;
        const listName = req.body.listName;
        if (listName === "Today") {
          try {
            await Item.deleteOne({ _id: checkedItemId });
            console.log("Successfully deleted checked item");
            res.redirect("/");
          } catch (err) {
            console.log(err);
            res.status(500).send("Error deleting item");
          }
        } else {
          const foundList = await List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, { new: true });
          if (!foundList) {
            res.status(404).send("List not found");
          } else {
            res.redirect("/" + listName);
          }
        }
      });
      




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
