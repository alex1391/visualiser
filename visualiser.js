var scene, renderer, camera;
var controls;
var spheres = [], bigSphere;
var tick = 0;

init();

function init() {
  renderer = new THREE.WebGLRenderer ( { antialias: true } );
  renderer.setSize (window.innerWidth, window.innerHeight);
  document.body.appendChild (renderer.domElement);
  scene = new THREE.Scene();
  scene.background = new THREE.Color ( 0x000000 );

  camera = new THREE.PerspectiveCamera (/*fov*/ 50 , /*aspect ratio*/ window.innerWidth/window.innerHeight, /*near*/ 0.1, /*far*/ 10000);

  controls = new THREE.OrbitControls(camera, renderer.domElement)
};

window.onload = function() {
  var file = document.getElementById("thefile");
  var audio = document.getElementById("audio");

  file.onchange = function() {
    var files = this.files;
    audio.src = URL.createObjectURL(files[0]);
    audio.load();
    audio.play();
    var context = new AudioContext();
    var src = context.createMediaElementSource(audio);
    var analyser = context.createAnalyser();

    src.connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = 512;

    var bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);

    var dataArray = new Uint8Array(bufferLength);

    for (i=0;i<bufferLength;i++) {
      var sphere = new THREE.Mesh(
        new THREE.SphereGeometry(1),
        new THREE.MeshBasicMaterial( {color: new THREE.Color("hsl("+(i/bufferLength)*360+", 100%, 50%)")} )
      )
      sphere.position.x = i - bufferLength/2
      spheres.push(sphere);
      scene.add(sphere);
    }

    var bigSphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshBasicMaterial( {color: new THREE.Color("hsl("+180+", 100%, 50%)")} )
    )
    bigSphere.position.y = -100
    scene.add(bigSphere);

    var gridXZ = new THREE.GridHelper(bufferLength, 10);
    gridXZ.setColors( new THREE.Color(0xff0000), new THREE.Color(0xffffff) );
    scene.add(gridXZ);

    camera.position.x = 200;
    camera.position.y = 200;
    camera.position.z = -200;
    camera.lookAt (new THREE.Vector3(0, 0, 0));

    function renderFrame() {
      controls.update();
      requestAnimationFrame(renderFrame);
      renderer.render (scene, camera);

      analyser.getByteFrequencyData(dataArray);

      var total = 0;

      for (var i = 0; i < bufferLength; i++) {
            spheres[i].position.y = dataArray[i];
            total += dataArray[i] * 0.4;
      }
      av = (total / bufferLength);
      bigSphere.scale.set(av, av, av);
      bigSphere.material.color.set("hsl("+(av*5)%360+", 100%, 50%)");
    };

    audio.play();
    renderFrame();
  };
};
