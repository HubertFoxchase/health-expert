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

import bigml.api
from bigml.api import BigML
from bigml.model import Model
from bigml.fields import Fields
from api2_messages import OutcomeRequestMessage
from bigml.tree import PROPORTIONAL
import bigml_model


WEB_CLIENT_ID = '817202020074-1b97ag04r8rhfj6r40bocobupn92g5bj.apps.googleusercontent.com'
ANDROID_CLIENT_ID = 'replace this with your Android client ID'
IOS_CLIENT_ID = 'replace this with your iOS client ID'
OTHER_CLIENT_ID = '817202020074-utvardicvh3oaqhf2tqagqnrmk52cv2p.apps.googleusercontent.com'
ANDROID_AUDIENCE = WEB_CLIENT_ID

BIGML_USERNAME = "michaellisovski"
BIGML_API_KEY = "b9065b0309020eb71b1a5bca99dc8cabcaabc9f9"

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
        model.put()
        return model

    @Organisation.method(request_fields=('name',),
                    path='organisation/{id}', 
                    http_method='POST',
                    name='update')   
    def OrganisationUpdate(self, model):
        model.put()
        if not model.from_datastore:
            raise endpoints.NotFoundException('Organisation not found.')        
        return model

    @Organisation.query_method(path='organisation', 
                      http_method='GET',
                      name='list')   
    def OrganisationList(self, query):
        return query

    @Organisation.method(path='organisation/{id}', 
                      http_method='GET',
                      name='get')   
    def OrganisationGet(self, model):
        
        if not model.from_datastore:
            raise endpoints.NotFoundException('Organisation not found.')
        return model        


@c4c_api.api_class(resource_name='patient')
class PatientApi(remote.Service):
   
    @Patient.method(request_fields=('ref','organisation',),
                    response_fields=('id', 'ref', 'organisation',),
                    path='patient', 
                    http_method='POST',
                    name='insert')   
    def PatientInsert(self, model):

        model.put()
        return model

    @Patient.query_method(path='patients', 
                      http_method='GET',
                      name='list')   
    def PatientList(self, query):
        return query

    @Patient.method(path='patient/{id}', 
                      http_method='GET',
                      name='get')   
    def PatientGet(self, model):
        
        if not model.from_datastore:
            raise endpoints.NotFoundException('Patient not found.')
        return model        

    @Patient.method(request_fields=('ref', 'organisation'),
                      path='patient/{id}', 
                      http_method='POST',
                      name='update')   
    def PatientUpdate(self, model):
        model.put()        
        if not model.from_datastore:
            raise endpoints.NotFoundException('Patient not found.')
        return model        


    @Patient.method(path='patient/{id}', 
                      http_method='DELETE',
                      name='delete')   
    def PatientDelete(self, model):
        model.key.delete()
        if not model.from_datastore:
            raise endpoints.NotFoundException('Patient not found.')
        return model        

    @Patient.query_method(path='patients/deleteAll', 
                      http_method='GET',
                      name='deleteAll')   
    def PatientDeleteAll(self, query):
        
        ndb.delete_multi(query.iter(keys_only=True))
        return query         

@c4c_api.api_class(resource_name='session')
class SessionApi(remote.Service):
   
    @Session.method(request_fields=('patient',),
                    response_fields=('id', 'created', 'state', 'patient', 'next'),
                    path='session', 
                    http_method='POST',
                    name='insert')   
    def SessionInsert(self, model):
        
        bm = bigml_model.get_model()
        bml = bigml_model.get_local_model()
        
        field_id = bm['object']['model']['root']['children'][0]['predicate']['field']
        field = bml.fields[field_id]

        if 'label' in field :
            label = field['label']
        else :
            label = field['name']

        if 'description' in field :
            description = field['description']
        else :
            description = ''

        if 'categories' in field['summary'] :
            
            cat = []
            for c in field['summary']['categories'] :
                cat.append(c[0])
            
            model.next = Question(label=label, description=description, type=field['optype'], categories=cat)
        else:
            model.next = Question(label=label, description=description, type=field['optype'])
        
        model.put()
        return model

    @Session.query_method(path='list_sessions', 
                      http_method='GET',
                      name='list')   
    def SessionList(self, query):
        return query

    @Session.query_method(path='active_sessions', 
                      http_method='GET',
                      name='listActive')   
    def SessionListActive(self, query):
        return query.filter(Session.state == int(SessionState.ACTIVE))


    @Session.method(path='get_session/{id}', 
                      http_method='GET',
                      name='get')   
    def SessionGet(self, model):
        
        if not model.from_datastore:
            raise endpoints.NotFoundException('Session not found.')
        return model        

    @Session.method(path='end_session/{id}', 
                      http_method='POST',
                      name='end')   
    def SessionEnd(self, model):
        model.state = int(SessionState.ENDED)
        model.ended = datetime.datetime.now()
        model.put()        
        if not model.from_datastore:
            raise endpoints.NotFoundException('Session not found.')
        return model        


    @Session.method(path='delete_session/{id}', 
                      http_method='GET',
                      name='delete')   
    def SessionDelete(self, model):
        model.key.delete()
        if not model.from_datastore:
            raise endpoints.NotFoundException('Session not found.')
        return model        

    @Session.query_method(path='delete_all_sessions', 
                      http_method='GET',
                      name='deleteAll')   
    def SessionDeleteAll(self, query):
        
        ndb.delete_multi(query.iter(keys_only=True))
        return query 

    @Session.method(request_fields=('id', 'name', 'value'),
                    path='insert_symptom', 
                      http_method='POST',
                      name='insertSymptom')
    def SymptomInsert(self, model):

        session = model.key.get()

        if session is None:
            raise endpoints.NotFoundException('Session not found.')             

        for s in session.symptoms :
            if s.name == model.name :
                s.value = model.value
                break
        else :
            symptom = Symptom(name=model.name, value=model.value)
            session.symptoms.append(symptom)

        logging.debug('starting prediction')        

        p = {}
        
        for symptom in session.symptoms:
            p[symptom.name] = symptom.value
                    
        bigml_local_model = bigml_model.get_local_model()
        
        prediction = bigml_local_model.predict(p, add_confidence=True, add_path=True, add_distribution=True, add_count=True, add_next=True)
        
        if prediction['next'] is not None :
            logging.debug('got fields %s' % bigml_local_model.fields)

            fields = Fields(bigml_local_model.fields)
            field_id = fields.field_id(prediction['next'])
            field = bigml_local_model.fields[field_id]

            if 'label' in field :
                label = field['label']
            else :
                label = field['name']

            if 'description' in field :
                description = field['description']
            else :
                description = ''

            if 'categories' in field['summary'] :
                
                cat = []
                for c in field['summary']['categories'] :
                    cat.append(c[0])
                
                session.next = Question(label=label, description=description, type=field['optype'], categories=cat)
            else:
                session.next = Question(label=label, description=description, type=field['optype'])

        else :
            session.next = None
            
        session.outcome = Outcome(name=prediction['prediction'], confidence=str(prediction['confidence']))        
        session.put()
        
        return session

    @endpoints.method(api2_messages.OutcomeRequestMessage, 
                      message_types.VoidMessage,
                      path='insert_outcome', 
                      http_method='POST',
                      name='insertOutcome')
    def OutcomeInsert(self, request): 

        Session.add_outcome(request)
        return message_types.VoidMessage()



app = endpoints.api_server([c4c_api], restricted=False)    
