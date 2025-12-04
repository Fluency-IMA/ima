import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';

// Check if service account path is provided
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!serviceAccountPath) {
    console.error('Error: GOOGLE_APPLICATION_CREDENTIALS environment variable not set.');
    console.error('Please set it to the path of your service account key file.');
    process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
    credential: cert(serviceAccount)
});

const email = process.argv[2];

if (!email) {
    console.error('Please provide an email address.');
    process.exit(1);
}

getAuth()
    .getUserByEmail(email)
    .then((user) => {
        return getAuth().setCustomUserClaims(user.uid, {
            admin: true,
        });
    })
    .then(() => {
        console.log(`Success! ${email} has been made an admin.`);
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    });
