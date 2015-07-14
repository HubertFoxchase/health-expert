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

from api2_messages import OutcomeRequestMessage
import infermedica_api
import informedica_api_old
from string import lower

WEB_CLIENT_ID = '817202020074-1b97ag04r8rhfj6r40bocobupn92g5bj.apps.googleusercontent.com'
ANDROID_CLIENT_ID = 'replace this with your Android client ID'
IOS_CLIENT_ID = 'replace this with your iOS client ID'
OTHER_CLIENT_ID = '817202020074-utvardicvh3oaqhf2tqagqnrmk52cv2p.apps.googleusercontent.com'
ANDROID_AUDIENCE = WEB_CLIENT_ID

APP_ID = "b2bc2e86"
APP_KEY = "92d49a8b4302920c299e038041049741"

RAISE_UNAUTHORISED = False


c4c_api = endpoints.api(name='c4c', 
               version='v1',
               allowed_client_ids=[WEB_CLIENT_ID,
                                   OTHER_CLIENT_ID, 
                                   endpoints.API_EXPLORER_CLIENT_ID],
               audiences=[ANDROID_AUDIENCE],
               scopes=[endpoints.EMAIL_SCOPE])


@c4c_api.api_class(resource_name='organisation')
class AdminApi(remote.Service):
   
    @Organisation.method(request_fields=('name',),
                    response_fields=('id', 'name', 'created',),
                    path='organisation', 
                    http_method='POST',
                    name='insert')   
    def OrganisationInsert(self, model):
        _isAdminUser()
        model.put()
        return model

    @Organisation.method(request_fields=('name',),
                    path='organisation/{id}', 
                    http_method='POST',
                    name='update')   
    def OrganisationUpdate(self, model):
        _isAdminUser()
        model.put()
        if not model.from_datastore:
            raise endpoints.NotFoundException('Organisation not found.')        
        return model

    @Organisation.query_method(path='organisation', 
                      http_method='GET',
                      name='list')   
    def OrganisationList(self, query):
        _isAdminUser()
        return query

    @Organisation.method(path='organisation/{id}', 
                      http_method='GET',
                      name='get')   
    def OrganisationGet(self, model):
        
        if not model.from_datastore:
            raise endpoints.NotFoundException('Organisation not found.')
        return model        


@c4c_api.api_class(resource_name='user')
class UserApi(remote.Service):
    
    @User.method(request_fields=('name', 'organisation'),
                    response_fields=('id','email', 'name', 'created', 'organisation'),
                    path='user', 
                    http_method='POST',
                    name='insert')   
    def UserInsert(self, model):
        _isAdminUser()

        current_user = endpoints.get_current_user()
        
        if current_user is None:
            raise endpoints.UnauthorizedException('Invalid token.')
        
        model.email = current_user.email().lower()
        
        model.put()
        return model
    
    @User.method(request_fields=('name', 'type', 'email'),
                      path='user/{id}', 
                      http_method='POST',
                      name='update')   
    def UserUpdate(self, model):
        _isAdminUser()
        model.put()        
        if not model.from_datastore:
            raise endpoints.NotFoundException('User not found.')
        return model       

    @User.query_method(path='user', 
                      http_method='GET',
                      name='list')   
    def UserList(self, query):
        _isAdminUser()
        return query


