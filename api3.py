'''
Created on 5 Mar 2015

@author: Michael Lisovski
'''


import api3_messages
import logging
from protorpc import remote
from protorpc import message_types
from api3_models import *

import infermedica_api
import string
import random

from myauth import MyAuth


WEB_CLIENT_ID = '817202020074-1b97ag04r8rhfj6r40bocobupn92g5bj.apps.googleusercontent.com'
ANDROID_CLIENT_ID = 'replace this with your Android client ID'
IOS_CLIENT_ID = 'replace this with your iOS client ID'
OTHER_CLIENT_ID = '817202020074-utvardicvh3oaqhf2tqagqnrmk52cv2p.apps.googleusercontent.com'
ANDROID_AUDIENCE = WEB_CLIENT_ID

APP_ID = "b2bc2e86"
APP_KEY = "92d49a8b4302920c299e038041049741"

RAISE_UNAUTHORISED = True

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

    @Organisation.method(request_fields=('name', 'settings'),
                    response_fields=('id', 'name', 'created',),
                    path='organisation', 
                    http_method='POST',
                    name='insert')   
    def OrganisationInsert(self, model):
        _isAdminUser()
        model.apikey = _idDenerator()
        model.put()
        return model

    @Organisation.method(request_fields=('name', 'settings', 'active'),
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


    @endpoints.method(message_types.VoidMessage,
                      User.ProtoModel(),
                      path='me', 
                      http_method='GET',
                      name='me')   
    def UserGetMe(self, request):
        _u = _isValidUser()
        
        _user = User.get_by_id(_u['user_id'])

        return _user.ToMessage()
    
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
    
    @User.method(request_fields=('name', 'email', 'role', 'type', 'organisation_id', 'password', ),
                 response_fields=('id','email', 'name', 'role', 'created', 'organisation'),
                 path='user', 
                 http_method='POST',
                 name='insert')   
    def UserInsert(self, model):
        _isAdminUser()

        model.email = model.email.lower()
        model.auth_ids = [model.email] 
        model.password = security.generate_password_hash(model.password, length=12)        
        model.verified = True
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
                       collection_fields=('id','email', 'name', 'role', 'verified'),
                       path='users/list', 
                       http_method='GET',
                       name='list',
                       use_projection=True)   
    def UserList(self, query):
        _isValidUser()
        return query.filter(User.active == True).order(User._key)

    @User.query_method(query_fields=('organisation_id',),
                       collection_fields=('id','email', 'name', 'role'),
                       path='users/listInvited', 
                       http_method='GET',
                       name='listInvited',
                       use_projection=True)   
    def UserListInvited(self, query):
        _isValidUser()
        return query.filter(User.verified == False).order(User._key)
                                           

    @User.method(path='user/{id}', 
                    http_method='DELETE',
                    name='delete')   
    def UserDelete(self, model):
        u = _isOrganisationAdminUser()

        if not model.from_datastore:
            raise endpoints.NotFoundException('User not found.')
        
        if model.organisation_id != int(u['organisation_id']):
            raise endpoints.ForbiddenException('Not authorised')            
        
        model.active = False
        model.put_async()
        
        return model        

    @endpoints.method(api3_messages.IdListMessage,
                      message_types.VoidMessage,
                      path='users/deleteByIdList', 
                      http_method='GET',
                      name='deleteByIdList')   
    def UsersDeleteByIds(self, request):
        u = _isOrganisationAdminUser()
        
        ids = [ndb.Key(User, user_id) for user_id in request.ids]

        users = ndb.get_multi(ids)

        delete_list = []
        update_list = []
        
        for p in users :
            
            if p is not None and p.organisation_id == int(u['organisation_id']):
                if p.verified :
                    p.active = False
                    update_list.append(p)
                else :
                    delete_list.append(p.key)
                    
        ndb.put_multi(update_list)
        ndb.delete_multi(delete_list)
        
        return message_types.VoidMessage()   

