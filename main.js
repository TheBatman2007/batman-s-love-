img = "";
statusholder = "";
objects = [];

const ip = "http://192.168.4.1/"

function sto(){
    fetch(ip + "stop");
}
function rev(){
    fetch(ip + "reverse");

}
function forw(){
    fetch(ip + "forward");
}
////these all are the commands stop,reverse,forward which will be sent to the esp32 through http


const apiUrl =
      "https://api.weatherapi.com/v1/current.json?key=778f1c35dcf1445c8e4190639241712&q=Kota&aqi=no";


    async function getWeatherData() {
      try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        const data = await response.json();

        // Extract required details
        const location = data.location.name; // City name
        const region = data.location.region; // Region/State
        const country = data.location.country; // Country
        const latitude = data.location.lat; // Latitude
        const longitude = data.location.lon; // Longitude
        const temperature = data.current.temp_c; // Temperature in Celsius
        const humidity = data.current.humidity; // Humidity in percentage
        const pressure = data.current.pressure_mb; // Pressure in millibars
        const windSpeed = data.current.wind_kph; // Wind speed in km/h
        const altitude = "0 km (Pre-launch phase)"; // Placeholder for altitude

        // Combine all details
        const weatherDetails = `
          Temperature: ${temperature}°C<br>
          Humidity: ${humidity}%<br>
          Pressure: ${pressure} mb<br>
          Wind Speed: ${windSpeed} km/h<br>
          Latitude: ${latitude}°<br>
          Longitude: ${longitude}°<br>
          Altitude: ${altitude}
        `;

        // Rocket-related visualization text
        const rocketDetails = `
          🚀 Rocket Launch Status:<br>
          Launch Coordinates: Latitude ${latitude}°, Longitude ${longitude}°<br>
          Wind Speed: ${windSpeed} km/h (Optimal for liftoff)<br>
          Pressure: ${pressure} mb (Stable atmospheric pressure)<br>
          Humidity: ${humidity}% (Ideal moisture for rockets)
        `;

        // Update HTML content
        document.getElementById("weatherInfo").innerHTML = weatherDetails;
        document.getElementById("rocket-details").innerHTML = rocketDetails;

      } catch (error) {
        console.error("Error fetching weather data:", error);
        document.getElementById("weatherInfo").innerHTML = "Error fetching weather data. Please try again.";
      }
    }

    getWeatherData();

let video;
let poseNet;
let pose;
let skeleton;

let canvas
function preload(){
    getWeatherData();
}

function setup() {
    canvas = createCanvas(480, 480);
    canvas.parent('maincont');

    video = createCapture(VIDEO);
    video.hide();

    poseNet = ml5.poseNet(video, modelLoaded1);
    poseNet.on('pose', gotPoses);

    objectDetector = ml5.objectDetector("COCOSSD", modelLoaded);
}
function modelLoaded() {
    console.log("Model is loaded");
    statusholder = true;
}
function gotResults(error, results) {
    if (error) {
        console.error(error);
    }
    else {
        console.log(results);
        objects = results;
    }
}

function gotPoses(poses) {
    //console.log(poses); 
    if (poses.length > 0) {
        pose = poses[0].pose;
        skeleton = poses[0].skeleton;
    }
}


function modelLoaded1() {
    console.log('poseNet ready');
}

function draw() {
    image(video, 0, 0);

    if (pose) {
        let eyeR = pose.rightEye;
        let eyeL = pose.leftEye;
        let d = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
        fill(130, 198, 201);
        ellipse(pose.nose.x, pose.nose.y, d);
        fill(0, 0, 255);
        ellipse(pose.rightWrist.x, pose.rightWrist.y, 32);
        ellipse(pose.leftWrist.x, pose.leftWrist.y, 32);

        for (let i = 0; i < pose.keypoints.length; i++) {
            let x = pose.keypoints[i].position.x;
            let y = pose.keypoints[i].position.y;
            fill(0, 255, 0);
            ellipse(x, y, 16, 16);
        }

        for (let i = 0; i < skeleton.length; i++) {
            let a = skeleton[i][0];
            let b = skeleton[i][1];
            strokeWeight(2);
            stroke(255);
            line(a.position.x, a.position.y, b.position.x, b.position.y);
        }
    }

    if (statusholder != "") {
        r = random(255);
        g = random(255);
        b = random(255);
        objectDetector.detect(video, gotResults);
        for (i = 0; i < objects.length; i++) {
            fill(r, g, b);
            percent = floor(objects[i].confidence * 100);
            text(objects[i].label + " " + percent + "%", objects[i].x, objects[i].y);
            noFill();
            stroke(r, g, b);
            rect(objects[i].x, objects[i].y, objects[i].width, objects[i].height);
        }
    }
}