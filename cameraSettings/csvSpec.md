# CSV Specification for camera configuration

The server will read from the csv in this directory to get the parameters for all of the cameras multiple times throught its running state. This will allow camera settign to be modified without the need of shutting down the server.

Having a CSV file will also reduce special code for each different building, allowing development for all bulding to take place simultaneously.

## Fields

|camera id| x             | y             | z    | width| height | theta| < Optional > function |
| ------- | ------------- | ------------- | -----| ---- | ------ | ---- | --------------------- |


## Explanation
Before coordinates can be decided a orgin and units must be set to have useful transformations of blobs to global coordinates.
The unit currently in use if feet for the settings, but blobs coordinates will be in meters after transformation.

+ camera id:   The unique identifier of this camera that will apprear on blobs sent from this camera.
+ x:           The x coordinate of the camera within the global corrdinate space.
+ y:           The y coordinate of the camera within the global coordinate space.
+ z:           The z coordinate of the camera within the global coordinate space.
+ width:       The width that the camera covers in its field of vision.
+ height:      The height (could also be interpreted as length) that the camera covers in its field of vision.
+ theta:       The angle from the origin that the camera is directed at in radians.
+ function:    This is an optional field that will manipulate the height in the physical world (y coordinate) of the blob based on the function specified of x and z;
