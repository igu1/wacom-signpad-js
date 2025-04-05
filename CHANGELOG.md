# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-04-05

### Changed
- Reimplemented core signature functionality using SignaturePad library
- Updated Wacom integration to work with SignaturePad
- Improved pressure sensitivity handling
- Added support for multiple image formats (PNG, JPEG, SVG)

## [1.0.0] - 2025-04-05

### Added
- Initial project setup with Wacom SignPad integration
- `index.html`: Main HTML file with signature canvas and controls
- `style.css`: Styling for signature capture interface
- `script.js`: Core functionality with Wacom SDK integration
- `README.md`: Project documentation and usage instructions
- Basic signature capture functionality with:
  - Pressure sensitivity support for Wacom devices
  - Mouse/touch fallback
  - Clear and save functionality
  - Signature data display
