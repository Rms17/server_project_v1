const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
exports.get_last_video = function(directorioVideos,callback){
    fs.readdir(directorioVideos, (err, archivos) => {
        if (err) {
          console.error('Error al leer el directorio:', err);
          callback(err,"");
        }
      
        // Filtra los archivos para obtener solo los archivos de video (puedes ajustar la extensión según tus necesidades)
        const archivosDeVideo = archivos.filter(archivo => {
          return archivo.endsWith('.avi');
        });
      
        // Ordena los archivos por fecha de modificación para obtener el más reciente
        const archivosOrdenados = archivosDeVideo.map(archivo => {
          const rutaCompleta = path.join(directorioVideos, archivo);
          return {
            nombre: archivo,
            fechaModificacion: fs.statSync(rutaCompleta).mtime.getTime()
          };
        }).sort((a, b) => b.fechaModificacion - a.fechaModificacion);
        if (archivosOrdenados.length > 0) {
          let ultimoArchivo = archivosOrdenados[0].nombre;
          console.log('El archivo más reciente es:', ultimoArchivo);
          callback(null,ultimoArchivo);
        } else {
          console.log('No se encontraron archivos de video en la carpeta proporcionada.');
          callback(new Error('No se encontraron archivos de video en la carpeta proporcionada.'),"");
        }
      });
  }

