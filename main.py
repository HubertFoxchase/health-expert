#!/usr/bin/env python

import jinja2

from google.appengine.ext import ndb

import logging
import os.path
import webapp2

from webapp2_extras import auth
from webapp2_extras import sessions

from webapp2_extras.auth import InvalidAuthIdError
from webapp2_extras.auth import InvalidPasswordError
import api2_models

import json
import urllib

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__), 'templates')),
    extensions=['jinja2.ext.autoescape'],
    variable_start_string='((', 
    variable_end_string='))',
    autoescape=True)


def user_required(handler):
    """
    Decorator that checks if there's a user associated with the current session.
    Will also fail if there's no session present.
    """

    def check_login(self, *args, **kwargs):
        auth = self.auth
        if not auth.get_user_by_session():
            _params = {'url' : self.request.path_qs}
            self.redirect(self.uri_for('login') + '?' + urllib.urlencode(_params), abort=True)
        else:
            return handler(self, *args, **kwargs)

    return check_login


class BaseHandler(webapp2.RequestHandler):

    @webapp2.cached_property
    def auth(self):
        """Shortcut to access the auth instance as a property."""

        return auth.get_auth()

    @webapp2.cached_property
    def user_info(self):
        """Shortcut to access a subset of the user attributes that are stored
    in the session.

    The list of attributes to store in the session is specified in
      config['webapp2_extras.auth']['user_attributes'].
    :returns
      A dictionary with most user information
    """

        return self.auth.get_user_by_session()

    @webapp2.cached_property
    def user(self):
        """Shortcut to access the current logged in user.

    Unlike user_info, it fetches information from the persistence layer and
    returns an instance of the underlying model.

    :returns
      The instance of the user model associated to the logged in user.
    """

        u = self.user_info
        return (self.user_model.get_by_id(u['user_id']) if u else None)

    @webapp2.cached_property
    def user_model(self):
        """Returns the implementation of the user model.

    It is consistent with config['webapp2_extras.auth']['user_model'], if set.
    """

        return self.auth.store.user_model

    @webapp2.cached_property
    def session(self):
        """Shortcut to access the current session."""

        return self.session_store.get_session()

    def serve_static_file(self, file_name):
        
        path = os.path.join(os.path.dirname(__file__), 'templates', file_name)
        html = open(path, 'r')
        self.response.write(html.read())


    def render_template(self, view_filename, params=None):
        if not params:
            params = {}
        user = self.user_info
        params['user'] = user
        
        template = JINJA_ENVIRONMENT.get_template(view_filename)
        self.response.write(template.render(params))
        
    def display_message(self, message):
        """Utility function to display a template with a simple message."""

        params = {'message': message}
        self.render_template('message.html', params)

    # this is needed for webapp2 sessions to work
    def dispatch(self):

        # Get a session store for this request.
        self.session_store = sessions.get_store(request=self.request)

        try:
            # Dispatch the request.
            webapp2.RequestHandler.dispatch(self)
        finally:
            # Save all sessions.
            self.session_store.save_sessions(self.response)


class AppMainHandler(BaseHandler):

    @user_required
    def get(self):
        self.serve_static_file('channel.html')

class ClientMainHandler(BaseHandler):

    @user_required
    def get(self):
        self.serve_static_file('client.html')

class CompleteSignupHandler(BaseHandler):

    def get(self, *args, **kwargs):
        user = None
        user_id = kwargs['user_id']
        signup_token = kwargs['signup_token']

        (user, ts) = self.user_model.get_by_auth_token(int(user_id), signup_token, 'invite')
        
        organisation = ndb.Key(api2_models.Organisation, user.organisation_id).get()

        if user:
            params = {'email': user.email, 
                      'organisation_id': user.organisation_id,  
                      'organisation_name': organisation.name,  
                      'user_id': user_id, 
                      'token': signup_token}
            self.render_template('completeregistration.html', params)
            return

        else:            
            logging.info('Could not find any user with id "%s" token "%s"' , user_id, signup_token)
            self.abort(404)


