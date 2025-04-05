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
<html>
<head>
    <title>Sign Here Plz</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
    <div class="wrapper">
        <h1>Put Yo Signature Here</h1>
        
        <div class="sign-box">
            <canvas id="sign-area"></canvas>
        </div>

        <div class="buttons">
            <button id="clear">Clear</button>
            <button id="save">Save</button>
        </div>

        <div class="data-box">
            <h3>Signature Data Thing:</h3>
            <textarea id="sig-data" readonly></textarea>
        </div>
    </div>
    
    <script src="script.js"></script>
</body>
</html>
```

### CSS (style.css)
```css
/* probly should use a reset but whatever */
body {
    font-family: Arial, Helvetica, sans-serif;
    background: #eee;
    padding: 20px;
}

.wrapper {
    width: 90%;
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

#sign-area {
    border: 1px solid #ccc;
    background: white;
    width: 100%;
    height: 300px;
}

.buttons {
    margin: 15px 0;
}

button {
    padding: 8px 15px;
    margin-right: 10px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
}

#clear {
    background: #ff6b6b;
    color: white;
}

#save {
    background: #4CAF50;
    color: white;
}

#sig-data {
    width: 100%;
    height: 100px;
    padding: 8px;
    border: 1px solid #ddd;
    font-family: monospace;
}
```

### JavaScript (script.js)
```javascript
// Main script - hope this works lol
$(function() {
    // Load the sig pad thing
    var sigPadScript = document.createElement('script');
    sigPadScript.src = 'https://cdn.jsdelivr.net/npm/signature_pad@4.1.5/dist/signature_pad.umd.min.js';
    sigPadScript.onload = setupSigPad;
    document.head.appendChild(sigPadScript);

    var canvas = document.getElementById('sign-area');
    var sigData = $('#sig-data');
    var signaturePad;

    function setupSigPad() {
        signaturePad = new SignaturePad(canvas, {
            minWidth: 0.5,
            maxWidth: 2.5,
            penColor: 'black'
        });

        // Make it look ok on different screens
        function fixSize() {
            var ratio = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext('2d').scale(ratio, ratio);
            signaturePad.clear();
        }

        window.addEventListener('resize', fixSize);
        fixSize();

        // Try to load wacom stuff
        loadWacom();

        $('#clear').click(function() {
            signaturePad.clear();
            sigData.val('');
        });

        $('#save').click(function() {
            saveSig();
            showData();
        });
    }

    function loadWacom() {
        var wacomScript = document.createElement('script');
        wacomScript.src = 'https://cdn.wacom.com/sdk/wacom-1.0.js';
        wacomScript.onload = function() {
            if (typeof Wacom !== 'undefined') {
                var wacom = new Wacom();
                wacom.init(canvas);
                
                canvas.addEventListener('wacom.pointer', function(e) {
                    if (e.pointerType === 'pen') {
                        signaturePad.minWidth = e.pressure * 0.5;
                        signaturePad.maxWidth = e.pressure * 2.5;
                    }
                });
            }
        };
        wacomScript.onerror = function() {
            console.log('No wacom stuff loaded');
        };
        document.head.appendChild(wacomScript);
    }

    function saveSig() {
        if (!signaturePad.isEmpty()) {
            var data = signaturePad.toDataURL('image/png');
            var blob = dataToBlob(data);
            var url = URL.createObjectURL(blob);
            var link = document.createElement('a');
            link.href = url;
            link.download = 'signature.png';
            document.body.appendChild(link);
            link.click();
            setTimeout(function() {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
        }
    }

    function dataToBlob(dataURL) {
        var parts = dataURL.split(',');
        var type = parts[0].match(/:(.*?);/)[1];
        var decoded = atob(parts[1]);
        var u8 = new Uint8Array(decoded.length);
        for (var i = 0; i < decoded.length; ++i) {
            u8[i] = decoded.charCodeAt(i);
        }
        return new Blob([u8], { type: type });
    }

    function showData() {
        if (!signaturePad.isEmpty()) {
            sigData.val(signaturePad.toDataURL());
        }
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
