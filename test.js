let admin = require("firebase-admin");
let Promise = require("bluebird");

// make sure to change the service account here
let serviceAccount = require("/path/to/json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-bug-86395.firebaseio.com"
});

function padLeft(num) {
  return ("00000"+num).slice(-5);
}

function formatFloat(f) {
  return Math.floor(f*100)/100;
}

let baseRef = "/fb_tests"
let count = 2000;

console.log("Firebase test");

Promise.resolve().then(() => {
  // clear previous data before we fill the db
  console.log("* Clearing .ref(" + baseRef+ ")");
  return admin.database().ref(baseRef).set({});
}).then(() => {
  // preparing database data
  console.log("* Setting up data - going to test with " + count + " entries");

  let data = {}
  for (let i=0; i<count; i++) {
    data["key_"+padLeft(i)] = i;
  }

  // determine size of database data
  let len =  JSON.stringify(data).length;
  console.log("* Database size ~" + formatFloat(len / 1024) + "kb");

  // set database data
  return admin.database().ref(baseRef + "/input").set(data);
}).then(() => {
  // now let's trigger the bug
  console.log("* Database is filled, let's set up child_added listener")
  admin.database().ref(baseRef + "/input").on("child_added", (snap) => {
    let update = {};
    update[baseRef + "/output/" + snap.key] = snap.val() 
    admin.database().ref().update(update);
  })
});





