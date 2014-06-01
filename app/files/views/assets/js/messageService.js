
Appery.messageService = Appery.createClass(null, {

    init : function(requestOptions) {
        this.__requestOptions = $.extend({}, requestOptions);
    },

    process : function(settings) {
        settings.beforeSend(settings);
        if (this.__requestOptions.echo) {
            settings.success(this.__requestOptions.echo);
        } else {
            
            ts = (new Date()).getTime();
            console.log("request messages since " + ts + "(" + (new Date()) + ")");
            gapi.client.messages.list(settings.data).execute(function(resp) {
                
                if(resp.items && resp.items.length > 0) {
                
                    console.log("received " + resp.items.length + " new messages");
                    
                    var d = JSON.parse(localStorage.getItem("messageData"));
                    
                    if(!d) {
                        d = resp;
                    }
                    else {
                        for(i = 0; i< resp.items.length; i++){
                            d.items.push(resp.items[i]);
                        }
                    }
    
                    d.ts = ts;
                    localStorage.setItem("messageData", JSON.stringify(d));
                    
                    settings.success(d);
                }
            });            
        }
        settings.complete('success');
    }

});