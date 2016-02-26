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
> -  origin < JSON Object> will hold the x, y, and z coordinates of where this blob is located.
-- x < float > the x coordinate
-- y < float > the y coordinate
-- z < float > the z coordinate
> - source < string > will somehow identify where this blob came from so certain clients can treat it differently if desired.
> - boundingBox < JSON Object > Will represent the area that the blob takes up
-- x < float > x coordinate of the top left corner
-- y < float > y coordinate of top left corner
-- width < float > width of the bounding box
-- height < float >  height of the bounding box

>**Optional Fields **
> -  orientation < JSON Object >
>-- x < float > 
>-- y < float > 
 >-- z < float >
 >-- theta  < float >
