let pane;
let params = {
  // Global settings
  mode: 'wave', // 'wave' or 'static'
  gradient1: '#ff6496',
  gradient2: '#3296ff',
  
  // Wave mode settings
  wave: {
    patternDensity: 50,
    bandSpacing: 2,
    contrast: 1.2,
    waveFrequency: 0.015,
    waveAmplitude: 30,
    noiseLevel: 0.4,
    animationSpeed: 0.008,
    reverseWave: false,
    upperFade: {
      enabled: true,
      distance: 80,
      amount: 0.9,
      frequency: 0.025,
      reverse: false
    },
    lowerFade: {
      enabled: true,
      distance: 80,
      amount: 0.9,
      frequency: 0.025,
      reverse: false
    }
  },
  
  // Static mode settings
  static: {
    lineCount: 80,
    lineThickness: 2,
    lineSpacing: 1,
    contrast: 1.0,
    noiseLevel: 0.02,
    upperFade: {
      enabled: false,
      distance: 100,
      amount: 0.8
    },
    lowerFade: {
      enabled: false,
      distance: 100,
      amount: 0.8
    }
  }
};

let time = 0;
let canvas;

function setup() {
  canvas = createCanvas(800, 600);
  canvas.parent('canvas-container');
  
  colorMode(RGB, 255);
  noStroke();
  
  setupUI();
}

function draw() {
  background(20);
  
  if (params.mode === 'wave') {
    drawWaveGradient();
    time += params.wave.animationSpeed;
  } else {
    drawStaticGradient();
  }
}

function drawWaveGradient() {
  background(20);
  
  // Calculate band height based on pattern density
  let totalBands = params.wave.patternDensity;
  let bandHeight = max(1, floor((height - params.wave.bandSpacing * (totalBands - 1)) / totalBands));
  
  for (let i = 0; i < totalBands; i++) {
    let bandY = i * (bandHeight + params.wave.bandSpacing);
    
    // Skip if band is outside canvas
    if (bandY >= height) break;
    
    // Calculate gradient progress for this band
    let gradientProgress = i / (totalBands - 1);
    
    // Convert hex colors to RGB and interpolate
    let color1 = hexToRgb(params.gradient1);
    let color2 = hexToRgb(params.gradient2);
    
    let r = lerp(color1.r, color2.r, gradientProgress);
    let g = lerp(color1.g, color2.g, gradientProgress);
    let b = lerp(color1.b, color2.b, gradientProgress);
    
    // Apply contrast
    r = constrain((r - 128) * params.wave.contrast + 128, 0, 255);
    g = constrain((g - 128) * params.wave.contrast + 128, 0, 255);
    b = constrain((b - 128) * params.wave.contrast + 128, 0, 255);
    
    // Draw the band with wave modulation
    drawWaveBand(bandY, bandHeight, r, g, b, i);
  }
}

