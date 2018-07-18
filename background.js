//popup.js

'use strict';

var DEFAULT_SOUND = 'slow-spring-board';
var DEFAULT_VOLUME = 1.0;
var DEFAULT_INTERVAL = 60;
var HOUR_MS = 1000 * 60 * 60;

var audio=null
var start_time = 10 * HOUR_MS;
var end_time = 22 * HOUR_MS;

function playSound(duckAudio) {

  var currentSound = DEFAULT_SOUND;
  audio = document.createElement('audio');
  document.body.appendChild(audio);
  audio.autoplay = true;

  var src = currentSound + '.ogg';
  var volume = DEFAULT_VOLUME;
  audio.volume = volume;
  audio.src = src;
}

function setnextAlarm() {
  var minutes = DEFAULT_INTERVAL;
  var d = new Date();

  var now = d.getHours() * HOUR_MS +
            d.getMinutes() * 60 * 1000 +
            d.getSeconds() * 1000;
  
  var next_alarm = now + (minutes * 60 * 1000);
  
  if(next_alarm>end_time){
    alert('greater than end time');
    minutes = (start_time + (HOUR_MS*24 - now));
    minutes = Math.ceil(minutes/(60*1000));
  }
  if(next_alarm<start_time){
    alert('before start time');
    minutes = (start_time - now);
    minutes = Math.ceil(minutes/(60*1000));
  }

  var ss = d.getSeconds() + (minutes%1)*60;
  var mm = d.getMinutes() + Math.floor(minutes%60);
  var hh = d.getHours() + Math.floor(minutes/60);
  if(parseFloat(ss)>59){
    mm = mm + 1;
    ss = ss%60;
  }
  if(parseFloat(mm)>59){
    hh = hh + 1;
    mm = mm%60;
  }
  if(parseFloat(mm) < 10){
    mm = "0"+mm;
  }
  if(parseFloat(ss) < 10){
    mm = "0"+ss;
  }
  var alarm_time = hh + ":" + mm + ":"+ ss;
  chrome.storage.sync.set({'next_alarm': alarm_time});
  chrome.alarms.create({delayInMinutes: minutes});  
}

chrome.alarms.onAlarm.addListener(function(){
  chrome.browserAction.setBadgeText({text: ''});
  chrome.notifications.create({
      type:     'basic',
      iconUrl:  'icon.png',
      title:    'Time to Hydrate',
      message:  'Everyday I\'m Guzzlin\'!',
      buttons: [
        {title: 'Keep it Flowing.'}
      ],
      priority: 0});
  setnextAlarm();
  playSound(true);
});

chrome.notifications.onButtonClicked.addListener(function() {
  chrome.storage.sync.get(['minutes'], function(item) {
    chrome.browserAction.setBadgeText({text: 'ON'});
    chrome.alarms.create({delayInMinutes: item.minutes});
  });
});

function bginitialize() {
  alert('bginitialize');
  var tod = new Date();
  chrome.storage.sync.set({'today': String(tod.getDate())});
  chrome.storage.sync.set({'current_water': "0"});  
  chrome.alarms.create({delayInMinutes: 0.1});
}

bginitialize();
