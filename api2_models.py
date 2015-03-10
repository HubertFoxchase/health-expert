'''
Created on 5 Mar 2015

@author: Michael Lisovski
'''
import endpoints
import datetime
import api2_messages
from protorpc import messages
from google.appengine.ext import ndb
from endpoints_proto_datastore.ndb import EndpointsModel
from endpoints_proto_datastore.ndb import EndpointsAliasProperty

class Organisation(EndpointsModel):
    
    _message_fields_schema = ('id', 'name', 'created',)
    
    name = ndb.StringProperty()
    created = ndb.DateTimeProperty(auto_now_add=True)
    

class User(EndpointsModel):
    
    name = ndb.StringProperty()
    created = ndb.DateTimeProperty(auto_now_add=True)
    type = ndb.IntegerProperty()
    owner = ndb.UserProperty()

class Patient(EndpointsModel):
    
    _message_fields_schema = ('id', 'ref', 'organisation')
    
    _organisationId = None

    ref = ndb.StringProperty()
    organisation_ref = ndb.KeyProperty(kind=Organisation)

    def OrganisationId(self, value):
        if not isinstance(value, (int, long)):
            raise endpoints.BadRequestException('Organisation id must be an integer.')
        
        if ndb.Key(Organisation, value) is None:
            raise endpoints.NotFoundException('Organisation %s does not exist.' % value)        

        self._organisationId = value
        self.organisation_ref = ndb.Key(Organisation, value)

    @EndpointsAliasProperty(setter=OrganisationId, property_type=messages.IntegerField)
    def organisation(self):

        return self.organisation_ref.integer_id()   
    

'''    
    def OrganisationSet(self, value):
        if not isinstance(value, (int, long)):
            raise endpoints.BadRequestException('Organisation id must be an integer.')
    
        self._parent = value
        organisation_key = ndb.Key(Organisation, value)
        
        if organisation_key.get() is None:
            raise endpoints.NotFoundException('Organisation %s does not exist.' % value)
        
        self.key = ndb.Key(Patient, None, parent=organisation_key)
    
        self._endpoints_query_info.ancestor = organisation_key    
    
    @EndpointsAliasProperty(setter=OrganisationSet, property_type=messages.IntegerField)
    def organisation(self):
        if self._parent is None and self.key is not None:
            self._parent = self.key.parent().integer_id()
        return self._parent
'''
class Symptom(EndpointsModel):
    
    name = ndb.StringProperty()
    #question = ndb.StringProperty()
    value = ndb.StringProperty()  
    
class Outcome(EndpointsModel):
    
    name = ndb.StringProperty()
    confidence = ndb.StringProperty()  

class Question(EndpointsModel):
    
    label = ndb.StringProperty()
    description = ndb.StringProperty()
    type = ndb.StringProperty()  
    categories = ndb.StringProperty(repeated=True)

class SessionState(messages.Enum):
    ACTIVE = 1
    ENDED = 0
   
class Session(EndpointsModel):
    
    _message_fields_schema = ('id', 'created', 'ended', 'state','symptoms', 'outcome', 'next','patient', 'name', 'value')    
    
    _patientId = None
    _name = None
    _value = None
    
    state = ndb.IntegerProperty(default = int(SessionState.ACTIVE))
    created = ndb.DateTimeProperty(auto_now_add=True)
    ended = ndb.DateTimeProperty()
    symptoms = ndb.LocalStructuredProperty(Symptom, repeated=True)
    next = ndb.LocalStructuredProperty(Question)
    outcome = ndb.LocalStructuredProperty(Outcome)
    
    patient_ref = ndb.KeyProperty(kind=Patient)
    
    def nameSetter(self, value):
        self._name = value
    
    @EndpointsAliasProperty(setter=nameSetter, property_type=messages.StringField)
    def name(self):
        return self._name

    def valueSetter(self, value):
        self._value = value

    @EndpointsAliasProperty(setter=valueSetter, property_type=messages.StringField)
    def value(self):
        return self._value

    def PatientId(self, value):
        if not isinstance(value, (int, long)):
            raise endpoints.BadRequestException('Patient id must be an integer.')
        
        patient_key = ndb.Key(Patient, value)
        
        if patient_key is None:
            raise endpoints.NotFoundException('Patient %s does not exist.' % value)        

        self._patientId = value
        self.patient_ref = patient_key

    @EndpointsAliasProperty(setter=PatientId, property_type=messages.IntegerField)
    def patient(self):

        return self.patient_ref.integer_id()   
    
    @classmethod
    def add_symptom(cls, message):
        
        key = ndb.Key(cls, message.session)
        entity = key.get()
        
        if entity is None:
            raise endpoints.NotFoundException('Session %s does not exist.' % message.session)         
        
        symptom = Symptom(name=message.name, value=message.value)
        entity.symptoms.append(symptom)
        
        entity.put()
        return entity    
    
    @classmethod
    def add_outcome(cls, message):
        
        key = ndb.Key(cls, message.session)
        entity = key.get()
        
        if entity is None:
            raise endpoints.NotFoundException('Session %s does not exist.' % message.session)         
        
        outcome = Outcome(name=message.name, confidence=message.confidence)
        entity.outcome = outcome
        #entity.state = int(SessionState.ENDED)
        #entity.ended = datetime.datetime.now() 
        
        entity.put()
        return entity    
    
