Mirror Worlds Server
========

Mirror Worlds Server exists to take allow sending a receiving of blobs describing the location of an object 
for the [Mirror Worlds Project] ( https://icat.vt.edu/impact/project/mirror-worlds ) by providing an api for listening for
and sending blobs.

An example client for this server can be found under [examples]
(https://github.com/MirrorWorldsVT/server-src/tree/master/Examples/Simple_Listeners):
Features
--------

- Bidirectional communication of location data
- Transformation from local into a global coordinate system
- restart on a software crash 

Installation
------------

The mirror worlds server requires node-js to run and had additional dependencies to be installed

Install the dependencies by running:

    npm install
    
in the root directory.


Running
-------

Once the dependencies are installed the server can be run with

    startServer.sh

and stopped with

    stopServer.sh

Contribute
----------

- Issue Tracker: github.com/MirrorWorldsVT/server-src/issues
- Source Code: github.com/MirrorWorldsVT/server-src

Support
-------

If you are having issues, please let us know.
We can be contacted at: ericrw96@vt.edu or nuoma@vt.edu


More Information
----------------
For more details of the server functionality you can see the [Confluence Documentation](https://webapps.es.vt.edu/confluence/display/ICATVT/Networking)
