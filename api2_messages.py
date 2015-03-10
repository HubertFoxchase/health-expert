'''
Created on 6 Mar 2015

@author: Michael Lisovski
'''

from protorpc import messages

#users
class SymptomRequestMessage(messages.Message):
    name = messages.StringField(1)
    value = messages.StringField(2)
    session = messages.IntegerField(3)

class SymptomResponseMessage(messages.Message):
    name = messages.StringField(1)
    value = messages.StringField(2)

class QuestionsResponseMessage(messages.Message):
    label = messages.StringField(1)
    description = messages.StringField(2)
    type = messages.StringField(3)
    categories = messages.StringField(4, repeated=True)
         
class OutcomeRequestMessage(messages.Message):
    name = messages.StringField(1)
    confidence = messages.StringField(2)
    session = messages.IntegerField(3)

class OutcomeResposeMessage(messages.Message):
    name = messages.StringField(1)
    confidence = messages.StringField(2)

class SessionResponseMessage(messages.Message):
    patient = messages.IntegerField(1)
    created = messages.StringField(2)
    ended = messages.StringField(3)
    state = messages.IntegerField(4)
    sysmptoms = messages.MessageField(SymptomResponseMessage, 5, repeated=True)    
    next = messages.MessageField(QuestionsResponseMessage, 6)    
    outcome = messages.MessageField(OutcomeResposeMessage, 7)   
    