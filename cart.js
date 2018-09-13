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
  Next Steps
Once you know you have a clear understanding of all the concepts presented in the exam labs and the course content in general then there are probably a few exercises you can adapt from the "mongomart" code given as a common practice of "refactoring" the existing code towards several new goals.

The code "masks" errors which can be produced. Change the implementation of the DAO sections to pass any error in the callback response and handle error messages in the routes instead. You need only log errors to console, but you might consider a "developer mode" where you would report errors on a web page as well.

Consider refactoring the code to use Promises. Promises are a modern way to avoid nested callback calls and make the code cleaner and easier to read and maintain. Consider then refactoring the base Promise implementation to use the async/await keywords available in modern JavaScript environments and current Long Term Support NodeJS releases.

Add routes for a JSON API which simply returns all required data for the "pages" rather than rendering templates.

See if you can find more possible uses for the $facet aggregation pipeline stage in providing data.

Use the JSON API you developed as the back end source for a Single Page Web Application (SPA) or other port of the application display presentation.

Look at implementing all the API part using [Stitch][1]

Taking an existing application and looking at refactoring points just as outlined above is a great way to learn languages, frameworks and specific API's. In addition to the suggested "pathway" outlined above, you can also think of new "features" to add and the different components you need in order to implement them.


*/


var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


function CartDAO(database) {
    "use strict";

    this.db = database;
    let cart = this.db.collection('cart');
    let items = this.db.collection('item');

    this.getCart = function(userId, callback) {
        "use strict";


        cart.findOne({userId: userId}, function(err, item){
          assert.equal(null,err);
          callback(item);
        });
    }


    this.itemInCart = function(userId, itemId, callback) {
        "use strict";

         this.db.collection('cart').findOne(
   {  userId, "items._id": itemId },
   { "items.$": 1 },
   (err, item) => {
     if (item != null)
       item = item.items[0];
     callback(item);
   }
  )
    }


    this.addItem = function(userId, item, callback) {
        "use strict";

        // Will update the first document found matching the query document.
        this.db.collection("cart").findOneAndUpdate(
            // query for the cart with the userId passed as a parameter.
            {userId: userId},
            // update the user's cart by pushing an item onto the items array
            {"$push": {items: item}},
            // findOneAndUpdate() takes an options document as a parameter.
            // Here we are specifying that the database should insert a cart
            // if one doesn't already exist (i.e. "upsert: true") and that
            // findOneAndUpdate() should pass the updated document to the
            // callback function rather than the original document
            // (i.e., "returnOriginal: false").
            {
                upsert: true,
                returnOriginal: false
            },
            // Because we specified "returnOriginal: false", this callback
            // will be passed the updated document as the value of result.
            function(err, result) {
                assert.equal(null, err);
                // To get the actual document updated we need to access the
                // value field of the result.
                callback(result.value);
            });

        /*

          Without all the comments this code looks written as follows.

        this.db.collection("cart").findOneAndUpdate(
            {userId: userId},
            {"$push": {items: item}},
            {
                upsert: true,
                returnOriginal: false
            },
            function(err, result) {
                assert.equal(null, err);
                callback(result.value);
            });
        */

    };


    this.updateQuantity = function(userId, itemId, quantity, callback) {
        "use strict";

      

        var userCart = {
            userId: userId,
            items: []
        }
        var dummyItem = this.createDummyItem();
        dummyItem.quantity = quantity;
        userCart.items.push(dummyItem);
        callback(userCart);

        // TODO-lab7 Replace all code above (in this method).

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
            quantity: 1,
            reviews: []
        };

        return item;
    }

}


module.exports.CartDAO = CartDAO;
