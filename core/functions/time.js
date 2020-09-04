global.formatTime = function(ms, showMs){
    if (ms <= 0) return "forever";
    if (Number.isNaN(ms)) return "NaN";
    if (!Number.isFinite(ms)) return "forever";

    let tbl = [];
    let t = Math.floor(ms/1000);

    let mil = ms % 1000;
    let sec = t % 60;
    let min = Math.floor((t / 60) % 60);
    let hour = Math.floor((t / 3600) % 24);
    let day = Math.floor((t / 3600) / 24);

    if (day > 0) tbl.push((day === 1) ? "one day" : day + " days");
    if (hour > 0) tbl.push((hour === 1) ? "one hour" : hour + " hours");
    if (min > 0) tbl.push((min === 1) ? "one minute" : min + " minutes");
    if (sec > 0) tbl.push((sec === 1) ? "one second" : sec + " seconds");
    if (showMs && mil > 0) tbl.push((mil === 1) ? "one millisecond" : mil + " milliseconds");

    if (tbl.length === 0) return "forever";
    return tbl.join(" ");
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
