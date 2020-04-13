export default class Path{

    constructor(firstPoint,lastPoint){
        this.firstPoint=firstPoint
        this.lastPoint=lastPoint
        this.radius=100

        this.path = new BABYLON.AbstractMesh
    }


    createPath(scene,color,position){
        this.path = BABYLON.Mesh.CreateLines("path", [
            this.firstPoint,this.lastPoint
        ], scene);

        var limitPoint1 = this.firstPoint.clone().addInPlace(position)
        var limitPoint2 = this.lastPoint.clone().addInPlace(position)

        limitPoint1.z-=this.radius
        limitPoint2.z-=this.radius

        var limit1 = BABYLON.Mesh.CreateLines("path", [
            limitPoint1,limitPoint2
        ], scene);

        
        var limitPoint3 = this.firstPoint.clone().addInPlace(position)
        var limitPoint4 = this.lastPoint.clone().addInPlace(position)

        limitPoint3.z+=this.radius
        limitPoint4.z+=this.radius

        var limit2 = BABYLON.Mesh.CreateLines("path", [
            limitPoint3,limitPoint4
        ], scene);

        this.path.color = color
        this.path.position = position

    }
}