const fs = require('fs');
const { MongoClient, GridFSBucket } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();
const url = process.env.MONGO_URL
const dbName = process.env.MONGO_DB_NAME;

exports.main=function(ultimoArchivo){
    const client = new MongoClient(url);
  
    try {
      client.connect();
      console.log('Conectado a la base de datos');
  
      const db = client.db(dbName);
      const bucket = new GridFSBucket(db);
  
      console.log(ultimoArchivo);
      
      if (ultimoArchivo != ""){
          const videoStream = fs.createReadStream(ultimoArchivo);
          const uploadStream = bucket.openUploadStream(ultimoArchivo);
          videoStream.pipe(uploadStream);
  
          uploadStream.on('finish', () => {
          console.log('Archivo MP4 subido exitosamente a MongoDB');
          client.close();
          });   
      }else{
          console.log("No existe archivo mp4");
      }
  } catch (error) {
      console.error('Error al conectar o subir el archivo:', error);
      client.close();
      }      
}