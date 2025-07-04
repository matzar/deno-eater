import { MongoClient, MongoClientOptions, ServerApiVersion } from 'mongodb';
import path from 'path';
import fs from 'fs';

// Different URIs for different environments
let uri: string;
const options: MongoClientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

if (process.env.NODE_ENV === 'development') {
  // Development: Use certificate-based URI and local cert file
  uri =
    'mongodb+srv://random-words.40wbfia.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&appName=random-words';

  // Auto-detect the first .pem file in the certs directory
  const certsDir = path.join(process.cwd(), 'certs');

  if (!fs.existsSync(certsDir)) {
    throw new Error(
      'certs/ directory not found. Please create it and add your .pem certificate file.',
    );
  }

  const pemFiles = fs
    .readdirSync(certsDir)
    .filter((file) => file.endsWith('.pem'));

  if (pemFiles.length === 0) {
    throw new Error(
      'No .pem certificate file found in certs/ directory. Please add your MongoDB X.509 certificate.',
    );
  }

  if (pemFiles.length > 1) {
    console.warn(`Multiple .pem files found in certs/. Using: ${pemFiles[0]}`);
  }

  const credentials = path.join(certsDir, pemFiles[0]);
  options.tlsCertificateKeyFile = credentials;
} else {
  // Production: Use password-based URI from environment variable
  uri = process.env.MONGODB_URI!;

  if (!uri) {
    throw new Error(
      'Please define the MONGODB_URI environment variable for production',
    );
  }
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the connection
  const globalWithMongo = global as typeof globalThis & {
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
