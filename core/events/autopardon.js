// setInterval(function(){
//     let now = Date.now();
//     storage.guilds.forEach((cfg, id, map) => {
//         let edited = false;
//         for (let i of cfg.strikes) {
//             let strike = cfg.strikes[i];
//             if (strike.active) {
//                 if (now - strike.on >= cfg.plugins.auto_moderation.pardon.time) {
//                     strike.active = false;
//                     strike.expired = now;
//                     edited = true;
//                 }
//             }
//         }

//         if (edited) {
//             if (!toSave.guilds.has(id)) toSave.guilds.add(id);
//         }
//     });
// }, 60000);