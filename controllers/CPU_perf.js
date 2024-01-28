const os = require('os');

exports.cpu_perf = function(){
    const used_mem = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log('Memoria RAM usada:', used_mem ,'MB');
    const cpuUsage = os.cpus();
    console.log('Uso de la CPU:', cpuUsage[3].times.user);
    return [used_mem,cpuUsage[3].times.user]
}
