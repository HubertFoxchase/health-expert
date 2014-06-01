'''
Created on 18 May 2014

@author: Michael Lisovski
'''
import endpoints
from google.appengine.ext import ndb
from google.appengine.ext.ndb import polymodel
from google.appengine.ext.ndb import msgprop

from datetime import datetime

import api_messages


TIME_FORMAT_STRING = '%b %d, %Y %I:%M:%S %p'


def get_endpoints_current_user(raise_unauthorized=True):

    current_user = endpoints.get_current_user()
    if raise_unauthorized and current_user is None:
        raise endpoints.UnauthorizedException('Invalid token.')
    else:
        pass
        
    return current_user


class Score(ndb.Model):
    """Model to store scores that have been inserted by users.

    Since the played property is auto_now_add=True, Scores will document when
    they were inserted immediately after being stored.
    """
    outcome = ndb.StringProperty(required=True)
    played = ndb.DateTimeProperty(auto_now_add=True)
    player = ndb.UserProperty(required=True)

    @property
    def timestamp(self):
        """Property to format a datetime object to string."""
        return self.played.strftime(TIME_FORMAT_STRING)

    def to_message(self):
        """Turns the Score entity into a ProtoRPC object.

        This is necessary so the entity can be returned in an API request.

        Returns:
            An instance of ScoreResponseMessage with the ID set to the datastore
            ID of the current entity, the outcome simply the entity's outcome
            value and the played value equal to the string version of played
            from the property 'timestamp'.
        """
        return api_messages.ScoreResponseMessage(id=self.key.id(),
                                    outcome=self.outcome,
                                    played=self.timestamp)

    @classmethod
    def put_from_message(cls, message):

        current_user = get_endpoints_current_user()
        entity = cls(outcome=message.outcome, player=current_user)
        entity.put()
        return entity

    @classmethod
    def query_current_user(cls):

        current_user = get_endpoints_current_user()
        return cls.query(cls.player == current_user)



class Question(ndb.Model):

    text = ndb.StringProperty(required=True)
    answers = msgprop.EnumProperty(api_messages.AnswerGroup, required=True)

    def to_message(self):

        return api_messages.QuestionResponseMessage(id=self.key.id(),
                                    text=self.text,
                                    answers=self.answers)

    @classmethod
    def put_from_message(cls, message):
        """Gets the current user and inserts a score.

        Args:
            message: A QuestionRequestMessage instance to be inserted.

        Returns:
            The Question entity that was inserted.
        """
        entity = cls(text=message.text, answers=message.answers)
        entity.put()
        return entity

    @classmethod
    def delete_from_message(cls, message):
        """Delete questio by id.

        Args:
            message: A QuestionRequestMessage instance to be inserted.

        Returns:
            The Question entity that was deleted.
        """
        entity = cls(id=message.id)
        entity.delete()
        return entity

    @classmethod
    def get_query(cls):
        """Creates a query.

        Returns:
            An ndb.Query object. This can be used
            to filter for other properties or order by them.
        """
        return cls.query()


class Person(polymodel.PolyModel):

    name = ndb.StringProperty()
    dob = ndb.DateProperty()
    gender = ndb.StringProperty()
    
class User(Person):
    email = ndb.StringProperty(required=True)

    def to_message(self):
        return api_messages.UserResponseMessage(id=str(self.key.id()),
                                    name=self.name,
                                    email=self.email,
                                    gender=self.gender,
                                    dob=self.dob.strftime(TIME_FORMAT_STRING))

    @classmethod
    def put_from_message(cls, message):
        current_user = get_endpoints_current_user()
        
        key = ndb.Key(cls, current_user.email())
        entity = key.get();
        
        if entity is None:
            entity = cls()
            
        entity.name = message.name 
        entity.dob = datetime.strptime(message.dob, '%Y/%m/%d')
        entity.email = current_user.email()
        entity.gender = message.gender
        
        entity.put()
        return entity

    @classmethod
    def delete_from_message(cls, message):
        current_user = get_endpoints_current_user()
        key = ndb.Key(cls, current_user.email())
        return key.delete()

    @classmethod
    def query_user(cls, message):
        
        query = cls.query()
        
        if message.email is not None :
            query = cls.query(cls.email == message.email)
        elif message.id is not None :
            query = cls.query(cls.id == message.id)
        elif message.use_current_user is not None and message.use_current_user:
            current_user = get_endpoints_current_user()
            query = cls.query(cls.email == current_user.email())
        
        return query        

    @classmethod
    def get_current_user(cls):
        current_user = get_endpoints_current_user()
        key = ndb.Key(cls, current_user.email())
        return key.get()    


