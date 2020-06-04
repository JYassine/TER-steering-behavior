import Direction from "./Direction.js";

export default class Road {

    constructor(height, position, direction) {

        this.height = height;
        this.direction = direction;
        this.road = undefined
        this.position = position;
        this.pathPoint = []

    }


    createRoad(scene) {
        var myMaterial = new BABYLON.StandardMaterial("road", scene);
        var roadmaterialpt = new BABYLON.RoadProceduralTexture("customtext", 512, scene);
        myMaterial.diffuseTexture = roadmaterialpt;
        var road = BABYLON.MeshBuilder.CreateBox("myBox", { height: this.height, width: this.height, depth: 10 }, scene);

        switch (this.direction) {
            case Direction.BACK:
                road.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
                road.rotate(BABYLON.Axis.Y, -Math.PI / 2, BABYLON.Space.WORLD);
                break;
            case Direction.FORWARD:

                road.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
                road.rotate(BABYLON.Axis.Y, Math.PI / 2, BABYLON.Space.WORLD);
                break;
            case Direction.LEFT:

                road.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
                break;
            case Direction.RIGHT:
                road.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
                road.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.WORLD);
                break;

        }

        road.material = myMaterial;
        road.position = this.position
        this.road = road;
        return road;

    }


    createPath(lastPoint) {

        switch (this.direction) {
            case Direction.BACK:
                if (lastPoint !== undefined) {
                    for (let i = lastPoint.z; i < (this.position.z) + (this.height / 2); i += 30) {
                        this.pathPoint.push(new BABYLON.Vector3(this.position.x, this.position.y, i))
                    }
                    break;

                } else {
                    for (let i = (this.position.z) - (this.height / 2); i < (this.position.z) + (this.height / 2); i += 30) {
                        this.pathPoint.push(new BABYLON.Vector3(this.position.x, this.position.y, i))
                    }
                    break;
                }
                break;
            case Direction.FORWARD:

                if (lastPoint !== undefined) {
                    for (let i = lastPoint.z; i > (this.position.z) - (this.height / 2); i -= 30) {
                        this.pathPoint.push(new BABYLON.Vector3(this.position.x, this.position.y, i))
                    }
                    break;

                } else {
                    for (let i = (this.position.z) + (this.height / 2); i > (this.position.z) - (this.height / 2); i -= 30) {
                        this.pathPoint.push(new BABYLON.Vector3(this.position.x, this.position.y, i))
                    }
                    break;
                }
            case Direction.LEFT:

                if (lastPoint !== undefined) {
                    for (let i = lastPoint.x; i < (this.position.x) + (this.height / 2); i += 30) {
                        this.pathPoint.push(new BABYLON.Vector3(i, this.position.y, this.position.z))
                    }
                    break;

                } else {
                    for (let i = (this.position.x) - (this.height / 2); i < (this.position.x) + (this.height / 2); i += 30) {
                        this.pathPoint.push(new BABYLON.Vector3(i, this.position.y, this.position.z))
                    }
                    break;
                }
            case Direction.RIGHT:

                if (lastPoint !== undefined) {
                    for (let i = lastPoint.x; i > (this.position.x) - (this.height / 2); i -= 30) {
                        this.pathPoint.push(new BABYLON.Vector3(i, this.position.y, this.position.z))
                    }
                    break;

                } else {
                    for (let i = (this.position.x) + (this.height / 2); i > (this.position.x) - (this.height / 2); i -= 30) {
                        this.pathPoint.push(new BABYLON.Vector3(i, this.position.y, this.position.z))
                    }
                    break;
                }

        }


    }
}