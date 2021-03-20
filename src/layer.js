import * as THREE from "three";

customElements.define("stylus-layer", class extends HTMLElement {
    constructor() {
        super();

        // Properties
        this.pointers = {};
        this.updateRequested = false;

        // Scene
        this.scene = new THREE.Scene();
        
        // Camera
        this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
        const z = (window.innerHeight / 2) / Math.tan(30 / 360 * 2 * Math.PI);
        this.camera.position.set(window.innerWidth/2, window.innerHeight/2, z);
        // this.camera = new THREE.OrthographicCamera(0,window.innerWidth,0,window.innerHeight,0.1,1000);

        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setClearColor( 0x000000, 0 );
        

        // Add canvas to DOM
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(this.renderer.domElement);

        const canvas = this.renderer.domElement;
        canvas.style.position = "absolute";
        canvas.style.zIndex = 99999;
        canvas.style.left = "0";
        canvas.style.top = "0";


        const ambient = new THREE.AmbientLight( 0xffffff, 0.5 );
        this.scene.add( ambient );

        const directionalLight = new THREE.DirectionalLight( 0xff0000, 1 );
        directionalLight.position.set( -0.1, 0.1, 1 );
        this.scene.add( directionalLight );


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
        console.log("_update");
        this.renderer.render( this.scene, this.camera );
    }
    _createObject(e) {
        // const geometry = new THREE.BoxGeometry(48, 48, 48);
        
        const STYLUS_RADIUS = 18;
        const geometry = new THREE.CylinderGeometry( STYLUS_RADIUS, STYLUS_RADIUS, 100, 32 );
        const material = new THREE.MeshPhongMaterial( { color: 0x808080, dithering: true } );
        
        const obj = new THREE.Mesh( geometry, material );
        this.scene.add( obj );

        obj.rotateX(90/360*Math.PI*2);
        
        return obj;
    }
    _setObjPosition(obj, e) {
        const w2 = window.innerHeight / 2;
        const y = w2 - (e.clientY - w2);
        obj.position.set( e.clientX, y, 50 );
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