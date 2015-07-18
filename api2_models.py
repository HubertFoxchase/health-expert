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
from api2_messages import PatientResposeMessage

class Organisation(EndpointsModel):
    
    _message_fields_schema = ('id', 'name', 'apikey', 'created',)
    
    name = ndb.StringProperty()
    apikey = ndb.StringProperty()
    created = ndb.DateTimeProperty(auto_now_add=True)
    
class UserType(messages.Enum):
    ADMIN = 1
    NORMAL = 2

class UserRole(messages.Enum):
    DOCTOR = 1
    NURSE = 2
    RECEPTIONIST = 3
    SUPPORT = 4
    OTHER = 5

class User(EndpointsModel):
    
    _message_fields_schema = ('id', 'email', 'name', 'type', 'role', 'organisation', 'organisation_id', 'created')

    email = ndb.StringProperty()
    name = ndb.StringProperty()
    created = ndb.DateTimeProperty(auto_now_add=True)
    type = ndb.IntegerProperty()
    role = ndb.IntegerProperty()

    organisation_ref = ndb.KeyProperty(kind=Organisation)

    def OrganisationId(self, value):
        if not isinstance(value, (int, long)):
            raise endpoints.BadRequestException('Organisation id must be an integer.')
        
        self.organisation_ref = ndb.Key(Organisation, value)

        if self.organisation_ref is None:
            raise endpoints.NotFoundException('Organisation %s does not exist.' % value)        

    @EndpointsAliasProperty(setter=OrganisationId, property_type=messages.IntegerField)
    def organisation_id(self):
        return self.organisation_ref.integer_id()   

    @EndpointsAliasProperty(property_type=Organisation.ProtoModel())
    def organisation(self):
        if self.organisation_ref is not None:
            return self.organisation_ref.get()   



class Patient(EndpointsModel):
    
    _message_fields_schema = ('id', 'ref', 'gender', 'age', 'organisation', 'organisation_id', )
    
    ref = ndb.StringProperty()
    gender = ndb.StringProperty()
    age = ndb.IntegerProperty()
    
    organisation_ref = ndb.KeyProperty(kind=Organisation)

    def OrganisationId(self, value):
        if not isinstance(value, (int, long)):
            raise endpoints.BadRequestException('Organisation id must be an integer.')
        
        self.organisation_ref = ndb.Key(Organisation, value)

        if self.organisation_ref is None:
            raise endpoints.NotFoundException('Organisation %s does not exist.' % value)        

    @EndpointsAliasProperty(setter=OrganisationId, property_type=messages.IntegerField)
    def organisation_id(self):
        return self.organisation_ref.integer_id()   

    @EndpointsAliasProperty(property_type=Organisation.ProtoModel())
    def organisation(self):
        if self.organisation_ref is not None:
            return self.organisation_ref.get() 
    

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
    id = ndb.StringProperty()
    name = ndb.StringProperty()
    value = ndb.StringProperty()  

class Symptoms(EndpointsModel):
    items = ndb.LocalStructuredProperty(Symptom, repeated=True) 


class OutcomeListItem(EndpointsModel):
    id = ndb.StringProperty()
    name = ndb.StringProperty()
    probability = ndb.FloatProperty() 
    
class Outcome(EndpointsModel):
    id = ndb.StringProperty()
    name = ndb.StringProperty()
    probability = ndb.FloatProperty()  
    full = ndb.LocalStructuredProperty(OutcomeListItem, repeated=True) 

class Question(EndpointsModel):
    label = ndb.StringProperty()
    description = ndb.StringProperty()
    type = ndb.StringProperty()  
    symptoms = ndb.LocalStructuredProperty(Symptom, repeated=True)

class SessionState(messages.Enum):
    IN_PROGRESS = 1
    ENDED = 2
    REVIEWED = 3
    DELETED = 4

class Session(EndpointsModel):
    
    _message_fields_schema = ('id', 'created', 'ended', 'updated', 'state', 'symptoms', 'outcome', 'next', 'patient', 'organisation', 'patient_id')    
    
    _patientId = None
    _symptomId = None
    _symptomName = None
    _symptomValue = None
    _patient = None
    _symptomsArray = None
    
    state = ndb.IntegerProperty(default = int(SessionState.IN_PROGRESS))
    created = ndb.DateTimeProperty(auto_now_add=True)
    updated = ndb.DateTimeProperty(auto_now=True)
    ended = ndb.DateTimeProperty()
    symptoms = ndb.LocalStructuredProperty(Symptoms)
    next = ndb.LocalStructuredProperty(Question)
    outcome = ndb.LocalStructuredProperty(Outcome)
    
    organisation = ndb.IntegerProperty()
    
    patient = ndb.LocalStructuredProperty(Patient)

    def symptom_idSetter(self, value):
        self._symptomId = value
    
    @EndpointsAliasProperty(setter=symptom_idSetter, property_type=messages.StringField)
    def symptom_id(self):
        return self._symptomId

    def PatientId(self, value):
        if not isinstance(value, (int, long)):
            raise endpoints.BadRequestException('Patient id must be an integer.')
        
        patient_key = ndb.Key(Patient, value)
        
        if patient_key is None:
            raise endpoints.NotFoundException('Patient %s does not exist.' % value)        

        self._patientId = value
        self.patient = patient_key.get()

    @EndpointsAliasProperty(setter=PatientId, property_type=messages.IntegerField)
    def patient_id(self):
        pass  
    
    @classmethod
    def add_symptom(cls, message):
        
        key = ndb.Key(cls, message.session)
        entity = key.get()
        
        if entity is None:
            raise endpoints.NotFoundException('Session %s does not exist.' % message.session)         
        
        symptom = Symptom(id=message.id, name=message.name, value=message.value)
        entity.symptoms.append(symptom)

        entity.updated = datetime.datetime.now()
        
        entity.put()
        return entity    
    
    @classmethod
    def add_outcome(cls, message):
        
        key = ndb.Key(cls, message.session)
        entity = key.get()
        
        if entity is None:
            raise endpoints.NotFoundException('Session %s does not exist.' % message.session)         
        
        entity.outcome = Outcome(id=message.id, name=message.name, probability=message.probability)

        entity.state = int(SessionState.REVIEWED)
        entity.updated = datetime.datetime.now()
        entity.ended = datetime.datetime.now() 
        
        entity.put()
        return entity    
    
