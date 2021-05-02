const express = require("express");
const server = express();
const cors = require("cors");
const ObjectID = require("mongodb").ObjectID;

const body_parser = require("body-parser");
require("dotenv").config();

// parse JSON (application/json content-type)
server.use(body_parser.json());
server.use(cors());

const port = 4000;

// << db setup >>
const db = require("./db");
const dbName = process.env.DB_NAME;
const collectionName = process.env.DB_COLLECTION;

// mailbox
const mailjet = require("node-mailjet").connect(
  process.env.MAIL_APIKEY,
  process.env.MAIL_SERVERKEY
);

server.listen(port, () => {
  console.log(`Server listening at ${port}`);
});

// << db init >>
db.initialize(
  dbName,
  collectionName,
  function (dbCollection) {
    // successCallback

    // << db CRUD routes >>
    // get all items
    server.get("/users", (request, response) => {
      // return updated list
      dbCollection.find().toArray((error, result) => {
        if (error) throw error;
        response.json(result);
      });
    });

    // update item
    server.put("/user/:id", (request, response) => {
      const userId = request.params.id;
      const user = request.body;
      let userDetails = {};
      console.log("Editing user: ", userId, " to be ", user);

      dbCollection.updateOne(
        { _id: ObjectID(userId) },
        { $set: user },
        (error, result) => {
          if (error) throw error;
          dbCollection.findOne({ _id: ObjectID(userId) }, (error, result) => {
            if (error) throw error;
            userDetails = result;

            console.log("userDetails ==> ", userDetails);
            var pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            console.log("patter ==> ", pattern.test(userDetails.email));
            if (!pattern.test(userDetails.email)) {
              let bodyData = { action_result: "email_is is not valid" };
              dbCollection.updateOne(
                { _id: ObjectID(userId) },
                { $set: bodyData },
                (error, result) => {
                  if (error) {
                    console.log(error);
                  }
                  dbCollection.find().toArray((error, result) => {
                    if (error) throw error;
                    console.log("Here in res ", result);
                    response.json(result);
                  });
                }
              );
            }
            if (
              (user?.move_forward == true || user?.move_forward == false) &&
              pattern.test(userDetails.email)
            ) {
              const request = mailjet
                .post("send", { version: "v3.1" })
                .request({
                  Messages: [
                    {
                      From: {
                        Email: process.env.MAIL_FROM,
                        Name: process.env.MAIL_NAME,
                      },
                      To: [
                        {
                          Email: userDetails.email,
                          Name: process.env.MAIL_NAME,
                        },
                      ],
                      Subject: process.env.MAIL_NAME,
                      TextPart: process.env.MAIL_NAME,
                      HTMLPart: `<div> On change of the move_forward</div>`,
                      CustomID: "AppGettingStartedTest",
                    },
                  ],
                });
              request
                .then((result) => {
                  console.log(
                    "message Status ==>",
                    result.body.Messages[0].Status
                  );
                  let bodyData = {
                    action_result: "email was sent to the email_id.",
                  };

                  if (
                    result.body.Messages[0].Status.toLocaleLowerCase() ===
                    "success"
                  ) {
                    dbCollection.updateOne(
                      { _id: ObjectID(userId) },
                      { $set: bodyData },
                      (error, result) => {
                        if (error) {
                          console.log(error);
                        }
                      }
                    );
                    dbCollection.find().toArray((error, result) => {
                      if (error) throw error;
                      response.json(result);
                    });
                  }
                })
                .catch((err) => {
                  console.log(err.statusCode);
                });
            }
          });
        }
      );
    });
  },
  function (err) {
    // failureCallback
    console.log(err);
    throw err;
  }
);
