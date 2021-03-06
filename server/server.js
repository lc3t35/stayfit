
/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/

var serialize = function(obj) {
  var str = [];
  for(var p in obj)
     str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
  return str.join("&");
};

var Base64 = {

// private property
_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

// public method for encoding
encode : function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = Base64._utf8_encode(input);

    while (i < input.length) {

        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
        this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
        this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

    }

    return output;
},

// public method for decoding
decode : function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {

        enc1 = this._keyStr.indexOf(input.charAt(i++));
        enc2 = this._keyStr.indexOf(input.charAt(i++));
        enc3 = this._keyStr.indexOf(input.charAt(i++));
        enc4 = this._keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }

    }

    output = Base64._utf8_decode(output);

    return output;

},

// private method for UTF-8 encoding
_utf8_encode : function (string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {

        var c = string.charCodeAt(n);

        if (c < 128) {
            utftext += String.fromCharCode(c);
        }
        else if((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        }
        else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }

    }

    return utftext;
},

// private method for UTF-8 decoding
_utf8_decode : function (utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;

    while ( i < utftext.length ) {

        c = utftext.charCodeAt(i);

        if (c < 128) {
            string += String.fromCharCode(c);
            i++;
        }
        else if((c > 191) && (c < 224)) {
            c2 = utftext.charCodeAt(i+1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
        }
        else {
            c2 = utftext.charCodeAt(i+1);
            c3 = utftext.charCodeAt(i+2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }

    }

    return string;
}

}

Meteor.publish("userSettings",function(userId,vCode){
    if(typeof userId != "undefined" && userId != null && typeof vCode != 'undefined'){
        var q = user_settings.find({owner:userId, vCode: vCode,status:0}).fetch();
        if(q){
            // update user setting to status 1
            
            console.log('updating here');
            user_settings.update({owner:userId,vCode:vCode},{'$set':{status:1}});
        }
    }else{
        // look for a value with status 1
        return user_settings.find({owner:userId, status:1});
    }
});

Meteor.publish("userEvents",function(userId){
    //console.log('publishing');
    if(typeof userId != "undefined" && userId != null){
        return user_events.find({owner:userId});
    }
});


Meteor.publish("userActivities",function(userId){
    if(typeof userId != "undefined" && userId != null){
        return user_activities.find({owner:userId});
    }
});

Meteor.publish("userLocations",function(userId){
    if(typeof userId != "undefined" && userId != null){
        return user_locations.find({owner:userId});
    }
});
/*
Meteor.publish("userMovesPlaces",function(userId){
    if(typeof userId != "undefined" && userId != null){
        return user_moves_places.find({owner:userId});
    }
});


Meteor.publish("userMovesActivities",function(userId){
    if(typeof userId != "undefined" && userId != null){
        return user_moves_activities.find({owner:userId});
    }
});
*/

Meteor.publish("userMovesStoryline",function(userId,showDays){
    if(typeof userId != "undefined" && userId != null  ) {
    
        if(typeof showDays == "undefined"){
            showDays = 7;
        }
    
    // first lookup via owner and dates less than showDays minus today ...
    // get 'end of dates'
        var end_day =  moment().subtract('days',parseInt(showDays)).format("YYYYMMDD");
        
        var start_day = moment().format("YYYYMMDD");
        
        var dates = [];
        showDays = parseInt(showDays);
        // m aybe this isnt an integer ? is show days always undefined?
        for(var x =0; x < showDays ; x++){
            dates.push(moment().subtract('days',x).format("YYYYMMDD"));
        }
        console.log(dates);
        
        return user_moves_storyline.find({owner:userId,date:{"$in" : dates}});
    }
});

Meteor.methods({
    genCode : function(the_owner){
        console.log('generating code for' + the_owner);
        var random_value = Random.hexString(4);
        user_settings.update({owner:the_owner},{set: {vCode: random_value,status : 0}});
        return random_value;
        }
    ,
    newUserSettings : function(the_owner){
        if(typeof the_owner != "undefined" && the_owner){
            var new_object = {};
            new_object.owner = the_owner;
            new_object.status = 1;
            if(!user_settings.findOne({owner:the_owner})){
                user_settings.insert(new_object);
                // issue another call to determine to send as SMS or email
                return true;
            }else{
                console.log('user exists');
                return false;
            }
        }
    },
    verifyCode : function(the_owner,vCode){
    
        var q = user_settings.findOne({owner:the_owner,status:0,vCode:vCode});
        if(q){
            // update object to set status to 1
            var theUpdate = user_settings.update({owner:the_owner},{"$set":{owner:the_owner,status:1}});
            if(theUpdate)
                return theUpdate;
            else{
                console.log('problem with updating backend for ' + the_owner);
                return false;
               }
            
            }
        else{
            console.log('prob with vcode match ... try again');
            return false;
        }
        // problem with update?
        return false;
        
    },
/*
 *  Serverside taxonomy insert events...
 *  i think i'm putting them here for now
 */
    createEvent : function(userId,obj){
        // probably validate obj ...
        var cpy = obj;
        cpy.owner = userId;
        return user_events.insert(obj);
        
    },
    createLocation : function(userId,obj){
        var cpy = obj;
        cpy.owner = userId;
        return user_locations.insert(obj);
        
    },
    
    createActivity : function(userId,obj){
       var cpy = obj;
        cpy.owner = userId;
        user_activities.insert(cpy);
    },
/* 
 *  twilio API
 *      sendSMS(phone number, userid)  - (for now) sends a confirmation code stored in user_settings via Meteor.userId() via sms
 *      very basic implementation
 */
    sendSMS : function (dest, userid) {
    
        var settings = Meteor.settings;

        if(settings.twilio != "undefined"){
            settings = settings.twilio;
           
            if(settings.account_sid != "undefined"){
                var sid = settings.account_sid;
                if(settings.auth_token != "undefined"){
                    var auth_token = settings.auth_token
                }
           }
        }

        var q =user_settings.findOne({owner:userid},{vCode:1});

        if(q && typeof q.vCode != 'undefined')

            console.log(Meteor.http.post('https://api.twilio.com/2010-04-01/Accounts/'+sid+'/Messages',
            {
            params:{From:'+14696434684', To: dest, Body: 'Your stayfit code is ' + q.vCode},
            headers: {
            'content-type':'application/x-www-form-urlencoded',
            'authorization' : 'Basic ' +  Base64.encode(sid + ':' + auth_token)
            }
            }
            ));
    },
/*
 *  END twilio API
 */
/*
 *  Sendgrid API
 *      sendEmail(userId,email)  - (for now) sends a confirmation code stored in user_settings via Meteor.userId()
 *      very basic implementation
 */
     
    sendEmail : function(userId,address){
        // verify userId exists and  check status : 0
            
        var confirmation = user_settings.findOne({owner:userId});
        
        var settings = Meteor.settings;
        
        
        
        if(typeof settings != "undefined" && settings){
            if(settings.sendGrid != "undefined"){
                settings = settings.sendGrid;
            }
        }
        
        if(typeof settings.user != "undefined" && typeof settings.key != "undefined"){
            sendgrid_user = settings.user;
            sendgrid_key = settings.key;
        
        
            if(confirmation && typeof confirmation.vCode != 'undefined'){
                var message = 'Your confirmation code for stayfit.meteor.com is ' + confirmation.vCode;
            
                var to_name = 'User';
                var subject = 'Confirmation Code';
                
                var base_url = 'https://sendgrid.com/api/mail.send.json?api_user='+sendgrid_user+'&api_key='+sendgrid_key+'&to='+address+'&toname='+to_name+'&subject=Example_Subject&text='+message+'&from=donotreply@stayfit.meteor.com';
                    
                console.log(Meteor.http.get(base_url));
                
            }else{
                console.log('confirmation email already sent');
            }
        }
    },

/*
 *  END SENDGRID API
 */
    
/*
 *
 *  Moves API Stuff
 *  movesAuth ()                        -  Begins oauth flow. Redirects window to appropriate URL from backend call
 *
 *  movesRequestToken (code)            - uses code from above, which is stored via client side
 *                                        request in user_settings.movesCode
 *
 *  movesApi (userId,action,parameters) - Looks up users token via user id inside user_settings.movesToken, stored in method above server side.
 *                                        Uses action to add to end of URI, supports activities/daily and places/daily, enforced server-side. 
 *                                        Attaches access_token= parameter at end of statement. Stores activities/daily to user_moves_activities, 
 *                                        stores places/daily to user_moves_places (with some minor modification to record structure)
 */
    movesAuth : function(){
        var settings = Meteor.settings;
        if(typeof settings != 'undefined'){
            
            if(typeof settings.moves != 'undefined'){
                settings = settings.moves;
                if(typeof settings.client_id != "undefined"){
                    if(typeof settings.client_secret != "undefined"){
                        var base_url = "https://api.moves-app.com/oauth/v1/authorize?response_type=code&client_id=";
                        return base_url + settings.client_id + "&scope=activity%20location" ;
                    }
               }
            }
        }
    },
    
    movesRequestToken : function(code){
    
        var settings = Meteor.settings;
         var settings = Meteor.settings;
        if(typeof settings != 'undefined'){
            
            if(typeof settings.moves != 'undefined'){
                settings = settings.moves;
                if(typeof settings.client_id != "undefined"){
                    if(typeof settings.client_secret != "undefined"){
                        var post_request = {params : {
                            grant_type : "authorization_code",
                            code : code,
                            client_id : settings.client_id,
                            client_secret : settings.client_secret,
                            redirect_uri : settings.redirect_uri
                        }};
               
                        console.log(post_request);
                        Meteor.http.post( "https://api.moves-app.com/oauth/v1/access_token" ,post_request,function(error,result){
                            if( typeof result != "undefined"){
                                console.log(result);
                                if(result.statusCode == 200){
                                    console.log('token obtained from moves');
                                
                                if(typeof result.data != "undefined")
                                    if(typeof result.data.access_token != "undefined")
                                        // give user their moves token ...
                                        user_settings.update({movesCode : code},
                                        {"$set": {movesToken : result.data.access_token} });
                                }else{
                                    console.log('Moves token request returned error');
                                    console.log(result);
                                }
                            }else{
                                console.log('something bad happened when movesRequestToken ran');
                                console.log(error);
                            }
                        });
                   }
                }
            }
        }
    },
    
    movesApi : function (userId,action,parameters){
        // get api key
        var q = user_settings.findOne({owner:userId});
        if(q && typeof userId != "undefined" && typeof action != "undefined"){
            console.log(q);
            if (typeof q.movesToken != "undefined"){
                var token = q.movesToken;
               console.log(token);
               console.log("https://api.moves-app.com/api/v1/user/" + action +  (typeof parameters != "undefined" ? "?" + serialize(parameters) + "&" : "?" ) +  "access_token=" + token);
                // check if access token expired... PITA
                 Meteor.http.get(  "https://api.moves-app.com/api/v1/user/" + action +  (typeof parameters != "undefined" ? "?" + serialize(parameters) + "&" : "?" ) +  "access_token=" + token , function(error,result){
                    if(action == "places/daily" && result.data != null){
                        result.data.filter(function(arr){
                            var date = arr.date;
                            //var new_object = arr;
                            //arr.owner = userId;
                            var segments = [];
                            // clean up segments array field to make less verbose. Should be ok.
                            arr.segments.filter(function(arr2){
                                var new_segment = {};
                                
                                new_segment.id = arr2.place.id;
                                new_segment.name = arr2.place.name;
                                new_segment.type = arr2.place.type;
                                
                                new_segment.lat = arr2.place.location.lat;
                                new_segment.lon = arr2.place.location.lon;

                                
                                new_segment.startTime = arr2.startTime;
                                new_segment.endTime = arr2.endTime;
                                segments.push(new_segment);
                            });
                            
                            var new_record = {};
                            new_record.date = arr.date;
                            if(segments.length > 0)
                                new_record.segments = segments;
                              // check to see if date does not exist support upsert !!!?
                            new_record.owner = userId;
                            user_moves_places.insert( new_record );
                        });
                        // store to places
                        
                  //      user_moves_places.insert(
                    }else if(action == "activities/daily"){
                    // no change for this data structure since activities are more embedded and don't feel like
                    // doing time difference calculations for now ...
                    
                        if(result.data != null)
                        result.data.filter(function(arr){
                            //var new_object = arr;
                            //arr.owner = userId;
                            var new_record = arr;
                            new_record.owner = userId;
                            console.log(new_record);
                              // check to see if date does not exist support upsert !!!?
                            console.log(user_moves_activities.insert( new_record ));
                        });
                        else{
                            user_settings.update({owner: userId },{$set: { movesCode : undefined, movesToken:undefined } });
                            return {error : "expired access token"};
                        }
                            
                    }else if(action == "storyline/daily" || typeof parameters.trackPoints != "undefined"){
                        // only support one date to keep track of 'track points'
                        console.log(result.data);
                        if(typeof result != "undefined" && typeof result.data != "undefined" && result.data){
                            var new_record = result.data[0];
                            new_record.owner = Meteor.userId();
                            // can we do upserts yet? please ?
                            user_moves_storyline.insert(new_record);
                        }else{
                            console.log("Storyline/daily did not return a resultset");
                        }
                    }
                 
                 }) ;
               
                // perhaps do some validation on types of 'actions' to accept clientside
            }
        }
    },
    /*
     *  END OF MOVES API
     *
     */
     
     movesApiStoryline : function(userid,days){
        if(typeof userid != "undefined"){
            if(typeof days == "undefined"){
                days = 7;
            }
                 console.log('here');

            // todays day ...
            for(var x = 0;x < days; x++){
                var the_day =  moment().subtract('days',x).format("YYYYMMDD");
               // force string ?
                the_day = the_day + '';
                var pre_check = user_moves_storyline.findOne({owner:userid,date:the_day});
               if(!pre_check){

                    Meteor.call("movesApi",userid, "storyline/daily/" + the_day, {trackPoints:true},function(error,result) { if(typeof error != "undefined") console.log(error);} );
               }else{
               // compare what exists?
                    console.log('record exists');
               }
            }
            
        }
        // automatically get a specific number of days
        // to get track points systematically one day at a time ...
     },
     
     movesApiStorylineCount : function(userId){
            return user_moves_storyline.find({owner:userId},{date:1}).fetch().length;
     },
     
    fitbitAuth : function(){
    
        // old oauth greeattt
        
         console.log(Meteor.http.post('https://api.twilio.com/2010-04-01/Accounts/ACbe383739477ce50535347399480c8403/Messages',
          {
            params:{oauth_signature_method:'HMAC-SHA1', oauth_timestamp: Date.parse(new Date()).getTime()/1000, oauth_nonce: Random.hexString(6) },
            headers: {
            'content-type':'application/x-www-form-urlencoded',
                'authorization' : 'OAuth oauth_consumer_key="stayfit"',
            }
          }, function () {
              console.log(arguments)
            }
          ));
        
    }
    
    
});