function drawWaveBand(startY, bandHeight, r, g, b, bandIndex) {
  noStroke();
  
  // Sample points across the width for wave effect
  let resolution = 2; // Lower = smoother, higher = more performant
  
  for (let x = 0; x < width; x += resolution) {
    // Wave direction multiplier
    let waveDir = params.wave.reverseWave ? -1 : 1;
    
    // Calculate wave offset for this x position
    let waveOffset = sin(x * params.wave.waveFrequency + time * waveDir) * params.wave.waveAmplitude;
    
    // Add Perlin noise for organic texture
    let noiseOffset = (noise(x * 0.008, bandIndex * 0.1, time * 0.3) - 0.5) * params.wave.noiseLevel * params.wave.waveAmplitude;
    
    // Combine offsets
    let totalOffset = waveOffset + noiseOffset;
    let adjustedY = startY + totalOffset;
    
    // Calculate fade effects
    let fadeMultiplier = 1.0;
    let centerY = adjustedY + bandHeight / 2;
    
    // Upper fade
    if (params.wave.upperFade.enabled && centerY < params.wave.upperFade.distance) {
      let fadeProg = centerY / params.wave.upperFade.distance;
      let fadeWave = sin(x * params.wave.upperFade.frequency + time) * 0.2 + 0.8;
      fadeMultiplier *= params.wave.upperFade.reverse ? 
        (1 - fadeProg * params.wave.upperFade.amount * fadeWave) :
        (fadeProg * fadeWave);
    }
    
    // Lower fade
    if (params.wave.lowerFade.enabled && centerY > height - params.wave.lowerFade.distance) {
      let fadeProg = (height - centerY) / params.wave.lowerFade.distance;
      let fadeWave = sin(x * params.wave.lowerFade.frequency + time) * 0.2 + 0.8;
      fadeMultiplier *= params.wave.lowerFade.reverse ?
        (1 - fadeProg * params.wave.lowerFade.amount * fadeWave) :
        (fadeProg * fadeWave);
    }
    
    // Apply fade to colors
    let finalR = r * fadeMultiplier;
    let finalG = g * fadeMultiplier;
    let finalB = b * fadeMultiplier;
    
    // Set fill color and draw rectangle segment
    fill(finalR, finalG, finalB);
    rect(x, adjustedY, resolution, bandHeight);
  }
}

function drawStaticGradient() {
  background(20);
  
  // Calculate line dimensions like in the reference image
  let totalLines = params.static.lineCount;
  let lineThickness = params.static.lineThickness;
  let lineSpacing = params.static.lineSpacing;
  let totalHeight = totalLines * (lineThickness + lineSpacing) - lineSpacing;
  
  // Center the lines vertically if they don't fill the entire height
  let startY = (height - totalHeight) / 2;
  if (startY < 0) startY = 0;
  
  // Convert hex colors to RGB
  let color1 = hexToRgb(params.gradient1);
  let color2 = hexToRgb(params.gradient2);
  
  noStroke();
  
  for (let i = 0; i < totalLines; i++) {
    let lineY = startY + i * (lineThickness + lineSpacing);
    
    // Skip if line is outside canvas
    if (lineY + lineThickness > height) break;
    
    // Calculate gradient progress for this line
    let gradientProgress = i / (totalLines - 1);
    gradientProgress = constrain(gradientProgress, 0, 1);
    
    // Interpolate between gradient colors
    let r = lerp(color1.r, color2.r, gradientProgress);
    let g = lerp(color1.g, color2.g, gradientProgress);
    let b = lerp(color1.b, color2.b, gradientProgress);
    
    // Apply contrast
    r = constrain((r - 128) * params.static.contrast + 128, 0, 255);
    g = constrain((g - 128) * params.static.contrast + 128, 0, 255);
    b = constrain((b - 128) * params.static.contrast + 128, 0, 255);
    
    // Add subtle noise if enabled
    if (params.static.noiseLevel > 0) {
      let noiseValue = (noise(i * 0.1, 100) - 0.5) * params.static.noiseLevel * 20;
      r = constrain(r + noiseValue, 0, 255);
      g = constrain(g + noiseValue, 0, 255);
      b = constrain(b + noiseValue, 0, 255);
    }
    
    // Calculate fade effects
    let fadeMultiplier = 1.0;
    let lineCenterY = lineY + lineThickness / 2;
    
    // Upper fade
    if (params.static.upperFade.enabled && lineCenterY < params.static.upperFade.distance) {
      let fadeProg = lineCenterY / params.static.upperFade.distance;
      fadeMultiplier *= fadeProg * (1 - params.static.upperFade.amount) + params.static.upperFade.amount;
    }
    
    // Lower fade
    if (params.static.lowerFade.enabled && lineCenterY > height - params.static.lowerFade.distance) {
      let fadeProg = (height - lineCenterY) / params.static.lowerFade.distance;
      fadeMultiplier *= fadeProg * (1 - params.static.lowerFade.amount) + params.static.lowerFade.amount;
    }
    
    // Apply fade to colors
    r *= fadeMultiplier;
    g *= fadeMultiplier;
    b *= fadeMultiplier;
    
    // Draw the horizontal line
    fill(r, g, b);
    rect(0, lineY, width, lineThickness);
  }
}

