import requests
import json
import copy
from time import sleep


headers = {'content-Type': 'application/json'}


def is_json(the_json):
  '''
    Returns boolean indicating whether or not the object is a
    json object or not
  '''
  try:
    json.loads(the_json)
  except (ValueError, TypeError):
    return False
  return True

def request_handler(url, payload, headers=headers):
  '''
    Initiates a request.post ensuring json payload
  '''
  if is_json(payload):
    console.log("is_json");
    return requests.post(url, data=payload, headers=headers);
  else:
    return requests.post(url, data=json.dumps(payload), headers=headers);


def test(name):
  url = 'http://localhost:3000/clusters/%s' % name
  payload = {}
  response = request_handler(url, payload)
  return response


NO_AUTH_TOKEN_ERROR = '<h1>No authorization token was found</h1>'
EXPIRED_AUTH_TOKEN_ERROR = '<h1>jwt expired</h1>'

def add_cluster():
  url = 'http://localhost:3000/login'
  response = request_handler(url=url, payload={'username':'test1', 'password':'test1'})
  token = json.loads(response.content).get('token')
  headers_with_auth = copy.copy(headers)
  headers_with_auth['Authorization'] = 'Bearer %s' % token

  url = 'http://localhost:3000/clusters'
  payload = {'name' : 'test1',
             'type' : 'type1',
             'clusterIP' : '123',
             'hostname' : 'testhostname1',
             'ipaddress' : 'testipaddress1',
             'alive' : 'testalive1'}
  response = request_handler(url=url, payload=payload, headers=headers_with_auth)

  success = (response.content.split('\n')[0] not in [NO_AUTH_TOKEN_ERROR, EXPIRED_AUTH_TOKEN_ERROR])

  if not success:
    return False
  url = 'http://localhost:3000/logout'
  response = request_handler(url=url, payload={}, headers=headers_with_auth)

  return True


def get_cluster(system_ip):
  url = 'http://localhost:3000/login'
  response = request_handler(url=url, payload={'username':'test1', 'password':'test1'})
  token = json.loads(response.content).get('token')
  headers_with_auth = copy.copy(headers)
  headers_with_auth['Authorization'] = 'Bearer %s' % token

  url = 'http://localhost:3000/get/cluster/system/%s' % (system_ip)
  response = request_handler(url=url, payload={}, headers=headers_with_auth)

  success = (response.content.split('\n')[0] not in [NO_AUTH_TOKEN_ERROR, EXPIRED_AUTH_TOKEN_ERROR])
  if not success:
    return False

  url = 'http://localhost:3000/logout'
  res = request_handler(url=url, payload={}, headers=headers_with_auth)

  print '======='
  print pretty_print(json.loads(response.content))
  print '======='

  return json.loads(response.content)


def update_system(cluster_name, system_name):
  url = 'http://localhost:3000/login'
  response = request_handler(url=url, payload={'username':'test1', 'password':'test1'})
  token = json.loads(response.content).get('token')
  headers_with_auth = copy.copy(headers)
  headers_with_auth['Authorization'] = 'Bearer %s' % token

  url = 'http://localhost:3000/clusters/%s/system/%s' % (cluster_name, system_name)
  payload = {'alive':'true'}
  response = request_handler(url=url, payload=payload, headers=headers_with_auth)

  success = (response.content.split('\n')[0] not in [NO_AUTH_TOKEN_ERROR, EXPIRED_AUTH_TOKEN_ERROR])

  if not success:
    return False
  url = 'http://localhost:3000/logout'
  response = request_handler(url=url, payload={}, headers=headers_with_auth)

  return True


def pretty_print(the_dict):
  print json.dumps(the_dict, indent=4)


def add_property(property_name, property_value):
  url = 'http://localhost:3000/login'
  response = request_handler(url=url, payload={'username':'test1', 'password':'test1'})
  token = json.loads(response.content).get('token')

  headers_with_auth = copy.copy(headers)
  headers_with_auth['Authorization'] = 'Bearer %s' % token
  url = 'http://localhost:3000/add/properties'

  response = request_handler(url=url,
                        payload={'key' : property_name, 'value' : property_value},
                        headers=headers_with_auth)

  success = (response.content.split('\n')[0] not in [NO_AUTH_TOKEN_ERROR, EXPIRED_AUTH_TOKEN_ERROR])

  if not success:
    # use utils.exception packet
    return False

  url = 'http://localhost:3000/logout'
  response = request_handler(url=url, payload={}, headers=headers_with_auth)
  # print response.content

  return True


def get_property(property_name):
  url = 'http://localhost:3000/properties/' + property_name
  res = request_handler(url=url, payload={})
  print res.content
  # value = json.loads(res.content).get('value')
  return res


def delete_property(property_name):
  url = 'http://localhost:3000/login'
  response = request_handler(url=url, payload={'username':'test1', 'password':'test1'})
  token = json.loads(response.content).get('token')

  headers_with_auth = copy.copy(headers)
  headers_with_auth['Authorization'] = 'Bearer %s' % token
  url = 'http://localhost:3000/delete/properties/%s' % property_name

  response = request_handler(url=url,
                        payload={},
                        headers=headers_with_auth)

  success = (response.content.split('\n')[0] not in [NO_AUTH_TOKEN_ERROR, EXPIRED_AUTH_TOKEN_ERROR])

  if not success:
    # use utils.exception packet
    return False

  url = 'http://localhost:3000/logout'
  response = request_handler(url=url, payload={}, headers=headers_with_auth)
  # print response.content

  return True


