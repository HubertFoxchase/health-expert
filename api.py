'''
Created on 17 May 2014

@author: Michael Lisovski
'''

import endpoints
from protorpc import messages
from protorpc import message_types
from protorpc import remote

import api_models
import api_messages

import bigml.api
from bigml.api import BigML
from bigml.model import Model

package = 'Hello'

WEB_CLIENT_ID = '817202020074-1b97ag04r8rhfj6r40bocobupn92g5bj.apps.googleusercontent.com'
ANDROID_CLIENT_ID = 'replace this with your Android client ID'
IOS_CLIENT_ID = 'replace this with your iOS client ID'
OTHER_CLIENT_ID = '817202020074-utvardicvh3oaqhf2tqagqnrmk52cv2p.apps.googleusercontent.com'
ANDROID_AUDIENCE = WEB_CLIENT_ID


BIGML_USERNAME = "michaellisovski"
BIGML_API_KEY = "b9065b0309020eb71b1a5bca99dc8cabcaabc9f9"


api = BigML(BIGML_USERNAME, BIGML_API_KEY)
model = api.get_model('model/537a0067d994976c05000a05', query_string='only_model=true;limit=-1')
local_model = Model(model)

STORED_GREETINGS = api_messages.GreetingCollection(items=[
    api_messages.Greeting(message='hello world!'),
    api_messages.Greeting(message='goodbye world!'),
])

@endpoints.api(name='helloworld', 
               version='v1',
               allowed_client_ids=[WEB_CLIENT_ID,
                                   OTHER_CLIENT_ID, 
                                   endpoints.API_EXPLORER_CLIENT_ID],
               audiences=[ANDROID_AUDIENCE],
               scopes=[endpoints.EMAIL_SCOPE])
class HelloWorldApi(remote.Service):
    """Helloworld API v1."""

    @endpoints.method(message_types.VoidMessage, 
                      api_messages.GreetingCollection,
                      path='hellogreeting', 
                      http_method='GET',
                      name='greetings.listGreeting')
    def greetings_list(self, unused_request):
        return STORED_GREETINGS

    MULTIPLY_METHOD_RESOURCE = endpoints.ResourceContainer(
            api_messages.Greeting,
            times=messages.IntegerField(2, variant=messages.Variant.INT32,
                                        required=True))
    
    @endpoints.method(MULTIPLY_METHOD_RESOURCE, 
                      api_messages.Greeting,
                      path='hellogreeting/{times}', 
                      http_method='POST',
                      name='greetings.multiply')
    def greetings_multiply(self, request):
        return api_messages.Greeting(message=request.message * request.times)

    ID_RESOURCE = endpoints.ResourceContainer(
            message_types.VoidMessage,
            id=messages.IntegerField(1, variant=messages.Variant.INT32))

    @endpoints.method(ID_RESOURCE, 
                      api_messages.Greeting,
                      path='hellogreeting/{id}', 
                      http_method='GET',
                      name='greetings.getGreeting')
    def greeting_get(self, request):
        try:
            return STORED_GREETINGS.items[request.id]
        except (IndexError, TypeError):
            raise endpoints.NotFoundException('Greeting %s not found.' %
                                              (request.id,))


    @endpoints.method(message_types.VoidMessage, 
                      api_messages.Greeting,
                      path='hellogreeting/authed', 
                      http_method='POST',
                      name='greetings.authed')
    def greeting_authed(self, request):
        current_user = endpoints.get_current_user()
        email = (current_user.email() if current_user is not None
                 else 'Anonymous')
        return api_messages.Greeting(message='hello %s' % (email,))            



@endpoints.api(name='questions', 
               version='v1',
               allowed_client_ids=[WEB_CLIENT_ID,
                                   OTHER_CLIENT_ID, 
                                   endpoints.API_EXPLORER_CLIENT_ID],
               audiences=[ANDROID_AUDIENCE],
               scopes=[endpoints.EMAIL_SCOPE])
class QuestionsUploadApi(remote.Service):

    @endpoints.method(api_messages.QuestionsListRequest, 
                      api_messages.QuestionsListResponse,
                      path='list', 
                      http_method='POST',
                      name='list')
    def questions_list(self, request):
        
        try:
            limit = int(request.limit)
        except ValueError:
            limit = 10        
        
        query = api_models.Question.get_query()
        items = [entity.to_message() for entity in query.fetch(limit)]
        return api_messages.QuestionsListResponse(items=items)

    @endpoints.method(api_messages.QuestionRequestMessage, 
                      api_messages.QuestionResponseMessage,
                      path='insert', 
                      http_method='POST',
                      name='insert')
    def question_insert(self, request):

        entity = api_models.Question.put_from_message(request)
        return entity.to_message()


    @endpoints.method(api_messages.QuestionDeleteRequestMessage, 
                      api_messages.QuestionResponseMessage,
                      path='delete', 
                      http_method='POST',
                      name='delete')
    def question_delete(self, request):

        try:
            entity = api_models.Question.delete_from_message(request) 
            return entity.to_message()
        except (IndexError, TypeError):
            raise endpoints.NotFoundException('Question "%s" not found.' %
                                              (request.id,))        
        

