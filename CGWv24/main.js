'use strict';

let gl;                         // The webgl context.
let surface;                    // A surface model
let shProgram;                  // A shader program
let spaceball;                  // A SimpleRotator object that lets the user rotate the view by mouse.
let userPointCoord;
let userRotAngle;

function deg2rad(angle) {
    return angle * Math.PI / 180;
}


// Constructor
function Model(name) {
    this.name = name;
    this.iVertexBuffer = gl.createBuffer();
    this.iNormalBuffer = gl.createBuffer();
    this.iTextureBuffer = gl.createBuffer();
    this.count = 0;
    this.countT = 0;

    this.BufferData = function (vertices) {

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STREAM_DRAW);

        this.count = vertices.length / 3;
    }

    this.NormalBufferData = function (normals) {

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STREAM_DRAW);

        this.count = normals.length / 3;
    }

    this.TextureBufferData = function (points) {

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTextureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STREAM_DRAW);

        this.countT = points.length / 2;
    }

    this.Draw = function () {

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.vertexAttribPointer(shProgram.iAttribNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribNormal);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTextureBuffer);
        gl.vertexAttribPointer(shProgram.iAttribTexture, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribTexture);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.count);
    }
}


// Constructor
function ShaderProgram(name, program) {

    this.name = name;
    this.prog = program;

    // Location of the attribute variable in the shader program.
    this.iAttribVertex = -1;
    this.iAttribNormal = -1;
    this.iAttribTexture = -1;
    // Location of the uniform specifying a color for the primitive.
    this.iColor = -1;
    // Location of the uniform matrix representing the combined transformation.
    this.iModelViewProjectionMatrix = -1;
    this.iNormalMatrix = -1;
    this.lightPosLoc = -1;

    this.iUserPoint = -1;
    this.irotAngle = 0;
    this.iUP = -1;

    this.iTMU = -1;

    this.Use = function () {
        gl.useProgram(this.prog);
    }
}


/* Draws a colored cube, along with a set of coordinate axes.
 * (Note that the use of the above drawPrimitive function is not an efficient
 * way to draw with WebGL.  Here, the geometry is so simple that it doesn't matter.)
 */
function draw() {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /* Set the values of the projection transformation */
    // let projection = m4.perspective(Math.PI / 8, 1, 8, 12);
    let para = 3
    let projection = m4.orthographic(-para, para, -para, para, 0, para * 4);

    /* Get the view matrix from the SimpleRotator object.*/
    let modelView = spaceball.getViewMatrix();

    let rotateToPointZero = m4.axisRotation([0.707, 0.707, 0], 0.7);
    let translateToPointZero = m4.translation(0, 0, -10);

    let matAccum0 = m4.multiply(rotateToPointZero, modelView);
    let matAccum1 = m4.multiply(translateToPointZero, matAccum0);

    /* Multiply the projection matrix times the modelview matrix to give the
       combined transformation matrix, and send that to the shader program. */
    let modelViewProjection = m4.multiply(projection, matAccum1);

    gl.uniformMatrix4fv(shProgram.iModelViewProjectionMatrix, false, modelViewProjection);

    let modelviewInv = new Float32Array(16);
    let normalmatrix = new Float32Array(16);
    mat4Invert(modelViewProjection, modelviewInv);
    mat4Transpose(modelviewInv, normalmatrix);

    gl.uniformMatrix4fv(shProgram.iNormalMatrix, false, normalmatrix);

    /* Draw the six faces of a cube, with different colors. */
    gl.uniform4fv(shProgram.iColor, [0.2, 0.8, 0, 1]);
    gl.uniform3fv(shProgram.lightPosLoc, [10 * Math.cos(Date.now() * 0.005), 1, 10 * Math.sin(Date.now() * 0.005)]);

    gl.uniform1i(shProgram.iTMU, 0);
    gl.enable(gl.TEXTURE_2D);
    gl.uniform2fv(shProgram.iUserPoint, [userPointCoord.x, userPointCoord.y]); //giving coordinates of user point
    gl.uniform1f(shProgram.irotAngle, userRotAngle);
    surface.Draw();
}
function draw_() {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /* Set the values of the projection transformation */
    // let projection = m4.perspective(Math.PI / 8, 1, 8, 12);
    let para = 3
    let projection = m4.orthographic(-para, para, -para, para, 0, para * 4);

    /* Get the view matrix from the SimpleRotator object.*/
    let modelView = spaceball.getViewMatrix();

    let rotateToPointZero = m4.axisRotation([0.707, 0.707, 0], 0.7);
    let translateToPointZero = m4.translation(0, 0, -10);

    let matAccum0 = m4.multiply(rotateToPointZero, modelView);
    let matAccum1 = m4.multiply(translateToPointZero, matAccum0);

    /* Multiply the projection matrix times the modelview matrix to give the
       combined transformation matrix, and send that to the shader program. */
    let modelViewProjection = m4.multiply(projection, matAccum1);

    gl.uniformMatrix4fv(shProgram.iModelViewProjectionMatrix, false, modelViewProjection);

    let modelviewInv = new Float32Array(16);
    let normalmatrix = new Float32Array(16);
    mat4Invert(modelViewProjection, modelviewInv);
    mat4Transpose(modelviewInv, normalmatrix);

    gl.uniformMatrix4fv(shProgram.iNormalMatrix, false, normalmatrix);

    /* Draw the six faces of a cube, with different colors. */
    gl.uniform4fv(shProgram.iColor, [0.2, 0.8, 0, 1]);
    gl.uniform3fv(shProgram.lightPosLoc, [10 * Math.cos(Date.now() * 0.001), 1, 10 * Math.sin(Date.now() * 0.001)]);
    surface.Draw();
    draw();
    // window.requestAnimationFrame(draw_)
}

