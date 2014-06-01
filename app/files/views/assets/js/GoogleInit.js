	var API_ROOT = 'https://health-expert-1705.appspot.com/_ah/api', 
		CLIENT_ID = '817202020074-1b97ag04r8rhfj6r40bocobupn92g5bj.apps.googleusercontent.com', 
        //CLIENT_ID = '817202020074-utvardicvh3oaqhf2tqagqnrmk52cv2p.apps.googleusercontent.com',
		SCOPES = 'https://www.googleapis.com/auth/userinfo.email';

    (function() {
        var d=document,
        h=d.getElementsByTagName('head')[0],
        s=d.createElement('script');
        s.type='text/javascript';
        s.src='https://apis.google.com/js/client.js?onload=gapi_init';
        h.appendChild(s);
    })();

	function gapi_init() {
		var apisToLoad;

		var callback = function() {
			if (--apisToLoad == 0) {
				Appery('signingInLabel').text("Attepting to authorize ...");
				signin(true, userAuthed);
			}
		};

		apisToLoad = 3; // must match number of calls to gapi.client.load()
		gapi.client.load('members', 'v1', callback, API_ROOT);
		gapi.client.load('messages', 'v1', callback, API_ROOT);
		gapi.client.load('oauth2', 'v2', callback);
	}

	function signin(mode, callback) {
		gapi.auth.authorize({
			client_id : CLIENT_ID,
			scope : SCOPES,
			immediate : mode
		}, callback);
	}

	function userAuthed() {
		var request = gapi.client.oauth2.userinfo
				.get()
				.execute(
						function(resp) {
							Appery('signingInLabel').text("Sucessfuly signed in ...");
							if (!resp.code) {
								// User is signed in, call my Endpoint
								//Appery.navigateTo('selectScreen', {transition : 'slide'});
								Appery('mobilelabel_15').show();
                                membersDataSource.execute({});
							} else {
								Appery('loginWithGoogleBtn').show();
								Appery('signingInLabel').hide();
							}
						});
	}

	function auth() {
		signin(false, userAuthed);
	};