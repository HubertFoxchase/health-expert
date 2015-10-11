'''
Created on Oct 11, 2015

@author: Michael Lisovski
'''
import os

from api3_models import User

import time

from webapp2_extras import securecookie
from webapp2_extras.sessions import SessionDict
from webapp2_extras import auth

import Cookie

import logging


AUTH_CONFIG = {
    'webapp2_extras.auth': 
    {
      'user_model': 'api3_models.User',
      'user_attributes': ['email', 'type', 'organisation_id'],
      'token_max_age': 86400 * 7 * 3,
      'token_new_age': 86400,
      'token_cache_age': 3600,
      'cookie_name' : 'auth'
    },
    'webapp2_extras.sessions': 
    {
        'secret_key': 'YOUR_SECRET_KEY',
        'session_attributes' : ['user_id', 'remember', 'token', 'token_ts', 'cache_ts', 'email', 'type', 'organisation_id']
    }
}

#shortcuts
AUTH_TOKEN_CONFIG = {
    'token_max_age': AUTH_CONFIG['webapp2_extras.auth']['token_max_age'],
    'token_new_age': AUTH_CONFIG['webapp2_extras.auth']['token_new_age'],
    'token_cache_age': AUTH_CONFIG['webapp2_extras.auth']['token_cache_age'],
}

AUTH_COOKIE_NAME = AUTH_CONFIG['webapp2_extras.auth']['cookie_name']
SESSION_ATTRIBUTES = AUTH_CONFIG['webapp2_extras.sessions']['session_attributes']
SESSION_SECRET_KEY = AUTH_CONFIG['webapp2_extras.sessions']['secret_key']


class MyAuth():
    
    user = None
    token = None
    email = None
    organisation_ref = None

    @classmethod
    def get_user_from_cookie(cls):
        
        serializer = securecookie.SecureCookieSerializer(SESSION_SECRET_KEY)
        
        cookie_string = os.environ.get('HTTP_COOKIE')
        cookie = Cookie.SimpleCookie()
        cookie.load(cookie_string)
        
        if AUTH_COOKIE_NAME in cookie :
            session_name = cookie[AUTH_COOKIE_NAME].value
            session_name_data = serializer.deserialize(AUTH_COOKIE_NAME, session_name)
            session_dict = SessionDict(cls, data=session_name_data, new=False)
            
            if session_dict:
                session_final = dict(zip(SESSION_ATTRIBUTES, session_dict.get('_user')))
                
                logging.debug(session_final)
                
                _user, _token = cls.validate_token(session_final.get('user_id'), session_final.get('token'), token_ts=session_final.get('token_ts'))
                cls.user = _user
                cls.token = _token
                
                if cls.user:
                    cls.user['type'] = session_final.get('type')
                    cls.user['email'] = session_final.get('email')
                    cls.user['organisation_id'] = session_final.get('organisation_id')

    @classmethod
    def user_to_dict(cls, user):
        """Returns a dictionary based on a user object.

        Extra attributes to be retrieved must be set in this module's
        configuration.

        :param user:
            User object: an instance the custom user model.
        :returns:
            A dictionary with user data.
        """
        if not user:
            return None

        user_dict = dict((a, getattr(user, a)) for a in [])
        user_dict['user_id'] = user.get_id()
        user_dict['organisation_id'] = user.get_organisation_id()
        
        return user_dict

    @classmethod
    def get_user_by_auth_token(cls, user_id, token):
        """Returns a user dict based on user_id and auth token.

        :param user_id:
            User id.
        :param token:
            Authentication token.
        :returns:
            A tuple ``(user_dict, token_timestamp)``. Both values can be None.
            The token timestamp will be None if the user is invalid or it
            is valid but the token requires renewal.
        """
        user, ts = User.get_by_auth_token(user_id, token)
        return cls.user_to_dict(user), ts

    @classmethod
    def validate_token(cls, user_id, token, token_ts=None):
        """Validates a token.

        Tokens are random strings used to authenticate temporarily. They are
        used to validate sessions or service requests.

        :param user_id:
            User id.
        :param token:
            Token to be checked.
        :param token_ts:
            Optional token timestamp used to pre-validate the token age.
        :returns:
            A tuple ``(user_dict, token)``.
        """
        now = int(time.time())
        delete = token_ts and ((now - token_ts) > AUTH_TOKEN_CONFIG['token_max_age'])
        create = False
        user = None
        
        if not delete:
            # Try to fetch the user.
            logging.debug('getting user from data store %s, %s' , user_id, token)
            
            #get user info from session, if not in session get from persistent storage
            
            user, ts = cls.get_user_by_auth_token(user_id, token)

            logging.debug(user)
            
            if not user:
                logging.debug('no user, returning None, None')
                delete = False
                user = None
            else :
                # Now validate the real timestamp.
                delete = (now - ts) > AUTH_TOKEN_CONFIG['token_max_age']
                create = (now - ts) > AUTH_TOKEN_CONFIG['token_new_age']
        
                logging.debug('delete: %s; create: %s, now-ts: %s,', delete, create, now-ts)        
            
        if create:
            # Delete token from db.
            User.delete_auth_token(user_id, token)
            #token = User.create_auth_token(user_id)
            
            logging.debug('new auth token created %s', token)
            logging.debug('returning %s %s', user, token)

            
        if delete:
            # Delete token from db.
            User.delete_auth_token(user_id, token)
            logging.debug('auth token deleted %s', token)
            logging.debug('token deleted, returning None, None')

            user = None
            token = None        

        return user, token

        
        '''

        if not delete:
            # Try to fetch the user.
            logging.debug('getting user from data store %s, %s' , user_id, token)
            
            user, ts = cls.get_user_by_auth_token(user_id, token)
            if user:
                # Now validate the real timestamp.
                delete = (now - ts) > AUTH_TOKEN_CONFIG['token_max_age']
                create = (now - ts) > AUTH_TOKEN_CONFIG['token_new_age']

        
        if delete or create or not user:
            if delete or create:
                # Delete token from db.
                User.delete_auth_token(user_id, token)
                logging.debug('auth tooken deleted %s', token)

                if delete:
                    user = None

            token = None

        return user, token
        
        '''
