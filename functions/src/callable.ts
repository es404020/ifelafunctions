import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'

const db = admin.firestore();


//callable function to add contact on ifela application android /ios

export const addContacts = functions.https.onCall(async (data, context: any) => {
  const userId = context.auth.uid;

  const userRef = db.collection('users');

  const userSnap = await userRef.where("Email", "==", data.Email).get();

  if (userSnap) {

    const userContactRef = db.collection('contacts');
    const userContactSnap = await userContactRef.where('CEmail', "==", data.email).get() as any;

    if (userContactSnap && userContactSnap.data().Email != data.Email) {
      return userContactRef.add({
        ContactEmail: data.Email,
        ContactPhoneNumber: userContactSnap.data().Cphonenumber,
        UserID: userId,
        ContactId: userContactSnap.data().UserID


      })
    }

    else {
      throw new Error('Something went wrong');
    }


  }
  else {
    throw new Error('Sorry this email  address is not registered on this platform');

  }

  return;

});



export const addPhone = functions.https.onCall(async (data:any, context: any) => {
  const userRef = db.collection('users');
  const contactRef= db.collection('contact');

  try{
    const userSnap = await userRef.where("phone_number", "==", data.phone).get() ;

  console.log(data);
     if(userSnap.docs[0].data()){
      const contactSnap =  contactRef.where("peerID","==",userSnap.docs[0].data().UID).where("myID","==",data.UID).get() ;
      const contactSnap1 =  contactRef.where("myID","==",userSnap.docs[0].data().UID).where("peerID","==",data.UID).get() ;
    
     return Promise.all([contactSnap,contactSnap1]).then((res)=>{
   
  

  if(res[0].docs.length==0 && res[1].docs.length==0){


    contactRef.add({
      "peerID":userSnap.docs[0].data().UID,
      "myID":data.UID,
      "peerName":userSnap.docs[0].data().name,
      "myName":data.name,
      "peerPhoto":userSnap.docs[0].data().photo,
      "myPhoto":data.photo,
      "peerNumber":userSnap.docs[0].data().phone_number,
      "myNumber":data.number,
      "status":false,
  "ID":'hellor'

    }).then((re:any)=>{
      console.log(re);
      db.collection('contact').doc(re.id).set({
        ID:re.id
    }, { merge: true });
    });  
      return 'New contact added'
  
   

  }
       return 'Contact already exist';
     }).catch((err)=>{
       return err+'no';
     })
    
    }
  if(userSnap.empty){
      return 'User cannot be found';
    }
  
   
  
  }catch(err){
     if( Object.keys(err).length == 0){
      return 'User cannot be found';
     }
    return err;
  }
 

});