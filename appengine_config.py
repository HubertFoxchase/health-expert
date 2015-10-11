'''
Created on 5 May 2015

@author: Michael Lisovski
'''

import os
import sys

# Workaround the dev-environment SSL
#   http://stackoverflow.com/q/16192916/893652
if os.environ.get('SERVER_SOFTWARE', '').startswith('Development'):
    import imp
    import os.path
    from google.appengine.tools.devappserver2.python import sandbox

    sandbox._WHITE_LIST_C_MODULES += ['_ssl', '_socket']
    # Use the system socket.
    psocket = os.path.join(os.path.dirname(os.__file__), 'socket.py')
    imp.load_source('socket', psocket)
    
#add libs folder for future better content organisation
#from google.appengine.ext import vendor

#vendor.add('lib')

sys.path.append(os.path.join(os.path.dirname(__file__), "lib"))

def webapp_add_wsgi_middleware(app):
    from google.appengine.ext.appstats import recording
    app = recording.appstats_wsgi_middleware(app)
    return app