class CompleteSignupHandlerAjax(BaseHandler):

    def post(self):
        
        name = self.request.get('name')
        password = self.request.get('password')
        role = int(self.request.get('role'))
        user_id = self.request.get('user_id')
        signup_token= self.request.get('token')
        
        (user, ts) = self.user_model.get_by_auth_token(int(user_id), signup_token, 'invite')

        user.name = name
        user.role = role
        user.active = True
        user.verified = True
        user.set_password(password)
        user.put()        

        # remove signup token, we don't want users to come back with an old link
        self.user_model.delete_invite_token(user_id, signup_token)
        
        # store user data in the session
        self.auth.set_session(self.auth.store.user_to_dict(user), remember=True)
        
        self._serve_page(True)
        
    def _serve_page(self, success=False):

        self.response.headers['Content-Type'] = 'application/json'   
        obj = {'success': success} 
        self.response.out.write(json.dumps(obj))        


class InviteHandlerAjax(BaseHandler):

    @user_required
    def post(self):
        user = self.user
        
        email = self.request.get('email').lower()
        #name = self.request.get('name')
        #password = self.request.get('password')
        #userType = int(self.request.get('type'))
        role = int(self.request.get('role'))
        organisation_id = int(self.request.get('organisation_id'))
        
        #TODO: need to check if user is allowed to invite to this organisation
        organisation_ref = user.organisation_ref

        unique_properties = ['email']
        user_data = self.user_model.create_user(
            email,
            unique_properties,
            email=email,
            password_raw='AD2H68CD0',
            #name=name,
            type=int(api2_models.UserType.NORMAL),
            role=role,
            organisation_ref=organisation_ref,
            active=False,
            verified=False,
            )
        if not user_data[0]:  # user_data is a tuple
            #self.display_message('Unable to create user for email %s because of duplicate keys %s' % (email, user_data[1]))
            logging.debug(user_data[1])

            self._serve_page(success=False, message='Unable to create new user. Email address already exists')
            return

        user = user_data[1]
        user_id = user.get_id()

        token = self.user_model.create_invite_token(user_id)

        verification_url = self.uri_for('complete_signup', type='i', user_id=user_id, signup_token=token, _full=True)

        self._serve_page(success=True, verification_url=verification_url)

    def _serve_page(self, success=False, verification_url=None, message=None):

        self.response.headers['Content-Type'] = 'application/json'   
        obj = {'success': success, 'verification': verification_url, 'message': message} 
        self.response.out.write(json.dumps(obj))


class ForgotPasswordHandler(BaseHandler):

    def get(self):
        self.render_template('forgot.html')

class ForgotPasswordHandlerAjax(BaseHandler):

    def get(self):
        self._serve_page()

    def post(self):
        email = self.request.get('email')

        user = self.user_model.get_by_auth_id(email)
        if not user:
            logging.info('Could not find any user entry for email %s', email)
            self._serve_page(success=False, message='Could not find any user entry for email ' + email)
            return

        user_id = user.get_id()
        token = self.user_model.create_signup_token(user_id)

        verification_url = self.uri_for('verification', type='p', user_id=user_id, signup_token=token, _full=True)
        
        self._serve_page(success=True, verification_url=verification_url)

    def _serve_page(self, success=False, verification_url=None, message=None):

        self.response.headers['Content-Type'] = 'application/json'   
        obj = {'success': success, 'verification': verification_url, 'message': message} 
        self.response.out.write(json.dumps(obj))


