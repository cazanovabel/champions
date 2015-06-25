﻿var CoC=new function(){
  this.data={}
  this.model={}
  this.settings={}
  this.algorithm={}
};

//load backbone and underscore
importScripts('underscore-min.js', 'backbone-min.js');

//load models, data and algorithms
importScripts('models.js', 'data.js', 'algorithm.js');

onmessage = function (event){
  var algorithm = event.data.algorithm;
  var rosterJSON = event.data.roster;
  var size = event.data.size;
  var weights = event.data.weights;
  var quest = event.data.quest;
  var extras = event.data.extras;
  var update = event.data.update;
  
  CoC.settings.getWeight=function(key){
    var value = weights[key];
    if(value === undefined || value === null)
      return 1;
    return value;
  }
  CoC.settings.getStarWeight=function(stars){
    return CoC.settings.getWeight({
      2:"stars-2",
      3:"stars-3",
      4:"stars-4"
    }[stars]);
  }
  CoC.settings.getDuplicateWeight=function(number){
    return CoC.settings.getWeight({
    2:"duplicates-2",
    3:"duplicates-3",
    4:"duplicates-4",
    5:"duplicates-5"
    }[number]);
  }
  
  var lastTime = (new Date()).getTime();
  if(!CoC.algorithm[algorithm]){
    postMessage({ type:"failed", message:"Algorithm not found" });
    return;
  }
  
  var roster = [];
  for(var i=0; i<rosterJSON.length; i++)
    roster.push(new CoC.model.Champion( rosterJSON[i] ));
  
  var result = CoC.algorithm[algorithm].build({ 
    champions:roster, 
    size:size, 
    extras:extras, 
    quest:quest, 
    progress:function(current, max, description){
      var time = (new Date()).getTime();
      if(!description && time-lastTime < update)
        return;
      lastTime = time;
      postMessage({ 
        type:"progress", 
        current:current, 
        max:max,
        description:description        
      });
    }  
  });

  postMessage({ type:"complete", result:result });
};