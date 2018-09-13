/*
  Copyright (c) 2008 - 2016 MongoDB, Inc. <http://mongodb.com>

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


function ItemDAO(database) {
    "use strict";

    this.db = database;

    this.getCategories = function(callback) {
      console.log("getCategories is running");

        "use strict";
        let items = this.db.collection("item");


        items.aggregate([
          {$group:{
	           _id: "$category",
	            num: {$sum: 1}
            }},
            {$sort: {"_id": 1}}
        ]).toArray(function(err,docs){
          assert.equal(null,err);

          let total = 0;
          docs.forEach(function(doc){
            total += doc.num;
            console.log(doc);
          });

          docs.push({
            _id: "All",
            num: total
          });
          console.log(docs);
          callback(docs);

        });





    }


    this.getItems = function(category, page, itemsPerPage, callback) {
        "use strict";


          console.log("getItems is running, category: ",category);
         let items = this.db.collection("item");

         if (category !== "All"){
         items.aggregate([
           {$match: {"category": category}},
           {$sort: {"_id": 1}},
           {$skip: (page*itemsPerPage)},
          {$limit: itemsPerPage}
        ]).toArray(function (err, docs){
          assert.equal(err, null);
          callback(docs);
        });
      }
      else{ //remove the $match: category query, everything else the same
        items.aggregate([
          {$sort: {"_id": 1}},
          {$skip: (page*itemsPerPage)},
         {$limit: itemsPerPage}
       ]).toArray(function (err, docs){
         assert.equal(err, null);
         callback(docs);
       });

      }


    }


    this.getNumItems = function(category, callback) {
        "use strict";
        console.log("getNumItems is running");
        var numItems = 0;

         let items = this.db.collection('item');
         items.find({"category": category}).count(function(err,count){
           assert.equal(err,null);
           callback(count);
         });

    }


    this.searchItems = function(query, page, itemsPerPage, callback) {
        "use strict";

         let items = this.db.collection('item');
         items.aggregate([
           {$match: {$text: {$search: query}}},
           {$sort: {_id: 1}},
           {$skip: (page*itemsPerPage)},
           {$limit: itemsPerPage}
         ]).toArray(function(err,items){
           console.log("searchItems has ran. docs: ",items, "err: ", err);
           callback(items);
         });



    }


    this.getNumSearchItems = function(query, callback) {
        "use strict";

        var numItems = 0;

        let items = this.db.collection('item');
        items.find({$text: {$search: query}}).count(function(err,num){
          assert.equal(null,err);
          callback(num);
        })


    }


    this.getItem = function(itemId, callback) {
        "use strict";

         let items = this.db.collection('item');
         items.findOne({_id: itemId}, function(err,item){
          assert.equal(null,err);
           callback(item);
         });
        var item = this.createDummyItem();


    }


    this.getRelatedItems = function(callback) {
        "use strict";

        this.db.collection("item").find({})
            .limit(4)
            .toArray(function(err, relatedItems) {
                assert.equal(null, err);
                callback(relatedItems);
            });
    };


    this.addReview = function(itemId, comment, name, stars, callback) {
        "use strict";

    

        var reviewDoc = {
            name: name,
            comment: comment,
            stars: stars,
            date: Date.now()
        }


        let items = this.db.collection('item');
        items.updateOne({_id: itemId}, {$push: {reviews: reviewDoc}}, function(err, res){
          assert.equal(err,null);
          callback(reviewDoc);
        });



    }


    this.createDummyItem = function() {
        "use strict";

        var item = {
            _id: 1,
            title: "Gray Hooded Sweatshirt",
            description: "The top hooded sweatshirt we offer",
            slogan: "Made of 100% cotton",
            stars: 0,
            category: "Apparel",
            img_url: "/img/products/hoodie.jpg",
            price: 29.99,
            reviews: []
        };

        return item;
    }
}


module.exports.ItemDAO = ItemDAO;
