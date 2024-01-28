const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const camera = require('vlc-simple-player')
const dotenv = require('dotenv');
const Stream = require('node-rtsp-stream');

const app = express();

dotenv.config();

const fecha_actual ={
  fecha_string(){
    const now = new Date();
    const anio = now.getFullYear().toString();
    const mes = now.getMonth()+1;
    const mes2 = mes.toString();
    const dia = now.getDate().toString();
    const hora = now.getHours().toString();
    const min = now.getMinutes().toString();
    const fecha = anio+'-'+mes2+'-'+dia+'T-'+hora+'h'+min+'min';
    return fecha
  }  
}


var st_alarm_0 = 'Desactivado';
const url = process.env.MONGO_URL
const dbName = process.env.MONGO_DB_NAME;
const collectionName = process.env.MONGO_COLLECTION_NAME;
var alarma_st,cerco_st;
let player;

app.use(bodyParser.json());
app.set('view engine','ejs');
app.use('/public/', express.static('./public'));


stream = new Stream({
  name: alarma_st,
  streamUrl: process.env.RTSP_CAMERA_URL,
  wsPort: 9999,
  ffmpegOptions: { // Opciones para ffmpeg
    '-stats': '', 
    '-r': 30 // Framerate
  }
});

app.post('/put', async (req, res) => {
    const { cerco_id, Estado_cerco,Estado_alarma, Fecha } = req.body;
    alarma_st = Estado_alarma;
    cerco_st = Estado_cerco;
    Fecha_evento = fecha_actual.fecha_string();
    const client = new MongoClient(url);
  
    try {
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(collectionName);
      //envio de datos de cerco
      const result = await collection.insertOne({ cerco_id, Estado_cerco,Estado_alarma, Fecha_evento });
      
      console.log('Datos insertados correctamente:', result.insertedId);
      //envio de datos CPU
      const cpu_var = require('./controllers/CPU_perf.js').cpu_perf();
      const Memoria_Ram_MB = cpu_var[0];
      const Tiempo_user_mode_ms = cpu_var[1]
      const cpucollection = db.collection(process.env.MONGO_SECOND_COLLECTION_NAME);

      const resultcpu= await cpucollection.insertOne({Memoria_Ram_MB,Tiempo_user_mode_ms})
      res.status(200).send('Datos insertados correctamente');

      if (Estado_alarma == 'Activado' && st_alarm_0 == 'Desactivado'){
        st_alarm_0 = Estado_alarma;  
        try {
          global.player = new camera(process.env.RTSP_CAMERA_URL)
          global.player.on('statuschange', (error, status) => {
            try {
                if (status.time == 2){
                    require('./controllers/VLC_CMD.js').press_key();
                    return
                } 
            } catch (error){}   
          }) 
        } catch (error) {
          console.log('No se puede conectar a la camara',error)
        }  
      }
  
      if (Estado_alarma == 'Desactivado' && st_alarm_0 =='Activado'){
        st_alarm_0 = Estado_alarma;
        require('./controllers/VLC_CMD.js').press_key();
        try {
          global.player.quit();
          var video = require("./controllers/video_name.js")
        video.get_last_video(process.env.VIDEO_PATH, (err, ultimoArchivo) => {
            if (err) {
              console.error('Error al obtener el último archivo:', err);
              return;
            }
            require('./controllers/avi2mp4.js').convert_video(ultimoArchivo,(err,event_path)=>{
              if (err){
                console.log("No se pudo convertir el archivo")
              }else{
                const DB_video = require("./controllers/video_db.js")
                DB_video.main(event_path);
              }
            })
            
          });
        } catch (error) {
          console.log(error)
        }
      }

    } catch (err) {
        console.error('Error al insertar datos:', err);
        res.status(500).send('Error al insertar datos');
      } finally {
        await client.close();
      }
  })

app.get('/last_video',(req,res)=>{
  res.render('index.ejs')
});

app.get('/',(req,res)=>{
  res.render('main.ejs',{alarma: alarma_st, estado: cerco_st})
});

app.get('/video',(req,res)=>{
  res.render('video_stream.ejs',{estado: alarma_st});
})
app.get('/video_hist',async (req,res)=>{
    const datos = await require('./controllers/read_mongo.js').read_hist_video();
    res.render('video_hist.ejs',{data: datos, Path: process.env.VIDEO_PATH+'\\event_videos',estado: alarma_st})
})
app.get('/show_video_hist.ejs', (req,res)=>{
  const datos = req.query.video_name
  res.render('show_video_hist.ejs',{data: datos})
})
app.listen(process.env.SERVER_PORT, () => {
  console.log(`Servidor escuchando en el puerto ${process.env.SERVER_PORT}`);
});
