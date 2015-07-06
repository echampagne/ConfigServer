import requests
import json

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

def request_handler(url, payload):
  '''
    Initiates a request.post ensuring json payload
  '''
  if is_json(payload):
    console.log("is_json");
    return requests.delete(url, data=payload, headers=headers);
  else:
    return requests.delete(url, data=json.dumps(payload), headers=headers);

def test():
  url = 'http://localhost:3000/clusters/559a88d0ce3d73381cb40478/system'
  payload = {"hostname":"testdelete", 'ipaddress': 'testdelete', 'alive':'testdelete'}
  response = request_handler(url, payload)
  return response
