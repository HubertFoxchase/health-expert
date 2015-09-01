'''
Created on 5 Mar 2015

@author: Michael Lisovski
'''
import logging
import endpoints
import datetime
import time
from protorpc import messages
from google.appengine.ext import ndb
from endpoints_proto_datastore.ndb import EndpointsModel, EndpointsAliasProperty
from webapp2_extras import auth
from webapp2_extras import security
from webapp2_extras.appengine.auth.models import Unique
from webapp2_extras.appengine.auth.models import UserToken

class Organisation(EndpointsModel):
    
    _message_fields_schema = ('id', 'name', 'apikey', 'created',)
    
    name = ndb.StringProperty()
    apikey = ndb.StringProperty()
    created = ndb.DateTimeProperty(auto_now_add=True)
    updated = ndb.DateTimeProperty(auto_now=True)
    active = ndb.BooleanProperty(default = True)
    
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
    type = ndb.IntegerProperty()
    role = ndb.IntegerProperty()
    created = ndb.DateTimeProperty(auto_now_add=True)
    updated = ndb.DateTimeProperty(auto_now=True)
    active = ndb.BooleanProperty(default = True)
    verified = ndb.BooleanProperty(default = False)
    auth_ids = ndb.StringProperty(repeated=True)
    password = ndb.StringProperty()
    
        #: The model used to ensure uniqueness.
    unique_model = Unique
    #: The model used to store tokens.
    token_model = UserToken

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
        
    def get_id(self):
        """Returns this user's unique ID, which can be an integer or string."""
        return self._key.id()

    def get_organisation_id(self):
        """Returns this organisation's unique ID, which can be an integer or string."""
        return self.organisation_ref.integer_id() 

    def add_auth_id(self, auth_id):
        """A helper method to add additional auth ids to a User

        :param auth_id:
            String representing a unique id for the user. Examples:

            - own:username
            - google:username
        :returns:
            A tuple (boolean, info). The boolean indicates if the user
            was saved. If creation succeeds, ``info`` is the user entity;
            otherwise it is a list of duplicated unique properties that
            caused creation to fail.
        """
        self.auth_ids.append(auth_id)
        unique = '%s.auth_id:%s' % (self.__class__.__name__, auth_id)
        ok = self.unique_model.create(unique)
        if ok:
            self.put()
            return True, self
        else:
            return False, ['auth_id']

    @classmethod
    def get_by_auth_id(cls, auth_id):
        """Returns a user object based on a auth_id.

        :param auth_id:
            String representing a unique id for the user. Examples:

            - own:username
            - google:username
        :returns:
            A user object.
        """
        
        user = cls.query(cls.auth_ids == auth_id).get()
                
        return user 

    @classmethod
    def get_by_auth_token(cls, user_id, token, subject='auth'):
        """Returns a user object based on a user ID and token.
    
        :param user_id:
            The user_id of the requesting user.
        :param token:
            The token string to be verified.
        :returns:
            A tuple ``(User, timestamp)``, with a user object and
            the token timestamp, or ``(None, None)`` if both were not found.
        """
        token_key = cls.token_model.get_key(user_id, subject, token)
        user_key = ndb.Key(cls, user_id)
        # Use get_multi() to save a RPC call.
        valid_token, user = ndb.get_multi([token_key, user_key])
        
        if valid_token and user:
            timestamp = int(time.mktime(valid_token.created.timetuple()))
            return user, timestamp
    
        return None, None

    @classmethod
    def get_by_auth_password(cls, auth_id, password):
        """Returns a user object, validating password.

        :param auth_id:
            Authentication id.
        :param password:
            Password to be checked.
        :returns:
            A user object, if found and password matches.
        :raises:
            ``auth.InvalidAuthIdError`` or ``auth.InvalidPasswordError``.
        """
        user = cls.get_by_auth_id(auth_id)
        
        logging.debug(user)
        
        if not user:
            raise auth.InvalidAuthIdError()

        if not security.check_password_hash(password, user.password):
            raise auth.InvalidPasswordError()

        return user

    @classmethod
    def validate_token(cls, user_id, subject, token):
        """Checks for existence of a token, given user_id, subject and token.

        :param user_id:
            User unique ID.
        :param subject:
            The subject of the key. Examples:

            - 'auth'
            - 'signup'
            - 'invite'
        :param token:
            The token string to be validated.
        :returns:
            A :class:`UserToken` or None if the token does not exist.
        """
        return cls.token_model.get(user=user_id, subject=subject,
                                   token=token) is not None

    @classmethod
    def create_auth_token(cls, user_id):
        """Creates a new authorization token for a given user ID.

        :param user_id:
            User unique ID.
        :returns:
            A string with the authorization token.
        """
        return cls.token_model.create(user_id, 'auth').token

    @classmethod
    def validate_auth_token(cls, user_id, token):
        return cls.validate_token(user_id, 'auth', token)

    @classmethod
    def delete_auth_token(cls, user_id, token):
        """Deletes a given authorization token.

        :param user_id:
            User unique ID.
        :param token:
            A string with the authorization token.
        """
        cls.token_model.get_key(user_id, 'auth', token).delete()

    @classmethod
    def create_signup_token(cls, user_id):
        entity = cls.token_model.create(user_id, 'signup')
        return entity.token

    @classmethod
    def validate_signup_token(cls, user_id, token):
        return cls.validate_token(user_id, 'signup', token)

    @classmethod
    def delete_signup_token(cls, user_id, token):
        cls.token_model.get_key(user_id, 'signup', token).delete()

    @classmethod
    def create_invite_token(cls, user_id):
        entity = cls.token_model.create(user_id, 'invite')
        return entity.token

    @classmethod
    def validate_invite_token(cls, user_id, token):
        return cls.validate_token(user_id, 'invite', token)

    @classmethod
    def delete_invite_token(cls, user_id, token):
        cls.token_model.get_key(user_id, 'invite', token).delete()

    @classmethod
    def create_user(cls, auth_id, unique_properties=None, **user_values):
        """Creates a new user.

        :param auth_id:
            A string that is unique to the user. Users may have multiple
            auth ids. Example auth ids:

            - own:username
            - own:email@example.com
            - google:username
            - yahoo:username

            The value of `auth_id` must be unique.
        :param unique_properties:
            Sequence of extra property names that must be unique.
        :param user_values:
            Keyword arguments to create a new user entity. Since the model is
            an ``Expando``, any provided custom properties will be saved.
            To hash a plain password, pass a keyword ``password_raw``.
        :returns:
            A tuple (boolean, info). The boolean indicates if the user
            was created. If creation succeeds, ``info`` is the user entity;
            otherwise it is a list of duplicated unique properties that
            caused creation to fail.
        """
        assert user_values.get('password') is None, \
            'Use password_raw instead of password to create new users.'

        assert not isinstance(auth_id, list), \
            'Creating a user with multiple auth_ids is not allowed, ' \
            'please provide a single auth_id.'

        if 'password_raw' in user_values:
            user_values['password'] = security.generate_password_hash(user_values.pop('password_raw'), length=12)

        user_values['auth_ids'] = [auth_id]
        user = cls(**user_values)

        # Set up unique properties.
        uniques = [('%s.auth_id:%s' % (cls.__name__, auth_id), 'auth_id')]
        if unique_properties:
            for name in unique_properties:
                key = '%s.%s:%s' % (cls.__name__, name, user_values[name])
                uniques.append((key, name))

        ok, existing = cls.unique_model.create_multi(k for k, v in uniques)
        
        logging.debug(ok)
        logging.debug(existing)
        if ok:
            user.put()
            return True, user
        else:
            properties = [v for k, v in uniques if k in existing]
            return False, properties        

    def set_password(self, raw_password):
        """Sets the password for the current user
    
        :param raw_password:
            The raw password which will be hashed and stored
        """
        self.password = security.generate_password_hash(raw_password, length=12)
    

