Sending Blobs to the Server
===========================

This file will specify how the blobs can be sent to the server using the
Socket.io events.

Blobs are sent to the server by emitting events with the blob as the message.
These events specify different blob types adhering to the BlobSpec found
in BlobSpec.md.

Events
------

### start

This event should be the first event sent. The message passed should be
a JSON object that has the type of connection. This type will either be
> - TWOWAY if we will both send and receive data
> - DATASOURCE if we will only send data
> - LISTENER if we will only receive data

The client can also identify themselves with an id optionally

An example JSON object with connectionType and optional id field will look like.

```json
  {connectionType: "TWOWAY",
    id : "example"};
```


Blob Events
-----------
These event will involve the creation, removal, and manipulation of blobs.
These blobs will adhere to the blob spec. One important thing to note with
these blobs is that they can be specified to not be transformed to global
coordinates by setting the makeGlobal field to false.

### new
This event will be sent once for each unique blob. This event signifies
the creation of that blob in the world at this specific location.
### update
This event can be sent multiple times over the lifetime of a blob, so that
the location of the blob can be updates

### remove
This event will be sent once to end the lifetime of a unique blob. This
event signifies the removal of that blob from the world. Location can or
cannot be specified to actual values in this blob, as its removal should
not have significance with its location.