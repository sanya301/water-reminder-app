//popup.js
'use strict';

var cur_wat;
var undo_val = 0;

var HOUR_MS = 1000 * 60 * 60;
var start_time = 10 * HOUR_MS;
var end_time = 22 * HOUR_MS;

var GLASS = "250"

function time(ms) {
    return new Date(ms).toISOString().slice(11, -5);
}

function check_next_alarm(){
	var now = new Date;
	chrome.storage.sync.get('next_alarm', function(result) {
		var n_a = result.next_alarm;
		var alarm = parseFloat(n_a.slice(0,2))*HOUR_MS 
					 + parseFloat(n_a.slice(3,5))* 60 *1000;
		var t = now.getHours() * HOUR_MS +
    			now.getMinutes() * 60 * 1000 +
    			now.getSeconds() * 1000;
		if (alarm < t){
			alert('correcting next_alarm in check_next_alarm');
			n_a = time(now.getTime() + 60*60*1000);
			chrome.storage.sync.set({'next_alarm': n_a});
		}
	});
}

function getWater() {
	chrome.storage.sync.get('current_water', function (result) {
	    cur_wat = result.current_water;
	});
	if(cur_wat){
		document.getElementById('current_water').innerText = cur_wat + " mL";
	}
	else {
		document.getElementById('current_water').innerText = "0 mL";
	}
}

function updateWater(value){
	var add = (value == null)? document.getElementById('add_val').value : value;
	var cur = document.getElementById('current_water').innerText;
	var new_tot = parseFloat(cur) + parseFloat(add);
	var txt = String(new_tot);
	chrome.storage.sync.set({'current_water': txt});
	chrome.storage.sync.set({'last_val': add});
	document.getElementById('add_val').value = 0;
}

function undo(){
	var cur = document.getElementById('current_water').innerText;
	chrome.storage.sync.get('last_val', function (result) {
	    var undo_val = result.last_val;
	    chrome.storage.sync.set({'last_val': 0});
	    if(parseFloat(undo_val) < 0){
	    	return;
	    }
	    var old_tot = parseFloat(cur) - parseFloat(undo_val);
		var txt = String(old_tot);
		chrome.storage.sync.set({'current_water': txt});
	});
}

function clearAlarm() {
  	chrome.browserAction.setBadgeText({text: ''});
	chrome.alarms.clearAll();
    chrome.storage.sync.set({'next_alarm': "00:00"});
    window.close();
    chrome.browserAction.setBadgeText({text: 'OFF'});
	alert("All alarms for today canceled. Go to settings to restart.");
}

function updateCurrentTime() {
	var now= new Date;  
  	var fut = new Date();
  	chrome.storage.sync.get('next_alarm', function(result) {
        var d = result.next_alarm;
        if(d=="00:00"){
        	return;
        }
        var res = d.split(":")
        fut.setHours(res[0], res[1], res[2]);
      	
		var left = time(fut-now);
		if(parseFloat(left.slice(0,2))==23){
			left = "00:00:00";
		}
        document.getElementById('timer').innerText = left;
  	});
}

function setnewdaywater(){
    var now = new Date;
    chrome.storage.sync.get('today', function (result) {
	    var d = result.today;
	    if((parseFloat(now.getDate())-parseFloat(d))!=0){
	    	alert('date changing');
	    	check_next_alarm();
	    	chrome.storage.sync.set({'current_water': "0"});
	    	chrome.storage.sync.set({'today': String(now.getDate())});
	    	chrome.storage.sync.set({'last_val': "0"});
	    }
	});
}

window.onload=setnewdaywater();

updateCurrentTime();
setInterval(updateCurrentTime, 500);
getWater();
setInterval(getWater, 100);

document.getElementById('water_add').addEventListener('click', function(){updateWater(null)});
document.getElementById('undo').addEventListener('click', undo);
document.getElementById('glass').addEventListener('click', function(){updateWater(GLASS)});
document.getElementById('cancelAlarm').addEventListener('click', clearAlarm);