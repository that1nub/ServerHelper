global.formatTime = function(ms, returnObj){
    if (ms <= 0) return "forever";
    if (Number.isNaN(ms)) return "NaN";
    if (!Number.isFinite(ms)) return "forever";

    let t = Math.floor(ms/1000);
    
    let sec  = t % 60;
    let min  = Math.floor((t / 60) % 60);
    let hour = Math.floor((t / 3600) % 24);
    let day  = Math.floor(((t / 3600) / 24) % 7);
    let week = Math.floor((((t / 3600) / 24) / 7) % 4);
    let mon  = Math.floor(((t / 3600) / 24) / 30);
    
    if (!returnObj) {
        let tbl = [];
        if (mon  > 0) tbl.push(mon  + " month"  + (mon  > 1 ? "s" : ""));
        if (week > 0) tbl.push(week + " week"   + (week > 1 ? "s" : ""));
        if (day  > 0) tbl.push(day  + " day"    + (day  > 1 ? "s" : ""));
        if (hour > 0) tbl.push(hour + " hour"   + (hour > 1 ? "s" : ""));
        if (min  > 0) tbl.push(min  + " minute" + (min  > 1 ? "s" : ""));
        if (sec  > 0) tbl.push(sec  + " second" + (sec  > 1 ? "s" : ""));
        
        if (tbl.length === 0) return "forever";
        return tbl.join(" ");
    } else {
        let times = {};
        times.milliseconds = ms;
        times.seconds      = Math.floor(times.milliseconds / 1000);
        times.minutes      = Math.floor(times.seconds      / 60);
        times.hours        = Math.floor(times.minutes      / 60);
        times.days         = Math.floor(times.hours        / 24);    
        times.weeks        = Math.floor(times.days         / 7);
        times.months       = Math.floor(times.days         / 30.436875);
        times.years        = Math.floor(times.days         / 365);   

        return times;

        // let mil = ms % 1000;
        // return format.replace(/\$mo/g, mon)
        //              .replace(/\$w/g, week)
        //              .replace(/\$d/g, day)
        //              .replace(/\$h/g, hour)
        //              .replace(/\$m/g, min)
        //              .replace(/\$s/g, sec)
        //              .replace(/\$ms/g, mil);
    }
}

global.parseTime = function(input){
    if (!isString(input)) return;

    let keys = Object.keys(time);
    let re = new RegExp('[(' + keys.join(')(?:') + ')]', 'g');
    let slicePos = 0;
    let val = 0;

    if(input.includes("forever")) return Infinity;

    let matchesLeft = 32;
    while (--matchesLeft) {
        let res = re.exec(input);
        if (res == null) break;
        let timeType = input.charAt(res.index);
        if (keys.includes(timeType)) {
            let thisVal = Number(input.substring(slicePos, res.index));
            if (Number.isFinite(thisVal) && !Number.isNaN(thisVal)) {
                val += thisVal * time[timeType];
            }
        }
        slicePos = res.index + 1;
    }

    return val;
}
