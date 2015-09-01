# ConfigServer
A web application to manage configuration file properties and systems on a distributed network.
Uses Mongo, Node and Express for the backend. Front end made using Angular.

## Installation
Install NodeJS and MongoDB.
```
./installMongoAndNode.sh
```
Install the remaining node dependencies: 
angularjs-scroll-glue, busboy, express, jsonwebtoken, mongoose, node-schedule, passport, passport-local, python-shell,
request, socket.io
Angular modules located and installed in ConfigServer/ConfigServer/webcontent/bower_components

## Usage
First update the configuration file for MongoDB, mongod.conf
Then start up the mongo and node servers as daemon screen sessions using
```
./runConfigServer.sh
```
View the running screens to check that this worked by using the command
```
  screen -ls
```
View the webpage on http://localhost:3001



## System Endpoints
  Note that all system endpoints require authorization. This is done by tokens.
  Thus all endpoints require header of form:
  ```` javascript
  {"Authorization" : "Bearer [AUTH_TOKEN_VALUE]"}
  ````

- /clusters
  + GET request returns the list of clusters as JSON.
  ```` javascript
    {
      "_id":"55ad0b204bbff1497a78d33b",
      "name":String,
      "type":String,
      "__v":0,
      "systems":[],
      "manager":{
                  "hostname":String,
                  "ipaddress":String,
                  "alive":Boolean,
                  "mem_percent_used": Number,
                  "disk_percent_used": Number,
                  "low_resources" Number,
                  "RAM": Number
                }
    }
  ````
  where all systems of are of the form manager is, and all clusters are returned in this

  + POST request will edit the cluster with the same name or create one if it doesn't exist.
  Expects JSON
  ```` javascript
      {
      "name":String,
      "type":String,
      "manager":{
                  "alive":Boolean,
                  "ipaddress":String,
                  "hostname":String,
                  "numCPU": Number,
                  "RAM": Number
                }
      }
  ````

- /clusters/:id
  + PUT request to edit a cluster found by the mongoDB id field
  + Expects JSON
  ```` javascript
    {
      "name":String,
      "type":String,
      "manager":{
                   "alive":Boolean,
                  "ipaddress":String,
                  "hostname":String,
                  "numCPU": Number,
                  "RAM": Number
                }
    }
  ````

- /clusters/:cluster_name
  + DELETE request to delete a cluster by name
  + POST request to return a single cluster found by name

- /get/cluster/system/:system_ip
  + POST request to return a single cluster found by the IP of a system in it

- /clusters/:cluster_name/system
  + POST request to create a system for a cluster identified by name
  + Expects JSON
  ```` javascript
    {
      "alive":Boolean,
      "ipaddress":String,
      "hostname":String,
      "numCPU": Number,
      "RAM": Number
    }
  ````

- /clusters/:cluster_name/system/:system_hostname
  +  GET request returns the system from specified cluster with that hostname

  + POST request edits a system with that hostname
  + Expects JSON
  ```` javascript
    {
      "alive":Boolean,
      "ipaddress":String,
      "hostname":String,
      "numCPU": Number,
      "RAM": Number
    }
  ````

- /heartbeat/system/:system_ip
  + POST request to update total & available memory, hard disk space,
  low resources and alive of a system.
  + Uses Socket.io to emit message that there is an update, so all listening client's
  webpage will refresh with the new data. This is necessary as this endpoint is never hit by the user
  but by a cronjob.
  + Expects JSON
  ```` javascript
    {
       "avail_disk_space": "43.8",
       "avail_mem": "32.4",
       "total_disk_space": "76.7",
       "low_resources": true,
       "total_mem": "33.7",
       "system": "manager4"
    }
  ````

- /clusters/:cluster_name/system/:systemId
  + DELETE request to delete a system specified by the mongoDB id from a cluster.


- /status/clusters
  + GET request to check if each cluster hasn't been updated in 15 minutes.
  If it hasn't, set's all of the cluster's systems to be dead.
  + Note that this endpoint is hit by a cron job every 15 minutes.
  
- /suspend/cluters/:cluster_name/system/:system_name
  + POST request to suspend to unsuspend a system. A suspended system is not included
  in returns from get requests. However, it is not deleted from the database.
  + Expects JSON
  ```` javascript
    "suspend": Boolean
  ````

## Properties Endpoints
  Note that all properties endpoints require authorization. This is done by tokens.
  Thus all endpoints require header of form:
  ```` javascript
  {"Authorization" : "Bearer [AUTH_TOKEN_VALUE]"}
  ````
- /properties
  + GET request returns a list of properties as JSON
  ```` javascript
    [{
        "_id":"55ad06f54bbff1497a78d338",
        "key":"a2",
        "value":"b",
        "description": "this is the first property",
        "__v":0}
      },
      {
        "_id":"55ad06f74bbff1497a78d339",
        "key":"c",
        "value":"d",
        "description": "this is another property",
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
      "description": "c",
      "__v":0}
    }
  ````

- /edit/properties/:id
  + PUT request edits the property with matching id
  + Expects JSON
  ```` javascript
    {
      "key":"testkey1",
      "value":"testvalue1",
      "description": "testdescription"
    }
  ````

- /add/properties
  + POST request. Creates a property, edits value if key already exists
  + Expects JSON
  ```` javascript
    {
      "key":"testkey1",
      "value":"testvalue1",
      "description": testdescription"
    }
  ````

- /delete/properties/:key
  + DELETE request. Deletes the property with matching key


## User Endpoints
- /register
  + POST request.
  + Expects JSON
  ```` javascript
    {
      "username":"test1",
      "password":"test1"
    }
  ````
  Returns auth token as JSON
  ```` javascript
    {"token" : "GENERATED_AUTH_TOKEN"}
  ````


- /login
  + POST request. Returns auth token as JSON
  ```` javascript
    {"token" : "GENERATED_AUTH_TOKEN"}
  ````
  + Expects JSON
  ```` javascript
    {
      "username":"test1",
      "password":"test1"
    }
  ````

- /logout
  + POST request. Destroys user's token.

- /deleteUser
  + POST request. Given a username, deletes that user.
  + Requires header of form:
  ```` javascript
  {"Authorization" : "Bearer [AUTH_TOKEN_VALUE]"}
  ````
  + Expects JSON
  ```` javascipt
    { 
      "username": "user1" 
    }
  ````
  
- /user
  + POST request. Given a username, returns that user's information.
  + Requires header of form:
  ```` javascript
  {"Authorization" : "Bearer [AUTH_TOKEN_VALUE]"}
  ````
  + Expects JSON
  ```` javascipt
    { 
      "username": "user1" 
    }
  ````
  + Returns JSON:
  ```` javascript
    {
      "username": "user1"
      "control_list": ["addProperty", "deleteProperty"]
    }
  ````
  
- /user/controls
  + POST request. Given a username and control, add that control to the user's control list
    Note that the control's name is unique in the list.
  + Requires header of form:
  ```` javascript
  {"Authorization" : "Bearer [AUTH_TOKEN_VALUE]"}
  ````
  + Expects JSON
  ```` javascipt
    { 
      "username": "user1",
      "control": "addProperties"
    }
  ````
  
- /delete/user/controls
  + POST request. Given a username and control, remove that control for the user's control list.
  + Requires header of form:
  ```` javascript
  {"Authorization" : "Bearer [AUTH_TOKEN_VALUE]"}
  ````
  + Expects JSON
  ```` javascipt
    { 
      "username": "user1",
      "control": "addProperties"
    }
 ````