function setupUI() {
  // Check if Tweakpane is loaded
  if (typeof Tweakpane === 'undefined') {
    console.error('Tweakpane not loaded');
    return;
  }

  pane = new Tweakpane.Pane({
    container: document.getElementById('controls'),
    title: 'Controls'
  });
  
  // Mode selector
  const modeFolder = pane.addFolder({ title: 'Mode' });
  modeFolder.addInput(params, 'mode', {
    label: 'Style',
    options: {
      'Wave Animation': 'wave',
      'Static Layers': 'static'
    }
  }).on('change', () => {
    refreshUI();
  });
  
  // Gradient colors (always visible)
  const gradientFolder = pane.addFolder({ title: 'Gradient Colors' });
  gradientFolder.addInput(params, 'gradient1', { 
    label: 'Top Color'
  });
  gradientFolder.addInput(params, 'gradient2', { 
    label: 'Bottom Color'
  });
  
  refreshUI();
  
  // Save button
  document.getElementById('save-btn').addEventListener('click', saveGradient);
}

function refreshUI() {
  // Remove existing mode-specific folders
  if (pane) {
    // Clear existing folders except Mode and Gradient Colors
    const folders = pane.children.filter(child => child.title && 
      !['Mode', 'Gradient Colors'].includes(child.title));
    folders.forEach(folder => pane.remove(folder));
  }
  
  if (params.mode === 'wave') {
    setupWaveControls();
  } else {
    setupStaticControls();
  }
}

function setupWaveControls() {
  // Pattern controls
  const patternFolder = pane.addFolder({ title: 'Wave Pattern' });
  patternFolder.addInput(params.wave, 'patternDensity', { 
    label: 'Band Count', 
    min: 5, 
    max: 150, 
    step: 1 
  });
  patternFolder.addInput(params.wave, 'bandSpacing', { 
    label: 'Band Spacing', 
    min: 0, 
    max: 10, 
    step: 1 
  });
  patternFolder.addInput(params.wave, 'contrast', { 
    label: 'Contrast', 
    min: 0.1, 
    max: 3.0, 
    step: 0.1 
  });
  
  // Wave controls
  const waveFolder = pane.addFolder({ title: 'Wave Animation' });
  waveFolder.addInput(params.wave, 'waveFrequency', { 
    label: 'Wave Frequency', 
    min: 0.001, 
    max: 0.05, 
    step: 0.001 
  });
  waveFolder.addInput(params.wave, 'waveAmplitude', { 
    label: 'Wave Amplitude', 
    min: 0, 
    max: 80, 
    step: 1 
  });
  waveFolder.addInput(params.wave, 'reverseWave', { 
    label: 'Reverse Direction' 
  });
  waveFolder.addInput(params.wave, 'noiseLevel', { 
    label: 'Noise Level', 
    min: 0, 
    max: 1, 
    step: 0.05 
  });
  waveFolder.addInput(params.wave, 'animationSpeed', { 
    label: 'Animation Speed', 
    min: 0, 
    max: 0.02, 
    step: 0.001 
  });
  
  // Upper fade
  const upperFadeFolder = pane.addFolder({ title: 'Upper Fade' });
  upperFadeFolder.addInput(params.wave.upperFade, 'enabled', { label: 'Enable' });
  upperFadeFolder.addInput(params.wave.upperFade, 'distance', { 
    label: 'Distance', 
    min: 0, 
    max: 200, 
    step: 1 
  });
  upperFadeFolder.addInput(params.wave.upperFade, 'amount', { 
    label: 'Amount', 
    min: 0, 
    max: 1, 
    step: 0.05 
  });
  upperFadeFolder.addInput(params.wave.upperFade, 'frequency', { 
    label: 'Frequency', 
    min: 0.001, 
    max: 0.1, 
    step: 0.001 
  });
  upperFadeFolder.addInput(params.wave.upperFade, 'reverse', { label: 'Reverse' });
  
  // Lower fade
  const lowerFadeFolder = pane.addFolder({ title: 'Lower Fade' });
  lowerFadeFolder.addInput(params.wave.lowerFade, 'enabled', { label: 'Enable' });
  lowerFadeFolder.addInput(params.wave.lowerFade, 'distance', { 
    label: 'Distance', 
    min: 0, 
    max: 200, 
    step: 1 
  });
  lowerFadeFolder.addInput(params.wave.lowerFade, 'amount', { 
    label: 'Amount', 
    min: 0, 
    max: 1, 
    step: 0.05 
  });
  lowerFadeFolder.addInput(params.wave.lowerFade, 'frequency', { 
    label: 'Frequency', 
    min: 0.001, 
    max: 0.1, 
    step: 0.001 
  });
  lowerFadeFolder.addInput(params.wave.lowerFade, 'reverse', { label: 'Reverse' });
}

