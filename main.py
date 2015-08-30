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


class AuthHomeHandler(BaseHandler):

    def get(self):
        self.render_template('home.html')

class SignupHandler(BaseHandler):

    def get(self):
        self.render_template('signup.html')

    def post(self):
        email = self.request.get('email')
        name = self.request.get('name')
        password = self.request.get('password')
        userType = int(self.request.get('type'))
        role = int(self.request.get('role'))
        organisation_ref = ndb.Key(api2_models.Organisation, int(self.request.get('organisation')))

        unique_properties = ['email']
        user_data = self.user_model.create_user(
            email,
            unique_properties,
            email=email,
            password_raw=password,
            name=name,
            type=userType,
            role=role,
            organisation_ref=organisation_ref,
            active=True,
            verified=False,
            )
        if not user_data[0]:  # user_data is a tuple
            self.display_message('Unable to create user for email %s because of duplicate keys %s' % (email, user_data[1]))
            return

        user = user_data[1]
        user_id = user.get_id()

        token = self.user_model.create_signup_token(user_id)

        verification_url = self.uri_for('verification', type='v', user_id=user_id, signup_token=token, _full=True)

        msg = \
            'Send an email to user in order to verify their address. \
          They will be able to do so by visiting <a href="{url}">{url}</a>'

        self.display_message(msg.format(url=verification_url))


class ForgotPasswordHandler(BaseHandler):

    def get(self):
        self._serve_page()

    def post(self):
        email = self.request.get('email')

        user = self.user_model.get_by_auth_id(email)
        if not user:
            logging.info('Could not find any user entry for email %s', email)
            self._serve_page(not_found=True)
            return

        user_id = user.get_id()
        token = self.user_model.create_signup_token(user_id)

        verification_url = self.uri_for('verification', type='p', user_id=user_id, signup_token=token, _full=True)

        msg = \
            'Send an email to user in order to reset their password. \
          They will be able to do so by visiting <a href="{url}">{url}</a>'

        self.display_message(msg.format(url=verification_url))

    def _serve_page(self, not_found=False):
        email = self.request.get('email')
        params = {'email': email, 'not_found': not_found}
        self.render_template('forgot.html', params)

class ForgotPasswordHandlerAjax(BaseHandler):

    def get(self):
        self._serve_page()

    def post(self):
        email = self.request.get('email')

        user = self.user_model.get_by_auth_id(email)
        if not user:
            logging.info('Could not find any user entry for email %s', email)
            self._serve_page(success=False)
            return

        user_id = user.get_id()
        token = self.user_model.create_signup_token(user_id)

        verification_url = self.uri_for('verification', type='p', user_id=user_id, signup_token=token, _full=True)
        
        self._serve_page(success=True, verification_url=verification_url)

    def _serve_page(self, success=False, verification_url=None):

        self.response.headers['Content-Type'] = 'application/json'   
        obj = {'success': success, 'verification': verification_url} 
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

        (user, ts) = self.user_model.get_by_auth_token(int(user_id), signup_token, 'signup')

        if not user:
            logging.info('Could not find any user with id "%s" signup token "%s"' , user_id, signup_token)
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

        elif verification_type == 'p':
            # supply user to the page
            params = {'user': user, 'token': signup_token}
            self.render_template('resetpassword.html', params)
        
        else:
            logging.info('verification type not supported')
            self.abort(404)


class SetPasswordHandler(BaseHandler):

    @user_required
    def post(self):
        password = self.request.get('password')
        old_token = self.request.get('t')

        if not password or password != self.request.get('confirm_password'):
            self.display_message('passwords do not match')
            return

        user = self.user
        user.set_password(password)
        user.put()

        # remove signup token, we don't want users to come back with an old link
        self.user_model.delete_signup_token(user.get_id(), old_token)

        self.display_message('Password updated')

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
        self._serve_page()

    def post(self):
        email = self.request.get('email')
        password = self.request.get('password')
        remember = bool(self.request.get('remember'))
        
        logging.debug(self.request.get('remember'))
        
        try:
            u = self.auth.get_user_by_password(email, password, remember=remember, save_session=True)
            self.redirect(self.uri_for('home'))
        except (InvalidAuthIdError, InvalidPasswordError), e:
            logging.info('Login failed for user %s because of %s', email, type(e))
            self._serve_page(True)

    def _serve_page(self, failed=False):
        
        email = self.request.get('email')
        remember = bool(self.request.get('remember'))
        params = {
                  'email': email, 
                  'failed': failed, 
                  'remember': remember
                  }
        self.render_template('login.html', params)

class LoginHandlerAjax(BaseHandler):

    def get(self):
        self._serve_page()

    def post(self):
        
        email = self.request.get('email')
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


class AuthenticatedHandler(BaseHandler):

    @user_required
    def get(self):
        self.render_template('authenticated.html')


config = {
    'webapp2_extras.auth': 
    {
      'user_model': 'api2_models.User',
      'user_attributes': ['email', 'type']
    },
    'webapp2_extras.sessions': 
    {
        'secret_key': 'YOUR_SECRET_KEY'
    }
}

app = webapp2.WSGIApplication([
    webapp2.Route('/', AppMainHandler, name='home'),
    webapp2.Route('/client', ClientMainHandler, name='client'),
    webapp2.Route('/auth', AuthHomeHandler, name='auth'),
    webapp2.Route('/auth/signup', SignupHandler),
    webapp2.Route('/auth/<type:v|p>/<user_id:\d+>-<signup_token:.+>', handler=VerificationHandler, name='verification'),
    webapp2.Route('/auth/password', SetPasswordHandler),
    webapp2.Route('/auth/ajax/password', SetPasswordHandlerAjax),
    webapp2.Route('/auth/login', LoginHandler, name='login'),
    webapp2.Route('/auth/ajax/login', LoginHandlerAjax, name='ajax_login'),
    webapp2.Route('/auth/logout', LogoutHandler, name='logout'),
    webapp2.Route('/auth/forgot', ForgotPasswordHandler, name='forgot' ),
    webapp2.Route('/auth/ajax/forgot', ForgotPasswordHandlerAjax, name='ajax_forgot' ),
], debug=True, config=config)

logging.getLogger().setLevel(logging.DEBUG)


            