@endpoints.api(name='users', 
               version='v1',
               allowed_client_ids=[WEB_CLIENT_ID, 
                                   OTHER_CLIENT_ID,
                                   endpoints.API_EXPLORER_CLIENT_ID],
               audiences=[ANDROID_AUDIENCE],
               scopes=[endpoints.EMAIL_SCOPE])
class UsersApi(remote.Service):

    @endpoints.method(api_messages.UserRequestMessage, 
                      api_messages.UserResponseMessage,
                      path='get', 
                      http_method='GET',
                      name='get')
    def get_user(self, request):
        
        entity = api_models.User.get_current_user()

        return entity.to_message()
    
    @endpoints.method(api_messages.UsersListRequestMessage, 
                      api_messages.UsersListResponseMessage,
                      path='list', 
                      http_method='POST', 
                      name='list')
    def users_list(self, request):
        
        limit = 10
        if request.limit is not None:
            try:
                limit = int(request.limit)
            finally:
                pass
        
        query = api_models.User.query_user(request)
        items = [entity.to_message() for entity in query.fetch(limit)]
        return api_messages.UsersListResponseMessage(items=items)  

    @endpoints.method(api_messages.UserInsertRequestMessage, 
                      api_messages.UserResponseMessage,
                      path='insert', 
                      http_method='POST',
                      name='insert')
    def user_insert(self, request):

        entity = api_models.User.put_from_message(request)
        return entity.to_message()


    @endpoints.method(api_messages.UserDeleteRequestMessage, 
                      api_messages.UserResponseMessage,
                      path='delete', 
                      http_method='POST',
                      name='delete')
    def user_delete(self, request):

        try:
            entity = api_models.User.delete_from_message(request) 
            return entity.to_message()
        except (IndexError, TypeError):
            raise endpoints.NotFoundException('User "%s" not found.' %
                                              (request.id,))        


@endpoints.api(name='members', 
               version='v1',
               allowed_client_ids=[WEB_CLIENT_ID, 
                                   OTHER_CLIENT_ID,
                                   endpoints.API_EXPLORER_CLIENT_ID],
               audiences=[ANDROID_AUDIENCE],
               scopes=[endpoints.EMAIL_SCOPE])
class MembersApi(remote.Service):
    """Questions upload API v1."""

    @endpoints.method(api_messages.MemberRequestMessage, 
                      api_messages.MemberResponseMessage,
                      path='get', 
                      http_method='GET',
                      name='get')
    def get_member(self, request):
        
        entity = api_models.Member.get_member(request)
        
        return entity.to_message()
            
    @endpoints.method(api_messages.MemberInsertRequestMessage, 
                      api_messages.MemberResponseMessage,
                      path='insert', 
                      http_method='POST',
                      name='insert')
    def membert_insert(self, request):

        entity = api_models.Member.put_from_message(request)
        return entity.to_message()

    @endpoints.method(api_messages.MemberDeleteRequestMessage, 
                      message_types.VoidMessage,
                      path='delete', 
                      http_method='POST',
                      name='delete')
    def member_delete(self, request):

        try:
            api_models.Member.delete_from_message(request) 
            return message_types.VoidMessage()
        except (IndexError, TypeError):
            raise endpoints.NotFoundException('Member "%s" not found.' %
                                              (request.id,))        

    @endpoints.method(api_messages.MembersListRequestMessage, 
                      api_messages.MembersListResponseMessage,
                      path='list', 
                      http_method='POST',
                      name='list')
    def members_list(self, request):
        
        query = api_models.Member.query_current_user()
        items = [entity.to_message() for entity in query.fetch()]
        return api_messages.MembersListResponseMessage(items=items)


@endpoints.api(name='messages', 
               version='v1',
               allowed_client_ids=[WEB_CLIENT_ID, 
                                   OTHER_CLIENT_ID,
                                   endpoints.API_EXPLORER_CLIENT_ID],
               audiences=[ANDROID_AUDIENCE],
               scopes=[endpoints.EMAIL_SCOPE])
class MsgApi(remote.Service):
    """Questions upload API v1."""

    @endpoints.method(api_messages.MsgRequestMessage, 
                      api_messages.MsgResponseMessage,
                      path='get', 
                      http_method='GET',
                      name='get')
    def get_msg(self, request):
        
        entity = api_models.Msg.get_message(request)

        return entity.to_message()

    @endpoints.method(api_messages.MsgInsertRequestMessage, 
                      api_messages.MsgResponseMessage,
                      path='put', 
                      http_method='POST',
                      name='put')
    def msg_insert(self, request):

        entity = api_models.Msg.put_from_message(request)
        return entity.to_message()

    @endpoints.method(api_messages.MsgListRequestMessage, 
                      api_messages.MsgListResponseMessage,
                      path='list', 
                      http_method='POST',
                      name='list')
    def msg_list(self, request):
        
        query = api_models.Msg.query_messages(request)
        items = [entity.to_message() for entity in query.fetch()]
        return api_messages.MsgListResponseMessage(items=items)
    
app = endpoints.api_server([UsersApi, MembersApi, MsgApi])