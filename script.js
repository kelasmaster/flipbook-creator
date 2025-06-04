// Show selected tab
function showTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.getElementById(tabId + "-tab").classList.add("active");
}

// Split text into pages
function splitTextIntoPages(text, charsPerPage = 1000) {
  const words = text.split(/\s+/);
  let pages = [];
  let page = "";

  for (let word of words) {
    if ((page + word).length > charsPerPage) {
      pages.push(page.trim());
      page = word + " ";
    } else {
      page += word + " ";
    }
  }

  if (page.length > 0) pages.push(page.trim());
  return pages;
}

// Convert user text to flipbook
function convertToFlipbook() {
  const text = document.getElementById("user-text").value;
  if (!text.trim()) {
    alert("Please enter some text.");
    return;
  }
  console.log("Text input received:", text.slice(0, 50) + "...");
  
  const pages = splitTextIntoPages(text);
  console.log("Pages created:", pages.length);

  renderFlipbook(pages);
}
// Process uploaded document (PDF or DOCX)
async function processDocument() {
  const file = document.getElementById("document-file").files[0];
  if (!file) {
    alert("Please select a file.");
    return;
  }

  console.log("Processing file:", file.name);

  let text = "";
  if (file.type === "application/pdf") {
    text = await extractTextFromPDF(file);
  } else if (file.name.endsWith(".docx")) {
    text = await extractTextFromDOCX(file);
  } else {
    alert("Unsupported file format.");
    return;
  }

  console.log("Extracted text:", text.slice(0, 100) + "...");
  const pages = splitTextIntoPages(text);
  renderFlipbook(pages);
}

// Extract PDF text using pdf.js (stubbed here)
async function extractTextFromPDF(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async function () {
      try {
        const typedArray = new Uint8Array(reader.result);
        const pdfDoc = await pdfjsLib.getDocument({ data: typedArray }).promise;

        let fullText = '';
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const tokenizedText = await page.getTextContent();
          const pageText = tokenizedText.items.map(token => token.str).join(' ');
          fullText += pageText + '\n\n';
        }
        resolve(fullText);
      } catch (err) {
        console.error("Error reading PDF", err);
        reject("Error extracting text from PDF.");
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

// Extract DOCX text using mammoth.js (stubbed)
async function extractTextFromDOCX(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      mammoth.extractRawText({ arrayBuffer: e.target.result })
        .then(result => {
          resolve(result.value); // raw text
        })
        .catch(err => {
          console.error("Error extracting DOCX", err);
          reject("Error extracting text from DOCX.");
        });
    };
    reader.readAsArrayBuffer(file);
  });
}

// Render flipbook with Turn.js
function renderFlipbook(pages) {
  const container = $("#flipbook");
  container.empty();

  console.log("Rendering flipbook with pages:", pages.length);

  pages.forEach((page, i) => {
    $("<div>").addClass("page").html(`<p>${page}</p>`).appendTo(container);
  });

  // Destroy existing turn.js instance if any
  if (container.turn("size")) {
    container.turn("destroy");
  }

  try {
    container.turn({
      width: "100%",
      height: 500,
      autoCenter: true,
      acceleration: true
    });
  } catch (e) {
    console.error("Turn.js error:", e);
    alert("Failed to initialize flipbook. Check console for details.");
  }
}