class VerificationHandler(BaseHandler):

    def get(self, *args, **kwargs):
        user = None
        user_id = kwargs['user_id']
        signup_token = kwargs['signup_token']
        verification_type = kwargs['type']

        # it should be something more concise like
        # self.auth.get_user_by_token(user_id, signup_token)
        # unfortunately the auth interface does not (yet) allow to manipulate
        # signup tokens concisely
        
        token_name = 'signup'
        
        if verification_type == 'i':
            token_name = 'invite'

        (user, ts) = self.user_model.get_by_auth_token(int(user_id), signup_token, token_name)

        if not user:
            logging.info('Could not find any user with id "%s" token "%s"' , user_id, signup_token)
            self.abort(404)

        # store user data in the session
        self.auth.set_session(self.auth.store.user_to_dict(user), remember=True)

        if verification_type == 'v':
            # remove signup token, we don't want users to come back with an old link
            self.user_model.delete_signup_token(user.get_id(), signup_token)

            if not user.verified:
                user.verified = True
                user.put()

            self.display_message('User email address has been verified.')
            return

        elif verification_type == 'i':

            if user.verified:
                logging.info('existing account, no need to set up')
                self.display_message('User already have account.')
                return
            
            params = {'user': user, 'token': signup_token}
            self.render_template('completeregistration.html', params)

        elif verification_type == 'p':
            # supply user to the page
            params = {'user': user, 'token': signup_token}
            self.render_template('resetpassword.html', params)
        
        else:
            logging.info('verification type not supported')
            self.abort(404)


class SetPasswordHandlerAjax(BaseHandler):

    @user_required
    def post(self):
        password = self.request.get('password1')
        old_token = self.request.get('token')

        if not password or password != self.request.get('password2'):
            self._serve_page(False)
            return

        user = self.user
        user.set_password(password)
        user.put()

        # remove signup token, we don't want users to come back with an old link
        self.user_model.delete_signup_token(user.get_id(), old_token)

        self._serve_page(True)
        
    def _serve_page(self, success=False):

        self.response.headers['Content-Type'] = 'application/json'   
        obj = {'success': success} 
        self.response.out.write(json.dumps(obj))        


class LoginHandler(BaseHandler):

    def get(self):
        self.render_template('login.html')

class LoginHandlerAjax(BaseHandler):

    def post(self):
        
        email = self.request.get('email').lower()
        password = self.request.get('password')
        remember = bool(self.request.get('remember'))
        
        try:
            u = self.auth.get_user_by_password(email, password, remember=remember, save_session=True)
            self._serve_page(True)
        except (InvalidAuthIdError, InvalidPasswordError), e:
            logging.info('Login failed for user %s because of %s', email, type(e))
            self._serve_page(False)

    def _serve_page(self, success=False):

        self.response.headers['Content-Type'] = 'application/json'   
        obj = {'success': success} 
        self.response.out.write(json.dumps(obj))


class LogoutHandler(BaseHandler):

    def get(self):
        self.auth.unset_session()
        self.redirect(self.uri_for('home'))


config = {
    'webapp2_extras.auth': 
    {
      'user_model': 'api2_models.User',
      'user_attributes': ['email', 'type', 'organisation_id']
    },
    'webapp2_extras.sessions': 
    {
        'secret_key': 'YOUR_SECRET_KEY'
    }
}

app = webapp2.WSGIApplication([
    webapp2.Route('/', AppMainHandler, name='home'),
    webapp2.Route('/client', ClientMainHandler, name='client'),
    
    webapp2.Route('/auth/ajax/completesignup', CompleteSignupHandlerAjax),
    webapp2.Route('/auth/ajax/inviteuser', InviteHandlerAjax),
    
    webapp2.Route('/auth/<type:v|p>/<user_id:\d+>-<signup_token:.+>', handler=VerificationHandler, name='verification'),
    webapp2.Route('/auth/<type:i>/<user_id:\d+>-<signup_token:.+>', handler=CompleteSignupHandler, name='complete_signup'),
    
    webapp2.Route('/auth/ajax/password', SetPasswordHandlerAjax),
    
    webapp2.Route('/auth/login', LoginHandler, name='login'),
    webapp2.Route('/auth/ajax/login', LoginHandlerAjax, name='ajax_login'),
    
    webapp2.Route('/auth/logout', LogoutHandler, name='logout'),

    webapp2.Route('/auth/forgot', ForgotPasswordHandler, name='forgot' ),
    webapp2.Route('/auth/ajax/forgot', ForgotPasswordHandlerAjax, name='ajax_forgot' ),
], debug=True, config=config)

logging.getLogger().setLevel(logging.DEBUG)


            