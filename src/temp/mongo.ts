import mongodb from "mongodb"; 

export var mongo: mongodb.MongoClient;

export async function connect() {
    mongo = await mongodb.MongoClient.connect("mongodb://127.0.0.1:27017");
}