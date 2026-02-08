const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'proje_cizimi.dxf');

// Helper function to create DXF pairs with Windows line endings (CRLF)
// AutoCAD is sensitive to line endings and specific group code ordering.
function pair(code, value) {
    return `${code}\r\n${value}\r\n`;
}

// Helper to draw a LINE entity
function addLine(x1, y1, x2, y2) {
    let s = "";
    s += pair(0, "LINE");
    s += pair(8, "0"); // Layer 0
    s += pair(10, x1); // Start X
    s += pair(20, y1); // Start Y
    s += pair(30, 0.0); // Start Z
    s += pair(11, x2); // End X
    s += pair(21, y2); // End Y
    s += pair(31, 0.0); // End Z
    s += pair(62, 7);  // Color White/Black
    return s;
}

// Helper to add TEXT entity
function addText(x, y, height, text, rotation = 0) {
    let s = "";
    s += pair(0, "TEXT");
    s += pair(8, "0");
    s += pair(10, x);
    s += pair(20, y);
    s += pair(30, 0.0);
    s += pair(40, height);
    s += pair(1, text);
    s += pair(50, rotation);
    s += pair(62, 3); // Color Green
    return s;
}

// --- DXF CONTENT GENERATION ---

// Header Section (Minimal R12)
let content = "";
content += pair(0, "SECTION");
content += pair(2, "HEADER");
content += pair(9, "$ACADVER");
content += pair(1, "AC1009"); // AutoCAD R11/R12
content += pair(9, "$INSUNITS");
content += pair(70, 4); // Millimeters (or 0 for unitless)
content += pair(0, "ENDSEC");

// Entities Section
content += pair(0, "SECTION");
content += pair(2, "ENTITIES");

// Geometry Logic
// U-Shape points (Counter-clockwise from 0,0)
const pts = [
    { x: 0, y: 0 },       // Bottom-Left
    { x: 700, y: 0 },     // Bottom-Right
    { x: 700, y: 500 },   // Right-Top Outer
    { x: 500, y: 500 },   // Right-Top Inner
    { x: 500, y: 200 },   // Right-Inner Bottom
    { x: 200, y: 200 },   // Left-Inner Bottom
    { x: 200, y: 500 },   // Left-Top Inner
    { x: 0, y: 500 }      // Left-Top Outer
];

// Draw Geometry Lines
for (let i = 0; i < pts.length; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % pts.length];
    content += addLine(p1.x, p1.y, p2.x, p2.y);
}

// Add Dimension Text
content += addText(350, -30, 25, "700");      // Bottom Width
content += addText(730, 250, 25, "500", 90);  // Right Height
content += addText(100, 530, 25, "200");      // Left Top
content += addText(350, 230, 25, "300");      // Inner Gap
content += addText(600, 530, 25, "200");      // Right Top
content += addText(-30, 250, 25, "500", 90);  // Left Height

// Close Entities Section
content += pair(0, "ENDSEC");

// EOF
content += pair(0, "EOF");

// Write File
try {
    fs.writeFileSync(filePath, content, { encoding: 'utf8' });
    console.log("SUCCESS: RXF R12 file created at " + filePath);
} catch (err) {
    console.error("ERROR writing file: " + err.message);
}
