#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import webapp2
import json

from google.appengine.ext.webapp import template


from oauth.handlers import AuthorizationHandler, AccessTokenHandler
from oauth.models import OAuth_Client
from oauth.utils import oauth_required

class MainHandler(webapp2.RequestHandler):
    def get(self):
        self.response.write('Hello world!')
        
#auth stuff
class ClientsHandler(webapp2.RequestHandler):
    """ This is only indirectly necessary since the spec
        calls for clients, but managing them is out of scope  """
    
    def get(self):
        clients = OAuth_Client.all()
        self.response.out.write(
            template.render('oauth-templates/clients.html', locals()))
    
    def post(self):
        client = OAuth_Client(
            name            = self.request.get('name'),
            redirect_uri    = self.request.get('redirect_uri'), )
        client.put()
        self.redirect(self.request.path)

class ProtectedResourceHandler(webapp2.RequestHandler):
    """ This is an example of a resource protected by OAuth 
        and requires the 'read' scope """
        
    SECRET_PAYLOAD = 'bananabread'
    
    @oauth_required(scope='read')
    def get(self, token):
        self.response.headers['Content-Type'] = "application/json"
        self.response.out.write(
            json.dumps({'is_protected': True, 'secret_payload': self.SECRET_PAYLOAD}))        

app = webapp2.WSGIApplication([
    ('/', MainHandler),
        ('/oauth/authorize',    AuthorizationHandler),
        ('/oauth/token',        AccessTokenHandler),
        ('/protected/resource', ProtectedResourceHandler),
        ('/admin/clients',      ClientsHandler)    
], debug=True)
