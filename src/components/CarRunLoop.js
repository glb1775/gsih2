// 引入Three.js
import * as THREE from 'three';
function CarRun(car, model) {
    const arr = [];//车的轨迹坐标
    const linexyz = model.getObjectByName('轨迹坐标');
    for (let i = 0; i < linexyz.children.length; i++) {
        const v = new THREE.Vector3(0, 0, 0);
        linexyz.children[i].getWorldPosition(v);
        arr.push(v);
    }
    arr.push(arr[0]);
    arr.push(arr[1]);
    const R = 20; //圆弧半径
    // 创建组合曲线对象CurvePath
    const curve = new THREE.CurvePath();
    for (let i = 0; i < arr.length - 2; i++) {
        // 每一步生成一条直线加一条曲线
        const dir1 = arr[i + 1].clone().sub(arr[i]);
        dir1.normalize();
        const dir2 = arr[i + 2].clone().sub(arr[i + 1]);
        dir2.normalize();

        const p1 = arr[i].clone().add(dir1.clone().multiplyScalar(R));
        const p2 = arr[i + 1].clone().sub(dir1.clone().multiplyScalar(R));
        const p3 = arr[i + 1].clone().add(dir2.clone().multiplyScalar(R));


        const line = new THREE.LineCurve3(p1, p2);

        const beziercurve = new THREE.QuadraticBezierCurve3(p2, arr[i + 1], p3);

        // 把转换曲线和直线插入曲线中
        curve.curves.push(line, beziercurve);

    }
    // getPoints会带来等间距问题，getSpacedPoints不会
    // const pointsArr = curve.getPoints(5);
    const pointsArr = curve.getSpacedPoints(1500);
    // console.log('pointsArr', pointsArr);

    // 渲染函数
    let num = 0
    let L = pointsArr.length

    function loop() {
        requestAnimationFrame(loop);
        num += 1;
        if (num > L - 2) num = 0
        // 曲线位置
        const curPos = pointsArr[num];
        const nextPos = pointsArr[num + 1];

        // 设置车的位置
        car.position.set(curPos.x, curPos.y, curPos.z);
        // 转弯处，车的方向改变
        car.lookAt(nextPos.x, curPos.y, nextPos.z);
        car.target = nextPos;
    }
    loop();
}
export default CarRun;