function setupStaticControls() {
  // Static pattern controls
  const staticFolder = pane.addFolder({ title: 'Horizontal Lines' });
  staticFolder.addInput(params.static, 'lineCount', { 
    label: 'Line Count', 
    min: 10, 
    max: 200, 
    step: 1 
  });
  staticFolder.addInput(params.static, 'lineThickness', { 
    label: 'Line Thickness', 
    min: 1, 
    max: 10, 
    step: 1 
  });
  staticFolder.addInput(params.static, 'lineSpacing', { 
    label: 'Line Spacing', 
    min: 0, 
    max: 10, 
    step: 1 
  });
  staticFolder.addInput(params.static, 'contrast', { 
    label: 'Contrast', 
    min: 0.1, 
    max: 3.0, 
    step: 0.1 
  });
  staticFolder.addInput(params.static, 'noiseLevel', { 
    label: 'Noise Level', 
    min: 0, 
    max: 0.3, 
    step: 0.01 
  });
  
  // Upper fade
  const upperFadeFolder = pane.addFolder({ title: 'Upper Fade' });
  upperFadeFolder.addInput(params.static.upperFade, 'enabled', { label: 'Enable' });
  upperFadeFolder.addInput(params.static.upperFade, 'distance', { 
    label: 'Distance', 
    min: 0, 
    max: 200, 
    step: 1 
  });
  upperFadeFolder.addInput(params.static.upperFade, 'amount', { 
    label: 'Amount', 
    min: 0, 
    max: 1, 
    step: 0.05 
  });
  
  // Lower fade
  const lowerFadeFolder = pane.addFolder({ title: 'Lower Fade' });
  lowerFadeFolder.addInput(params.static.lowerFade, 'enabled', { label: 'Enable' });
  lowerFadeFolder.addInput(params.static.lowerFade, 'distance', { 
    label: 'Distance', 
    min: 0, 
    max: 200, 
    step: 1 
  });
  lowerFadeFolder.addInput(params.static.lowerFade, 'amount', { 
    label: 'Amount', 
    min: 0, 
    max: 1, 
    step: 0.05 
  });
}

function hexToRgb(hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
}

function saveGradient() {
  saveCanvas(canvas, 'threshold-gradient', 'png');
}

// Make canvas responsive
function windowResized() {
  let container = document.getElementById('canvas-container');
  let maxWidth = container.offsetWidth - 40;
  let maxHeight = container.offsetHeight - 40;
  
  let aspectRatio = 800 / 600;
  let newWidth, newHeight;
  
  if (maxWidth / aspectRatio <= maxHeight) {
    newWidth = maxWidth;
    newHeight = maxWidth / aspectRatio;
  } else {
    newWidth = maxHeight * aspectRatio;
    newHeight = maxHeight;
  }
  
  resizeCanvas(newWidth, newHeight);
}