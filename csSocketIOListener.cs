/**
 * OpenTSPS + Unity3d Extension
 * Created by James George on 11/24/2010
 * 
 * This example is distributed under The MIT License
 *
 * Copyright (c) 2010-2011 James George
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using SocketIO;

public class csSocketIOListener : MonoBehaviour {

	private Dictionary<int,GameObject> peopleCubes = new Dictionary<int,GameObject>();
	
	//game engine stuff for the example
	public Material	[] materials;
	public GameObject boundingPlane; //put the people on this plane
	public GameObject personMarker; //used to represent people moving about in our example
	private SocketIOComponent socket;

	// Use this for initialization
	void Start () {
		GameObject go = GameObject.Find("SocketIO");
		socket = go.GetComponent<SocketIOComponent>();

		Debug.Log ("Adding callbacks");
		socket.On("connect", Connect);
		socket.On("updateBlob", UpdateUser);
		socket.On("newBlob", AddUser);
		socket.On ("removeBlob", DeleteUser);

		socket.Connect ();

	}
	
	// Update is called once per frame
	void Update () {
	}

	void UpdateUser (SocketIOEvent e) {
		int id = (int)e.data.GetField("id").n;
		float x = e.data.GetField("origin").GetField("x").n;
		float y = e.data.GetField("origin").GetField("z").n;	// unity has a different coordinate system than the server: y and z are switched
		float z = e.data.GetField("origin").GetField("y").n;
		UnityEngine.Vector3 pos = new UnityEngine.Vector3 (x, y, z);
	
		if(peopleCubes.ContainsKey(id)){
			Debug.Log("Moving " + id + " to " + pos);
			GameObject cubeToMove = peopleCubes[id];
			cubeToMove.transform.position = pos;
		}
	}

	void AddUser(SocketIOEvent e) {
		int id = (int)e.data.GetField("id").n;
		Debug.Log ("Adding new user " + id);

		float x = e.data.GetField("origin").GetField("x").n;
		float y = e.data.GetField("origin").GetField("z").n; // unity has a different coordinate system than the server: y and z are switched
		float z = e.data.GetField("origin").GetField("y").n;
		UnityEngine.Vector3 pos = new UnityEngine.Vector3 (x, y, z);

		Debug.Log ("asdf1");
		GameObject personObject = 
			(GameObject)Instantiate(personMarker, pos, Quaternion.identity);
		Debug.Log (materials.Length);
		//personObject.renderer.material = materials[id % materials.Length];
		Debug.Log ("asdf2.5");
		peopleCubes.Add(id,personObject);
		Debug.Log ("asdf3");

	}

	void DeleteUser(SocketIOEvent e) {
		int id = (int)e.data.GetField("id").n;
			Debug.Log ("Deleting user " + id);
			if (peopleCubes.ContainsKey (id)) {
						Debug.Log ("Destroying cube");
						GameObject cubeToRemove = peopleCubes [id];
						peopleCubes.Remove (id);
						Destroy(cubeToRemove);
			}
	}

	void Connect(SocketIOEvent e) { 
		JSONObject connection = new JSONObject ();
		connection.AddField("connectionType", "LISTENER");
		socket.Emit ("start", connection);
		Debug.Log ("connected");
	}
}
