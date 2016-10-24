BLOB Specification
===================


This file will detail the blob data that is currently being expected on blobs, with some additional optional features that will be recognized by the server.

----------


JSON Fields
-------------

The fields of the JSON object are specified below

> **Fields**

> - id < int > Will identify the blob uniquely for each specific camera so that blobs can be updated correctly
> - cameraID < int > Will tell a client which camera has reported this blob. Together with the id this can uniquely identify a blob.
> -  Position < JSON Object> will hold the x, y, and z coordinates of where this blob is located.
>  - x < float > the x coordinate
>  - y < float > the y coordinate
>  - z < float > the z coordinate
> - source < string > will somehow identify where this blob came from so certain clients can treat it differently if desired.
> - boundingBox < JSON Object > Will represent the area that the blob takes up
>  - x < float > x coordinate of the top left corner
>  - y < float > y coordinate of top left corner
>  - width < float > width of the bounding box
>  - height < float >  height of the bounding box 
>  - NOTE if the blob is to be transformed the bounding box will need image_height and image_width float fields


> **Optional Fields **
> -  orientation < JSON Object >
>  - x < float > 
>  - y < float > 
>  - z < float >
>  - theta  < float >
> - makeGlobal < boolean > if false will not transform this coordinate even if its cameraID is associated with a transformation.
> - updatedTime
> - creationTime
> - age < string > used to distinguish blob types when not received from specific events such as through the TCP server.

Additional fields can be optionally added for uses by different clients as long as they do not conflict with the mandatory fields.

 


Example
-------------------

Here is an example of a JSON object with all the mandatory and some optional fields.
```json
 {
    id: 1,
    cameraID: 1,
    origin: {
        x: 2.0,
        y: 3.0,
        z: 4.0
    },
    orientation: {
        x: 1.0,
        y: 2.0,
        z: 2.0,
        theta: Math.PI
    },
    source: "blob_gen",
    boundingBox: {
        x: 4.5,
        y: 3.6,
        imageWidth: 300.0,
        imageHeight: 150.0,
        width: 5.4,
        height: 1.2
    },
    age: "LOST",
}
```
