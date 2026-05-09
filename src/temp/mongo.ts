import mongodb from "mongodb"; 

export var mongo: mongodb.MongoClient;

export async function connect() {
    mongo = await mongodb.MongoClient.connect("mongodb://localhost:27017");
}