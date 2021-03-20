import * as THREE from "three";

function deg2rad(deg) {
    return deg / 360 * Math.PI * 2;
}

customElements.define("stylus-layer", class extends HTMLElement {
    constructor() {
        super();

        // Properties
        this.pointers = {};
        this.updateRequested = false;
        this.supportsTilt = false;

        // Scene
        this.scene = new THREE.Scene();
        
        // Camera
        const FOV = 40;
        this.camera = new THREE.PerspectiveCamera( FOV, window.innerWidth / window.innerHeight, 0.1, 2000 );
        const z = (window.innerHeight / 2) / Math.tan((FOV / 2) / 360 * 2 * Math.PI);
        this.camera.position.set(window.innerWidth/2, window.innerHeight/2, z);
        // this.camera = new THREE.OrthographicCamera(0,window.innerWidth,window.innerHeight,0,0.1,1000);
        // this.camera.position.set(0, 0, 500);

        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setClearColor( 0x000000, 0 );
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Add canvas to DOM
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(this.renderer.domElement);

        const canvas = this.renderer.domElement;
        canvas.style.position = "absolute";
        canvas.style.zIndex = 99999;
        canvas.style.left = "0";
        canvas.style.top = "0";

        // Add lights
        const ambient = new THREE.AmbientLight( 0xffffff, 0.5 );
        this.scene.add( ambient );

        const directionalLight = new THREE.DirectionalLight( 0xffffff, 1, 500 );
        directionalLight.position.set( -250, 250, 500 );
        directionalLight.castShadow = true;
        directionalLight.shadow.radius = 20;
        directionalLight.shadow.mapSize.width = 2056;
        directionalLight.shadow.mapSize.height = 2056;
        directionalLight.shadow.camera.left = 0;
        directionalLight.shadow.camera.right = window.innerWidth;
        directionalLight.shadow.camera.top = window.innerHeight+200;
        directionalLight.shadow.camera.bottom = 0;
        directionalLight.shadow.camera.far = 1000;
        this.scene.add( directionalLight );
        // this.scene.add( new THREE.CameraHelper(directionalLight.shadow.camera) );

        //Create a plane that receives shadows (but does not cast them)
        const planeGeometry = new THREE.PlaneGeometry( window.innerWidth, window.innerHeight, 32, 32 );
        const planeMaterial = new THREE.ShadowMaterial();
        planeMaterial.opacity = 0.1;
        const plane = new THREE.Mesh( planeGeometry, planeMaterial );
        plane.receiveShadow = true;
        plane.position.set(window.innerWidth/2, window.innerHeight/2, 0);
        this.scene.add( plane );

        this.renderer.render( this.scene, this.camera );
    }

    connectedCallback() {
        document.addEventListener("pointerdown", (e) => this._down(e));
        document.addEventListener("pointermove", (e) => this._move(e));
        document.addEventListener("pointerup", (e) => this._up(e));
        document.addEventListener("pointercancel", (e) => this._cancel(e));

        this.style.pointerEvents = "none";
    }

    _requestUpdate() {
        if(!this.updateRequested) {
            this.updateRequested = true;
            requestAnimationFrame(() => {
                this._update();
                this.updateRequested = false;
            });
        }
    }
    _update() {
        this.renderer.render( this.scene, this.camera );
    }
    _createObject(e) {
        if(e.pointerType === "mouse") {
            return new THREE.Group();
        }
        if(e.pointerType === "touch") {
            const material = new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.2 } );
            const geometry = new THREE.SphereGeometry(24, 32, 32);
            const obj = new THREE.Mesh( geometry, material );
            this.scene.add(obj);
            return obj;
        }

        const STYLUS_RADIUS = 14;
        const STYLUS_HEIGHT = 250;
        const TIP_HEIGHT = STYLUS_RADIUS*4;

        const group = new THREE.Group();
        const material = new THREE.MeshPhongMaterial( { color: 0x808080, dithering: true } );

        const cylGeometry = new THREE.CylinderGeometry( STYLUS_RADIUS, STYLUS_RADIUS, STYLUS_HEIGHT, 32 );
        const cyl = new THREE.Mesh( cylGeometry, material );
        cyl.castShadow = true
        cyl.rotateX(deg2rad(90));
        cyl.position.set(0, 0, STYLUS_HEIGHT/2+TIP_HEIGHT);
        group.add(cyl);

        const coneGeometry = new THREE.ConeGeometry( STYLUS_RADIUS, TIP_HEIGHT, 32 );
        const cone = new THREE.Mesh( coneGeometry, material );
        cone.castShadow = true
        cone.rotateX(deg2rad(-90));
        cone.position.set(0, 0, TIP_HEIGHT/2);
        group.add(cone);

        group.rotateY(deg2rad(45));

        this.scene.add( group );
        return group;
    }
    _setObjPosition(obj, e) {
        const w2 = window.innerHeight / 2;
        const y = w2 - (e.clientY - w2);
        obj.position.set( e.clientX, y, 0 );

        // Detect tilt support
        if(e.tiltX && e.tiltY) {
           obj.rotation.y = deg2rad(e.tiltX);
           obj.rotation.x = deg2rad(e.tiltY);
        }
    }
    _down(e) {
        this.pointers[e.pointerId] = this._createObject(e);
        this._setObjPosition(this.pointers[e.pointerId], e);
        this._requestUpdate();
    }
    _move(e) {
        if(e.pointerId in this.pointers) {
            this._setObjPosition(this.pointers[e.pointerId], e);
            this._requestUpdate();
        }
    }
    _up(e) {
        this.scene.remove(this.pointers[e.pointerId]);
        delete this.pointers[e.pointerId];
        this._requestUpdate();
    }
    _cancel(e) {
        this.scene.remove(this.pointers[e.pointerId]);
        delete this.pointers[e.pointerId];
        this._requestUpdate();
    }
});
document.body.appendChild(document.createElement("stylus-layer"));