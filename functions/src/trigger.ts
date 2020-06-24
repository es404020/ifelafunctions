import * as functions from 'firebase-functions';
import * as request from "request-promise";
import * as urlBuilder from 'build-url';

import * as admin from 'firebase-admin';

const db = admin.firestore();

export const createLocation = functions.firestore
  .document('users/{userID}/locations/{locationsID}')
  .onCreate( (snap, context:any) => {
    const record = snap.data() as any;
   const UserID = context.params.userID;
   //const locationsID = context.params.locationsID;
   var d = new Date();
   d.setSeconds(0,0);
   d.setMilliseconds(0);
   d.setMinutes(0,0);
    const location = record;

    console.log('[data] - ', record.location);

  

    return  snap.ref.set({
      timestamp: location.timestamp,
      is_moving: location.is_moving,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      speed: location.coords.speed,
      heading: location.coords.heading,
      altitude: location.coords.altitude,
      event: location.event,
      battery_is_charging: location.battery.is_charging,
      battery_level: location.battery.level,
      activity_type: location.activity.type,
      activity_confidence: location.activity.confidence,
      extras: location.extras,
      userID:UserID,
      Date:d.toISOString
    }).then((res)=>{
      console.log('chnaged');
    }).catch((err)=>{
      console.log('err');
      console.log(err);
    })

    // return snap.ref.set({
    
    //   timestamp: location.timestamp,
    //   is_moving: location.is_moving,
    //   latitude: location.coords.latitude,
    //   longitude: location.coords.longitude,
    //   speed: location.coords.speed,
    //   heading: location.coords.heading,
    //   altitude: location.coords.altitude,
    //   event: location.event,
    //   battery_is_charging: location.battery.is_charging,
    //   battery_level: location.battery.level,
    //   activity_type: location.activity.type,
    //   activity_confidence: location.activity.confidence,
    //   extras: location.extras,
    //   userID:context.params.userID
    // });
  });


;








export const triggerHelp = functions.firestore.document('users/{userID}').onUpdate((change, context) => {
  const after = change.after.data() as any;
  const applink = 'https://ifela.org/link/';
  const userId = context.params.userID;
  const contactRef = db.collection('contact');
  const contactSnap = contactRef.where("peerID", "==", userId).get();
  const contactSnap1 = contactRef.where("myID", "==", userId).get();
  const key = 'AIzaSyB7ldLV0i7_rxv5C5cE4edgnRz9z3hAqqI';
  const socialDescription = `${after.name} is requesting help`;
  const socialImageUrl = " https://firebasestorage.googleapis.com/v0/b/eagleeye-dev.appspot.com/o/WhatsApp%20Image%202020-04-17%20at%2010.13.02%20PM.jpeg?alt=media&token=196a41c6-15de-4137-9ce3-e2f957214a8a";
let arrays = [] as any;
  if (after.target) {

    return Promise.all([contactSnap, contactSnap1]).then((res) => {
      if (res[0].docs.length > 0) {
        res[0].docs.forEach(element => {
          arrays.push(element.data().myNumber)



        });
      }

      if (res[1].docs.length > 0) {

        res[1].docs.forEach(element => {

          arrays.push(element.data().peerNumber)

        });

      }

      const options = {
        method: 'POST',
        uri: `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${key}`,
        body: {
          "longDynamicLink": makeDynamicLongLink(userId, socialDescription, socialImageUrl)
        },
        json: true
      };
      request.post(options)
        .then(function (parsedBody) {
          console.log(parsedBody.shortLink);
          console.log(arrays);
          return parsedBody.shortLink;
        
        }).catch(function (err) {
        
          console.log(err);

        });

   

    }).catch((err) => {
      console.log(err)
    })
  }


  return;

})




function makeDynamicLongLink(UserID, socialDescription, socialImageUrl) {

  const applink = 'https://ifela.org/link/';
  return urlBuilder(applink, {
    queryParams: {
      link: "https://ifela.org/link/" + UserID,
      apn: "com.ifela.ifela",
      dfl: "https://www.ifela.org",
      st: "Ifela request help trigger",
      sd: socialDescription,
      si: socialImageUrl
    }
  });
}