'''
Created on 18 May 2014
@author: Michael Lisovski
'''

from protorpc import messages

#users
class UserRequestMessage(messages.Message):
    id = messages.StringField(1)

class UserInsertRequestMessage(messages.Message):
    name = messages.StringField(1)
    gender = messages.StringField(2)
    dob = messages.StringField(3)

class UserResponseMessage(messages.Message):
    id = messages.StringField(1)
    email = messages.StringField(2)
    name = messages.StringField(3)
    gender = messages.StringField(4)
    dob = messages.StringField(5)

class UserDeleteRequestMessage(messages.Message):
    id = messages.StringField(1)
    
class UsersListRequestMessage(messages.Message):
    id = messages.StringField(1)
    email = messages.StringField(2)
    use_current_user = messages.BooleanField(3)
    limit = messages.IntegerField(4)

class UsersListResponseMessage(messages.Message):
    items = messages.MessageField(UserResponseMessage, 1, repeated=True)       

class MemberRequestMessage(messages.Message):
    id = messages.IntegerField(1)

class MemberInsertRequestMessage(messages.Message):
    id = messages.IntegerField(1)
    name = messages.StringField(2)
    gender = messages.StringField(3)
    dob = messages.StringField(4)

class MemberResponseMessage(messages.Message):
    id = messages.IntegerField(1)
    name = messages.StringField(2)
    gender = messages.StringField(3)
    dob = messages.StringField(4)
    user = messages.StringField(5)

class MemberDeleteRequestMessage(messages.Message):
    id = messages.StringField(1)

class MembersListRequestMessage(messages.Message):
    pass

class MembersListResponseMessage(messages.Message):
    items = messages.MessageField(MemberResponseMessage, 1, repeated=True)    


class MsgType(messages.Enum):
    CHAT = 1
    DIAGNOSTIC_QUESTION = 2
    DIAGNOSTIC_ANSWER = 3

class MsgDirection(messages.Enum):
    TO_MEMEBER = 1
    FROM_MEMEBER = 2

class MsgResponseMessage(messages.Message):
    id = messages.IntegerField(1)
    channel = messages.IntegerField(2)
    type = messages.IntegerField(3)
    direction = messages.IntegerField(4)
    content = messages.StringField(5)
    timestamp = messages.StringField(6)
    session = messages.IntegerField(8)
    member = messages.IntegerField(9)
    user = messages.StringField(10)

class MsgInsertRequestMessage(messages.Message):
    channel = messages.IntegerField(1)
    type = messages.IntegerField(2)
    direction = messages.IntegerField(3)
    content = messages.StringField(4)
    timestamp = messages.StringField(5)
    session = messages.IntegerField(6)
    member = messages.IntegerField(7)
    user = messages.StringField(9)
    
class MsgRequestMessage(messages.Message):
    id = messages.IntegerField(1)

class MsgListRequestMessage(messages.Message):
    member = messages.IntegerField(1)
    channel = messages.IntegerField(2)
    ts = messages.IntegerField(3)
    


class MsgListResponseMessage(messages.Message):
    items = messages.MessageField(MsgResponseMessage, 1, repeated=True)    



class AnswerGroup(messages.Enum):
    YES_NO = 1
    YES_NO_MAYBE = 2

class QuestionResponseMessage(messages.Message):

    id = messages.IntegerField(1)
    text = messages.StringField(2)
    answers = messages.EnumField(AnswerGroup, 3)

class QuestionRequestMessage(messages.Message):

    text = messages.StringField(1, required=True)
    answers = messages.EnumField(AnswerGroup, 2, default=AnswerGroup.YES_NO, required=True)

class QuestionDeleteRequestMessage(messages.Message):

    id = messages.IntegerField(1, required=True)

class QuestionsListResponse(messages.Message):
    items = messages.MessageField(QuestionResponseMessage, 1, repeated=True)

class QuestionsListRequest(messages.Message):
    limit = messages.IntegerField(1, default=100)    


# greetings 
class Greeting(messages.Message):
    message = messages.StringField(1)

class GreetingCollection(messages.Message):
    items = messages.MessageField(Greeting, 1, repeated=True)

class BoardMessage(messages.Message):
    state = messages.StringField(1, required=True)

class ScoresListRequest(messages.Message):
    limit = messages.IntegerField(1, default=10)

    class Order(messages.Enum):
        WHEN = 1
        TEXT = 2
    order = messages.EnumField(Order, 2, default=Order.WHEN)

class ScoreRequestMessage(messages.Message):
    outcome = messages.StringField(1, required=True)

class ScoreResponseMessage(messages.Message):
    id = messages.IntegerField(1)
    outcome = messages.StringField(2)
    played = messages.StringField(3)

class ScoresListResponse(messages.Message):
    items = messages.MessageField(ScoreResponseMessage, 1, repeated=True)
    