function dot(a, b) {
    let c = [(a[1] * b[2] - a[2] * b[1]), (a[0] * b[2] - b[0] * a[2]), (a[0] * b[1] - a[1] * b[0])]
    return c
}
function normalize(a) {
    let d = Math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2)
    let n = [a[0] / d, a[1] / d, a[2] / d]
    return n;
}

function map(val, f1, t1, f2, t2) {
    let m;
    m = (val - f1) * (t2 - f2) / (t1 - f1) + f2
    return Math.min(Math.max(m, f2), t2);
}

function CreateTextureData() {
    let texCoordList = [];
    let i = 0;
    let j = 0;
    let b = true;
    while (i < 14.4) {
        if (b) {
            while (j < 1.5 * Math.PI) {
                let u = map(i, 0, 14.4, 0, 1);
                let v = map(j, 0, 1.5 * Math.PI, 0, 1);
                texCoordList.push(u, v);
                u = map(i + 0.1, 0, 14.4, 0, 1);
                texCoordList.push(u, v);
                u = map(i, 0, 14.4, 0, 1);
                v = map(j + 0.1, 0, 1.5 * Math.PI, 0, 1);
                texCoordList.push(u, v);
                u = map(i + 0.1, 0, 14.4, 0, 1);
                v = map(j, 0, 1.5 * Math.PI, 0, 1);
                texCoordList.push(u, v);
                u = map(i + 0.1, 0, 14.4, 0, 1);
                v = map(j + 0.1, 0, 1.5 * Math.PI, 0, 1);
                texCoordList.push(u, v);
                u = map(i, 0, 14.4, 0, 1);
                v = map(j + 0.1, 0, 1.5 * Math.PI, 0, 1);
                texCoordList.push(u, v);
                j += 0.1;
            }
            j = 1.5 * Math.PI
            
        }
        else {
            while (j > 0) {
                let u = map(i, 0, 14.4, 0, 1);
                let v = map(j, 0, 1.5 * Math.PI, 0, 1);
                texCoordList.push(u, v);
                u = map(i + 0.1, 0, 14.4, 0, 1);
                texCoordList.push(u, v);
                u = map(i, 0, 14.4, 0, 1);
                v = map(j + 0.1, 0, 1.5 * Math.PI, 0, 1);
                texCoordList.push(u, v);
                u = map(i + 0.1, 0, 14.4, 0, 1);
                v = map(j, 0, 1.5 * Math.PI, 0, 1);
                texCoordList.push(u, v);
                u = map(i + 0.1, 0, 14.4, 0, 1);
                v = map(j + 0.1, 0, 1.5 * Math.PI, 0, 1);
                texCoordList.push(u, v);
                u = map(i, 0, 14.4, 0, 1);
                v = map(j + 0.1, 0, 1.5 * Math.PI, 0, 1);
                texCoordList.push(u, v);
                j -= 0.1;
            }
            j = 0
            i += 0.1;
        }
        b = !b
    }
    return texCoordList;
}

