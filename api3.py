'''
Created on 5 Mar 2015

@author: Michael Lisovski
'''

import endpoints
import datetime
import api2_messages
import logging
from protorpc import messages
from google.appengine.ext import ndb
from google.appengine.api import memcache
from protorpc import remote, message_types
from protorpc import message_types
from api2_models import *

import infermedica_api
import string
import random
import os

import webapp2
import webapp2_extras
from webapp2_extras import auth
from webapp2_extras import sessions
from webapp2_extras import securecookie
from webapp2_extras.sessions import SessionDict

import Cookie



WEB_CLIENT_ID = '817202020074-1b97ag04r8rhfj6r40bocobupn92g5bj.apps.googleusercontent.com'
ANDROID_CLIENT_ID = 'replace this with your Android client ID'
IOS_CLIENT_ID = 'replace this with your iOS client ID'
OTHER_CLIENT_ID = '817202020074-utvardicvh3oaqhf2tqagqnrmk52cv2p.apps.googleusercontent.com'
ANDROID_AUDIENCE = WEB_CLIENT_ID

APP_ID = "b2bc2e86"
APP_KEY = "92d49a8b4302920c299e038041049741"

RAISE_UNAUTHORISED = True

TOKEN_CONFIG = {
    'token_max_age': 86400 * 7 * 3,
    'token_new_age': 86400,
    'token_cache_age': 3600,
}

SESSION_ATTRIBUTES = ['user_id', 'remember', 'token', 'token_ts', 'cache_ts', 'email', 'type']

SESSION_SECRET_KEY = 'YOUR_SECRET_KEY'

c4c_api = endpoints.api(name='c4c', 
               version='v1',
               allowed_client_ids=[WEB_CLIENT_ID,
                                   OTHER_CLIENT_ID, 
                                   endpoints.API_EXPLORER_CLIENT_ID],
               audiences=[ANDROID_AUDIENCE],
               scopes=[endpoints.EMAIL_SCOPE],
               auth=endpoints.api_config.ApiAuth(allow_cookie_auth=True))


@c4c_api.api_class(resource_name='organisation')
class AdminApi(remote.Service):

    @Organisation.method(request_fields=('name',),
                    response_fields=('id', 'name', 'created',),
                    path='organisation', 
                    http_method='POST',
                    name='insert')   
    def OrganisationInsert(self, model):
        _isAdminUser()
        model.apikey = _idDenerator()
        model.put()
        return model

    @Organisation.method(request_fields=('name', 'active'),
                    path='organisation/{id}', 
                    http_method='POST',
                    name='update')   
    def OrganisationUpdate(self, model):
        _isAdminUser()
        model.put()
        if not model.from_datastore:
            raise endpoints.NotFoundException('Organisation not found.')        
        return model

    @Organisation.query_method(path='organisations', 
                      http_method='GET',
                      name='list')   
    def OrganisationList(self, query):
        _isAdminUser()
        
        return query.filter(Organisation.active == True)

    @Organisation.method(path='organisation/{id}', 
                      http_method='GET',
                      name='get')   
    def OrganisationGet(self, model):
        _isValidUser()
        
        if not model.from_datastore:
            raise endpoints.NotFoundException('Organisation not found.')
        return model        


@c4c_api.api_class(resource_name='user')
class UserApi(remote.Service):
    
    @User.method(response_fields=('id','email', 'name', 'role', 'created', 'updated', 'organisation', 'active'),
                 path='user/{id}', 
                 http_method='GET',
                 name='get')   
    def UserGet(self, model):
        _isValidUser()
        
        if not model.from_datastore:
            raise endpoints.NotFoundException('User not found.')
        return model     

    @User.query_method(query_fields=('email',),
                       collection_fields=('id','email', 'name', 'role', 'created', 'updated', 'organisation'),
                       path='user', 
                       http_method='GET',
                       name='getByEmail',
                       limit_default=1)   
    def UserGetByEmail(self, query):
        _isValidUser()
        
        return query.filter(User.active == True) 
    
    @User.method(request_fields=('name', 'email', 'role', 'organisation_id'),
                 response_fields=('id','email', 'name', 'role', 'created', 'organisation'),
                 path='user', 
                 http_method='POST',
                 name='insert')   
    def UserInsert(self, model):
        _isAdminUser()

        #current_user = endpoints.get_current_user()
        
        #if current_user is None:
        #    raise endpoints.UnauthorizedException('Invalid token.')
        
        model.email = model.email.lower()
        model.type = int(UserType.NORMAL)
        model.put()
        return model
    
    @User.method(request_fields=('name', 'role', 'email', 'active'),
                      path='user/{id}', 
                      http_method='POST',
                      name='update')   
    def UserUpdate(self, model):
        _isAdminUser()
        
        model.email = model.email.lower()        
        model.put()        
        if not model.from_datastore:
            raise endpoints.NotFoundException('User not found.')
        return model       

    @User.query_method(query_fields=('organisation_id',),
                       collection_fields=('id','email', 'name', 'role', 'created', 'organisation', 'active'),
                       path='users', 
                       http_method='GET',
                       name='list')   
    def UserList(self, query):
        _isValidUser()
        return query