@c4c_api.api_class(resource_name='patient')
class PatientApi(remote.Service):
   
    @Patient.method(request_fields=('ref', 'age', 'dob', 'gender', 'organisation_id', ),
                    response_fields=('id', 'ref', 'age', 'gender', 'organisation_id', ),
                    path='patient', 
                    http_method='POST',
                    name='insert')   
    def PatientInsert(self, model):
        u = _isValidUser()
        
        if model.organisation_id != int(u['organisation_id']):
            raise endpoints.ForbiddenException('Not authorised')  
        
        if model.dob is not None :
            model.age = (datetime.datetime.today() - model.dob).days // 356
        
        model.put()
        return model

    @Patient.query_method(query_fields=('limit', 'order', 'pageToken'),
                          collection_fields=('id', 'ref', 'age', 'dob', 'gender'),
                          path='patients', 
                          http_method='GET',
                          name='list')   
    def PatientList(self, query):
        u = _isValidUser()
        
        organisation_ref = ndb.Key(Organisation, u['organisation_id'])
        
        return query.filter(Patient.active == True).filter(Patient.organisation_ref == organisation_ref)

    @Patient.method(path='patient/{id}', 
                    response_fields=('id', 'ref', 'age', 'dob', 'gender', 'organisation_id', ),
                    http_method='GET',
                    name='get')   
    def PatientGet(self, model):
        _isValidUser()
        
        if not model.from_datastore:
            raise endpoints.NotFoundException('Patient not found.')
        return model        

    @Patient.method(request_fields=('ref', 'age', 'dob', 'gender'),
                    response_fields=('id', 'ref', 'age', 'dob', 'gender', 'organisation_id', ),
                    path='patient/{id}', 
                    http_method='POST',
                    name='update')   
    def PatientUpdate(self, model):
        _isValidUser()
        
        if model.dob is not None :
            
            today = datetime.date.today()
            years = today.year - model.dob.year
            if today.month < model.dob.month or (today.month == model.dob.month and today.day < model.dob.day):
                years -= 1            
            
            model.age = years

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

    @endpoints.method(api3_messages.IdListMessage,
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
    

@c4c_api.api_class(resource_name='appointment')
class AppointmentApi(remote.Service):

    @Appointment.method(request_fields=('date', 'duration', 'patient_id', 'doctor_id'),
                    response_fields=('id', 'date', 'duration', 'patient', 'doctor'),
                    path='appointment', 
                    http_method='POST',
                    name='insert')   
    def AppointmentInsert(self, model):
        u = _isValidUser()
        
        model.organisation_ref = ndb.Key(Organisation, u['organisation_id'])
        
        model.put()
        return model

    @Appointment.query_method(query_fields=('patient_id',),
                          collection_fields=('id', 'date', 'duration', 'doctor'),
                          path='appointments/listByPatient', 
                          http_method='GET',
                          name='listByPatient')
    def AppointmentsListByPatient(self, query):
        _isValidUser()
        
        date = datetime.datetime.today()
        
        return query.filter(Appointment.active == True
                            ).filter(Appointment.date > date - datetime.timedelta(hours=2)
                                     ).order(Appointment.date)

    @Appointment.query_method(query_fields=('limit', 'order', 'pageToken'),
                          collection_fields=('id', 'date', 'duration', 'patient', 'doctor'),
                          path='appointments/list', 
                          http_method='GET',
                          name='list')   
    def AppointmentsList(self, query):
        u = _isValidUser()
        
        #TODO: check for valid organisation
        organisation_ref = ndb.Key(Organisation, u['organisation_id'])
        date = datetime.datetime.today()
        
        return query.filter(Appointment.active == True
                            ).filter(Appointment.date > date - datetime.timedelta(hours=2)
                                     ).filter(Appointment.organisation_ref == organisation_ref)

    @Appointment.query_method(query_fields=('query_date', 'limit', 'order', 'pageToken', ),
                          collection_fields=('id', 'date', 'duration', 'patient', 'doctor_id'),
                          path='appointments/listByDate', 
                          http_method='GET',
                          name='listByDate')   
    def AppointmentsListByDate(self, query):
        u = _isValidUser()
        
        #TODO: check for valid organisation
        organisation_ref = ndb.Key(Organisation, u['organisation_id'])
        
        return query.filter(Appointment.active == True
                            ).filter(Appointment.organisation_ref == organisation_ref)

    @Appointment.query_method(query_fields=('doctor_id', 'limit', 'order', 'pageToken'),
                          collection_fields=('id', 'date', 'duration', 'patient'),
                          path='appointments/listByDoctor', 
                          http_method='GET',
                          name='listByDoctor')   
    def AppointmentsListByDoctor(self, query):
        _isValidUser()
        
        
        date = datetime.datetime.today()
        
        return query.filter(Appointment.active == True
                            ).filter(Appointment.date > date - datetime.timedelta(hours=2))



    @Appointment.method(path='appointment/{id}', 
                    response_fields=('id', 'date', 'duration','patient', 'doctor', ),
                    http_method='GET',
                    name='get')   
    def AppointmentGet(self, model):
        _isValidUser()
        
        if not model.from_datastore:
            raise endpoints.NotFoundException('Appointment not found.')
        return model        

    @Appointment.method(request_fields=('date', 'duration', 'doctor_id'),
                    response_fields=('id', 'date', 'duration', 'patient', 'doctor', ),
                    path='appointment/{id}', 
                    http_method='POST',
                    name='update')   
    def AppointmentUpdate(self, model):
        _isValidUser()
        
        model.put()        

        if not model.from_datastore:
            raise endpoints.NotFoundException('Appointment not found.')
        return model        

    @Appointment.method(path='appointment/{id}', 
                    http_method='DELETE',
                    name='delete')   
    def AppointmentDelete(self, model):
        _isValidUser()
        
        model.active = False
        model.put()
        
        if not model.from_datastore:
            raise endpoints.NotFoundException('Appointment not found.')
        return model        
    
        

@c4c_api.api_class(resource_name='session')
class SessionApi(remote.Service):
   
    @endpoints.method(api3_messages.SessionNewRequestInsertMessage,
                      Session.ProtoModel(),
                      path='new_session', 
                      http_method='POST',
                      name='new')   
    def SessionInsert(self, request):
        
        u = _isValidUser()
        
        if request.organisation != int(u['organisation_id']):
            raise endpoints.ForbiddenException('Not authorised. Code: 1056')          

        patient = ndb.Key(Patient, request.patient).get()
        
        if patient.organisation_ref.integer_id() != int(u['organisation_id']):
            logging.debug(patient.organisation_ref.integer_id())
            logging.debug(int(u['organisation_id']))
            raise endpoints.ForbiddenException('Not authorised. Code: 1057')          
        
        session = Session(
                          patient = patient, 
                          patient_ref = patient.key, 
                          organisation_ref = patient.organisation_ref, 
                          symptoms = Symptoms())
        
        if request.doctor is not None :
            session.doctor_ref = ndb.Key(User, request.doctor)

        if request.appointment is not None :
            session.appointment_ref = ndb.Key(Appointment, request.appointment) 


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

    @Session.query_method(query_fields=('limit', 'order', 'pageToken'),
                          collection_fields =('id', 'created', 'ended', 'updated', 'status', 'outcome', 'patient'),
                          path='sessions/list', 
                          http_method='GET',
                          name='list')   
    def SessionList(self, query):
        u = _isValidUser()
        
        organisation_ref = ndb.Key(Organisation, u['organisation_id'])
        
        return query.filter(Session.active == True).filter(Session.organisation_ref == organisation_ref)
    
    @Session.query_method(query_fields=('organisation_id', 'doctor_id'),
                          collection_fields =('id', 'created', 'ended', 'updated', 'status', 'outcome', 'patient'),
                          path='sessions/listActiveByDoctor', 
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


    @endpoints.method(api3_messages.IdListMessage,
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

    @endpoints.method(api3_messages.SymptomMultiRequestMessage, 
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


    @endpoints.method(api3_messages.OutcomeRequestMessage, 
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
        
        return a.user
        
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
        
        logging.debug(a)

        if not a.user :
            raise endpoints.UnauthorizedException('Not authorised')
        elif not a.token :
            raise endpoints.UnauthorizedException('Invalid or expired token.')
        elif int(a.user['type']) != int(UserType.ADMIN) :
            raise endpoints.ForbiddenException('Access denied')       

        return a.user

'''
        current_user = endpoints.get_current_user()
        
        if current_user is None:
            raise endpoints.UnauthorizedException('Invalid token.')
        else :
            user = User.query(ndb.AND(User.email == current_user.email().lower(), User.type == int(UserType.ADMIN))).get()
            
            if user is None:
                raise endpoints.UnauthorizedException('Not authorised')
'''

def _isOrganisationAdminUser():
    
    if RAISE_UNAUTHORISED:
        
        a = MyAuth()
        a.get_user_from_cookie()
        
        logging.debug(a)

        if not a.user :
            raise endpoints.UnauthorizedException('Not authorised')
        elif not a.token :
            raise endpoints.UnauthorizedException('Invalid or expired token.')
        elif int(a.user['type']) not in [int(UserType.ORGANISATION_ADMIN), int(UserType.ADMIN)] :
            raise endpoints.ForbiddenException('Access denied')       

        return a.user


def _idDenerator(size=10, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))


app = endpoints.api_server([c4c_api], restricted=False)    
