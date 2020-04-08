
var Utilities = {


    getMagnitude(vector) {

        return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    },

    getRandom(min, max) {
        return Math.floor(Math.random() * max) + min
    },

    createText(text, color, size,scene) {
        var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 250, scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, 0, 40, "bold 36px Arial", color, "transparent", true);
        var plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
        plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
        plane.material.backFaceCulling = false;
        plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
        plane.material.diffuseTexture = dynamicTexture;
        return plane;
    }



};

export default Utilities;