This project will place all of the blobs received from the dev.mirrorworlds.icat.vt.edu server
into a mongodb server (currently running on the loaclhost)


You need nodejs to run this program.

MongoDB must be running for this program to work

Details about installing MongoDB on windows can be found here:
https://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/

Once MongoDB has been downloaded it needs to be run

C:\mongodb\bin\mongod.exe


after that make sure the nodejs mongo drivier is installed by running

npm install 

then finally run this program

node BlobAggregator.js <database suffix to use>