function CreateSurfaceData(norms = false) {
    let vertexList = [];
    let normalsList = [];

    let i = 0;
    let j = 0;
    let b = true;
    while (i < 14.4) {
        if (b) {
            while (j < 1.5 * Math.PI) {
                let v1 = surfaceFun(i, j)
                let v2 = surfaceFun(i + 0.1, j)
                let v3 = surfaceFun(i, j + 0.1)
                vertexList.push(v1.x, v1.y, v1.z);
                vertexList.push(v2.x, v2.y, v2.z);
                vertexList.push(v3.x, v3.y, v3.z);
                let v4 = surfaceFun(i + 0.1, j + 0.1);
                vertexList.push(v2.x, v2.y, v2.z);
                vertexList.push(v4.x, v4.y, v4.z);
                vertexList.push(v3.x, v3.y, v3.z);
                let v21 = { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z }
                let v31 = { x: v3.x - v1.x, y: v3.y - v1.y, z: v3.z - v1.z }
                let n1 = vec3Cross(v21, v31);
                vec3Normalize(n1);
                normalsList.push(n1.x, n1.y, n1.z);
                normalsList.push(n1.x, n1.y, n1.z);
                normalsList.push(n1.x, n1.y, n1.z);
                let v42 = { x: v4.x - v2.x, y: v4.y - v2.y, z: v4.z - v2.z };
                let v32 = { x: v3.x - v2.x, y: v3.y - v2.y, z: v3.z - v2.z };
                let n2 = vec3Cross(v42, v32);
                vec3Normalize(n2);
                normalsList.push(n2.x, n2.y, n2.z);
                normalsList.push(n2.x, n2.y, n2.z);
                normalsList.push(n2.x, n2.y, n2.z);
                j += 0.1
            }
            j = 1.5 * Math.PI;
            b = !b
        }
        else {
            while (j > 0) {
                let v1 = surfaceFun(i, j)
                let v2 = surfaceFun(i - 0.1, j)
                let v3 = surfaceFun(i, j - 0.1)
                vertexList.push(v1.x, v1.y, v1.z);
                vertexList.push(v2.x, v2.y, v2.z);
                vertexList.push(v3.x, v3.y, v3.z);
                let v4 = surfaceFun(i - 0.1, j - 0.1);
                vertexList.push(v2.x, v2.y, v2.z);
                vertexList.push(v4.x, v4.y, v4.z);
                vertexList.push(v3.x, v3.y, v3.z);
                let v21 = { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z }
                let v31 = { x: v3.x - v1.x, y: v3.y - v1.y, z: v3.z - v1.z }
                let n1 = vec3Cross(v21, v31);
                vec3Normalize(n1);
                normalsList.push(n1.x, n1.y, n1.z);
                normalsList.push(n1.x, n1.y, n1.z);
                normalsList.push(n1.x, n1.y, n1.z);
                let v42 = { x: v4.x - v2.x, y: v4.y - v2.y, z: v4.z - v2.z };
                let v32 = { x: v3.x - v2.x, y: v3.y - v2.y, z: v3.z - v2.z };
                let n2 = vec3Cross(v42, v32);
                vec3Normalize(n2);
                normalsList.push(n2.x, n2.y, n2.z);
                normalsList.push(n2.x, n2.y, n2.z);
                normalsList.push(n2.x, n2.y, n2.z);
                j -= 0.1
            }
            j = 0;
            b = !b
            i += 0.1
        }

    }
    if (norms) {
        return normalsList;
    }
    return vertexList;
}

