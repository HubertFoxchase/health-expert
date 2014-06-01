
Appery.postMessageService = Appery.createClass(null, {

    init : function(requestOptions) {
        this.__requestOptions = $.extend({}, requestOptions);
    },

    process : function(settings) {
        settings.beforeSend(settings);
        if (this.__requestOptions.echo) {
            settings.success(this.__requestOptions.echo);
        } else {
            
            gapi.client.messages.put(settings.data).execute(function(resp) {
	            settings.success({});
            }); 
        }
        settings.complete('success');
    }

});
