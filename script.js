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