class Member(Person):

    def to_message(self):
        return api_messages.MemberResponseMessage(id=self.key.id(),
                                    name=self.name,
                                    gender=self.gender,
                                    dob=self.dob.strftime(TIME_FORMAT_STRING),
                                    user=str(self.key.parent().id()))

    @classmethod
    def put_from_message(cls, message):
        current_user = get_endpoints_current_user()
        
        if message.id is None:
            entity = cls(parent = ndb.Key('User', current_user.email()))
        else:    
            key = ndb.Key(cls, message.id, parent = ndb.Key('User', current_user.email()))
            entity = key.get()
        
        if entity is None:
            entity = cls(parent = ndb.Key('User', current_user.email()))
            
        entity.name = message.name 
        entity.dob = datetime.strptime(message.dob, '%Y/%m/%d')
        entity.gender = message.gender
        
        entity.put()
        return entity

    @classmethod
    def delete_from_message(cls, message):
        current_user = get_endpoints_current_user()
        key = ndb.Key(cls, int(message.id), parent = ndb.Key('User', current_user.email()))
        key.delete()

    @classmethod
    def query_current_user(cls):
        current_user = get_endpoints_current_user()
        return cls.query(ancestor = ndb.Key("User", current_user.email()))        

    @classmethod
    def get_member(cls, message):
        current_user = get_endpoints_current_user()
        key = ndb.Key(cls, message.id, parent = ndb.Key('User', current_user.email()))
        return key.get()


class Msg(ndb.Model):

    channel = ndb.IntegerProperty(required=True)
    type = ndb.IntegerProperty(default = int(api_messages.MsgType.CHAT))
    direction = ndb.IntegerProperty(default = int(api_messages.MsgDirection.FROM_MEMEBER))
    content = ndb.StringProperty(required=True)
    timestamp = ndb.DateTimeProperty(auto_now_add=True)
    session = ndb.IntegerProperty()
    sender = ndb.IntegerProperty(required=True)
    user = ndb.StringProperty(required=True)

    def to_message(self):
        
        return api_messages.MsgResponseMessage(id=self.key.id(),
                                    channel = self.channel,
                                    type=self.type,
                                    direction = self.direction,
                                    content=self.content,
                                    timestamp=self.timestamp.strftime(TIME_FORMAT_STRING),
                                    session = self.session,
                                    member=self.key.parent().id(),
                                    user=str(self.key.parent().parent().id()))

    @classmethod
    def put_from_message(cls, message):
        current_user = get_endpoints_current_user()

        entity = cls(parent = ndb.Key('Member', int(message.member), parent = ndb.Key('User', current_user.email())),
                     channel = message.channel,
                     type = message.type,
                     direction = message.direction,
                     content = message.content,
                     #timestamp = datetime.strptime(message.timestamp, '%Y/%m/%d %H:%M:%S'),
                     session = message.session,
                     sender = message.member,
                     user = current_user.email())
                
        entity.put()
        return entity

    @classmethod
    def query_messages(cls, message):
        
        query = cls.query().order(cls.timestamp)
        
        if message.channel is not None:
            query = query.filter(cls.channel == message.channel)
        
        if message.ts is not None:
            try:
                t = datetime.fromtimestamp(message.ts/1000.0)
                query = query.filter(cls.timestamp > t)
            finally:
                pass

        return query       

    @classmethod
    def get_message(cls, message):
        #current_user = get_endpoints_current_user()
        if message.id is not None:
            key = ndb.Key(cls, message.id)
            return key.get()
        else:
            return None