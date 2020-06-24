import * as admin from 'firebase-admin'
admin.initializeApp();

export {addContacts,addPhone} from './callable';

export { createLocation, triggerHelp} from './trigger';