@c4c_api.api_class(resource_name='patient')
class PatientApi(remote.Service):
   
    @Patient.method(request_fields=('ref','organisation', 'age', 'gender'),
                    response_fields=('id', 'ref', 'organisation', 'age', 'gender'),
                    path='patient', 
                    http_method='POST',
                    name='insert')   
    def PatientInsert(self, model):
        _isValidUser()
        
        model.put()
        return model

    @Patient.query_method(path='patients', 
                      http_method='GET',
                      name='list')   
    def PatientList(self, query):
        _isValidUser()
        return query

    @Patient.method(path='patient/{id}', 
                      http_method='GET',
                      name='get')   
    def PatientGet(self, model):
        _isValidUser()
        
        if not model.from_datastore:
            raise endpoints.NotFoundException('Patient not found.')
        return model        

    @Patient.method(request_fields=('ref', 'organisation', 'age', 'gender'),
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
        model.key.delete()
        if not model.from_datastore:
            raise endpoints.NotFoundException('Patient not found.')
        return model        

    @Patient.query_method(path='patients/deleteAll', 
                      http_method='GET',
                      name='deleteAll')   
    def PatientDeleteAll(self, query):
        _isValidUser()
        
        ndb.delete_multi(query.iter(keys_only=True))
        return query         

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
        session = Session(patient = patient, symptoms = Symptoms())
        
        inf_api = infermedica_api.API(app_id=APP_ID, app_key=APP_KEY)
        r = infermedica_api.Diagnosis(sex=patient.gender, age=patient.age)

        if request.present is not None :
            
            for sp in request.present :

                observation = inf_api.observation_details(sp)
                
                if observation is not None :
                    symptom = Symptom(id=sp, name=observation.name, value='present')
                    session.symptoms.items.append(symptom)

        logging.debug(session.symptoms.items)

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
        
        session.put()
        return session.ToMessage()

    @Session.query_method(path='sessions/list', 
                      http_method='GET',
                      name='list')   
    def SessionList(self, query):
        _isValidUser()
        return query.filter(Session.state.IN([int(SessionState.IN_PROGRESS), int(SessionState.ENDED), int(SessionState.REVIEWED)])).order(-Session.created, Session.key)

    @Session.query_method(path='sessions/listAll', 
                      http_method='GET',
                      name='listAll',
                      limit_default = 99)   
    def SessionListAll(self, query):
        _isValidUser()
        return query.order(-Session.created)

    
    @Session.query_method(path='sessions/listActive', 
                      http_method='GET',
                      name='listActive',
                      limit_default = 99)   
    def SessionListActive(self, query):
        #return query.filter(Session.state == int(SessionState.ACTIVE))
        
        _isValidUser()
        
        date = datetime.datetime.today()
        
        return query.filter(ndb.AND(Session.created > date - datetime.timedelta(hours=1), 
                                    Session.state.IN([int(SessionState.IN_PROGRESS), int(SessionState.ENDED)]))).order(Session.state, -Session.created, Session.key)

    @Session.method(path='session/{id}', 
                      http_method='GET',
                      name='get')   
    def SessionGet(self, model):
        
        _isValidUser()
        if not model.from_datastore:
            raise endpoints.NotFoundException('Session not found.')
        return model        

    @Session.method(request_fields=('id',),
                    path='session/end/{id}', 
                      http_method='POST',
                      name='end')   
    def SessionEnd(self, model):
        _isValidUser()
        model.state = int(SessionState.ENDED)
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
        model.key.delete()
        if not model.from_datastore:
            raise endpoints.NotFoundException('Session not found.')
        return model        

    @Session.method(path='session/markDeleted/{id}', 
                      http_method='GET',
                      name='markDeleted')   
    def SessionMarkDeleted(self, model):
        _isValidUser()
        model.state = int(SessionState.DELETED)
        model.put()        
        if not model.from_datastore:
            raise endpoints.NotFoundException('Session not found.')
        return model  

    @Session.query_method(path='sessions/deleteAll', 
                      http_method='GET',
                      name='deleteAll')   
    def SessionDeleteAll(self, query):
        _isValidUser()
        
        ndb.delete_multi(query.iter(keys_only=True))
        return query 

    @Session.method(path='session/markReviewed/{id}', 
                      http_method='GET',
                      name='markReviewed')   
    def SessionMarkReviewed(self, model):
        _isValidUser()
        model.state = int(SessionState.REVIEWED)
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


def _lookupName(lookupId, lookupList):
    for item in lookupList :
        if lookupId == item.id :
            return item.name
    else :
        return ''

def _isValidUser():
    
    if RAISE_UNAUTHORISED:
    
        current_user = endpoints.get_current_user()
        
        if current_user is None:
            raise endpoints.UnauthorizedException('Invalid token.')
        else :
            user = User.query(User.email == current_user.email().lower()).get()
            
            if user is None:
                raise endpoints.UnauthorizedException('Not authorised')

    else:
        return True

def _isAdminUser():
    
    if RAISE_UNAUTHORISED:
    
        current_user = endpoints.get_current_user()
        
        if current_user is None:
            raise endpoints.UnauthorizedException('Invalid token.')
        else :
            user = User.query(ndb.AND(User.email == current_user.email().lower(), User.type == int(UserRole.ADMIN))).get()
            
            if user is None:
                raise endpoints.UnauthorizedException('Not authorised')

    else:
        return True


app = endpoints.api_server([c4c_api], restricted=False)    
