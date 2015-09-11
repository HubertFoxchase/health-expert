'''
Created on 6 Mar 2015

@author: Michael Lisovski
'''

from protorpc import messages

#users
class OrganisationResponseMessage(messages.Message):
    id = messages.StringField(1)
    name = messages.StringField(2)
    apikey = messages.StringField(3)
    created = messages.StringField(4)

class SymptomRequestMessage(messages.Message):
    id = messages.StringField(1)
    name = messages.StringField(2)
    value = messages.StringField(3)
    session = messages.IntegerField(4)

class SymptomMultiRequestMessage(messages.Message):
    session = messages.IntegerField(1)
    present = messages.StringField(2, repeated=True)
    absent = messages.StringField(3, repeated=True)

class SymptomResponseMessage(messages.Message):
    id = messages.StringField(1)
    name = messages.StringField(2)
    value = messages.StringField(3)

class PatientResposeMessage(messages.Message):
    id = messages.IntegerField(1)
    ref = messages.StringField(2)
    gender = messages.StringField(3)
    age = messages.IntegerField(4)
    organisation = messages.IntegerField(5)
    created = messages.StringField(6)
    updated = messages.StringField(7)

class QuestionsResponseMessage(messages.Message):
    label = messages.StringField(1)
    description = messages.StringField(2)
    type = messages.StringField(3)
    categories = messages.MessageField(SymptomResponseMessage, 4, repeated=True)
         
class OutcomeRequestMessage(messages.Message):
    id = messages.StringField(1)
    name = messages.StringField(2)
    probability = messages.FloatField(3)
    session = messages.IntegerField(4)

class OutcomeResposeMessage(messages.Message):
    id = messages.StringField(1)
    name = messages.StringField(2)
    probability = messages.FloatField(3)

class SessionNewRequestInsertMessage(messages.Message):
    patient = messages.IntegerField(1)
    organisation = messages.IntegerField(2)
    doctor = messages.IntegerField(3)
    appointment = messages.IntegerField(4)
    present = messages.StringField(5, repeated=True)


class SessionResponseMessage(messages.Message):
    patient = messages.IntegerField(1)
    created = messages.StringField(2)
    updated = messages.StringField(3)
    ended = messages.StringField(4)
    status = messages.IntegerField(5)
    sysmptoms = messages.MessageField(SymptomResponseMessage, 6, repeated=True)    
    next = messages.MessageField(QuestionsResponseMessage, 7)    
    outcome = messages.MessageField(OutcomeResposeMessage, 8)   
    
class IdListMessage(messages.Message):
        ids = messages.IntegerField(1, repeated=True)