class Patient(EndpointsModel):
    
    _message_fields_schema = ('id', 'ref', 'gender', 'dob', 'age', 'organisation', 'organisation_id', )
    
    ref = ndb.StringProperty()
    gender = ndb.StringProperty()
    age = ndb.IntegerProperty()
    dob = ndb.DateProperty()
    created = ndb.DateTimeProperty(auto_now_add=True)
    updated = ndb.DateTimeProperty(auto_now=True)
    active = ndb.BooleanProperty(default = True)
    
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
    
    _message_fields_schema = ('id', 'created', 'ended', 'updated', 'status', 'symptoms', 'outcome', 'next', 'patient', 'patient_id', 'organisation_id', )    
    
    _patientId = None
    _symptomId = None
    _symptomName = None
    _symptomValue = None
    _patient = None
    _symptomsArray = None
    
    status = ndb.IntegerProperty()
    created = ndb.DateTimeProperty(auto_now_add=True)
    updated = ndb.DateTimeProperty(auto_now=True)
    ended = ndb.DateTimeProperty()
    symptoms = ndb.LocalStructuredProperty(Symptoms)
    next = ndb.LocalStructuredProperty(Question)
    outcome = ndb.LocalStructuredProperty(Outcome)
    active = ndb.BooleanProperty(default = True)
    
    organisation_ref = ndb.KeyProperty(kind=Organisation)

    def OrganisationId(self, value):
        if not isinstance(value, (int, long)):
            raise endpoints.BadRequestException('Organisation id must be an integer.')
        
        self.organisation_ref = ndb.Key(Organisation, value)

        if self.organisation_ref is None:
            raise endpoints.NotFoundException('Organisation %s does not exist.' % value)        

    @EndpointsAliasProperty(setter=OrganisationId, property_type=messages.IntegerField)
    def organisation_id(self):
        if self.organisation_ref is not None:
            return self.organisation_ref.integer_id()   


    patient = ndb.LocalStructuredProperty(Patient)
    patient_ref = ndb.KeyProperty(kind=Patient)

    def PatientId(self, value):
        if not isinstance(value, (int, long)):
            raise endpoints.BadRequestException('Patient id must be an integer.')
        
        self.patient_ref = ndb.Key(Patient, value)

        if self.patient_ref is None:
            raise endpoints.NotFoundException('Patient %s does not exist.' % value)        

        self.patient = self.patient_ref.get()
        #self.organisation_ref = self.patient.organisation_ref

    @EndpointsAliasProperty(setter=PatientId, property_type=messages.IntegerField)
    def patient_id(self):
        if self.patient_ref is not None:
            return self.patient_ref.integer_id()   

    
    
    def symptom_idSetter(self, value):
        self._symptomId = value
    
    @EndpointsAliasProperty(setter=symptom_idSetter, property_type=messages.StringField)
    def symptom_id(self):
        return self._symptomId

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
    
