function showTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.getElementById(tabId + "-tab").classList.add("active");
}

function splitTextIntoPages(text, wordsPerPage = 300) {
  const paragraphs = text.split(/\n\s*\n/);
  let pages = [];
  let currentPage = "";
  let wordCount = 0;

  for (let para of paragraphs) {
    const words = para.trim().split(/\s+/);
    if (wordCount + words.length > wordsPerPage && currentPage !== "") {
      pages.push(currentPage.trim());
      currentPage = "";
      wordCount = 0;
    }
    currentPage += para.trim() + "\n\n";
    wordCount += words.length;
  }

  if (currentPage.trim()) pages.push(currentPage.trim());

  return pages;
}

function convertToFlipbook() {
  const text = document.getElementById("user-text").value;
  if (!text.trim()) {
    alert("Please enter some text.");
    return;
  }
  const pages = splitTextIntoPages(text);
  renderFlipbook(pages);
}

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

function renderFlipbook(pages) {
  const container = $("#flipbook");
  container.empty();

  pages.forEach((page, i) => {
    $("<div>")
      .addClass("page")
      .html(`<p>${page}</p><div class="page-number">${i + 1}</div>`)
      .appendTo(container);
  });

  if (container.turn("size")) {
    container.turn("destroy");
  }

  container.turn({
    width: "100%",
    height: 500,
    autoCenter: true,
    acceleration: true,
    elevation: 50,
    gradients: true,
    duration: 600
  });
}
