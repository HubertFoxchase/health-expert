
Appery.memberService = Appery.createClass(null, {

    init : function(requestOptions) {
        this.__requestOptions = $.extend({}, requestOptions);
    },

    process : function(settings) {
        settings.beforeSend(settings);
        if (this.__requestOptions.echo) {
            settings.success(this.__requestOptions.echo);
        } else {
            console.log('Default implementation is used. Please define your own.');
            
            // Get the list of previous scores
            gapi.client.members.list().execute(function(resp) {
                    settings.success(resp);
            });            
        }
        settings.complete('success');
    }

});