@c4c_api.api_class(resource_name='patient')
class PatientApi(remote.Service):
   
    @Patient.method(request_fields=('ref', 'age', 'gender', 'organisation_id', ),
                    response_fields=('id', 'ref', 'age', 'gender', 'organisation', ),
                    path='patient', 
                    http_method='POST',
                    name='insert')   
    def PatientInsert(self, model):
        _isValidUser()
        
        model.put()
        return model

    @Patient.query_method(query_fields=('organisation_id',),
                          collection_fields=('id', 'ref', 'age', 'gender', 'organisation', 'created', 'active'),
                          path='patients', 
                          http_method='GET',
                          name='list')   
    def PatientList(self, query):
        _isValidUser()
        
        return query.filter(Patient.active == True)

    @Patient.method(path='patient/{id}', 
                    response_fields=('id', 'ref', 'age', 'gender', 'organisation', ),
                    http_method='GET',
                    name='get')   
    def PatientGet(self, model):
        _isValidUser()
        
        if not model.from_datastore:
            raise endpoints.NotFoundException('Patient not found.')
        return model        

    @Patient.method(request_fields=('ref', 'age', 'gender'),
                    response_fields=('id', 'ref', 'age', 'gender', 'organisation', ),
                    path='patient/{id}', 
                    http_method='POST',
                    name='update')   
    def PatientUpdate(self, model):
        _isValidUser()
        model.put()        
        if not model.from_datastore:
            raise endpoints.NotFoundException('Patient not found.')
        return model        

    @Patient.method(path='patient/{id}', 
                    http_method='DELETE',
                    name='delete')   
    def PatientDelete(self, model):
        _isValidUser()
        
        model.active = False
        model.put_async()
        
        query = Session.query(Session.patient_ref == model.key)
        
        @ndb.tasklet
        def callback(msg):
            msg.active = False
            session = yield msg.put_async()
            raise ndb.Return(session)
        
        outputs = query.map(callback)        

        if not model.from_datastore:
            raise endpoints.NotFoundException('Patient not found.')
        return model        

    @endpoints.method(api2_messages.IdListMessage,
                      message_types.VoidMessage,
                      path='patients/deleteByIdList', 
                      http_method='GET',
                      name='deleteByIdList')   
    def PatientDeleteByIds(self, request):
        _isValidUser()
        
        ids = [ndb.Key(Patient, patient_id) for patient_id in request.ids]

        patients = ndb.get_multi(ids)

        for p in patients :
            p.active = False
        
        ndb.put_multi(patients)
        
        query = Session.query(Session.patient_ref.IN(ids))
        
        @ndb.tasklet
        def callback(msg):
            msg.active = False
            session = yield msg.put_async()
            raise ndb.Return(session)
        
        outputs = query.map(callback)         
        
        return message_types.VoidMessage()         

