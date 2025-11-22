document.addEventListener("DOMContentLoaded", () => {
  const App = {
    state: {
      aspectRatio: "4:5", // "4:5" or "1:1"
      slideCount: 2, // Start with 2
      canvas: null, // Fabric.js canvas instance
      slideWidth: 1080,
      slideHeight: 1350,
      generatedImages: [],
      scaleFactor: 1, // Current visual scale factor
      draggedImageSrc: null, // For drag & drop
      isDraggingCanvas: false,
      lastX: 0,
      lastY: 0,
    },

    elements: {
      step1Setup: document.getElementById("step-1-setup"),
      step2Editor: document.getElementById("step-2-editor"),
      step3Result: document.getElementById("step-3-result"),
      
      startUploadButton: document.getElementById("startUploadButton"),
      initialUploadInput: document.getElementById("initialUploadInput"),
      
      backToSetupButton: document.getElementById("backToSetupButton"),
      
      galleryAddButton: document.getElementById("galleryAddButton"),
      imageUploadInput: document.getElementById("imageUploadInput"),
      galleryScroll: document.getElementById("galleryScroll"),
      
      bgColorPicker: document.getElementById("bgColorPicker"),
      addSlideButton: document.getElementById("addSlideButton"),
      previewButton: document.getElementById("previewButton"),
      
      canvasWrapper: document.getElementById("canvasWrapper"),
      canvasGuides: document.getElementById("canvasGuides"),
      resultPreviewContainer: document.getElementById("resultPreviewContainer"),
      downloadZipButton: document.getElementById("downloadZipButton"),
      restartButton: document.getElementById("restartButton"),
      
      editorCanvasContainer: document.getElementById('editorCanvasContainer'),
      
      // Nav Buttons
      canvasPrevBtn: document.getElementById('canvasPrevBtn'),
      canvasNextBtn: document.getElementById('canvasNextBtn'),
      galleryPrevBtn: document.getElementById('galleryPrevBtn'),
      galleryNextBtn: document.getElementById('galleryNextBtn'),
    },

    init() {
      if (window.TossUI && window.TossUI.checkAndEscapeKakaoInApp()) return;
      
      this.bindEvents();
    },

    bindEvents() {
      // Step 1: Setup & Direct Upload
      this.elements.startUploadButton.addEventListener("click", () => {
        this.elements.initialUploadInput.click();
      });

      this.elements.initialUploadInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.initializeEditor(e.target.files);
          this.ui.goToStep(this.elements.step2Editor);
        }
      });

      // Step 2: Editor
      this.elements.backToSetupButton.addEventListener("click", () => {
        if (confirm("작업 중인 내용이 사라집니다. 처음으로 돌아가시겠습니까?")) {
          this.ui.goToStep(this.elements.step1Setup);
        }
      });

      this.elements.galleryAddButton.addEventListener("click", () => {
        this.elements.imageUploadInput.click();
      });

      this.elements.imageUploadInput.addEventListener("change", (e) => {
        this.handleImageUpload(e.target.files);
        e.target.value = ''; // Reset
      });

      this.elements.bgColorPicker.addEventListener("input", (e) => {
        if (App.state.canvas) {
          App.state.canvas.setBackgroundColor(e.target.value, App.state.canvas.renderAll.bind(App.state.canvas));
        }
      });

      this.elements.addSlideButton.addEventListener("click", () => {
        this.updateSlideCount(App.state.slideCount + 1);
        // Auto-scroll to the newly added slide
        setTimeout(() => {
          const slideScrollAmount = App.state.slideWidth * App.state.scaleFactor;
          this.elements.editorCanvasContainer.scrollBy({ left: slideScrollAmount, behavior: 'smooth' });
        }, 100);
      });

      this.elements.previewButton.addEventListener("click", () => {
        this.generateResult();
      });

      // Step 3: Result
      this.elements.downloadZipButton.addEventListener("click", () => {
        this.downloadZip();
      });

      this.elements.restartButton.addEventListener("click", () => {
        location.reload();
      });

      // Drag & Drop Events for Canvas (Adding Images)
      const canvasContainer = document.getElementById('canvasWrapper');
      
      canvasContainer.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow drop
      });

      canvasContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        if (App.state.draggedImageSrc) {
          this.addImageToCanvas(App.state.draggedImageSrc, e);
          App.state.draggedImageSrc = null;
        }
      });

      // Drag to Scroll (Panning)
      const scrollContainer = this.elements.editorCanvasContainer;
      
      scrollContainer.addEventListener('mousedown', (e) => {
        // Only trigger if clicking on background (not canvas)
        if (e.target === scrollContainer || e.target.classList.contains('scroll-area')) {
          App.state.isDraggingCanvas = true;
          App.state.lastX = e.clientX;
          App.state.lastY = e.clientY;
          scrollContainer.style.cursor = 'grabbing';
        }
      });

      window.addEventListener('mousemove', (e) => {
        if (!App.state.isDraggingCanvas) return;
        e.preventDefault();
        const deltaX = e.clientX - App.state.lastX;
        const deltaY = e.clientY - App.state.lastY;
        
        scrollContainer.scrollLeft -= deltaX;
        scrollContainer.scrollTop -= deltaY;
        
        App.state.lastX = e.clientX;
        App.state.lastY = e.clientY;
      });

      window.addEventListener('mouseup', () => {
        App.state.isDraggingCanvas = false;
        scrollContainer.style.cursor = 'grab';
      });

      // Navigation Buttons
      this.elements.canvasPrevBtn.addEventListener('click', () => {
        // Scroll by one slide width (scaled)
        const slideScrollAmount = App.state.slideWidth * App.state.scaleFactor;
        this.elements.editorCanvasContainer.scrollBy({ left: -slideScrollAmount, behavior: 'smooth' });
      });
      this.elements.canvasNextBtn.addEventListener('click', () => {
        // Scroll by one slide width (scaled)
        const slideScrollAmount = App.state.slideWidth * App.state.scaleFactor;
        this.elements.editorCanvasContainer.scrollBy({ left: slideScrollAmount, behavior: 'smooth' });
      });
      
      this.elements.galleryPrevBtn.addEventListener('click', () => {
        this.elements.galleryScroll.scrollBy({ left: -200, behavior: 'smooth' });
      });
      this.elements.galleryNextBtn.addEventListener('click', () => {
        this.elements.galleryScroll.scrollBy({ left: 200, behavior: 'smooth' });
      });
    },

    initializeEditor(initialFiles) {
      // Always use 4:5 aspect ratio
      App.state.aspectRatio = "4:5";

      // Determine initial slide count based on files (min 2)
      App.state.slideCount = 3;

      // Calculate dimensions
      this.updateDimensions();
      
      const totalWidth = App.state.slideWidth * App.state.slideCount;
      const totalHeight = App.state.slideHeight;

      // Initialize Fabric Canvas
      if (App.state.canvas) {
        App.state.canvas.dispose();
      }

      App.state.canvas = new fabric.Canvas('fabricCanvas', {
        width: totalWidth,
        height: totalHeight,
        backgroundColor: '#ffffff',
        preserveObjectStacking: true
      });

      // Set initial background color
      App.state.canvas.setBackgroundColor(this.elements.bgColorPicker.value, App.state.canvas.renderAll.bind(App.state.canvas));

      // Scale canvas to fit screen height (Horizontal scroll)
      this.fitCanvasHeight();
      window.addEventListener('resize', () => this.fitCanvasHeight());

      // Draw Guides
      this.drawGuides();

      // Clear Gallery
      const addBtn = this.elements.galleryAddButton;
      this.elements.galleryScroll.innerHTML = '';
      this.elements.galleryScroll.appendChild(addBtn);

      // Load initial images into Gallery
      if (initialFiles) {
        this.handleImageUpload(initialFiles);
      }
    },

    updateDimensions() {
      // Always 4:5
      App.state.slideHeight = 1350;
    },

    updateSlideCount(newCount) {
      if (newCount < 2) return;
      App.state.slideCount = newCount;
      
      const totalWidth = App.state.slideWidth * App.state.slideCount;
      const totalHeight = App.state.slideHeight;
      
      App.state.canvas.setDimensions({ width: totalWidth, height: totalHeight });
      this.fitCanvasHeight();
      this.drawGuides();
    },

    fitCanvasHeight() {
      if (!App.state.canvas) return;
      
      // We want the canvas to fit within the editor container height with some padding
      const containerHeight = this.elements.editorCanvasContainer.clientHeight;
      const padding = 80; // Top/Bottom padding
      const availableHeight = containerHeight - padding;
      
      // Calculate scale to fit height
      const scale = availableHeight / App.state.slideHeight;
      App.state.scaleFactor = scale;

      const totalWidth = App.state.slideWidth * App.state.slideCount;
      const totalHeight = App.state.slideHeight;

      // Apply scale using CSS transform
      const fabricContainer = document.querySelector('.canvas-container');
      if (fabricContainer) {
        // Use center-center transform origin for better centering
        fabricContainer.style.transform = `scale(${scale})`;
        fabricContainer.style.transformOrigin = 'center center';
        
        // IMPORTANT: Set the wrapper size to the SCALED dimensions
        // This ensures the scroll area knows the real visual size
        const scaledWidth = totalWidth * scale;
        const scaledHeight = totalHeight * scale;
        
        this.elements.canvasWrapper.style.width = `${scaledWidth}px`;
        this.elements.canvasWrapper.style.height = `${scaledHeight}px`;
        
        // Since we are scaling the inner content but setting fixed size on wrapper,
        // we need to make sure the inner content is centered or positioned at top-left 0,0 relative to wrapper
        // But transform-origin: center center will center it.
        // Let's try transform-origin: top left and set wrapper size exactly.
        fabricContainer.style.transformOrigin = 'top left';
        
        // Adjust Add Button height to match
        this.elements.addSlideButton.style.height = `${scaledHeight}px`;
      }
    },

    drawGuides() {
      const guidesOverlay = this.elements.canvasGuides;
      guidesOverlay.innerHTML = '';
      
      const count = App.state.slideCount;
      
      for (let i = 1; i < count; i++) {
        const guide = document.createElement('div');
        guide.style.position = 'absolute';
        guide.style.left = `${(i / count) * 100}%`;
        guide.style.top = '0';
        guide.style.bottom = '0';
        guide.style.width = '1px';
        guide.style.borderLeft = '2px dashed rgba(0, 0, 0, 0.2)';
        guide.style.zIndex = '1000';
        
        guidesOverlay.appendChild(guide);
      }
      
      // Add labels for all slides
      for (let i = 0; i < count; i++) {
        const label = document.createElement('div');
        label.textContent = i + 1;
        label.style.position = 'absolute';
        label.style.left = `${(i / count) * 100}%`;
        label.style.top = '10px';
        label.style.marginLeft = '10px';
        label.style.fontSize = '16px';
        label.style.fontWeight = 'bold';
        label.style.color = 'rgba(0,0,0,0.2)';
        label.style.pointerEvents = 'none';
        guidesOverlay.appendChild(label);
      }
    },

    handleImageUpload(files) {
      if (!files || files.length === 0) return;

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (f) => {
          this.addToGallery(f.target.result);
        };
        reader.readAsDataURL(file);
      });
    },

    addToGallery(imageSrc) {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.draggable = true;
      
      const img = document.createElement('img');
      img.src = imageSrc;
      item.appendChild(img);
      
      // Drag events
      item.addEventListener('dragstart', (e) => {
        App.state.draggedImageSrc = imageSrc;
        e.dataTransfer.effectAllowed = 'copy';
      });

      // Click to add (fallback)
      item.addEventListener('click', () => {
        this.addImageToCanvas(imageSrc);
      });

      // Insert before the add button
      this.elements.galleryScroll.insertBefore(item, this.elements.galleryAddButton);
    },

    addImageToCanvas(imageSrc, dropEvent = null) {
      fabric.Image.fromURL(imageSrc, (img) => {
        // Scale image to fit roughly one slide
        const targetSize = App.state.slideWidth * 0.9;
        const scale = targetSize / Math.max(img.width, img.height);
        
        let left, top;

        if (dropEvent) {
          // Calculate drop position relative to canvas
          const canvasRect = this.elements.canvasWrapper.getBoundingClientRect();
          const scaleFactor = App.state.scaleFactor;
          
          const clientX = dropEvent.clientX;
          const clientY = dropEvent.clientY;
          
          // Position inside the SCALED wrapper
          const relativeX = clientX - canvasRect.left;
          const relativeY = clientY - canvasRect.top;
          
          // Convert to UN-SCALED canvas coordinates
          left = relativeX / scaleFactor - (img.width * scale) / 2;
          top = relativeY / scaleFactor - (img.height * scale) / 2;
        } else {
          // Center of viewport (approx)
          // We need to find the center of the CURRENTLY VISIBLE part of the canvas
          // But for simplicity, let's just put it in the center of the first slide or the whole canvas
          left = (App.state.canvas.width - img.width * scale) / 2;
          top = (App.state.canvas.height - img.height * scale) / 2;
        }
        
        img.set({
          scaleX: scale,
          scaleY: scale,
          left: left,
          top: top,
          cornerColor: '#0070ff',
          cornerStyle: 'circle',
          borderColor: '#0070ff',
          transparentCorners: false
        });
        
        App.state.canvas.add(img);
        App.state.canvas.setActiveObject(img);
      });
    },

    async generateResult() {
      App.ui.setLoading(App.elements.previewButton, "자르는 중...");
      
      App.state.canvas.discardActiveObject();
      App.state.canvas.renderAll();

      const dataURL = App.state.canvas.toDataURL({
        format: 'png',
        multiplier: 1,
        quality: 1
      });

      const masterImage = new Image();
      masterImage.src = dataURL;
      
      masterImage.onload = () => {
        const pieces = [];
        const { slideCount, slideWidth, slideHeight } = App.state;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = slideWidth;
        tempCanvas.height = slideHeight;
        const ctx = tempCanvas.getContext('2d');

        for (let i = 0; i < slideCount; i++) {
          ctx.clearRect(0, 0, slideWidth, slideHeight);
          ctx.drawImage(
            masterImage,
            i * slideWidth, 0, slideWidth, slideHeight,
            0, 0, slideWidth, slideHeight
          );
          pieces.push(tempCanvas.toDataURL('image/png'));
        }

        App.state.generatedImages = pieces;
        this.showResult(pieces);
        App.ui.setLoading(App.elements.previewButton, "결과 확인", false);
        App.ui.goToStep(App.elements.step3Result);
      };
    },

    showResult(images) {
      const container = App.elements.resultPreviewContainer;
      container.innerHTML = '';
      
      images.forEach((src, index) => {
        const div = document.createElement('div');
        div.className = 'result-item';
        
        const img = document.createElement('img');
        img.src = src;
        
        const num = document.createElement('div');
        num.className = 'result-number';
        num.textContent = index + 1;
        
        div.appendChild(img);
        div.appendChild(num);
        container.appendChild(div);
      });
    },

    async downloadZip() {
      const { generatedImages } = App.state;
      if (generatedImages.length === 0) return;

      const btn = App.elements.downloadZipButton;
      App.ui.setLoading(btn, "압축 중...");

      try {
        const zip = new JSZip();
        generatedImages.forEach((dataUrl, i) => {
          const data = dataUrl.split(',')[1];
          zip.file(`slide_${i + 1}.png`, data, { base64: true });
        });

        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = "seamless-carousel.zip";
        link.click();
        URL.revokeObjectURL(link.href);
      } catch (err) {
        console.error(err);
        alert("다운로드 중 오류가 발생했습니다.");
      } finally {
        App.ui.setLoading(btn, "한번에 저장하기", false);
      }
    },

    ui: {
      goToStep(targetStep) {
        [
          App.elements.step1Setup,
          App.elements.step2Editor,
          App.elements.step3Result
        ].forEach(step => step.classList.remove('active'));
        targetStep.classList.add('active');
        
        if (targetStep === App.elements.step2Editor) {
          setTimeout(() => App.fitCanvasHeight(), 100);
        }
      },
      
      setLoading(btn, text, isLoading = true) {
        btn.disabled = isLoading;
        btn.textContent = text;
      }
    }
  };

  App.init();
});
