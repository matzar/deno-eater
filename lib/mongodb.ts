import { MongoClient, ServerApiVersion } from 'mongodb';
import path from 'path';

const credentials = path.join(
  process.cwd(),
  'certs/X509-cert-6924067380824752665.pem',
);

const uri =
  'mongodb+srv://random-words.40wbfia.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&appName=random-words';

const options = {
  tlsCertificateKeyFile: credentials,
  serverApi: ServerApiVersion.v1,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the connection
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