function surfaceFun(u, v) {
    let x = 0.1 * u * Math.cos(Math.cos(u)) * Math.cos(v);
    let y = 0.1 * u * Math.cos(Math.cos(u)) * Math.sin(v);
    let z = 0.1 * u * Math.sin(Math.cos(u));
    return { x: x, y: y, z: z }
}

function vec3Cross(a, b) {
    let x = a.y * b.z - b.y * a.z;
    let y = a.z * b.x - b.z * a.x;
    let z = a.x * b.y - b.x * a.y;
    return { x: x, y: y, z: z }
}

function vec3Normalize(a) {
    var mag = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
    a[0] /= mag; a[1] /= mag; a[2] /= mag;
}

/* Initialize the WebGL context. Called from init() */
function initGL() {
    let prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);

    shProgram = new ShaderProgram('Basic', prog);
    shProgram.Use();

    shProgram.iAttribVertex = gl.getAttribLocation(prog, "vertex");
    shProgram.iAttribNormal = gl.getAttribLocation(prog, "normal");
    shProgram.iAttribTexture = gl.getAttribLocation(prog, "texCoord");
    shProgram.iModelViewProjectionMatrix = gl.getUniformLocation(prog, "ModelViewProjectionMatrix");
    shProgram.iNormalMatrix = gl.getUniformLocation(prog, "NormalMatrix");
    shProgram.iColor = gl.getUniformLocation(prog, "color");
    shProgram.lightPosLoc = gl.getUniformLocation(prog, "lightPosition");
    shProgram.iTMU = gl.getUniformLocation(prog, 'tmu');
    shProgram.iUserPoint = gl.getUniformLocation(prog, 'userPoint');
    shProgram.irotAngle = gl.getUniformLocation(prog, 'rotA');
    shProgram.iUP = gl.getUniformLocation(prog, 'translateUP');

    surface = new Model('Surface');
    surface.BufferData(CreateSurfaceData());
    surface.NormalBufferData(CreateSurfaceData(1));
    LoadTexture();
    console.log(CreateSurfaceData().length)
    console.log(CreateTextureData().length)
    surface.TextureBufferData(CreateTextureData());

    gl.enable(gl.DEPTH_TEST);
}


/* Creates a program for use in the WebGL context gl, and returns the
 * identifier for that program.  If an error occurs while compiling or
 * linking the program, an exception of type Error is thrown.  The error
 * string contains the compilation or linking error.  If no error occurs,
 * the program identifier is the return value of the function.
 * The second and third parameters are strings that contain the
 * source code for the vertex shader and for the fragment shader.
 */
function createProgram(gl, vShader, fShader) {
    let vsh = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsh, vShader);
    gl.compileShader(vsh);
    if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
        throw new Error("Error in vertex shader:  " + gl.getShaderInfoLog(vsh));
    }
    let fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsh, fShader);
    gl.compileShader(fsh);
    if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
        throw new Error("Error in fragment shader:  " + gl.getShaderInfoLog(fsh));
    }
    let prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error("Link error in program:  " + gl.getProgramInfoLog(prog));
    }
    return prog;
}


/**
 * initialization function that will be called when the page has loaded
 */
function init() {
    userPointCoord = { x: 0.5, y: 0.5 }
    userRotAngle = 0.0;
    let canvas;
    try {
        let resolution = Math.min(window.innerHeight, window.innerWidth);
        canvas = document.querySelector('canvas');
        gl = canvas.getContext("webgl");
        canvas.width = resolution;
        canvas.height = resolution;
        gl.viewport(0, 0, resolution, resolution);
        if (!gl) {
            throw "Browser does not support WebGL";
        }
    }
    catch (e) {
        document.querySelector('"canvas-holder"').innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }
    try {
        initGL();  // initialize the WebGL graphics context
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not initialize the WebGL graphics context: " + e + "</p>";
        return;
    }

    spaceball = new TrackballRotator(canvas, draw, 0);

    draw();
    // window.requestAnimationFrame(draw_);
}

