# ConfigServer

A web application to help manage clusters and properties of a distributed system.

## Cluster/System Endpoints

- /clusters
  + GET request returns the list of clusters as JSON
  ```` javascript
    {
      "_id":"55ad0b204bbff1497a78d33b",
      "name":"cluster1",
      "type":"type1",
      "__v":0,
      "systems":[],
      "manager":{
                  "alive":true,
                  "ipaddress":"ipaddress",
                  "hostname":"hostname"
                }
    }
  ````

  +POST request will edit the cluster with the same name or create one if it doesn't exist.
  + Requires header of form:
  ```` javascript
  {"Authorization" : "Bearer [AUTH_TOKEN_VALUE]"}
  ````
  +Expects JSON
  ```` javascript
      {
      "name":"cluster1",
      "type":"type1",
      "manager":{
                  "alive":true,
                  "ipaddress":"ipaddress",
                  "hostname":"hostname"
                }
      }
  ````

- /clusters/:id
  + PUT request to edit a cluster found by the mongoDB id field
  + Requires header of form:
  ```` javascript
  {"Authorization" : "Bearer [AUTH_TOKEN_VALUE]"}
  ````
  + Expects JSON
  ```` javascript
    {
      "name":"cluster1",
      "type":"type1",
      "manager":{
                  "alive":true,
                  "ipaddress":"ipaddress",
                  "hostname":"hostname"
                }
    }
  ````


- /clusters/:cluster_name
  + DELETE request to delete a cluster by name
  + Requires header of form:
  ```` javascript
  {"Authorization" : "Bearer [AUTH_TOKEN_VALUE]"}
  ````

  + POST request to return a single cluster found by name

- /get/cluster/system/:system_ip
  + POST request to return a single cluster found by the IP of a system in it

- /clusters/:cluster_name/system
  + POST request to create a system for a cluster identified by name
  + Requires header of form:
  ```` javascript
  {"Authorization" : "Bearer [AUTH_TOKEN_VALUE]"}
  ````
  + Expects JSON
  ```` javascript
    {
      "hostname" : "name1",
      "ipaddress" : "ip1",
      "alive" : true
    }
  ````

- /clusters/:cluster_name/system/:system_hostname
  +  GET request returns the system from specified cluster with that hostname

  + POST request edits a system with that hostname
  + Requires header of form:
  ```` javascript
  {"Authorization" : "Bearer [AUTH_TOKEN_VALUE]"}
  ````
  + Expects JSON
  ```` javascript
    {
      "hostname" : "name1",
      "ipaddress" : "ip1",
      "alive" : true
    }
  ````


- /heartbeat/system/:system_ip
  + POST request to update total & available memory, hard disk space,
  low resources and alive of a system
  + Requires header of form:
  ```` javascript
  {"Authorization" : "Bearer [AUTH_TOKEN_VALUE]"}
  ````
  + Expects JSON
  ```` javascript
    {
       "avail_disk_space": "43.8 GB",
       "avail_mem": "32.4 GB",
       "total_disk_space": "76.7 GB",
       "low_resources": true,
       "total_mem": "33.7 GB",
       "system": "manager3"
    }
  ````

- /clusters/:cluster_name/system/:systemId
  + DELETE request to delete a system specified by the mongoDB id from a cluster.
  + Requires header of form:
  ```` javascript
  {"Authorization" : "Bearer [AUTH_TOKEN_VALUE]"}
  ````

## Properties Endpoints

- /properties
  + GET request returns a list of properties as JSON
  ```` javascript
    [{
        "_id":"55ad06f54bbff1497a78d338",
        "key":"a2",
        "value":"b",
        "__v":0}
      },
      {
        "_id":"55ad06f74bbff1497a78d339",
        "key":"c",
        "value":"d",
        "__v":0
      }]
  ````


- /properties/:key
  + POST request returns the property with matching key as JSON
  ```` javascript
    {
      "_id":"55ad06f54bbff1497a78d338",
      "key":"a2",
      "value":"b",
      "__v":0}
    }
  ````

- /edit/properties/:id
  + PUT request edits the property with matching id
  + Requires header of form:
  ```` javascript
  {"Authorization" : "Bearer [AUTH_TOKEN_VALUE]"}
  ````
  + Expects JSON
  ```` javascript
    {
      "key":"testkey1",
      "value":"testvalue1"
    }
  ````

- /add/properties
  + POST request. Creates a property, edits value if key already exists
  + Requires header of form:
  ```` javascript
  {"Authorization" : "Bearer [AUTH_TOKEN_VALUE]"}
  ````
  + Expects JSON
  ```` javscript
    {
      "key":"testkey1",
      "value":"testvalue1"
    }
  ````

- /delete/properties/:key
  + DELETE request. Deletes the property with matching key
  + Requires header of form:
  ```` javascript
  {"Authorization" : "Bearer [AUTH_TOKEN_VALUE]"}
  ````


## Auth Endpoints

- /register
  + POST request.
  + Requires header of form:
  ```` javascript
  {"Authorization" : "Bearer [AUTH_TOKEN_VALUE]"}
  ````
  + Expects JSON
  ```` javascript
    {
      "username":"test1",
      "password":"test1"
    }
  ````
  Returns auth token as JSON
  ```` javascript
    {"token" : "GENERATED_TOKEN_HERE"}
  ````


- /login
  + POST request. Returns auth token as JSON
  ```` javascript
    {"token" : "GENERATED_TOKEN_HERE"}
  ````
  + Expects JSON
  ```` javascript
    {
      "username":"test1",
      "password":"test1"
    }
  ````

- /logout
  + POST request. Destroys user's session.
