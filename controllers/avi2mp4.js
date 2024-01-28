const hbjs = require('handbrake-js')
const dotenv = require('dotenv')
const fs = require('fs')
dotenv.config()

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

exports.convert_video=function(archivo_video,callback){
  const video_path_output = './public/eventVideo'+fecha_actual.fecha_string()+'.mp4';
  console.log(video_path_output)
  hbjs.spawn({ input: process.env.VIDEO_PATH+'\\'+archivo_video, output: './public/video.mp4' })
  .on('error', err => {
    console.log("invalid user input, no video found etc");
  })
  .on('progress', progress => {
    console.log('Conversión de video al: '+progress.percentComplete+'%')  
    if(progress.percentComplete === 100){
      console.log('Conversiión 1 completada')
      
    }
  })
  setTimeout((tiempo)=>{},1000)
  hbjs.spawn({ input: process.env.VIDEO_PATH+'\\'+archivo_video, output: video_path_output})
      .on('error', err => {
        console.log("invalid user input, no video found etc",err);
        callback(1,null)
      })
      .on('progress', progress => {
        console.log('Conversión de video al: '+progress.percentComplete+'%')  
        if(progress.percentComplete === 100){
            console.log('Convsersiones completadas!')
            callback(null,video_path_output)
        }
      })
}