@c4c_api.api_class(resource_name='session')
class SessionApi(remote.Service):
   
    @endpoints.method(api2_messages.SessionNewRequestInsertMessage,
                      Session.ProtoModel(),
                      path='new_session', 
                      http_method='POST',
                      name='new')   
    def SessionInsert(self, request):
        
        _isValidUser()

        patient = ndb.Key(Patient, request.patient).get()
        session = Session(patient = patient, patient_ref = patient.key, organisation_ref = patient.organisation_ref, symptoms = Symptoms())
        
        inf_api = infermedica_api.API(app_id=APP_ID, app_key=APP_KEY)
        r = infermedica_api.Diagnosis(sex=patient.gender, age=patient.age)

        if request.present is not None :
            
            for sp in request.present :

                observation = inf_api.observation_details(sp)
                
                if observation is not None :
                    symptom = Symptom(id=sp, name=observation.name, value='present')
                    session.symptoms.items.append(symptom)

        for symptom in session.symptoms.items:
            r.add_observation(symptom.id, symptom.value)
        
        # call diagnosis
        r = inf_api.diagnosis(r)      

        label = r.question.text
        description = label
        type = r.question.type
        
        cat = []
        for c in r.question.items :
            cat.append(Symptom(id=c['id'], name=c['name'], value=''))
        
        session.next = Question(label=label, description=description, type=type, symptoms=cat)
        session.status = int(SessionState.IN_PROGRESS) 
        
        session.put()
        return session.ToMessage()

    @Session.query_method(query_fields=('organisation_id',),
                          collection_fields =('id', 'created', 'ended', 'updated', 'status', 'outcome', 'patient'),
                          path='sessions/list', 
                          http_method='GET',
                          name='list')   
    def SessionList(self, query):
        _isValidUser()
        
        return query.filter(Session.active == True).order(-Session.created, Session.key)
    
    @Session.query_method(query_fields=('organisation_id',),
                          collection_fields =('id', 'created', 'ended', 'updated', 'status', 'outcome', 'patient'),
                          path='sessions/listActive', 
                          http_method='GET',
                          name='listActive',
                          limit_default = 99)   
    def SessionListActive(self, query):
        _isValidUser()
        
        date = datetime.datetime.today()
        return query.filter(ndb.AND(Session.status.IN([int(SessionState.IN_PROGRESS), int(SessionState.ENDED)]),
                                    Session.created > date - datetime.timedelta(hours=1), 
                                    Session.active == True)).order(Session.status, -Session.created, Session.key)

    @Session.method(path='session/{id}', 
                      http_method='GET',
                      name='get')   
    def SessionGet(self, model):
        _isValidUser()
        
        if not model.from_datastore:
            raise endpoints.NotFoundException('Session not found.')
        return model        

    @Session.method(path='session/end/{id}', 
                      http_method='GET',
                      name='end')   
    def SessionEnd(self, model):
        _isValidUser()
        
        model.status = int(SessionState.ENDED)
        model.ended = datetime.datetime.now()
        
        model.put()
                
        if not model.from_datastore:
            raise endpoints.NotFoundException('Session not found.')
        return model        

    @Session.method(path='session/delete/{id}', 
                      http_method='GET',
                      name='delete')   
    def SessionDelete(self, model):
        _isValidUser()
        
        model.active = False
        model.put()        

        if not model.from_datastore:
            raise endpoints.NotFoundException('Session not found.')
        return model  


    @endpoints.method(api2_messages.IdListMessage,
                      message_types.VoidMessage,
                      path='sessions/deleteByIdList', 
                      http_method='GET',
                      name='deleteByIdList')   
    def SessionDeleteByIdList(self, request):
        _isValidUser()
        
        ids = [ndb.Key(Session, session_id) for session_id in request.ids]

        session = ndb.get_multi(ids)
        
        logging.debug(session)

        for s in session :
            s.active = False

        logging.debug(session)
        
        ndb.put_multi(session)
        
        return message_types.VoidMessage() 

    @Session.method(path='session/markReviewed/{id}', 
                    http_method='GET',
                    name='markReviewed')   
    def SessionMarkReviewed(self, model):
        _isValidUser()
        
        model.status = int(SessionState.REVIEWED)
        model.put()        
        
        if not model.from_datastore:
            raise endpoints.NotFoundException('Session not found.')
        return model  

    @endpoints.method(api2_messages.SymptomMultiRequestMessage, 
                      Session.ProtoModel(),
                      path='session/insertMultipleSymptoms', 
                      http_method='POST',
                      name='insertMultipleSymptoms')
    def SymptomsInsertMulti(self, request):
        _isValidUser()

        session = ndb.Key(Session, request.session).get()
        patient = session.patient

        if session is None:
            raise endpoints.NotFoundException('Session not found.')             

        if session.symptoms is None :
            session.symptoms = Symptoms()

        if request.present is not None :
            
            for sp in request.present :
                for s in session.symptoms.items :
                    if s.id == sp :
                        s.value = 'present'
                        break
                else :
                    symptom = Symptom(id=sp, name=_lookupName(sp, session.next.symptoms), value='present')
                    session.symptoms.items.append(symptom)

        if request.absent is not None : 
        
            for sp in request.absent :
                for s in session.symptoms.items :
                    if s.id == sp :
                        s.value = 'absent'
                        break
                else :
                    symptom = Symptom(id=sp, name=_lookupName(sp, session.next.symptoms), value='absent')
                    session.symptoms.items.append(symptom)            

        logging.debug('starting prediction')        
        
        inf_api = infermedica_api.API(app_id=APP_ID, app_key=APP_KEY)
        r = infermedica_api.Diagnosis(sex=patient.gender, age=patient.age)

        for symptom in session.symptoms.items:
            r.add_observation(symptom.id, symptom.value)
        
        r = inf_api.diagnosis(r)      

        logging.debug(r)

        label = r.question.text
        description = label
        type = r.question.type
        
        cat = []
        for c in r.question.items :
            cat.append(Symptom(id=c['id'], name=c['name'], value=''))
        
        session.next = Question(label=label, description=description, type=type, symptoms=cat)

        session.outcome = Outcome(id=r.conditions[0]['id'], 
                                  name=r.conditions[0]['name'], 
                                  probability=float(r.conditions[0]['probability']), 
                                  full=r.conditions[:3] )        
        session.put()
        
        return session.ToMessage()


    @endpoints.method(api2_messages.OutcomeRequestMessage, 
                      Session.ProtoModel(),
                      path='session/insertOutcome', 
                      http_method='POST',
                      name='insertOutcome')
    def OutcomeInsert(self, request): 
        _isValidUser()

        session = Session.add_outcome(request)
        return session.ToMessage()

    #Admin methods

    @Session.method(path='session/erase/{id}', 
                      http_method='GET',
                      name='erase')   
    def SessionErase(self, model):
        _isAdminUser()
        
        model.key.delete()
        if not model.from_datastore:
            raise endpoints.NotFoundException('Session not found.')
        return model        


    @Session.query_method(path='sessions/eraseAll', 
                          http_method='GET',
                          name='eraseAll')   
    def SessionEraseAll(self, query):
        _isAdminUser()
        
        ndb.delete_multi(query.iter(keys_only=True))
        return query 

