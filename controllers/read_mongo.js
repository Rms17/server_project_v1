const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();
let fecha = new Array()
let file_name = new Array();
exports.read_hist_video = async function(){
    const client = new MongoClient(process.env.MONGO_URL);
    await client.connect()
    const db = client.db(process.env.MONGO_DB_NAME);
    const collection = db.collection(process.env.MONGO_COLLECTON_VIDEO_NAME);
    try {
    const docs =  await collection.find({}).sort({uploadDate : -1 }).toArray(); 
    docs.forEach(doc=>{
      fecha.push(doc.uploadDate)
      file_name.push(doc.filename)
    })
  } finally {
    await client.close();
    
  }
    return [fecha,file_name]  
}
