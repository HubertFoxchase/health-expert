'''
Created on 5 May 2015

@author: Michael Lisovski
'''
import logging
import requests

APP_ID = "b2bc2e86"
APP_KEY = "92d49a8b4302920c299e038041049741"

HEADERS = {
    "app_id" : APP_ID,
    "app_key" : APP_KEY
}

LOOKUP_URL = "https://api.infermedica.com/v1/lookup"
        
def lookup(observation, sex):

    payload = {
        "phrase" : observation,
        "sex" : sex
    }
    
    r = requests.get(LOOKUP_URL, params=payload, headers=HEADERS)        
        
    logging.debug(r.text)
    
    return r.json()