class MyAuth():
    
    user = None
    token = None
    userType = None
    email = None
    organisation_ref = None
    

    @classmethod
    def get_user_from_cookie(cls):
        
        serializer = securecookie.SecureCookieSerializer(SESSION_SECRET_KEY)
        
        cookie_string = os.environ.get('HTTP_COOKIE')
        cookie = Cookie.SimpleCookie()
        cookie.load(cookie_string)
        
        session_name = cookie['auth'].value
        session_name_data = serializer.deserialize('auth', session_name)
        session_dict = SessionDict(cls, data=session_name_data, new=False)
        
        logging.debug(session_dict)

        if session_dict:
            session_final = dict(zip(SESSION_ATTRIBUTES, session_dict.get('_user')))
            _user, _token = cls.validate_token(session_final.get('user_id'), 
                                               session_final.get('token'),
                                               token_ts=session_final.get('token_ts'))
            cls.user = _user
            cls.token = _token
            cls.userType = session_final.get('type')
            cls.email = session_final.get('email')
            
            logging.debug(_token)

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
        delete = token_ts and ((now - token_ts) > TOKEN_CONFIG['token_max_age'])
        create = False

        if not delete:
            # Try to fetch the user.
            user, ts = cls.get_user_by_auth_token(user_id, token)
            if user:
                # Now validate the real timestamp.
                delete = (now - ts) > TOKEN_CONFIG['token_max_age']
                create = (now - ts) > TOKEN_CONFIG['token_new_age']

        if delete or create or not user:
            if delete or create:
                # Delete token from db.
                User.delete_auth_token(user_id, token)

                if delete:
                    user = None

            token = None

        return user, token


def _lookupName(lookupId, lookupList):
    for item in lookupList :
        if lookupId == item.id :
            return item.name
    else :
        return ''

def _isValidUser():
    
    if RAISE_UNAUTHORISED:
        
        a = MyAuth()
        a.get_user_from_cookie()
        
        if not a.user :
            raise endpoints.UnauthorizedException('Not authorised')
        elif not a.token :
            raise endpoints.UnauthorizedException('Invalid or expired token.')
        
'''    
        current_user = endpoints.get_current_user()
        
        if current_user is None:
            raise endpoints.UnauthorizedException('Invalid token.')
        else :
            user = User.query(User.email == current_user.email().lower()).get()
            
            if user is None:
                raise endpoints.UnauthorizedException('Not authorised')
'''

        

def _isAdminUser():
    
    if RAISE_UNAUTHORISED:
        
        a = MyAuth()
        a.get_user_from_cookie()
        
        logging.debug(a.user)
        logging.debug(a.email)
        logging.debug(a.userType)
        
        if not a.user :
            raise endpoints.UnauthorizedException('Not authorised')
        elif not a.token :
            raise endpoints.UnauthorizedException('Invalid or expired token.')
        elif int(a.userType) != int(UserType.ADMIN) :
            raise endpoints.UnauthorizedException('Access denied')       

'''
        current_user = endpoints.get_current_user()
        
        if current_user is None:
            raise endpoints.UnauthorizedException('Invalid token.')
        else :
            user = User.query(ndb.AND(User.email == current_user.email().lower(), User.type == int(UserType.ADMIN))).get()
            
            if user is None:
                raise endpoints.UnauthorizedException('Not authorised')
'''


def _idDenerator(size=10, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))


app = endpoints.api_server([c4c_api], restricted=False)    
