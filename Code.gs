/**
 * Google Apps Script for Levox Infotech Message Gunrater - Secure Login
 * 
 * Setup Instructions:
 * 1. Create a new Google Sheet.
 * 2. Rename the first tab to "Users" (or update the SHEET_NAME variable below).
 * 3. In row 1, set up your headers: Cell A1 = "Username", Cell B1 = "Password".
 * 4. Add your user credentials starting from row 2.
 * 5. In the Google Sheet, go to Extensions > Apps Script.
 * 6. Delete whatever is there, and paste this entire code snippet.
 * 7. Click 'Deploy' (top right) > 'New deployment'.
 * 8. Click the gear icon next to "Select type" and choose "Web app".
 * 9. Set "Execute as" to "Me", and "Who has access" to "Anyone".
 * 10. Click Deploy, authorize the script to access your Sheet, and copy the Web App URL.
 * 11. Replace the `GAS_AUTH_URL` placeholder in `main.js` with this copied URL.
 */

const SHEET_NAME = "Users";

// Process incoming POST requests from the app
function doPost(e) {
  return handleAuthRequest(e);
}

// Process incoming GET requests from the app (fallback)
function doGet(e) {
  return handleAuthRequest(e);
}

// Support for handling CORS preflight checks automatically in Apps Script
function doOptions(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("").setHeaders(headers);
}

function handleAuthRequest(e) {
  try {
    // Both GET parameters or POST payload work with e.parameter
    const username = e.parameter.username ? String(e.parameter.username).trim() : null;
    const password = e.parameter.password ? String(e.parameter.password) : null;
    
    if (!username || !password) {
      return buildJSONResponse({ 
        status: "error", 
        message: "Missing username or password" 
      });
    }
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
       return buildJSONResponse({ 
        status: "error", 
        message: "Spreadsheet not actively bound to script." 
      });
    }

    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // Fallback: If the exact name isn't found (due to a typo or a trailing space like "Users "),
    // just use the very first tab in the spreadsheet.
    if (!sheet) {
      sheet = spreadsheet.getSheets()[0];
    }
    
    if (!sheet) {
      return buildJSONResponse({ 
        status: "error", 
        message: "No sheets found in the connected spreadsheet." 
      });
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Start from index 1 to skip the header row
    for (let i = 1; i < data.length; i++) {
        const rowUser = String(data[i][0] || "").trim();
        const rowPass = String(data[i][1] || "");
        
        if (rowUser === username && rowPass === password) {
          return buildJSONResponse({ 
            status: "success", 
            message: "Authentication successful",
            username: username
          });
        }
    }
    
    return buildJSONResponse({ 
      status: "error", 
      message: "Invalid username or password" 
    });
    
  } catch (error) {
    return buildJSONResponse({ 
      status: "error", 
      message: "Server Error: " + error.toString() 
    });
  }
}

// Helper to format consistent JSON responses with wide-open CORS
function buildJSONResponse(responseObject) {
  const responseStr = JSON.stringify(responseObject);
  return ContentService.createTextOutput(responseStr)
    .setMimeType(ContentService.MimeType.JSON);
}
