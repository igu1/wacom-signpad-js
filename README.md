# Wacom Signature Pad Integration JS

Professional implementation for capturing digital signatures using Wacom signature pads. This project utilizes the SignaturePad library for signature capture functionality.

#### Features:
- Pressure-sensitive signature capture with Wacom devices
- Fallback support for mouse/touch input
- PNG export functionality
- Base64 signature data representation

#### The Code Stuff:

### HTML (index.html)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Digital Signature Capture</title>
    <meta name="description" content="Professional digital signature capture with Wacom device support">
    <link rel="stylesheet" href="style.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
    <main class="signature-container">
        <header class="signature-header">
            <h1>Digital Signature Capture</h1>
            <p class="instructions">Please sign in the designated area below</p>
        </header>
        
        <section class="signature-pad">
            <canvas id="signature-canvas" aria-label="Signature area"></canvas>
        </section>

        <section class="signature-controls">
            <button id="clear-btn" class="btn btn-secondary">Clear Signature</button>
            <button id="save-btn" class="btn btn-primary">Save Signature</button>
        </section>

        <section class="signature-data">
            <h2>Signature Data</h2>
            <textarea id="signature-data" class="data-output" readonly 
                     aria-label="Signature data in base64 format"></textarea>
        </section>
    </main>
    
    <script src="script.js"></script>
</html>
```

### CSS (style.css)
```css
/* Main Styles */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f8f9fa;
    color: #333;
    line-height: 1.6;
}

.signature-container {
    max-width: 800px;
    margin: 0 auto;
    background-color: #fff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.signature-header {
    text-align: center;
    margin-bottom: 1.5rem;
}

.signature-header h1 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
}

.instructions {
    color: #7f8c8d;
    margin: 0;
}

.signature-pad {
    margin: 1.5rem 0;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
}

#signature-canvas {
    display: block;
    width: 100%;
    height: 300px;
    cursor: crosshair;
}

.signature-controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    justify-content: center;
}

.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-primary {
    background-color: #3498db;
    color: white;
}

.btn-primary:hover {
    background-color: #2980b9;
}

.btn-secondary {
    background-color: #e74c3c;
    color: white;
}

.btn-secondary:hover {
    background-color: #c0392b;
}

.signature-data {
    margin-top: 1.5rem;
}

.signature-data h2 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: #2c3e50;
}

.data-output {
    width: 100%;
    height: 120px;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: monospace;
    resize: none;
    background-color: #f8f9fa;
}
```

### JavaScript (script.js)
```javascript
$(document).ready(function() {
    // Load SignaturePad library dynamically
    const signaturePadScript = document.createElement('script');
    signaturePadScript.src = 'https://cdn.jsdelivr.net/npm/signature_pad@4.1.5/dist/signature_pad.umd.min.js';
    signaturePadScript.onload = initializeSignaturePad;
    document.head.appendChild(signaturePadScript);

    // DOM elements
    const canvas = document.getElementById('signature-canvas');
    const signatureData = $('#signature-data');
    let signaturePad;

    // Configuration
    const config = {
        minWidth: 0.5,
        maxWidth: 2.5, 
        penColor: '#000000',
        onEnd: updateSignatureData
    };

    /**
     * Initialize SignaturePad with configuration
     */
    function initializeSignaturePad() {
        signaturePad = new SignaturePad(canvas, config);
        setupCanvasResizing();
        initializeWacomIntegration();
        bindEventHandlers();
    }

    /**
     * Handle canvas resizing for different screen densities
     */
    function setupCanvasResizing() {
        function resizeCanvas() {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext('2d').scale(ratio, ratio);
            signaturePad.clear();
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }

    /**
     * Initialize Wacom device integration if available
     */
    function initializeWacomIntegration() {
        const wacomScript = document.createElement('script');
        wacomScript.src = 'https://cdn.wacom.com/sdk/wacom-1.0.js';
        wacomScript.onload = () => {
            if (typeof Wacom !== 'undefined') {
                const wacom = new Wacom();
                wacom.init(canvas);
                
                canvas.addEventListener('wacom.pointer', (e) => {
                    if (e.pointerType === 'pen') {
                        signaturePad.minWidth = e.pressure * 0.5;
                        signaturePad.maxWidth = e.pressure * 2.5;
                    }
                });
            }
        };
        wacomScript.onerror = () => console.warn('Wacom SDK failed to load');
        document.head.appendChild(wacomScript);
        console.log('Wacom integration initialized');
    }

    /**
     * Bind DOM event handlers
     */
    function bindEventHandlers() {
        $('#clear-btn').on('click', () => {
            signaturePad.clear();
            signatureData.val('');
            console.log('Signature cleared');
        });

        $('#save-btn').on('click', () => {
            saveSignatureAsPNG();
            updateSignatureData();
            console.log('Signature saved');
        });
    }

    /**
     * Export signature as PNG file
     */
    function saveSignatureAsPNG() {
        if (signaturePad.isEmpty()) return;
        
        const dataURL = signaturePad.toDataURL('image/png');
        const blob = dataURLtoBlob(dataURL);
        const url = URL.createObjectURL(blob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `signature_${new Date().toISOString().slice(0,10)}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        }, 100);
    }

    /**
     * Convert Data URL to Blob object
     * @param {string} dataURL - The Data URL to convert
     * @returns {Blob} - The resulting Blob object
     */
    function dataURLtoBlob(dataURL) {
        const parts = dataURL.split(',');
        const mime = parts[0].match(/:(.*?);/)[1];
        const decoded = atob(parts[1]);
        const u8arr = new Uint8Array(decoded.length);
        
        for (let i = 0; i < decoded.length; i++) {
            u8arr[i] = decoded.charCodeAt(i);
        }
        
        return new Blob([u8arr], { type: mime });
    }

    /**
     * Update signature data display
     */
    function updateSignatureData() {
        signatureData.val(signaturePad.isEmpty() ? '' : signaturePad.toDataURL());
    }
});
```

### Getting Started
```bash
# Clone the repository
git clone https://github.com/yourusername/wacom-signpad-integration-js.git
cd wacom-signpad-integration-js
```

### How to Use

1. **Setup**:
   - Put all files in same folder
   - Open index.html in browser (duh)

2. **With Wacom**:
   - Plug in your fancy pen tablet
   - Scribble your name
   - Hit save to get PNG

3. **Without Wacom**:
   - Use your mouse
   - It still works (kinda)