function mat4Transpose(a, transposed) {
    var t = 0;
    for (var i = 0; i < 4; ++i) {
        for (var j = 0; j < 4; ++j) {
            transposed[t++] = a[j * 4 + i];
        }
    }
}

function mat4Invert(m, inverse) {
    var inv = new Float32Array(16);
    inv[0] = m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[9] * m[6] * m[15] +
        m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];
    inv[4] = -m[4] * m[10] * m[15] + m[4] * m[11] * m[14] + m[8] * m[6] * m[15] -
        m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];
    inv[8] = m[4] * m[9] * m[15] - m[4] * m[11] * m[13] - m[8] * m[5] * m[15] +
        m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];
    inv[12] = -m[4] * m[9] * m[14] + m[4] * m[10] * m[13] + m[8] * m[5] * m[14] -
        m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];
    inv[1] = -m[1] * m[10] * m[15] + m[1] * m[11] * m[14] + m[9] * m[2] * m[15] -
        m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];
    inv[5] = m[0] * m[10] * m[15] - m[0] * m[11] * m[14] - m[8] * m[2] * m[15] +
        m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];
    inv[9] = -m[0] * m[9] * m[15] + m[0] * m[11] * m[13] + m[8] * m[1] * m[15] -
        m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];
    inv[13] = m[0] * m[9] * m[14] - m[0] * m[10] * m[13] - m[8] * m[1] * m[14] +
        m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];
    inv[2] = m[1] * m[6] * m[15] - m[1] * m[7] * m[14] - m[5] * m[2] * m[15] +
        m[5] * m[3] * m[14] + m[13] * m[2] * m[7] - m[13] * m[3] * m[6];
    inv[6] = -m[0] * m[6] * m[15] + m[0] * m[7] * m[14] + m[4] * m[2] * m[15] -
        m[4] * m[3] * m[14] - m[12] * m[2] * m[7] + m[12] * m[3] * m[6];
    inv[10] = m[0] * m[5] * m[15] - m[0] * m[7] * m[13] - m[4] * m[1] * m[15] +
        m[4] * m[3] * m[13] + m[12] * m[1] * m[7] - m[12] * m[3] * m[5];
    inv[14] = -m[0] * m[5] * m[14] + m[0] * m[6] * m[13] + m[4] * m[1] * m[14] -
        m[4] * m[2] * m[13] - m[12] * m[1] * m[6] + m[12] * m[2] * m[5];
    inv[3] = -m[1] * m[6] * m[11] + m[1] * m[7] * m[10] + m[5] * m[2] * m[11] -
        m[5] * m[3] * m[10] - m[9] * m[2] * m[7] + m[9] * m[3] * m[6];
    inv[7] = m[0] * m[6] * m[11] - m[0] * m[7] * m[10] - m[4] * m[2] * m[11] +
        m[4] * m[3] * m[10] + m[8] * m[2] * m[7] - m[8] * m[3] * m[6];
    inv[11] = -m[0] * m[5] * m[11] + m[0] * m[7] * m[9] + m[4] * m[1] * m[11] -
        m[4] * m[3] * m[9] - m[8] * m[1] * m[7] + m[8] * m[3] * m[5];
    inv[15] = m[0] * m[5] * m[10] - m[0] * m[6] * m[9] - m[4] * m[1] * m[10] +
        m[4] * m[2] * m[9] + m[8] * m[1] * m[6] - m[8] * m[2] * m[5];

    var det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];
    if (det == 0) return false;
    det = 1.0 / det;
    for (var i = 0; i < 16; i++) inverse[i] = inv[i] * det;
    return true;
}

function LoadTexture() {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, );

    const image = new Image();
    image.crossOrigin = 'anonymus';
    image.src = "https://raw.githubusercontent.com/romadjan/WebGL-Labs/CGW/Wave.png";
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image
        );
        draw()
    }
}

onmousemove = (e) => {
    userRotAngle = map(e.clientX, 0, window.outerWidth, 0, Math.PI * 0.5)
    draw()
};