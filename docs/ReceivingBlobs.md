Receiving Blobs from the server
===============================

This file will specify how to receive blobs from the server by through
Socket.io events.

Blobs are sent by the server through events that contain the blob object
as the message. These blobs will conform to the BlobSpec found in BlobSpec.md.

Events
------
These events should be listened for by a client.

### newBlob
This will be sent when a new blob has been add to the world with the
specified id, and the location in the world.

### updateBlob
This will be sent whenever a blob in the world changes properties
such as location in the world.

### removeBlob
This will be sent whenever an existing blob should be removed from the world.
As it's lifetime has ended.

