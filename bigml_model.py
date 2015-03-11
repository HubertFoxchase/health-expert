'''
Created on 10 Mar 2015

@author: Michael Lisovski
'''
from google.appengine.api import memcache
from bigml.api import BigML
from bigml.model import Model
import logging

BIGML_USERNAME = "michaellisovski"
BIGML_API_KEY = "b9065b0309020eb71b1a5bca99dc8cabcaabc9f9"

dev_mode = True
memcache_timeout = 3600
model_id = '53794a0ed994976c0d001092'

        #54fa4dc7af447f278e000083 - production
        #5379421cd994976c0800013b - development

def get_local_model():
    
    return Model(get_model())

def get_model():
    
    bigml_model = memcache.Client().get(model_id)

    if bigml_model is None :
        bigml_api = BigML(BIGML_USERNAME, BIGML_API_KEY, dev_mode=dev_mode)
        bigml_model = bigml_api.get_model('model/%s' % model_id, query_string='only_model=true;limit=-1')
        memcache.Client().add(model_id, bigml_model, time=memcache_timeout)

    return bigml_model