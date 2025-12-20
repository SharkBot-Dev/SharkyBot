import mongodb from "mongodb"; 

export var mongo: mongodb.MongoClient;

export async function connect() {
    mongo = await mongodb.MongoClient.connect("mongodb://192.168.11.15:27017");
}