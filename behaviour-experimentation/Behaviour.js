export default class Behaviour {

    constructor(mesh) {
        this.mesh=mesh
        this.target = undefined
        this.position = mesh.position
        this.velocity = new BABYLON.Vector3(0.2, 0, 0)
        this.acceleration = new BABYLON.Vector3(0, 0, 0)
        this.maxSpeed = 2
        this.maxForce = 0.1

    }

    facePoint (rotatingObject, pointToRotateTo) {
		// a directional vector from one object to the other one
		var direction = pointToRotateTo.subtract(rotatingObject.position);
		
		if (!rotatingObject.rotationQuaternion) {
			rotatingObject.rotationQuaternion = BABYLON.Quaternion.Identity();
		}
		
		direction.normalize();
		
		var mat = BABYLON.Matrix.Identity();
		
		var upVec = BABYLON.Vector3.Up();
		
		var xaxis = BABYLON.Vector3.Cross(direction, upVec);
		var yaxis = BABYLON.Vector3.Cross(xaxis, direction);
		
		mat.m[0] = xaxis.x;
		mat.m[1] = xaxis.y;
		mat.m[2] = xaxis.z;
		
		mat.m[4] = direction.x;
		mat.m[5] = direction.y;
		mat.m[6] = direction.z;
		
		mat.m[8] = yaxis.x;
		mat.m[9] = yaxis.y;
		mat.m[10] = yaxis.z;
		
		BABYLON.Quaternion.FromRotationMatrixToRef(mat, rotatingObject.rotationQuaternion);
		
	}

    getMesh(){
        return this.mesh
    }

    applyForce(force) {
        this.acceleration.addInPlace(force);
    }

    update() {

        this.velocity.addInPlace(this.acceleration);
        this.position.addInPlace(this.velocity);
        this.acceleration.multiplyInPlace(new BABYLON.Vector3(0, 0, 0));
        
    }


}