'''
Created on 6 Mar 2015

@author: Michael Lisovski
'''

from protorpc import messages

#users
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
    present = messages.StringField(2, repeated=True)


class SessionResponseMessage(messages.Message):
    patient = messages.IntegerField(1)
    created = messages.StringField(2)
    ended = messages.StringField(3)
    state = messages.IntegerField(4)
    sysmptoms = messages.MessageField(SymptomResponseMessage, 5, repeated=True)    
    next = messages.MessageField(QuestionsResponseMessage, 6)    
    outcome = messages.MessageField(OutcomeResposeMessage, 7)   
    