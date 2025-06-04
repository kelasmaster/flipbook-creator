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
  const pages = splitTextIntoPages(text);
  renderFlipbook(pages);
}

// Process uploaded document (PDF or DOCX)
async function processDocument() {
  const file = document.getElementById("document-file").files[0];
  if (!file) {
    alert("Please select a file.");
    return;
  }

  let text = "";
  if (file.type === "application/pdf") {
    text = await extractTextFromPDF(file);
  } else if (file.name.endsWith(".docx")) {
    text = await extractTextFromDOCX(file);
  } else {
    alert("Unsupported file format.");
    return;
  }

  if (!text.trim()) {
    alert("Could not extract readable text from the file.");
    return;
  }

  const pages = splitTextIntoPages(text);
  renderFlipbook(pages);
}

// Extract PDF text using pdf.js (stubbed here)
async function extractTextFromPDF(file) {
  // In real use, use pdf.js to parse the PDF
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve("Extracted text from PDF will appear here in a real implementation.");
    };
    reader.readAsDataURL(file);
  });
}

// Extract DOCX text using mammoth.js (stubbed)
async function extractTextFromDOCX(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const arrayBuffer = e.target.result;

      mammoth.extractRawText({ arrayBuffer: arrayBuffer })
        .then(result => {
          resolve(result.value); // raw text
        })
        .catch(() => {
          resolve("Error extracting DOCX text.");
        });
    };
    reader.readAsArrayBuffer(file);
  });
}

// Render flipbook with Turn.js
function renderFlipbook(pages) {
  const container = $("#flipbook");
  container.empty();

  pages.forEach((page, i) => {
    $("<div>").addClass("page").html(`<p>${page}</p>`).appendTo(container);
  });

  if ($("#flipbook").turn("size")) {
    $("#flipbook").turn("destroy");
  }

  container.turn({
    width: "100%",
    height: 500,
    autoCenter: true,
    acceleration: true
  });
}
